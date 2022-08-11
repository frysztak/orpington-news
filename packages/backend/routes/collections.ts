import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { DataIntegrityError, NotFoundError } from 'slonik';
import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import {
  addCollection,
  DBCollection,
  deleteCollections,
  getCollectionChildrenIds,
  getCollectionOwner,
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
  setItemDateRead,
} from '@db/collectionItems';
import {
  getPreferences,
  modifyExpandedCollections,
  pruneExpandedCollections,
  setActiveView,
  setHomeCollectionLayout,
} from '@db/preferences';
import { addPagination, PaginationParams, PaginationSchema } from '@db/common';
import {
  FlatCollection,
  CollectionIcons,
  CollectionItem,
  CollectionLayouts,
  defaultCollectionLayout,
} from '@orpington-news/shared';
import { normalizeUrl, Nullable } from '@utils';
import { logger } from '@utils/logger';
import { timestampMsToSeconds } from '@utils/time';
import {
  fetchRSSJob,
  parser,
  updateCollections,
  extractFeedUrl,
} from '@tasks/fetchRSS';
import { importOPML } from '@services/opml';

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
  newParentId: Nullable(Type.Integer()),
  newOrder: Type.Integer(),
});
type MoveCollectionType = Static<typeof MoveCollection>;

const ItemDetailsParams = Type.Object({
  id: Type.Integer(),
  itemId: Type.Number(),
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

const verifyCollectionOwner = async (
  request: FastifyRequest<{ Params: CollectionIdType }>,
  reply: FastifyReply
) => {
  const {
    params: { id },
    session: { userId },
  } = request;

  if (typeof id === 'number') {
    const owner = await pool.maybeOne(getCollectionOwner(id));
    if (owner !== null && owner.userId !== userId) {
      reply.status(403).send({ errorCode: 403, message: 'Access forbidden.' });
    }
  }
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
      const userId = request.session.userId;
      const collections = await pool.any(getCollections(userId));
      return collections.map(mapDBCollection);
    }
  );

  fastify.post<{ Body: PostCollectionType; Reply: Array<FlatCollection> }>(
    '/',
    {
      schema: {
        body: PostCollection,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        body,
        session: { userId },
      } = request;
      const preferences = await pool.one(getPreferences(userId));
      await pool.transaction(async (conn) => {
        await conn.any(
          addCollection(
            {
              ...body,
              layout: preferences.defaultCollectionLayout,
            },
            userId
          )
        );
        await conn.any(recalculateCollectionsOrder());
      });
      fetchRSSJob.start();

      if (body.parentId) {
        await pool.query(
          modifyExpandedCollections('add', body.parentId, userId)
        );
        await pool.query(pruneExpandedCollections(userId));
      }

      const collections = await pool.any(getCollections(userId));
      return collections.map(mapDBCollection);
    }
  );

  fastify.post<{ Body: MoveCollectionType; Reply: Array<FlatCollection> }>(
    '/move',
    {
      schema: {
        body: MoveCollection,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        body: { collectionId, newParentId, newOrder },
        session: { userId },
      } = request;

      await pool.any(moveCollections(collectionId, newParentId, newOrder));
      await pool.query(pruneExpandedCollections(userId));
      const collections = await pool.any(getCollections(userId));
      return collections.map(mapDBCollection);
    }
  );

  fastify.put<{ Body: PutCollectionType }>(
    '/',
    {
      schema: {
        body: PutCollection,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        body,
        session: { userId },
      } = request;
      if (body.id === body.parentId) {
        reply.status(500);
        return {
          errorCode: 500,
          message: 'Collection cannot be its own parent',
        };
      }
      await pool.any(updateCollection(body));

      if (body.parentId) {
        await pool.query(
          modifyExpandedCollections('add', body.parentId, userId)
        );
        await pool.query(pruneExpandedCollections(userId));
      }

      const collections = await pool.any(getCollections(userId));
      return collections.map(mapDBCollection);
    }
  );

  fastify.delete<{ Params: CollectionIdType }>(
    '/:id',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        params: { id },
        session: { userId },
      } = request;

      if (id === 'home') {
        reply.status(500);
        return { errorCode: 500, message: 'Cannot DELETE home collection' };
      }

      const [idsToDelete, preferences] = await Promise.all([
        pool
          .many(getCollectionChildrenIds(id))
          .then((result) => result.map((x) => x.children_id)),

        pool.one(getPreferences(userId)),
      ]);

      const deletingCurrentlyActiveCollection =
        preferences.activeView === 'collection' &&
        idsToDelete.includes(preferences.activeCollectionId);

      const deletedIds = await pool.transaction(async (conn) => {
        if (deletingCurrentlyActiveCollection) {
          await conn.query(
            setActiveView(
              {
                activeView: 'home',
              },
              userId
            )
          );
        }

        const deletedIds = await conn.any(deleteCollections(idsToDelete));
        await conn.any(recalculateCollectionsOrder());
        await conn.query(pruneExpandedCollections(userId));
        return deletedIds;
      });

      const ids = deletedIds.map(({ id }) => id);
      return {
        ids,
        navigateHome: deletingCurrentlyActiveCollection,
      };
    }
  );

  fastify.post<{ Params: CollectionIdType }>(
    '/:id/markAsRead',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
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
    Reply: readonly Omit<
      CollectionItem,
      'previousId' | 'nextId' | 'fullText'
    >[];
  }>(
    '/:id/items',
    {
      schema: {
        params: CollectionId,
        querystring: PaginationSchema,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        params: { id },
        query: pagination,
        session: { userId },
      } = request;
      const itemsQuery =
        id === 'home' ? getAllCollectionItems(userId) : getCollectionItems(id);
      const items = await pool.any<Omit<DBCollectionItem, 'full_text'>>(
        addPagination(pagination, itemsQuery)
      );

      return items.map((dbItem) => ({
        id: dbItem.id,
        url: dbItem.url,
        title: dbItem.title,
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
          icon: dbItem.collection_icon,
        },
        onReadingList: false, // TODO
      }));
    }
  );

  fastify.get<{
    Params: ItemDetailsType;
  }>(
    '/:id/item/:itemId',
    {
      schema: {
        params: ItemDetailsParams,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const { params } = request;
      const { id, itemId } = params;

      try {
        const details = await pool.one(getItemDetails(id, itemId));
        const {
          previous_id,
          next_id,
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
          previousId: previous_id,
          nextId: next_id,
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
            `Items details for collection '${id}' and item '${itemId}' not found.`
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

  const DateReadBody = Type.Object({
    dateRead: Nullable(Type.Number()),
  });
  fastify.put<{
    Params: ItemDetailsType;
    Body: Static<typeof DateReadBody>;
  }>(
    '/:id/item/:itemId/dateRead',
    {
      schema: {
        params: ItemDetailsParams,
        body: DateReadBody,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        params: { id, itemId },
        body: { dateRead },
      } = request;

      await pool.any(setItemDateRead(id, itemId, dateRead));
      return true;
    }
  );

  fastify.post<{ Params: Static<typeof CollectionId> }>(
    '/:id/refresh',
    {
      schema: {
        params: CollectionId,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
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
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        body: { layout },
        params: { id },
        session: { userId },
      } = request;

      if (typeof id === 'number') {
        await pool.query(setCollectionLayout(id, layout));
      } else if (id === 'home') {
        await pool.query(setHomeCollectionLayout(layout, userId));
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
        session: { userId },
      } = request;

      const tryParse = async (url: string) => {
        const isUrlAlreadyUsed = await pool.exists(
          hasCollectionWithUrl(url, userId)
        );
        if (isUrlAlreadyUsed) {
          return reply
            .status(418)
            .send({ errorCode: 418, message: 'Duplicate feed URL.' });
        }

        try {
          const feed = await parser.parseURL(url);
          return reply.status(200).send({
            feedUrl: url,
            title: feed.title,
            description: feed.description || feed.subtitle,
          });
        } catch (err) {
          console.error('RSS parsing failed with: ', err);
          return reply
            .status(418)
            .send({ errorCode: 418, message: 'Invalid RSS/Atom feed.' });
        }
      };

      const normalizedUrl = normalizeUrl(url);
      const result = await extractFeedUrl(normalizedUrl);

      if (result.status === 'OK') {
        const normalizedFeedUrl = normalizeUrl(result.feedUrl);
        const parseReply = await tryParse(normalizedFeedUrl);
        if (parseReply) {
          return parseReply;
        }
      } else if (result.status === 'isXML') {
        const parseReply = await tryParse(normalizedUrl);
        if (parseReply) {
          return parseReply;
        }
      } else {
        return reply
          .status(418)
          .send({ errorCode: 418, message: 'Invalid RSS/Atom feed.' });
      }
    }
  );

  fastify.post(
    '/import/opml',
    {
      schema: {
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;

      const opmlFile = await request.file();
      const opmlBuffer = await opmlFile.toBuffer();
      const opmlString = opmlBuffer.toString();

      await importOPML(opmlString, userId);

      return true;
    }
  );
};
