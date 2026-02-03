import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

describe("Environment Validation", () => {
	const originalEnv = process.env

	beforeEach(() => {
		// Reset modules to force re-evaluation of env.ts
		vi.resetModules()
		// Create a fresh copy of env
		process.env = { ...originalEnv }
	})

	afterEach(() => {
		process.env = originalEnv
	})

	it("should export validated environment config with correct types", async () => {
		// Set required environment variables
		process.env.BETTER_AUTH_SECRET = "test-secret-key-12345"
		process.env.POSTGRES_HOST = "localhost"
		process.env.POSTGRES_USER = "test_user"
		process.env.POSTGRES_PASSWORD = "test_password"
		process.env.POSTGRES_DB = "test_db"

		const { env } = await import("./env")

		expect(env.API_PORT).toBeTypeOf("number")
		expect(env.NODE_ENV).toMatch(/development|production|test/)
		expect(env.LOG_LEVEL).toMatch(/debug|info|warn|error/)
		expect(env.ALLOWED_ORIGINS).toBeInstanceOf(Array)
		expect(env.POSTGRES_HOST).toBe("localhost")
	})

	it("should use default values when optional variables are not set", async () => {
		process.env.BETTER_AUTH_SECRET = "test-secret-key-12345"
		process.env.POSTGRES_HOST = "localhost"
		process.env.POSTGRES_USER = "test_user"
		process.env.POSTGRES_PASSWORD = "test_password"
		process.env.POSTGRES_DB = "test_db"

		const { env } = await import("./env")

		expect(env.API_PORT).toBe(3333)
		// Vitest sets NODE_ENV=test by default
		expect(env.NODE_ENV).toMatch(/development|production|test/)
		expect(env.REDIS_PORT).toBe(6379)
	})

	it("should parse ALLOWED_ORIGINS as array", async () => {
		process.env.BETTER_AUTH_SECRET = "test-secret-key-12345"
		process.env.POSTGRES_HOST = "localhost"
		process.env.POSTGRES_USER = "test_user"
		process.env.POSTGRES_PASSWORD = "test_password"
		process.env.POSTGRES_DB = "test_db"
		process.env.ALLOWED_ORIGINS = "http://localhost:3000, http://localhost:5173"

		const { env } = await import("./env")

		expect(env.ALLOWED_ORIGINS).toEqual([
			"http://localhost:3000",
			"http://localhost:5173",
		])
	})

	it("should coerce numeric values correctly", async () => {
		process.env.BETTER_AUTH_SECRET = "test-secret-key-12345"
		process.env.POSTGRES_HOST = "localhost"
		process.env.POSTGRES_USER = "test_user"
		process.env.POSTGRES_PASSWORD = "test_password"
		process.env.POSTGRES_DB = "test_db"
		process.env.API_PORT = "8080"
		process.env.REDIS_PORT = "6380"

		const { env } = await import("./env")

		expect(env.API_PORT).toBe(8080)
		expect(env.REDIS_PORT).toBe(6380)
	})
})
