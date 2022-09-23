import 'dotenv/config.js';
import { createPool } from 'slonik';
import { readEnvVariable } from '@utils';

export const buildDsn = (): string => {
  const user = process.env.DB_USER ?? 'postgres';
  const pass = readEnvVariable('DB_PASS', { fileFallback: true });
  const host = readEnvVariable('DB_HOST');
  const port = process.env.DB_PORT ?? 5432;
  const name = process.env.DB_NAME ?? 'postgres';

  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
};

export const pool = await createPool(buildDsn());
