import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	AdminProvisionUserPayload,
	AdminProvisionUserResponse,
} from "@hris-v2/contracts/admin"
import { CREATED } from "stoker/http-status-codes"
import {
	BadRequestErrorRoute,
	ConflictErrorRoute,
	ForbiddenErrorRoute,
	NotFoundErrorRoute,
	ServerErrorRoute,
	UnauthorizedErrorRoute,
} from "@/lib/http/error-routes"
import { createSuccessResponse } from "@/lib/http/response-factory"
import { requirePermission } from "@/middlewares/rbac"
import { adminService } from "@/services/admin"
import type { App } from "@/types"

const route = createRoute({
	tags: ["admin"],
	summary: "Provision a user account and employee profile",
	method: "post",
	path: "/provision-user",
	request: {
		body: {
			content: {
				"application/json": {
					schema: AdminProvisionUserPayload,
				},
			},
		},
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [requirePermission({ user: ["create"] })],
	responses: {
		201: {
			content: {
				"application/json": {
					schema: AdminProvisionUserResponse,
				},
			},
			description: "Provisioned successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
		...ConflictErrorRoute,
		...ServerErrorRoute,
	},
})

export function provisionUserRoute(_app: App, adminRoute: OpenAPIHono) {
	adminRoute.openapi(route, async (c) => {
		const actor = c.get("user")
		const body = c.req.valid("json")
		const logger = c.get("logger")

		logger.info({ actorId: actor.id, email: body.email }, "Provisioning user")

		const result = await adminService.provisionUserWithInvite(
			body,
			actor.id,
			c.req.raw.headers,
		)

		return c.json(createSuccessResponse(result), CREATED)
	})
}
