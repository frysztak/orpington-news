import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { isLoginDisabled } from '@orpington-news/shared';

function verifySession(
  request: FastifyRequest,
  reply: FastifyReply,
  done: () => void
) {
  const disableLogin = isLoginDisabled();
  if (disableLogin) {
    return done();
  }

  const isAuthenticated = Boolean(request.session.authenticated);
  if (!isAuthenticated) {
    request.destroySession(() => {
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
    authenticated: boolean;
  }
}
