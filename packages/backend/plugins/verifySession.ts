import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';

function verifySession(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const isAuthenticated = typeof request.session.userId === 'number';
  if (!isAuthenticated) {
    return request.session.destroy(() => {
      reply
        .status(401)
        .clearCookie('sessionId')
        .send({ statusCode: 401, message: 'Unauthorized' });
      done();
    });
  }

  return done();
}

const plugin = async (fastify: FastifyInstance) => {
  fastify.decorate('verifySession', verifySession);
};

export const fastifyVerifySession = fastifyPlugin(plugin, {
  fastify: '3.x',
  name: 'fastify-verify-session',
});

declare module 'fastify' {
  interface FastifyInstance {
    verifySession: typeof verifySession;
  }

  interface Session {
    userId: number;
  }
}
