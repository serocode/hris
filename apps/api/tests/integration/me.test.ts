import { type ApiSuccessResponse, mockLogger } from "@tests/helpers/setup"
import type { Context, Next } from "hono"
import { describe, expect, it, vi } from "vitest"
import { createHonoApp } from "@/lib/hono"
import type { App } from "@/types"
import { meRoutes } from "@/v1/me"

vi.mock("@/middlewares/session", () => ({
	sessionCheck: async (_c: Context, next: Next) => await next(),
}))

vi.mock("@/services/users", () => ({
	userService: {
		getProfile: vi.fn().mockResolvedValue({
			employee: {
				id: "emp-123",
				userId: "user-456",
				firstName: "John",
				lastName: "Doe",
				middleName: null,
				suffix: null,
				fullName: "John Doe",
				dateOfBirth: "1990-01-01",
				hireDate: "2020-01-01",
				createdAt: new Date("2020-01-01"),
				updatedAt: new Date("2020-01-01"),
			},
			account: {
				id: "user-456",
				email: "john@example.com",
				name: "John Doe",
				image: null,
			},
		}),
		updateProfile: vi.fn(),
	},
}))

describe("Me Route Integration", () => {
	function buildApp() {
		const app = createHonoApp()

		app.use("*", async (c, next) => {
			c.set("logger", mockLogger())
			c.set("user", {
				id: "user-456",
				email: "john@example.com",
				name: "EMP001", // employee_number
				createdAt: new Date(),
				updatedAt: new Date(),
				emailVerified: true,
				banned: false,
			})
			await next()
		})

		app.route("/", meRoutes({} as App))

		return app
	}

	interface MeProfile {
		id: string
		userId: string
		email: string
		name: string
		firstName: string
		lastName: string
		middleName: string | null
		suffix: string | null
		image: string | null
		hireDate: string
		createdAt: string
		updatedAt: string
	}

	it("GET / should return 200 and formatted profile", async () => {
		const app = buildApp()
		const res = await app.request("/")
		expect(res.status).toBe(200)

		const body = (await res.json()) as ApiSuccessResponse<MeProfile>
		expect(body.status).toBe("success")
		expect(body.data.name).toBe("John Doe")
		expect(body.data.email).toBe("john@example.com")
		expect(body.data.userId).toBe("user-456")
	})

	it("PATCH / should return 200 and updated profile", async () => {
		const { userService } = await import("@/services/users")
		vi.mocked(userService.updateProfile).mockResolvedValueOnce({
			employee: {
				id: "emp-123",
				userId: "user-456",
				firstName: "Jane",
				lastName: "Doe",
				middleName: null,
				suffix: null,
				fullName: "Jane Doe",
				dateOfBirth: "1990-01-01",
				hireDate: "2020-01-01",
				createdAt: new Date("2020-01-01"),
				updatedAt: new Date("2020-01-01"),
			},
			account: {
				id: "user-456",
				email: "john@example.com",
				name: "Jane Doe",
				image: null,
			},
		})

		const app = buildApp()
		const res = await app.request("/", {
			method: "PATCH",
			headers: {
				"content-type": "application/json",
			},
			body: JSON.stringify({
				firstName: "Jane",
			}),
		})

		expect(res.status).toBe(200)

		const body = (await res.json()) as ApiSuccessResponse<MeProfile>
		expect(body.status).toBe("success")
		expect(body.data.firstName).toBe("Jane")
		expect(body.data.name).toBe("Jane Doe")
	})
})
