import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { pool } from '@db';
import {
  getPreferences,
  modifyExpandedCollections,
  pruneExpandedCollections,
  savePreferences,
  setActiveView,
  ViewPreferenceCodec,
} from '@db/preferences';
import type { Preferences, ViewPreference } from '@orpington-news/shared';

export const preferences: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.addHook('preHandler', fastify.auth([fastify.verifySession]));

  fastify.get<{ Reply: Preferences }>(
    '/',
    {
      schema: {
        tags: ['Preferences'],
      },
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;
      return await pool.one(getPreferences(userId));
    }
  );

  fastify.put<{ Reply: Preferences; Body: Preferences }>(
    '/',
    {
      schema: {
        tags: ['Preferences'],
      },
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;
      await pool.query(savePreferences(request.body, userId));
      return await pool.one(getPreferences(userId));
    }
  );

  const CollectionId = Type.Object({
    id: Type.Integer(),
  });
  type CollectionIdType = Static<typeof CollectionId>;

  fastify.put<{ Reply: Preferences; Params: CollectionIdType }>(
    '/expand/:id',
    {
      schema: {
        params: CollectionId,
        tags: ['Preferences'],
      },
    },
    async (request, reply) => {
      const {
        params: { id },
        session: { userId },
      } = request;
      await pool.query(modifyExpandedCollections('add', id, userId));
      await pool.query(pruneExpandedCollections(userId));
      return await pool.one(getPreferences(userId));
    }
  );

  fastify.put<{ Reply: Preferences; Params: CollectionIdType }>(
    '/collapse/:id',
    {
      schema: {
        params: CollectionId,
        tags: ['Preferences'],
      },
    },
    async (request, reply) => {
      const {
        params: { id },
        session: { userId },
      } = request;
      await pool.query(modifyExpandedCollections('remove', id, userId));
      await pool.query(pruneExpandedCollections(userId));
      return await pool.one(getPreferences(userId));
    }
  );

  fastify.put<{ Reply: Preferences; Body: ViewPreference }>(
    '/activeView',
    {
      schema: {
        body: ViewPreferenceCodec,
        tags: ['Preferences'],
      },
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;
      await pool.query(setActiveView(request.body, userId));
      return await pool.one(getPreferences(userId));
    }
  );
};
