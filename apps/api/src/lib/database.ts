import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import {
    POSTGRES_DB,
    POSTGRES_HOST,
    POSTGRES_PASSWORD,
    POSTGRES_USER,
} from '@/constants/env';
import * as schema from '@/schema';

export type Schema = typeof schema;

export const pg = postgres({
  host: POSTGRES_HOST,
  database: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

export const db = drizzle(pg, { logger: true, schema});
