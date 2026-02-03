import { z } from "zod"

const envSchema = z.object({
	// Server Configuration
	API_PORT: z.coerce.number().default(3333),
	NODE_ENV: z
		.enum(["development", "production", "test"])
		.default("development"),
	LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

	// Auth Configuration
	BETTER_AUTH_URL: z.string().url().default("https://api.hris.localhost"),
	BETTER_AUTH_SECRET: z.string().min(16, "BETTER_AUTH_SECRET must be at least 16 characters"),

	// CORS Configuration
	ALLOWED_ORIGINS: z
		.string()
		.default("http://localhost:5173,http://localhost:3000")
		.transform((s) => s.split(",").map((o) => o.trim())),

	// PostgreSQL Configuration - Required for database connectivity
	POSTGRES_HOST: z.string().min(1, "POSTGRES_HOST is required"),
	POSTGRES_USER: z.string().min(1, "POSTGRES_USER is required"),
	POSTGRES_PASSWORD: z.string().min(1, "POSTGRES_PASSWORD is required"),
	POSTGRES_DB: z.string().min(1, "POSTGRES_DB is required"),
	POSTGRES_MAX_CONNECTIONS: z.coerce.number().default(10),
	POSTGRES_IDLE_TIMEOUT: z.coerce.number().default(30),

	// Redis Configuration
	REDIS_HOST: z.string().default("localhost"),
	REDIS_PORT: z.coerce.number().default(6379),
	REDIS_PASSWORD: z.string().default("hris-master-password"),
	REDIS_USERNAME: z.string().default("default"),
	REDIS_DB: z.coerce.number().default(0),

	// SMTP Configuration
	SMTP_HOST: z.string().default("localhost"),
	SMTP_PORT: z.coerce.number().default(1025),
})

// Parse and validate environment variables on module load
const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
	console.error("❌ Invalid environment variables:")
	console.error(parsed.error.flatten().fieldErrors)
	process.exit(1)
}

export const env = parsed.data

// Re-export individual variables for backward compatibility
export const API_PORT = env.API_PORT
export const NODE_ENV = env.NODE_ENV
export const LOG_LEVEL = env.LOG_LEVEL
export const BETTER_AUTH_URL = env.BETTER_AUTH_URL
export const BETTER_AUTH_SECRET = env.BETTER_AUTH_SECRET
export const ALLOWED_ORIGINS = env.ALLOWED_ORIGINS
export const POSTGRES_HOST = env.POSTGRES_HOST
export const POSTGRES_USER = env.POSTGRES_USER
export const POSTGRES_PASSWORD = env.POSTGRES_PASSWORD
export const POSTGRES_DB = env.POSTGRES_DB
export const POSTGRES_MAX_CONNECTIONS = env.POSTGRES_MAX_CONNECTIONS
export const POSTGRES_IDLE_TIMEOUT = env.POSTGRES_IDLE_TIMEOUT
export const REDIS_HOST = env.REDIS_HOST
export const REDIS_PORT = env.REDIS_PORT
export const REDIS_PASSWORD = env.REDIS_PASSWORD
export const REDIS_USERNAME = env.REDIS_USERNAME
export const REDIS_DB = env.REDIS_DB
export const SMTP_HOST = env.SMTP_HOST
export const SMTP_PORT = env.SMTP_PORT