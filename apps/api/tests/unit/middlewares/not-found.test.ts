import type { ApiErrorResponse } from "@tests/helpers/setup"
import { Hono } from "hono"
import { describe, expect, it } from "vitest"
import { notFound } from "@/middlewares/not-found"

describe("notFound handler", () => {
	function buildApp() {
		const app = new Hono()
		app.notFound(notFound)
		return app
	}

	it("should return 404 status code", async () => {
		const app = buildApp()
		const res = await app.request("/non-existent")
		expect(res.status).toBe(404)
	})

	it("should return JSON with correct error structure", async () => {
		const app = buildApp()
		const res = await app.request("/unknown-route")
		const body = (await res.json()) as ApiErrorResponse

		expect(body.status).toBe("error")
		expect(body.message).toBe("Not Found")
		expect(body.error).toContain("GET")
		expect(body.error).toContain("/unknown-route")
	})

	it("should include the HTTP method in the error message", async () => {
		const app = buildApp()
		const res = await app.request("/missing", { method: "POST" })
		const body = (await res.json()) as ApiErrorResponse

		expect(body.error).toContain("POST")
		expect(body.error).toContain("/missing")
	})

	it("should return application/json content type", async () => {
		const app = buildApp()
		const res = await app.request("/nope")
		expect(res.headers.get("content-type")).toContain("application/json")
	})
})
