import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	EmployeesUpdateParams,
	EmployeesUpdatePayload,
	EmployeesUpdateResponse,
} from "@hris-v2/contracts/employees"
import { formatDate } from "@hris-v2/utils"
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
import { employeeService } from "@/services/employees"
import type { App } from "@/types/index"

const route = createRoute({
	tags: ["employees"],
	summary: "Update an employee",
	method: "patch",
	path: "/{id}",
	request: {
		params: EmployeesUpdateParams,
		body: {
			content: {
				"application/json": {
					schema: EmployeesUpdatePayload,
				},
			},
		},
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [requirePermission({ user: ["set-role"] })],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: EmployeesUpdateResponse,
				},
			},
			description: "Employee updated successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
		...ConflictErrorRoute,
		...ServerErrorRoute,
	},
})

export function updateEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
	employeeRoute.openapi(route, async (c) => {
		const { id } = EmployeesUpdateParams.parse(c.req.param())
		const body = c.req.valid("json")
		const user = c.get("user")
		const logger = c.get("logger")

		logger.info(
			{
				userId: user.id,
				userEmail: user.email,
				employeeId: id,
				updates: body,
			},
			"Updating employee",
		)

		const employee = await employeeService.updateEmployee(id, body)

		logger.info(
			{
				employeeId: employee.data.id,
			},
			"Employee updated successfully",
		)

		return c.json(
			createSuccessResponse({
				id: employee.data.id,
				userId: employee.data.userId,
				firstName: employee.data.firstName,
				lastName: employee.data.lastName,
				middleName: employee.data.middleName || undefined,
				suffix: employee.data.suffix || undefined,
				dateOfBirth: employee.data.dateOfBirth,
				hireDate: formatDate(employee.data.hireDate),
				createdAt: employee.data.createdAt
					? formatDate(employee.data.createdAt, "YYYY-MM-DDTHH:mm:ssZ")
					: "",
				updatedAt: employee.data.updatedAt
					? formatDate(employee.data.updatedAt, "YYYY-MM-DDTHH:mm:ssZ")
					: "",
			}),
		)
	})
}
