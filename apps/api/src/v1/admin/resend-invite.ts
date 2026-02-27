import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute, z } from "@hono/zod-openapi"
import { AdminResendInviteResponse } from "@hris-v2/contracts/admin"
import { OK } from "stoker/http-status-codes"
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

const ResendInviteParams = z.object({
	userId: z.string().openapi({ example: "user_123" }),
})

const route = createRoute({
	tags: ["admin"],
	summary: "Resend account invite",
	method: "post",
	path: "/users/{userId}/resend-invite",
	request: {
		params: ResendInviteParams,
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [requirePermission({ user: ["update"] })],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: AdminResendInviteResponse,
				},
			},
			description: "Invite resent successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
		...ConflictErrorRoute,
		...ServerErrorRoute,
	},
})

export function resendInviteRoute(_app: App, adminRoute: OpenAPIHono) {
	adminRoute.openapi(route, async (c) => {
		const actor = c.get("user")
		const { userId } = ResendInviteParams.parse(c.req.param())
		const logger = c.get("logger")

		logger.info({ actorId: actor.id, userId }, "Resending invite")

		const result = await adminService.resendUserInvite(userId, actor.id)

		return c.json(createSuccessResponse(result), OK)
	})
}
