import 'dotenv/config.js';
import { createPool } from 'slonik';

if (!process.env.DB_HOST) {
  throw new Error(`DB_HOST not set!`);
}

if (!process.env.DB_PASS) {
  throw new Error(`DB_PASS not set!`);
}

export const buildDsn = (): string => {
  const user = process.env.DB_USER ?? 'postgres';
  const pass = process.env.DB_PASS;
  const host = process.env.DB_HOST;
  const port = process.env.DB_PORT ?? 5432;
  const name = process.env.DB_NAME ?? 'postgres';

  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
};

export const pool = createPool(buildDsn());
