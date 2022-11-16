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
  hasCollectionWithUrl,
  markCollectionAsRead,
  moveCollections,
  recalculateCollectionsOrder,
  setCollectionPreferences,
  updateCollection,
} from '@db/collections';
import {
  DBCollectionItemWithoutText,
  getCollectionItems,
  getItemDetails,
  setItemDateRead,
} from '@db/collectionItems';
import {
  getPreferences,
  modifyExpandedCollections,
  pruneExpandedCollections,
  setActiveCollection,
} from '@db/preferences';
import { addPagination, PaginationSchema } from '@db/common';
import {
  Collection,
  CollectionLayout,
  defaultCollectionLayout,
  ID,
  numeric,
  UpdateCollection,
  AddCollection,
  CollectionId,
  CollectionFilter,
  defaultCollectionFilter,
  defaultCollectionGrouping,
  CollectionGrouping,
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
import { none } from 'rambda';
import { getUser } from '@db/users';

const PostCollection = AddCollection.omit({
  layout: true,
});

const MoveCollection = z.object({
  collectionId: ID,
  newParentId: ID.nullable(),
  newOrder: z.number(),
});

const ItemDetailsParams = z.object({
  id: numeric(ID),
  itemId: numeric(ID),
});

const mapDBCollection = (collection: DBCollection): Collection => {
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
    filter,
    grouping,
    sort_by,
    is_home,
    description,
    ...rest
  } = collection;

  return {
    ...rest,
    description: description ?? undefined,
    dateUpdated: date_updated,
    refreshInterval: refresh_interval,
    unreadCount: unread_count ?? 0,
    layout: layout ?? defaultCollectionLayout,
    filter: filter ?? defaultCollectionFilter,
    grouping: grouping ?? defaultCollectionGrouping,
    sortBy: sort_by ?? 'ee',
    isHome: is_home,
    parents,
    parentId: parent_id ?? undefined,
    parentOrder: parent_order ?? undefined,
    isLastChild: is_last_child ?? false,
    orderPath: order_path,
  };
};

const calculateUnreadCount = (collections: Collection[]): Collection[] => {
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
  request: FastifyRequest<{ Params: z.infer<typeof CollectionId> }>,
  reply: FastifyReply
) => {
  const {
    params: { id },
    session: { userId },
  } = request;

  const owner = await pool.maybeOne(getCollectionOwner(id));
  if (owner !== null && owner.userId !== userId) {
    reply.status(403).send({ errorCode: 403, message: 'Access forbidden.' });
  }
};

export const collections: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.addHook('preHandler', fastify.auth([fastify.verifySession]));

  fastify.get<{ Reply: Array<Collection> }>(
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
    Reply: Array<Collection>;
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
      const { defaultCollectionLayout } = await pool.one(
        getPreferences(userId)
      );
      const { homeId } = await pool.one(getUser(userId));

      await pool.transaction(async (conn) => {
        await conn.any(
          addCollection(
            {
              ...body,
              parentId: body.parentId ?? homeId,
              layout: defaultCollectionLayout,
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
    Reply: Array<Collection>;
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

  fastify.put<{ Body: UpdateCollection }>(
    '/',
    {
      schema: {
        body: UpdateCollection,
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

  fastify.delete<{ Params: z.infer<typeof CollectionId> }>(
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

      const [idsToDelete, preferences] = await Promise.all([
        pool
          .many(getCollectionChildrenIds(id))
          .then((result) => result.map((x) => x.id)),

        pool.one(getPreferences(userId)),
      ]);

      const deletingCurrentlyActiveCollection = idsToDelete.includes(
        preferences.activeCollectionId
      );

      const deletedIds = await pool.transaction(async (conn) => {
        if (deletingCurrentlyActiveCollection) {
          const { homeId } = await conn.one(getUser(userId));
          await conn.query(setActiveCollection(homeId, userId));
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

  fastify.post<{ Params: z.infer<typeof CollectionId> }>(
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
        session: { userId },
        params: { id },
      } = request;

      const timestamp = getUnixTime(new Date());

      await pool.any(
        markCollectionAsRead(getCollectionChildrenIds(id), timestamp)
      );
      const children = await pool.any(getCollectionChildrenIds(id));

      const ids = children.map(({ id }) => id);
      const collections = await queryCollections(userId);
      return { ids, collections, timestamp };
    }
  );

  const GetItemsParams = PaginationSchema.merge(
    z.object({
      filter: CollectionFilter.optional(),
      grouping: CollectionGrouping.optional(),
    })
  );
  fastify.get<{
    Params: z.infer<typeof CollectionId>;
    Querystring: z.infer<typeof GetItemsParams>;
  }>(
    '/:id/items',
    {
      schema: {
        params: CollectionId,
        querystring: GetItemsParams,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        params: { id },
        query: {
          pageIndex,
          pageSize,
          filter = defaultCollectionFilter,
          grouping = defaultCollectionGrouping,
        },
        session: { userId },
      } = request;

      const itemsQuery = getCollectionItems({
        userId,
        collectionId: id,
        filter,
      });
      const items = (await pool.any(
        addPagination({ pageIndex, pageSize }, itemsQuery)
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
      const {
        params: { id, itemId },
      } = request;

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
          collection_title,
          collection_icon,
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
          collection: {
            id: collection_id,
            title: collection_title,
            icon: collection_icon,
          },
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
        } else {
          logger.error(error);
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

      await pool.any(setItemDateRead(id, itemId, dateRead));
      return true;
    }
  );

  fastify.post<{ Params: z.infer<typeof CollectionId> }>(
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

      const collections = await pool.any(getCollectionsFromRootId(id));
      const result = await updateCollections(collections);

      if (result) {
        const children = await pool.any(getCollectionChildrenIds(id));
        return { ids: children.map(({ id }) => id) };
      } else {
        const noun = collections.length > 1 ? 'Feeds' : 'Feed';
        reply
          .status(500)
          .send({ errorCode: 500, message: `${noun} failed to refresh.` });
      }
    }
  );

  const PreferencesBody = z.object({
    layout: CollectionLayout.optional(),
    filter: CollectionFilter.optional(),
    grouping: CollectionGrouping.optional(),
  });

  fastify.put<{
    Params: z.infer<typeof CollectionId>;
    Body: z.infer<typeof PreferencesBody>;
  }>(
    '/:id/preferences',
    {
      schema: {
        params: CollectionId,
        body: PreferencesBody,
        tags: ['Collections'],
      },
      preHandler: verifyCollectionOwner,
    },
    async (request, reply) => {
      const {
        body: preferences,
        params: { id },
      } = request;

      if (none(Boolean, Object.values(preferences))) {
        return true;
      }

      await pool.query(
        setCollectionPreferences({ collectionId: id, preferences })
      );

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
