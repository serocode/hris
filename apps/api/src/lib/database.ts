import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import {
	NODE_ENV,
	POSTGRES_DB,
	POSTGRES_HOST,
	POSTGRES_IDLE_TIMEOUT,
	POSTGRES_MAX_CONNECTIONS,
	POSTGRES_PASSWORD,
	POSTGRES_USER,
} from "@/constants/env"
import * as schema from "@/schema"

export type Schema = typeof schema

export const pg = postgres({
	host: POSTGRES_HOST,
	database: POSTGRES_DB,
	user: POSTGRES_USER,
	password: POSTGRES_PASSWORD,
	max: POSTGRES_MAX_CONNECTIONS,
	idle_timeout: POSTGRES_IDLE_TIMEOUT,
})

export const db = drizzle(pg, {
	logger: NODE_ENV !== "production",
	schema,
})
