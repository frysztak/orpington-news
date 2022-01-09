import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { pool } from 'db';
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
} from '@db/collectionItems';
import { addPagination, PaginationParams, PaginationSchema } from '@db/common';
import {
  Collection,
  CollectionIcons,
  CollectionItem,
} from '@orpington-news/shared';
import { disableCoercionAjv } from '@utils';

const PostCollection = Type.Object({
  title: Type.String(),
  icon: Type.Optional(
    Type.Union(CollectionIcons.map((icon) => Type.Literal(icon)))
  ),
  parentId: Type.Optional(Type.Integer()),
  description: Type.Optional(Type.String()),
  url: Type.Optional(Type.String()),
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
    Reply: readonly CollectionItem[];
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
      const items = await pool.any<DBCollectionItem>(
        addPagination(pagination, itemsQuery)
      );

      return items.map(
        (dbItem: DBCollectionItem): CollectionItem => ({
          id: dbItem.id,
          title: dbItem.title,
          slug: dbItem.slug,
          link: dbItem.link,
          summary: dbItem.summary,
          fullText: dbItem.full_text,
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
        })
      );
    }
  );
};
