import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import { DataIntegrityError, NotFoundError } from 'slonik';
import { getUnixTime } from 'date-fns';
import { pool } from '@db';
import {
  addCollection,
  DBCollection,
  deleteCollections,
  getCollectionById,
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
  DBCollectionItemWithoutText,
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
  Collection,
  FlatCollection,
  CollectionLayout,
  defaultCollectionLayout,
  ID,
  CollectionId,
  HomeCollectionId,
  numeric,
} from '@orpington-news/shared';
import { MAX_INT, normalizeUrl } from '@utils';
import { logger } from '@utils/logger';
import { timestampMsToSeconds } from '@utils/time';
import {
  fetchRSSJob,
  parser,
  updateCollections,
  extractFeedUrl,
} from '@tasks/fetchRSS';
import { importOPML } from '@services/opml';

const PostCollection = Collection.pick({
  title: true,
  icon: true,
  parentId: true,
  description: true,
  url: true,
  refreshInterval: true,
});

const PutCollection = PostCollection.merge(
  z.object({
    id: ID,
  })
);

const MoveCollection = z.object({
  collectionId: ID,
  newParentId: ID.nullable(),
  newOrder: z.number(),
});

const ItemDetailsParams = HomeCollectionId.merge(
  z.object({
    itemId: numeric(ID),
  })
);

const mapDBCollection = (collection: DBCollection): FlatCollection => {
  const {
    date_updated,
    refresh_interval,
    unread_count,
    layout,
    order_path,
    parents,
    parent_id,
    parent_order,
    is_last_child,
    ...rest
  } = collection;

  return {
    ...rest,
    dateUpdated: date_updated,
    refreshInterval: refresh_interval,
    unreadCount: unread_count ?? 0,
    layout: layout ?? defaultCollectionLayout,
    parents,
    parentId: parent_id ?? undefined,
    parentOrder: parent_order ?? undefined,
    isLastChild: is_last_child ?? false,
    orderPath: order_path,
  };
};

const calculateUnreadCount = (
  collections: FlatCollection[]
): FlatCollection[] => {
  const lut = new Map<ID, number>(
    collections.map(({ id, unreadCount }) => [id, unreadCount])
  );
  return collections.map((collection) => {
    const { unreadCount, children } = collection;
    const childrenUnreadCount = children.reduce((acc, childrenId) => {
      return acc + (lut.get(childrenId) ?? 0);
    }, 0);

    return {
      ...collection,
      unreadCount: unreadCount + childrenUnreadCount,
    };
  });
};

const queryCollections = async (userId: ID) => {
  const collections = await pool.any(getCollections(userId));
  return calculateUnreadCount(collections.map(mapDBCollection));
};

const verifyCollectionOwner = async (
  request: FastifyRequest<{ Params: z.infer<typeof HomeCollectionId> }>,
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
      const {
        session: { userId },
      } = request;
      return await queryCollections(userId);
    }
  );

  fastify.post<{
    Body: z.infer<typeof PostCollection>;
    Reply: Array<FlatCollection>;
  }>(
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

      return await queryCollections(userId);
    }
  );

  fastify.post<{
    Body: z.infer<typeof MoveCollection>;
    Reply: Array<FlatCollection>;
  }>(
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

      return await queryCollections(userId);
    }
  );

  fastify.put<{ Body: z.infer<typeof PutCollection> }>(
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

      const { id, parentId } = body;

      if (id === parentId) {
        reply.status(500);
        return {
          errorCode: 500,
          message: 'Collection cannot be its own parent',
        };
      }

      const { parent_id: currentParentId } = await pool.one(
        getCollectionById(body.id)
      );
      if (parentId !== undefined && currentParentId !== parentId) {
        await pool.any(moveCollections(id, parentId, MAX_INT));
      }

      await pool.any(updateCollection(body));

      if (body.parentId) {
        await pool.query(
          modifyExpandedCollections('add', body.parentId, userId)
        );
        await pool.query(pruneExpandedCollections(userId));
      }

      return await queryCollections(userId);
    }
  );

  fastify.delete<{ Params: z.infer<typeof HomeCollectionId> }>(
    '/:id',
    {
      schema: {
        params: HomeCollectionId,
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
        idsToDelete.includes(preferences.activeCollectionId!);

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

  fastify.post<{ Params: z.infer<typeof HomeCollectionId> }>(
    '/:id/markAsRead',
    {
      schema: {
        params: HomeCollectionId,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        session: { userId },
        params: { id },
      } = request;
      if (id === 'home') {
        reply.status(500);
        return {
          errorCode: 500,
          message: 'Cannot mark home collection as read',
        };
      }

      const timestamp = getUnixTime(new Date());
      await pool.any(markCollectionAsRead(id, timestamp));
      const children = await pool.any(getCollectionChildrenIds(id));
      const ids = children.map(({ children_id }) => children_id);
      const collections = await queryCollections(userId);
      return { ids, collections, timestamp };
    }
  );

  fastify.get<{
    Params: z.infer<typeof HomeCollectionId>;
    Querystring: PaginationParams;
  }>(
    '/:id/items',
    {
      schema: {
        params: HomeCollectionId,
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
      console.log(id);
      const itemsQuery =
        id === 'home' ? getAllCollectionItems(userId) : getCollectionItems(id);
      const items = (await pool.any(
        addPagination(pagination, itemsQuery)
      )) as readonly DBCollectionItemWithoutText[];

      return items.map((dbItem) => ({
        id: dbItem.id,
        url: dbItem.url,
        title: dbItem.title,
        summary: dbItem.summary,
        thumbnailUrl: dbItem.thumbnail_url ?? undefined,
        datePublished: timestampMsToSeconds(dbItem.date_published),
        dateUpdated: timestampMsToSeconds(dbItem.date_updated),
        dateRead: timestampMsToSeconds(dbItem.date_read),
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
    Params: z.infer<typeof ItemDetailsParams>;
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
      // TODO
      if (id === 'home') {
        return;
      }

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

  const DateReadBody = z.object({
    dateRead: z.number().nullable(),
  });
  fastify.put<{
    Params: z.infer<typeof ItemDetailsParams>;
    Body: z.infer<typeof DateReadBody>;
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

      // TODO
      if (id === 'home') {
        return;
      }

      await pool.any(setItemDateRead(id, itemId, dateRead));
      return true;
    }
  );

  fastify.post<{ Params: z.infer<typeof HomeCollectionId> }>(
    '/:id/refresh',
    {
      schema: {
        params: HomeCollectionId,
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

  const LayoutBody = z.object({
    layout: CollectionLayout,
  });

  fastify.put<{
    Params: z.infer<typeof CollectionId>;
    Body: z.infer<typeof LayoutBody>;
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

  const VerifyURLParams = z.object({
    url: z.string().url(),
  });

  fastify.post<{
    Body: z.infer<typeof VerifyURLParams>;
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
      const opmlBuffer = await opmlFile?.toBuffer();
      const opmlString = opmlBuffer?.toString();

      if (opmlString) {
        await importOPML(opmlString, userId);
      } else {
        reply.status(400).send({ errorCode: 400, message: 'Invalid file.' });
      }

      return true;
    }
  );
};
