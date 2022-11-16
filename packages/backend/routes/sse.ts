import type { FastifyPluginAsync } from 'fastify';
import type { EventMessage } from 'fastify-sse-v2';
import { EventIterator } from 'event-iterator';
import { sseEmitter } from 'sse';

export const sse: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.addHook('preHandler', fastify.auth([fastify.verifySession]));

  fastify.get('/', { schema: {} }, (req, res) => {
    const sseSource = new EventIterator<EventMessage>(({ push }) => {
      const cb = (data: any) => {
        push({ data });
      };
      sseEmitter.on('push', cb);

      req.raw.on('close', () => {
        sseEmitter.removeListener('push', cb);
      });

      return () => sseEmitter.removeListener('push', cb);
    });

    res.header('X-Accel-Buffering', 'no').sse(sseSource);
  });
};
