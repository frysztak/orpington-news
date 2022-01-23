import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { pool } from 'db';
import { DataIntegrityError, NotFoundError } from 'slonik';
import {
  addCollection,
  deleteCollection,
  getCollections,
  inflateCollections,
  moveCollection,
  updateCollection,
} from 'db/collections';
import {
  DBCollectionItem,
  getAllCollectionItems,
  getCollectionItems,
  getItemDetails,
} from '@db/collectionItems';
import { addPagination, PaginationParams, PaginationSchema } from '@db/common';
import {
  Collection,
  CollectionIcons,
  CollectionItem,
} from '@orpington-news/shared';
import { disableCoercionAjv } from '@utils';
import { logger } from '@utils/logger';
import { timestampMsToSeconds } from '@utils/time';
import { parser } from '@tasks/fetchRSS/parse';

const PostCollection = Type.Object({
  title: Type.String(),
  icon: Type.Optional(
    Type.Union(CollectionIcons.map((icon) => Type.Literal(icon)))
  ),
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
  id: Type.Integer(),
  newParentId: Type.Union([Type.Integer(), Type.Null()]),
});
type MoveCollectionType = Static<typeof MoveCollection>;

const ItemDetailsParams = Type.Object({
  id: Type.Integer(),
  itemSlug: Type.String(),
});
type ItemDetailsType = Static<typeof ItemDetailsParams>;

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
      const collections = await pool.any(getCollections());
      return inflateCollections(collections);
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
      await pool.any(addCollection(body));
      return true;
    }
  );

  fastify.post<{ Body: MoveCollectionType }>(
    '/move',
    {
      schema: {
        body: MoveCollection,
        tags: ['Collections'],
      },
      config: {
        schemaValidators: {
          params: disableCoercionAjv,
        },
      },
    },
    async (request, reply) => {
      const {
        body: { id, newParentId },
      } = request;
      await pool.any(moveCollection(id, newParentId));
      return true;
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

      await pool.any(deleteCollection(id));
      return true;
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
    '/:id/item/:itemSlug',
    {
      schema: {
        params: ItemDetailsParams,
        tags: ['Collections'],
      },
    },
    async (request, reply) => {
      const { params } = request;
      const { id, itemSlug } = params;

      try {
        const details = await pool.one(getItemDetails(id, itemSlug));
        const {
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
          fullText: full_text,
          datePublished: timestampMsToSeconds(date_published),
          dateRead: timestampMsToSeconds(date_read),
          date_updated: timestampMsToSeconds(date_updated),
          thumbnailUrl: thumbnail_url,
          readingTime: reading_time,
        };
      } catch (error) {
        if (error instanceof NotFoundError) {
          logger.error(
            `Items details for collection '${id}' and item '${itemSlug}' not found.`
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

      try {
        const feed = await parser.parseURL(url);
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
