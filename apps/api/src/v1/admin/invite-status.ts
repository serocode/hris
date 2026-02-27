import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	AdminInviteStatusListResponse,
	AdminInviteStatusQuery,
} from "@hris-v2/contracts/admin"
import { OK } from "stoker/http-status-codes"
import {
	BadRequestErrorRoute,
	ForbiddenErrorRoute,
	ServerErrorRoute,
	UnauthorizedErrorRoute,
} from "@/lib/http/error-routes"
import { createSuccessResponse } from "@/lib/http/response-factory"
import { requirePermission } from "@/middlewares/rbac"
import { adminService } from "@/services/admin"
import type { App } from "@/types"

const route = createRoute({
	tags: ["admin"],
	summary: "List invite statuses for users",
	method: "get",
	path: "/users/invite-status",
	request: {
		query: AdminInviteStatusQuery,
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [requirePermission({ user: ["list"] })],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: AdminInviteStatusListResponse,
				},
			},
			description: "Invite statuses retrieved",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...ServerErrorRoute,
	},
})

export function inviteStatusRoute(_app: App, adminRoute: OpenAPIHono) {
	adminRoute.openapi(route, async (c) => {
		const { userIds } = AdminInviteStatusQuery.parse(c.req.query())

		const parsedUserIds = (userIds ?? "")
			.split(",")
			.map((value: string) => value.trim())
			.filter(Boolean)

		const data = await adminService.listInviteStatusesForUsers(parsedUserIds)

		return c.json(createSuccessResponse(data), OK)
	})
}
