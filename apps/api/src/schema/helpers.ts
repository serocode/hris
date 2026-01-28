import { timestamp } from "drizzle-orm/pg-core";

export const dates = {
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
};