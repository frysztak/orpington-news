import 'dotenv/config.js';
import { createPool } from 'slonik';

if (!process.env.DATABASE_URL) {
  throw new Error(`DATABASE_URL not set!`);
}

export const pool = createPool(process.env.DATABASE_URL);
