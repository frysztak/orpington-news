import { sql } from 'slonik';
import { ID } from '@orpington-news/shared';
import { User } from './types';

export const insertUser = (
  user: Pick<User, 'username'> & { password: string }
) => {
  const { username, password } = user;
  return sql<{ id: ID }>`
    INSERT INTO "users"(name, password)
    VALUES (${username}, ${password})
    RETURNING id`;
};

export const getUserPassword = (username: string) => {
  return sql<{ id: ID; password: string }>`
    SELECT id, password FROM "users"
    WHERE name = ${username}`;
};

export const setUserPassword = (userId: ID, password: string) => {
  return sql`
    UPDATE "users"
    SET password = ${password}
    WHERE id = ${userId}`;
};
