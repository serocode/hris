import { createRoute } from "@hono/zod-openapi"
import {
	MeResponse,
	MeUpdatePayload,
	MeUpdateResponse,
} from "@hris-v2/contracts/me"
import { formatDate } from "@hris-v2/utils"
import { createHonoApp } from "@/lib/hono"
import {
	BadRequestErrorRoute,
	NotFoundErrorRoute,
	ServerErrorRoute,
	UnauthorizedErrorRoute,
} from "@/lib/http/error-routes"
import { createSuccessResponse } from "@/lib/http/response-factory"
import { sessionCheck } from "@/middlewares/session"
import { userService } from "@/services/users"
import type { UpdateOwnProfileCommand } from "@/services/users/users.types"
import type { App } from "@/types"

const route = createRoute({
	tags: ["me"],
	summary: "Get own profile",
	method: "get",
	path: "/",
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [sessionCheck],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: MeResponse,
				},
			},
			description: "User profile retrieved successfully",
		},
		...UnauthorizedErrorRoute,
		...NotFoundErrorRoute,
		...ServerErrorRoute,
	},
})

const updateRoute = createRoute({
	tags: ["me"],
	summary: "Update own profile",
	method: "patch",
	path: "/",
	request: {
		body: {
			content: {
				"application/json": {
					schema: MeUpdatePayload,
				},
			},
		},
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [sessionCheck],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: MeUpdateResponse,
				},
			},
			description: "User profile updated successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...NotFoundErrorRoute,
		...ServerErrorRoute,
	},
})

function toMeResponseData(
	profile: Awaited<ReturnType<typeof userService.getProfile>>,
) {
	return {
		id: profile.employee.id,
		userId: profile.employee.userId,
		email: profile.account.email,
		name: profile.account.name ?? profile.employee.fullName,
		firstName: profile.employee.firstName,
		lastName: profile.employee.lastName,
		middleName: profile.employee.middleName ?? null,
		suffix: profile.employee.suffix ?? null,
		image: profile.account.image ?? null,
		hireDate: formatDate(profile.employee.hireDate),
		createdAt: profile.employee.createdAt
			? formatDate(profile.employee.createdAt, "YYYY-MM-DDTHH:mm:ssZ")
			: "",
		updatedAt: profile.employee.updatedAt
			? formatDate(profile.employee.updatedAt, "YYYY-MM-DDTHH:mm:ssZ")
			: "",
	}
}

function toUpdateOwnProfileCommand(
	payload: MeUpdatePayload,
): UpdateOwnProfileCommand {
	return {
		firstName: payload.firstName,
		lastName: payload.lastName,
		middleName: payload.middleName,
		suffix: payload.suffix,
		image: payload.image,
	}
}

export function meRoutes(_app: App) {
	const meRoute = createHonoApp()

	meRoute.openapi(route, async (c) => {
		const user = c.get("user")
		const logger = c.get("logger")

		logger.info(
			{
				userId: user.id,
				userEmail: user.email,
			},
			"Fetching user profile",
		)

		const profile = await userService.getProfile(user.id)

		logger.info(
			{
				employeeId: profile.employee.id,
			},
			"User profile retrieved successfully",
		)

		return c.json(createSuccessResponse(toMeResponseData(profile)), 200)
	})

	meRoute.openapi(updateRoute, async (c) => {
		const user = c.get("user")
		const logger = c.get("logger")
		const payload = c.req.valid("json")

		logger.info(
			{
				userId: user.id,
				userEmail: user.email,
				updates: payload,
			},
			"Updating own profile",
		)

		const profile = await userService.updateProfile(
			user.id,
			toUpdateOwnProfileCommand(payload),
		)

		logger.info(
			{
				employeeId: profile.employee.id,
			},
			"User profile updated successfully",
		)

		return c.json(createSuccessResponse(toMeResponseData(profile)), 200)
	})

	return meRoute
}
