import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import argon2 from 'argon2';
import { fileTypeFromBuffer } from 'file-type';
import { defaultPreferences, ID } from '@orpington-news/shared';
import { pool } from '@db';
import {
  getUser,
  getUserAvatar,
  getUserPassword,
  getUserPasswordById,
  insertUser,
  setUser,
  setUserPassword,
} from '@db/users';
import { insertPreferences } from '@db/preferences';

export const auth: FastifyPluginAsync = async (fastify): Promise<void> => {
  const PostRegister = z.object({
    username: z.string(),
    password: z.string(),
    displayName: z.string(),
    avatar: z.string().optional(),
  });
  fastify.post<{ Body: z.infer<typeof PostRegister> }>(
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

  const PostLogin = z.object({
    username: z.string(),
    password: z.string(),
  });
  fastify.post<{ Body: z.infer<typeof PostLogin> }>(
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

  const PasswordBody = z.object({
    currentPassword: z.string(),
    newPassword: z.string(),
  });
  fastify.put<{ Body: z.infer<typeof PasswordBody> }>(
    '/password',
    {
      schema: {
        body: PasswordBody,
        tags: ['Auth'],
      },
      preHandler: fastify.auth([fastify.verifySession]),
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

  const apiUrl = process.env.API_URL ?? `${process.env.APP_URL}/api`;
  const getUserJSON = (userId: ID) => {
    return pool.one(getUser(userId)).then((result) => {
      const { hasAvatar, ...rest } = result;
      return {
        ...rest,
        avatarUrl: hasAvatar ? `${apiUrl}/auth/user/avatar` : undefined,
      };
    });
  };

  fastify.get(
    '/user',
    {
      schema: {
        tags: ['Auth'],
      },
      preHandler: fastify.auth([fastify.verifySession]),
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;

      return await getUserJSON(userId);
    }
  );

  const PutUser = z.object({
    displayName: z.string(),
    avatarUrl: z.string().optional(),
  });
  fastify.put<{ Body: z.infer<typeof PutUser> }>(
    '/user',
    {
      schema: {
        body: PutUser,
        tags: ['Auth'],
      },
      preHandler: fastify.auth([fastify.verifySession]),
    },
    async (request, reply) => {
      const {
        body: { displayName, avatarUrl },
        session: { userId },
      } = request;

      await pool.query(
        setUser({
          id: userId,
          displayName,
          avatarUrl,
        })
      );

      return await getUserJSON(userId);
    }
  );

  fastify.get(
    '/user/avatar',
    {
      schema: {
        tags: ['Auth'],
      },
      preHandler: fastify.auth([fastify.verifySession]),
    },
    async (request, reply) => {
      const {
        session: { userId },
      } = request;

      const response = await pool.maybeOne(getUserAvatar(userId));
      const buffer = response?.avatar;
      if (!buffer) {
        reply.status(404);
        return;
      }
      const fileType = await fileTypeFromBuffer(buffer);
      if (!fileType) {
        reply.status(500);
        return { statusCode: 500, message: 'Unknown file type.' };
      }

      reply.status(200).type(fileType.mime);
      return buffer;
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
      await request.session.destroy();
      reply.status(200).clearCookie('sessionId').send(true);
    }
  );
};
