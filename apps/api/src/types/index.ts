import type { OpenAPIHono } from '@hono/zod-openapi';
import type { Queue } from 'bullmq';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { Logger } from 'pino';
import type { Sql } from 'postgres';
import type { auth } from '@/lib/auth';
import type { Schema } from '@/lib/database';

export type App = {
  openAPIHono: OpenAPIHono;
  pg: Sql;
  db: PostgresJsDatabase<Schema>;
  mailQueue: Queue;
};

export type AuthType = {
  user: typeof auth.$Infer.Session.user | null;
  session: typeof auth.$Infer.Session.session | null;
};

declare module 'hono' {
  interface ContextVariableMap {
    user: NonNullable<AuthType['user']>;
    session: NonNullable<AuthType['session']>;
    logger: Logger;
  }
}