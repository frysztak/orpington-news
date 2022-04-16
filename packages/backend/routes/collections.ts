import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { DataIntegrityError, NotFoundError } from 'slonik';
import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import {
  addCollection,
  DBCollection,
  deleteCollection,
  getCollectionChildrenIds,
  getCollections,
  getCollectionsFromRootId,
  getCollectionsWithUrl,
  hasCollectionWithUrl,
  markCollectionAsRead,
  moveCollections,
  recalculateCollectionsOrder,
  setCollectionLayout,
  updateCollection,
} from '@db/collections';
import {
  DBCollectionItem,
  getAllCollectionItems,
  getCollectionItems,
  getItemDetails,
} from '@db/collectionItems';
import { pruneExpandedCollections } from '@db/preferences';
import { addPagination, PaginationParams, PaginationSchema } from '@db/common';
import {
  FlatCollection,
  CollectionIcons,
  CollectionItem,
  CollectionLayouts,
  defaultCollectionLayout,
} from '@orpington-news/shared';
import { disableCoercionAjv, normalizeUrl } from '@utils';
import { logger } from '@utils/logger';
import { timestampMsToSeconds } from '@utils/time';
import { fetchRSSJob, parser, updateCollections } from '@tasks/fetchRSS';

const PostCollection = Type.Object({
  title: Type.String(),
  icon: Type.Union(CollectionIcons.map((icon) => Type.Literal(icon))),
  parentId: Type.Optional(Type.Integer()),
  description: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),
  refreshInterval: Type.Integer(),
});

type PostCollectionType = Static<typeof PostCollection>;

const PutCollection = Type.Intersect([
  PostCollection,
  Type.Object({
    id: Type.Integer(),
  }),
]);
type PutCollectionType = Static<typeof PutCollection>;

const CollectionId = Type.Object({
  id: Type.Union([Type.Integer(), Type.Literal('home')]),
});
type CollectionIdType = Static<typeof CollectionId>;

const MoveCollection = Type.Object({
  collectionId: Type.Integer(),
  newParentId: Type.Union([Type.Integer(), Type.Null()]),
  newOrder: Type.Integer(),
});
type MoveCollectionType = Static<typeof MoveCollection>;

const ItemDetailsParams = Type.Object({
  id: Type.Integer(),
  itemSerialId: Type.Number(),
});
type ItemDetailsType = Static<typeof ItemDetailsParams>;

const mapDBCollection = (collection: DBCollection): FlatCollection => {
  const { date_updated, refresh_interval, unread_count, layout, ...rest } =
    collection;

  return {
    ...rest,
    dateUpdated: date_updated,
    refreshInterval: refresh_interval,
    unreadCount: unread_count ?? 0,
    layout: layout ?? defaultCollectionLayout,
  };
};

