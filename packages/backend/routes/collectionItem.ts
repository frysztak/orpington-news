import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { pool } from '@db';
import { setItemDateRead } from '@db/collectionItems';

const ItemIdSchema = Type.Object({
  id: Type.String(),
});
type ItemId = Static<typeof ItemIdSchema>;

export const collectionItem: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  fastify.addHook('preHandler', fastify.auth([fastify.verifySession]));

  const SetDateReadSchema = Type.Object({
    id: Type.Number(),
    dateRead: Type.Union([Type.Null(), Type.Number()]),
  });
  fastify.put<{ Body: Static<typeof SetDateReadSchema> }>(
    '/setDateRead',
    {
      schema: {
        body: SetDateReadSchema,
        tags: ['CollectionItem'],
      },
    },
    async (request, reply) => {
      const {
        body: { id, dateRead },
      } = request;
      await pool.any(setItemDateRead(id, dateRead));
      return true;
    }
  );
};
