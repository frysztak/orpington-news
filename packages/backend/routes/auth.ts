import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import { noop } from '@orpington-news/shared';
import { isLoginDisabled } from '@utils';

const PostLogin = Type.Object({
  username: Type.String(),
  password: Type.String(),
});

type PostLoginType = Static<typeof PostLogin>;

export const auth: FastifyPluginAsync = async (
  fastify,
  opts
): Promise<void> => {
  const disableLogin = isLoginDisabled();

  fastify.post<{ Body: PostLoginType; Reply: Object }>(
    '/login',
    {
      schema: {
        body: !disableLogin && PostLogin,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      if (disableLogin) {
        reply.status(200);
        return {};
      }

      if (!process.env.APP_USERNAME) {
        reply.status(500);
        return {
          statusCode: 500,
          message: `Env variable 'APP_USERNAME' not set.`,
        };
      }
      if (!process.env.APP_PASSWORD) {
        reply.status(500);
        return {
          statusCode: 500,
          message: `Env variable 'APP_PASSWORD' not set.`,
        };
      }

      const { username, password } = request.body;
      if (
        username === process.env.APP_USERNAME &&
        password === process.env.APP_PASSWORD
      ) {
        reply.status(200);
        request.session.set('authenticated', true);
        return { statusCode: 200 };
      } else {
        reply.status(401);
        return { statusCode: 401, message: 'Wrong username or password.' };
      }
    }
  );

  fastify.delete('/session', async (request, reply) => {
    request.destroySession(noop);
    return {};
  });
};
