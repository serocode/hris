import { z } from "zod"

function isWeakSecret(secret: string): boolean {
	return (
		secret.length < 32 ||
		/change-me|example|placeholder|your[_-]?secret/i.test(secret)
	)
}

const envSchema = z
	.object({
		// Server Configuration
		API_PORT: z.coerce.number().default(3333),
		NODE_ENV: z
			.enum(["development", "production", "test"])
			.default("development"),
		LOG_LEVEL: z.enum(["debug", "info", "warn", "error"]).default("debug"),

		// Auth Configuration
		BETTER_AUTH_URL: z.string().url().default("https://api.hris.localhost"),
		BETTER_AUTH_SECRET: z
			.string()
			.min(32, "BETTER_AUTH_SECRET must be at least 32 characters"),
		FRONTEND_URL: z.string().url().default("http://localhost:5173"),
		COOKIE_DOMAIN: z.string().default(".hris.localhost"),

		// CORS Configuration
		ALLOWED_ORIGINS: z
			.string()
			.default(
				"http://localhost:5173,http://localhost:3000,https://hris.localhost,https://api.hris.localhost",
			)
			.transform((s) =>
				s
					.split(",")
					.map((o) => o.trim())
					.filter(Boolean),
			),

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
		REDIS_PASSWORD: z.string().optional().default(""),
		REDIS_USERNAME: z.string().default(""),
		REDIS_DB: z.coerce.number().default(0),

		// SMTP Configuration
		SMTP_HOST: z.string().default("localhost"),
		SMTP_PORT: z.coerce.number().default(1025),

		// Account Provisioning / Invite Configuration
		INVITE_EXPIRY_HOURS: z.coerce.number().int().min(1).max(168).default(72),
	})
	.superRefine((data, ctx) => {
		if (data.ALLOWED_ORIGINS.length === 0) {
			ctx.addIssue({
				code: "custom",
				path: ["ALLOWED_ORIGINS"],
				message: "At least one allowed origin is required",
			})
		}

		if (data.NODE_ENV !== "production") {
			return
		}

		if (!data.BETTER_AUTH_URL.startsWith("https://")) {
			ctx.addIssue({
				code: "custom",
				path: ["BETTER_AUTH_URL"],
				message: "BETTER_AUTH_URL must use HTTPS in production",
			})
		}

		if (isWeakSecret(data.BETTER_AUTH_SECRET)) {
			ctx.addIssue({
				code: "custom",
				path: ["BETTER_AUTH_SECRET"],
				message:
					"BETTER_AUTH_SECRET is too weak for production. Use a random 32+ character secret.",
			})
		}

		if (!data.REDIS_PASSWORD || isWeakSecret(data.REDIS_PASSWORD)) {
			ctx.addIssue({
				code: "custom",
				path: ["REDIS_PASSWORD"],
				message: "REDIS_PASSWORD is required and must be strong in production.",
			})
		}
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
export const FRONTEND_URL = env.FRONTEND_URL
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
export const COOKIE_DOMAIN = env.COOKIE_DOMAIN
export const INVITE_EXPIRY_HOURS = env.INVITE_EXPIRY_HOURS
