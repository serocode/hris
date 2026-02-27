import { type ApiErrorResponse, createTestApp } from "@tests/helpers/setup"
import { describe, expect, it } from "vitest"
import { MAX_REQUEST_SIZE, requestSizeLimit } from "@/middlewares/request-size"

describe("requestSizeLimit middleware", () => {
	function buildApp() {
		const app = createTestApp()
		app.use("*", requestSizeLimit())
		app.all("/test", (c) => c.json({ ok: true }))
		return app
	}

	it("should allow requests without content-length header", async () => {
		const app = buildApp()
		const res = await app.request("/test", { method: "GET" })
		expect(res.status).toBe(200)
	})

	it("should allow requests under the size limit", async () => {
		const app = buildApp()
		const res = await app.request("/test", {
			method: "POST",
			headers: {
				"Content-Length": "1024",
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ data: "small" }),
		})
		expect(res.status).toBe(200)
	})

	it("should reject requests exceeding the size limit", async () => {
		const app = buildApp()
		const overLimit = MAX_REQUEST_SIZE + 1
		const res = await app.request("/test", {
			method: "POST",
			headers: {
				"Content-Length": overLimit.toString(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ data: "large" }),
		})
		expect(res.status).toBe(413)
		const body = (await res.json()) as ApiErrorResponse
		expect(body.status).toBe("error")
		expect(body.message).toContain("10MB")
	})

	it("should reject requests at exactly the size limit + 1", async () => {
		const app = buildApp()
		const res = await app.request("/test", {
			method: "POST",
			headers: {
				"Content-Length": (MAX_REQUEST_SIZE + 1).toString(),
				"Content-Type": "application/json",
			},
			body: "x",
		})
		expect(res.status).toBe(413)
	})

	it("should allow requests at exactly the size limit", async () => {
		const app = buildApp()
		const res = await app.request("/test", {
			method: "POST",
			headers: {
				"Content-Length": MAX_REQUEST_SIZE.toString(),
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ data: "ok" }),
		})
		expect(res.status).toBe(200)
	})

	it("should reject non-numeric content-length", async () => {
		const app = buildApp()
		const res = await app.request("/test", {
			method: "POST",
			headers: {
				"Content-Length": "not-a-number",
				"Content-Type": "application/json",
			},
			body: "data",
		})
		expect(res.status).toBe(400)
		const body = (await res.json()) as ApiErrorResponse
		expect(body.message).toBe("Invalid Content-Length header")
	})

	it("should export MAX_REQUEST_SIZE as 10MB", () => {
		expect(MAX_REQUEST_SIZE).toBe(10 * 1024 * 1024)
	})
})
