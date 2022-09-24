import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { pool } from '@db';
import {
  getPreferences,
  modifyExpandedCollections,
  pruneExpandedCollections,
  savePreferences,
  setActiveView,
} from '@db/preferences';
import {
  CollectionId,
  Preferences,
  ViewPreferences,
} from '@orpington-news/shared';

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

  const PutPreferences = Preferences.pick({
    defaultCollectionLayout: true,
    avatarStyle: true,
  });

  fastify.put<{ Reply: Preferences; Body: z.infer<typeof PutPreferences> }>(
    '/',
    {
      schema: {
        tags: ['Preferences'],
        body: PutPreferences,
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

  fastify.put<{ Reply: Preferences; Params: CollectionId }>(
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

  fastify.put<{ Reply: Preferences; Params: CollectionId }>(
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

  fastify.put<{ Reply: Preferences; Body: ViewPreferences }>(
    '/activeView',
    {
      schema: {
        body: ViewPreferences,
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
