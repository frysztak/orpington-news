import Fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyCookie from 'fastify-cookie';
import fastifySession from '@fastify/session';
import fastifyAuth from 'fastify-auth';
import fastifySplitValidator from 'fastify-split-validator';
import { auth } from './auth';
import { fastifyVerifySession } from '@plugins/verifySession';
import { defaultAjv } from '@utils';

const authRoutes: FastifyPluginAsync = async (fastify, opts): Promise<void> => {
  fastify.get(
    '/sample',
    { preHandler: fastify.auth([fastify.verifySession]) },
    async (request, reply) => {
      return { sample: 'data' };
    }
  );
};

function build() {
  const fastify = Fastify();
  fastify.register(fastifyAuth);
  fastify.register(fastifyVerifySession);
  fastify.register(fastifySplitValidator, { defaultValidator: defaultAjv });
  fastify.register(auth, { prefix: '/auth' });
  fastify.register(authRoutes, { prefix: '/routes' });
  fastify.register(fastifyCookie);
  fastify.register(fastifySession, {
    secret: 'etc$yDsefnEqbKXDqYoom3BWywLx9!2w',
    cookie: {
      secure: false,
    },
  });
  return fastify;
}

describe('/auth', () => {
  let app: FastifyInstance;

  beforeEach(() => {
    app = build();
  });

  test('POST /login returns 400 for missing body', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/auth/login',
    });

    expect(res.statusCode).toBe(400);
    expect(res.json()).toHaveProperty('message', 'body must be object');
  });

  test("DELETE /session doesn't set cookie", async () => {
    const res = await app.inject({
      method: 'DELETE',
      url: '/auth/session',
      cookies: {
        sessionId: 'ee',
      },
    });

    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual(true);
    expect(res.headers).toHaveProperty(
      'set-cookie',
      'sessionId=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT'
    );
  });
});
