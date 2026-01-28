import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { db, pg } from '@/lib/database';

async function runMigration() {
  await migrate(db, { migrationsFolder: 'drizzle' });
  await pg.end();
}

runMigration();