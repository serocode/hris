import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	EmployeesDetailsParams,
	EmployeesDetailsResponse,
} from "@hris-v2/contracts/employees"
import { formatDate } from "@hris-v2/utils"
import {
	BadRequestErrorRoute,
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
	summary: "Get employee by ID",
	method: "get",
	path: "/{id}",
	request: {
		params: EmployeesDetailsParams,
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
					schema: EmployeesDetailsResponse,
				},
			},
			description: "Employee retrieved successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
		...ServerErrorRoute,
	},
})

export function getEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
	employeeRoute.openapi(route, async (c) => {
		const { id } = EmployeesDetailsParams.parse(c.req.param())
		const user = c.get("user")
		const logger = c.get("logger")

		logger.info(
			{
				userId: user.id,
				userEmail: user.email,
				employeeId: id,
			},
			"Getting employee by ID",
		)

		const employee = await employeeService.getEmployeeById(id)

		logger.info(
			{
				employeeId: employee.id,
			},
			"Employee retrieved successfully",
		)

		return c.json(
			createSuccessResponse({
				id: employee.id,
				userId: employee.userId,
				firstName: employee.firstName,
				lastName: employee.lastName,
				middleName: employee.middleName || undefined,
				suffix: employee.suffix || undefined,
				dateOfBirth: employee.dateOfBirth,
				hireDate: employee.hireDate,
				createdAt: employee.createdAt
					? formatDate(employee.createdAt, "YYYY-MM-DDTHH:mm:ssZ")
					: "",
				updatedAt: employee.updatedAt
					? formatDate(employee.updatedAt, "YYYY-MM-DDTHH:mm:ssZ")
					: "",
			}),
		)
	})
}
