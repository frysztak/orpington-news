import { FastifyPluginAsync } from 'fastify';
import { Static, Type } from '@sinclair/typebox';
import argon2 from 'argon2';
import { defaultPreferences, ID } from '@orpington-news/shared';
import { pool } from '@db';
import {
  getUser,
  getUserPassword,
  getUserPasswordById,
  insertUser,
  setUser,
  setUserPassword,
} from '@db/users';
import { insertPreferences } from '@db/preferences';

export const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
  const PostRegister = Type.Object({
    username: Type.String(),
    password: Type.String(),
    displayName: Type.String(),
    avatar: Type.Optional(Type.String()),
  });
  fastify.post<{ Body: Static<typeof PostRegister> }>(
    '/register',
    {
      schema: {
        body: PostRegister,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const {
        body: { username, password, displayName, avatar },
      } = request;

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
          insertUser({
            username,
            password: passwordHashed,
            displayName,
            avatar,
          })
        );
        await conn.query(insertPreferences(defaultPreferences, id));
      });
      return true;
    }
  );

  const PostLogin = Type.Object({
    username: Type.String(),
    password: Type.String(),
  });
  fastify.post<{ Body: Static<typeof PostLogin> }>(
    '/login',
    {
      schema: {
        body: PostLogin,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const {
        body: { username, password },
      } = request;
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

  const PasswordBody = Type.Object({
    currentPassword: Type.String(),
    newPassword: Type.String(),
  });
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
        body: { currentPassword, newPassword },
        session: { userId },
      } = request;

      const { password: currentPasswordHash } = await pool.one(
        getUserPasswordById(userId)
      );
      const isCurrentPasswordValid = await argon2.verify(
        currentPasswordHash,
        currentPassword
      );
      if (!isCurrentPasswordValid) {
        return reply
          .status(500)
          .send({ errorCode: 500, message: 'Current password is incorrect.' });
      }

      const passwordHashed = await argon2.hash(newPassword, {
        type: argon2.argon2id,
      });
      await pool.query(setUserPassword(userId, passwordHashed));
      return true;
    }
  );

  const getUserData = async (userId: ID) => {
    const { avatar, ...rest } = await pool.one(getUser(userId));
    return {
      ...rest,
      avatar: avatar?.toString('ascii'),
    };
  };

  fastify.get(
    '/user',
    {
      schema: {
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;

      return await getUserData(userId);
    }
  );

  const PutUser = Type.Object({
    displayName: Type.String(),
    avatar: Type.Optional(Type.String()),
  });
  fastify.put<{ Body: Static<typeof PutUser> }>(
    '/user',
    {
      schema: {
        body: PutUser,
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      const {
        body: { displayName, avatar },
        session: { userId },
      } = request;
      await pool.query(
        setUser({
          id: userId,
          displayName,
          avatar,
        })
      );
      return await getUserData(userId);
    }
  );

  fastify.delete(
    '/session',
    {
      schema: {
        tags: ['Auth'],
      },
    },
    async (request, reply) => {
      request.session.destroy(() => {
        reply.status(200).clearCookie('sessionId').send(true);
      });
    }
  );
};
