import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	EmployeesCreatePayload,
	EmployeesCreateResponse,
} from "@hris-v2/contracts/employees"
import {
	BadRequestErrorSchema,
	ConflictErrorSchema,
	ServerErrorSchema,
} from "@hris-v2/contracts/errors"
import {
	ForbiddenErrorRoute,
	NotFoundErrorRoute,
	UnauthorizedErrorRoute,
} from "@/lib/http/error-routes"
import { createSuccessResponse } from "@/lib/http/response-factory"
import { requirePermission } from "@/middlewares/rbac"
import { employeeService } from "@/services/employees"
import type { App } from "@/types/index"

const route = createRoute({
	tags: ["employees"],
	summary: "Create an employee",
	method: "post",
	path: "/",
	request: {
		body: {
			content: {
				"application/json": {
					schema: EmployeesCreatePayload,
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
					schema: EmployeesCreateResponse,
				},
			},
			description: "Employee created successfully",
		},
		400: {
			content: {
				"application/json": {
					schema: BadRequestErrorSchema,
				},
			},
			description: "Bad Request",
		},
		409: {
			content: {
				"application/json": {
					schema: ConflictErrorSchema,
				},
			},
			description: "Conflict",
		},
		500: {
			content: {
				"application/json": {
					schema: ServerErrorSchema,
				},
			},
			description: "Internal Server Error",
		},
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
	},
})

export function createEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
	employeeRoute.openapi(route, async (c) => {
		const body = c.req.valid("json")
		const actor = c.get("user")
		const logger = c.get("logger")

		logger.info(
			{
				actorId: actor.id,
			},
			"Starting Employee creation flow",
		)

		const result = await employeeService.createEmployee(
			{
				...body,
				userId: body.userId || actor.id,
			},
			actor.id,
		)

		logger.info(
			{
				employeeId: result.data.id,
				userId: actor.id,
			},
			"Employee created successfully",
		)

		return c.json(
			createSuccessResponse({
				id: result.data.id,
				userId: result.data.userId,
				firstName: result.data.firstName,
				lastName: result.data.lastName,
				middleName: result.data.middleName || undefined,
				suffix: result.data.suffix || undefined,
				dateOfBirth: result.data.dateOfBirth,
				hireDate: result.data.hireDate,
				createdAt: result.data.createdAt ?? "",
				updatedAt: result.data.updatedAt ?? "",
			}),
			201,
		)
	})
}
