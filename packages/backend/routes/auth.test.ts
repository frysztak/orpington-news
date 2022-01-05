import Fastify, { FastifyInstance, FastifyPluginAsync } from 'fastify';
import fastifyCookie from 'fastify-cookie';
import fastifySession from '@fastify/session';
import fastifyAuth from 'fastify-auth';
import { auth } from './auth';
import { fastifyVerifySession } from '@plugins/verifySession';

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
  const originalEnv = process.env;

  describe('with login disabled', () => {
    let app: FastifyInstance;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        APP_DISABLE_LOGIN: 'true',
      };

      app = build();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('POST /login always returns 200', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({});
    });

    test('DELETE /session always returns 200', async () => {
      const res = await app.inject({
        method: 'DELETE',
        url: '/auth/session',
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({});
    });

    test('GET /routes/sample', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/routes/sample',
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ sample: 'data' });
    });
  });

  describe('with login enabled', () => {
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
      expect(res.json()).toHaveProperty('message', 'body should be object');
    });

    test('POST /login returns 500 for missing username/password in process.env', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: '',
          password: '',
        },
      });

      expect(res.statusCode).toBe(500);
      expect(res.json()).toHaveProperty(
        'message',
        "Env variable 'APP_USERNAME' not set."
      );
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
      expect(res.json()).toEqual({});
      expect(res.headers).not.toHaveProperty('set-cookie');
    });
  });

  describe('with login enabled and username/password in process.env', () => {
    let app: FastifyInstance;

    beforeEach(() => {
      jest.resetModules();
      process.env = {
        ...originalEnv,
        APP_USERNAME: 'user',
        APP_PASSWORD: 'password',
      };

      app = build();
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    test('POST /login returns returns 401 for wrong username', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'ee',
          password: '',
        },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json()).toHaveProperty(
        'message',
        'Wrong username or password.'
      );
    });

    test('POST /login returns returns 401 for wrong password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'user',
          password: '',
        },
      });

      expect(res.statusCode).toBe(401);
      expect(res.json()).toHaveProperty(
        'message',
        'Wrong username or password.'
      );
    });

    test('POST /login returns returns 200 for correct username/password', async () => {
      const res = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'user',
          password: 'password',
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.headers).toHaveProperty('set-cookie');
    });

    test('GET /routes/sample returns 401 when not logged in', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/routes/sample',
      });

      expect(res.statusCode).toBe(401);
    });

    test('GET /routes/sample returns 200 when logged in', async () => {
      const { cookies } = await app.inject({
        method: 'POST',
        url: '/auth/login',
        payload: {
          username: 'user',
          password: 'password',
        },
      });

      const cookie = cookies[0] as any;

      const res = await app.inject({
        method: 'GET',
        url: '/routes/sample',
        cookies: {
          [cookie.name]: cookie.value,
        },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ sample: 'data' });
    });
  });
});
