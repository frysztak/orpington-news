import 'dotenv/config.js';
import { createPool } from 'slonik';
import { createQueryLoggingInterceptor } from 'slonik-interceptor-query-logging';
import { readEnvVariable } from '@utils';
import { nonNull } from '@orpington-news/shared';

const isDev = process.env.NODE_ENV === 'development';
const interceptors = [isDev ? createQueryLoggingInterceptor() : null].filter(
  nonNull
);

export const buildDsn = (): string => {
  const user = process.env.DB_USER ?? 'postgres';
  const pass = readEnvVariable('DB_PASS', { fileFallback: true });
  const host = readEnvVariable('DB_HOST');
  const port = process.env.DB_PORT ?? 5432;
  const name = process.env.DB_NAME ?? 'postgres';

  return `postgresql://${user}:${pass}@${host}:${port}/${name}`;
};

export const pool = await createPool(buildDsn(), { interceptors });
