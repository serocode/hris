import { mockLogger } from "@tests/helpers/setup"
import { describe, expect, it } from "vitest"
import { createHonoApp } from "@/lib/hono"
import {
	healthCheck,
	livenessProbe,
	readinessProbe,
} from "@/middlewares/health"

describe("Root and Health Routes Integration", () => {
	function buildApp() {
		const app = createHonoApp()

		app.use("*", async (c, next) => {
			c.set("logger", mockLogger())
			await next()
		})

		app.get("/", (c) =>
			c.json({ status: "ok", message: "HRIS API is running" }),
		)
		app.get(
			"/health",
			healthCheck({
				checkDatabase: async () => true,
				checkRedis: async () => true,
				checkAuth: async () => true,
			}),
		)
		app.get("/health/live", livenessProbe())
		app.get(
			"/health/ready",
			readinessProbe({
				checkDatabase: async () => true,
			}),
		)

		return app
	}

	it("GET / should return 200 and status ok", async () => {
		const app = buildApp()
		const res = await app.request("/")
		expect(res.status).toBe(200)
		const body = (await res.json()) as { status: string; message: string }
		expect(body.status).toBe("ok")
		expect(body.message).toContain("HRIS API")
	})

	it("GET /health should return 200", async () => {
		const app = buildApp()
		const res = await app.request("/health")
		expect(res.status).toBe(200)
		const body = (await res.json()) as { status: string }
		expect(body.status).toBe("healthy")
	})

	it("GET /health/live should return 200", async () => {
		const app = buildApp()
		const res = await app.request("/health/live")
		expect(res.status).toBe(200)
		const body = (await res.json()) as { status: string }
		expect(body.status).toBe("alive")
	})

	it("GET /health/ready should return 200", async () => {
		const app = buildApp()
		const res = await app.request("/health/ready")
		expect(res.status).toBe(200)
		const body = (await res.json()) as { status: string }
		expect(body.status).toBe("ready")
	})
})
