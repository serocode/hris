import { type ApiErrorResponse, createTestApp } from "@tests/helpers/setup"
import { describe, expect, it } from "vitest"
import { ServiceError } from "@/lib/service-error"
import { onError } from "@/middlewares/on-error"

describe("onError handler", () => {
	function buildApp() {
		const app = createTestApp()
		app.onError(onError)
		return app
	}

	it("should handle ServiceError with 400 status", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new ServiceError("BAD_INPUT", "Invalid input data", 400)
		})

		const res = await app.request("/test")
		expect(res.status).toBe(400)
		const body = (await res.json()) as ApiErrorResponse
		expect(body).toHaveProperty("status", "error")
	})

	it("should handle ServiceError with 404 status", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new ServiceError("NOT_FOUND", "Resource not found", 404)
		})

		const res = await app.request("/test")
		expect(res.status).toBe(404)
	})

	it("should handle ServiceError with 409 status", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new ServiceError("CONFLICT", "Already exists", 409)
		})

		const res = await app.request("/test")
		expect(res.status).toBe(409)
	})

	it("should handle ServiceError with 500 status", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new ServiceError("INTERNAL", "Something broke", 500)
		})

		const res = await app.request("/test")
		expect(res.status).toBe(500)
	})

	it("should handle generic Error", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new Error("Unexpected failure")
		})

		const res = await app.request("/test")
		expect(res.status).toBe(500)
		const body = (await res.json()) as ApiErrorResponse
		expect(body.status).toBe("error")
		expect(body.error).toBe("Unexpected failure")
	})

	it("should include stack trace in non-production mode", async () => {
		const app = buildApp()
		app.get("/test", () => {
			throw new Error("Stack test")
		})

		const res = await app.request("/test")
		const body = (await res.json()) as ApiErrorResponse
		expect(body.stack).toBeDefined()
	})
})