export const collections: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.addHook('preHandler', fastify.auth([fastify.verifySession]));

  fastify.get<{ Reply: Array<FlatCollection> }>(
    '/',
    {
      schema: {
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const collections = await pool.any(getCollections());
      return collections.map(mapDBCollection);
    }
  );

  fastify.post<{ Body: PostCollectionType; Reply: boolean }>(
    '/',
    {
      schema: {
        body: PostCollection,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const { body } = request;
      await pool.transaction(async (conn) => {
        await conn.any(addCollection(body));
        await conn.any(recalculateCollectionsOrder());
      });
      fetchRSSJob.start();
      return true;
    }
  );

  fastify.post<{ Body: MoveCollectionType; Reply: Array<FlatCollection> }>(
    '/move',
    {
      schema: {
        body: MoveCollection,
        tags: ['Collections'],
      },
      config: {
        schemaValidators: {
          body: disableCoercionAjv,
        },
      },
    },
    async (request, reply) => {
      const {
        body: { collectionId, newParentId, newOrder },
      } = request;

      await pool.any(moveCollections(collectionId, newParentId, newOrder));
      await pool.query(pruneExpandedCollections());
      const collections = await pool.any(getCollections());
      return collections.map(mapDBCollection);
    }
  );

  fastify.put<{ Body: PutCollectionType; Reply: boolean }>(
    '/',
    {
      schema: {
        body: PutCollection,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const { body } = request;
      await pool.any(updateCollection(body));
      return true;
    }
  );

  fastify.delete<{ Params: CollectionIdType }>(
    '/:id',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        params: { id },
      } = request;
      if (id === 'home') {
        reply.status(500);
        return { errorCode: 500, message: 'Cannot DELETE home collection' };
      }

      const deletedIds = await pool.transaction(async (conn) => {
        const deletedIds = await conn.any(deleteCollection(id));
        await conn.any(recalculateCollectionsOrder());
        await conn.query(pruneExpandedCollections());
        return deletedIds;
      });

      return { ids: deletedIds.map(({ id }) => id) };
    }
  );

  fastify.post<{ Params: CollectionIdType }>(
    '/:id/markAsRead',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        params: { id },
      } = request;
      if (id === 'home') {
        reply.status(500);
        return {
          errorCode: 500,
          message: 'Cannot mark home collection as read',
        };
      }

      await pool.any(markCollectionAsRead(id, getUnixTime(new Date())));
      const children = await pool.any(getCollectionChildrenIds(id));
      return { ids: children.map(({ children_id }) => children_id) };
    }
  );

  fastify.get<{
    Params: CollectionIdType;
    Querystring: PaginationParams;
    Reply: readonly Omit<CollectionItem, 'fullText'>[];
  }>(
    '/:id/items',
    {
      schema: {
        params: CollectionId,
        querystring: PaginationSchema,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const { params, query: pagination } = request;
      const { id } = params;
      const itemsQuery =
        id === 'home' ? getAllCollectionItems() : getCollectionItems(id);
      const items = await pool.any<Omit<DBCollectionItem, 'full_text'>>(
        addPagination(pagination, itemsQuery)
      );

      return items.map((dbItem) => ({
        id: dbItem.id,
        serialId: dbItem.serial_id,
        title: dbItem.title,
        slug: dbItem.slug,
        link: dbItem.link,
        summary: dbItem.summary,
        thumbnailUrl: dbItem.thumbnail_url ?? undefined,
        datePublished: dbItem.date_published,
        dateUpdated: dbItem.date_updated,
        dateRead: dbItem.date_read ?? undefined,
        categories: dbItem.categories ?? undefined,
        comments: dbItem.comments ?? undefined,
        readingTime: dbItem.reading_time,
        collection: {
          id: dbItem.collection_id,
          title: dbItem.collection_title,
          slug: dbItem.collection_slug,
          icon: dbItem.collection_icon,
        },
        onReadingList: false, // TODO
      }));
    }
  );

  fastify.get<{
    Params: ItemDetailsType;
  }>(
    '/:id/item/:itemSerialId',
    {
      schema: {
        params: ItemDetailsParams,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const { params } = request;
      const { id, itemSerialId } = params;

      try {
        const details = await pool.one(getItemDetails(id, itemSerialId));
        const {
          serial_id,
          full_text,
          date_published,
          date_read,
          date_updated,
          thumbnail_url,
          reading_time,
          collection_id,
          ...rest
        } = details;

        return {
          ...rest,
          serialId: serial_id,
          fullText: full_text,
          datePublished: timestampMsToSeconds(date_published),
          dateRead: timestampMsToSeconds(date_read),
          dateUpdated: timestampMsToSeconds(date_updated),
          thumbnailUrl: thumbnail_url,
          readingTime: reading_time,
        };
      } catch (error) {
        if (error instanceof NotFoundError) {
          logger.error(
            `Items details for collection '${id}' and item '${itemSerialId}' not found.`
          );
          reply
            .status(404)
            .send({ errorCode: 404, message: 'Item not found.' });
        } else if (error instanceof DataIntegrityError) {
          logger.error(
            'There is more than one row matching the select criteria.'
          );
          reply.status(500).send({ errorCode: 500, message: 'Server error.' });
        }
      }
    }
  );

  fastify.post<{ Params: Static<typeof CollectionId> }>(
    '/:id/refresh',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        params: { id },
      } = request;

      const collections = await pool.any(
        id === 'home' ? getCollectionsWithUrl() : getCollectionsFromRootId(id)
      );
      const result = await updateCollections(collections);

      if (result) {
        if (id === 'home') {
          const children = await pool.any(getCollectionsWithUrl());
          return { ids: children.map(({ id }) => id) };
        } else {
          const children = await pool.any(getCollectionChildrenIds(id));
          return { ids: children.map(({ children_id }) => children_id) };
        }
      } else {
        const noun = collections.length > 1 ? 'Feeds' : 'Feed';
        reply
          .status(500)
          .send({ errorCode: 500, message: `${noun} failed to refresh.` });
      }
    }
  );

  const LayoutBody = Type.Object({
    layout: Type.Union(CollectionLayouts.map((layout) => Type.Literal(layout))),
  });

  fastify.put<{
    Params: Static<typeof CollectionId>;
    Body: Static<typeof LayoutBody>;
  }>(
    '/:id/layout',
    {
      schema: {
        params: CollectionId,
        body: LayoutBody,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        body: { layout },
        params: { id },
      } = request;
      // TODO: remove once home collection is refactored
      if (typeof id === 'number') {
        await pool.query(setCollectionLayout(id, layout));
      }

      return true;
    }
  );

  const VerifyURLParams = Type.Object({
    url: Type.String(),
  });

  fastify.post<{
    Body: Static<typeof VerifyURLParams>;
  }>(
    '/verifyUrl',
    {
      schema: {
        body: VerifyURLParams,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        body: { url },
      } = request;

      const normalizedUrl = normalizeUrl(url);

      const isUrlAlreadyUsed = await pool.exists(
        hasCollectionWithUrl(normalizedUrl)
      );
      if (isUrlAlreadyUsed) {
        return reply
          .status(418)
          .send({ errorCode: 418, message: 'Duplicate feed URL.' });
      }

      try {
        const feed = await parser.parseURL(normalizedUrl);
        reply.status(200).send({
          title: feed.title,
          description: feed.description || feed.subtitle,
        });
      } catch (err) {
        reply
          .status(418)
          .send({ errorCode: 418, message: 'Invalid RSS/Atom feed.' });
      }
    }
  );
};
