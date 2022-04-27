import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import argon2 from 'argon2';
import { defaultPreferences, noop } from '@orpington-news/shared';
import { pool } from '@db';
import { getUserPassword, insertUser, setUserPassword } from '@db/users';
import { insertPreferences } from '@db/preferences';

const PostLogin = Type.Object({
  username: Type.String(),
  password: Type.String(),
});

type PostLoginType = Static<typeof PostLogin>;

const PasswordBody = Type.Object({
  password: Type.String(),
});

export const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
  fastify.post<{ Body: PostLoginType }>(
    '/register',
    {
      schema: {
        body: PostLogin,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;

      const userExists = await pool.exists(getUserPassword(username));
      if (userExists) {
        reply
          .status(500)
          .send({ errorCode: 500, message: 'Username is already taken.' });
        return false;
      }

      const passwordHashed = await argon2.hash(password, {
        type: argon2.argon2id,
      });
      await pool.transaction(async (conn) => {
        const { id } = await conn.one(
          insertUser({ username, password: passwordHashed })
        );
        await conn.query(insertPreferences(defaultPreferences, id));
      });
      return true;
    }
  );

  fastify.post<{ Body: PostLoginType }>(
    '/login',
    {
      schema: {
        body: PostLogin,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const { username, password } = request.body;
      const passQuery = await pool.maybeOne(getUserPassword(username));
      if (passQuery === null) {
        reply.status(403);
        return { statusCode: 403, message: 'Wrong username or password.' };
      }
      const isPasswordCorrect = await argon2.verify(
        passQuery.password,
        password
      );

      if (isPasswordCorrect) {
        reply.status(200);
        request.session.userId = passQuery.id;
        return true;
      } else {
        reply.status(403);
        return { statusCode: 403, message: 'Wrong username or password.' };
      }
    }
  );

  fastify.put<{ Body: Static<typeof PasswordBody> }>(
    '/password',
    {
      schema: {
        body: PasswordBody,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const {
        body: { password },
        session: { userId },
      } = request;

      const passwordHashed = await argon2.hash(password, {
        type: argon2.argon2id,
      });
      await pool.query(setUserPassword(userId, passwordHashed));
      return true;
    }
  );

  fastify.delete('/session', async (request, reply) => {
    request.destroySession(() => {
      reply.status(200).clearCookie('sessionId').send(true);
    });
  });
};
