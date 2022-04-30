import { sql } from 'slonik';
import type { ID, User } from '@orpington-news/shared';

const mapAvatar = (avatar: User['avatar']) => {
  return avatar ? sql.binary(Buffer.from(avatar, 'ascii')) : null;
};

export const insertUser = (user: User & { password: string }) => {
  const { username, password, displayName, avatar } = user;

  return sql<{ id: ID }>`
    INSERT INTO "users"(
      name, 
      password, 
      display_name, 
      avatar
    )
    VALUES (
      ${username}, 
      ${password},
      ${displayName},
      ${mapAvatar(avatar)}
    )
    RETURNING id`;
};

export const setUser = (user: Omit<User, 'username'> & { id: ID }) => {
  const { id, displayName, avatar } = user;

  return sql`
    UPDATE "users"
    SET
      display_name = ${displayName},
      avatar = ${mapAvatar(avatar)}
    WHERE id = ${id}`;
};

export const getUser = (id: ID) => {
  return sql<Omit<User, 'avatar'> & { avatar?: Buffer }>`
    SELECT
      name as username,
      display_name as "displayName",
      avatar
    FROM "users"
    WHERE id = ${id}`;
};

export const getUserPassword = (username: string) => {
  return sql<{ id: ID; password: string }>`
    SELECT id, password FROM "users"
    WHERE name = ${username}`;
};

export const getUserPasswordById = (userId: ID) => {
  return sql<{ password: string }>`
    SELECT password FROM "users"
    WHERE id = ${userId}`;
};

export const setUserPassword = (userId: ID, password: string) => {
  return sql`
    UPDATE "users"
    SET password = ${password}
    WHERE id = ${userId}`;
};
