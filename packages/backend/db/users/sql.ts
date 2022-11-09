import { sql } from 'slonik';
import { dataUriToBuffer } from 'data-uri-to-buffer';
import { ID, User } from '@orpington-news/shared';

const mapAvatar = (avatar?: string) => {
  return avatar ? sql.binary(dataUriToBuffer(avatar)) : null;
};

export const insertUser = (
  user: Omit<User, 'hasAvatar'> & { password: string; avatar?: string }
) => {
  const { username, password, displayName, avatar, homeId } = user;

  return sql<{ id: ID }>`
INSERT INTO "users" (
  name,
  password,
  display_name,
  avatar,
  home_id)
VALUES (
  ${username},
  ${password},
  ${displayName},
  ${mapAvatar(avatar)},
  ${homeId})
RETURNING
  id
`;
};

export const updateHomeCollection = (userId: ID, collectionId: ID) => {
  return sql`
UPDATE
  users
SET
  home_id = ${collectionId}
WHERE
  users.id = ${userId}
`;
};

export const setUser = (
  user: Omit<User, 'username' | 'homeId'> & { id: ID }
) => {
  const { id, displayName, avatarUrl } = user;

  if (avatarUrl !== undefined && !avatarUrl.startsWith('data:image')) {
    return sql`
UPDATE
  "users"
SET
  display_name = ${displayName}
WHERE
  id = ${id}
`;
  }

  return sql`
UPDATE
  "users"
SET
  display_name = ${displayName},
  avatar = ${mapAvatar(avatarUrl)}
WHERE
  id = ${id}
`;
};

export const getUser = (id: ID) => {
  return sql<Omit<User, 'avatarUrl'> & { hasAvatar: boolean; homeId: ID }>`
SELECT
  name as username,
  display_name as "displayName",
  (
    CASE WHEN avatar IS NULL THEN
      FALSE
    ELSE
      TRUE
    END) as "hasAvatar",
  home_id as "homeId"
FROM
  "users"
WHERE
  id = ${id}
`;
};

export const getUserAvatar = (id: ID) => {
  return sql<{ avatar?: Buffer }>`
SELECT
  avatar
FROM
  "users"
WHERE
  id = ${id}
`;
};

export const getUserPassword = (username: string) => {
  return sql<{ id: ID; password: string }>`
SELECT
  id,
  password
FROM
  "users"
WHERE
  name = ${username}
`;
};

export const getUserPasswordById = (userId: ID) => {
  return sql<{ password: string }>`
SELECT
  password
FROM
  "users"
WHERE
  id = ${userId}
`;
};

export const setUserPassword = (userId: ID, password: string) => {
  return sql`
UPDATE
  "users"
SET
  password = ${password}
WHERE
  id = ${userId}
`;
};
