import type { OpenAPIHono } from "@hono/zod-openapi"
import { createRoute } from "@hono/zod-openapi"
import {
	EmployeesDeleteParams,
	EmployeesDeleteResponse,
} from "@hris-v2/contracts/employees"
import { formatDate } from "@hris-v2/utils"
import {
	BadRequestErrorRoute,
	ForbiddenErrorRoute,
	NotFoundErrorRoute,
	ServerErrorRoute,
	UnauthorizedErrorRoute,
} from "@/lib/http/error-routes"
import { requirePermission } from "@/middlewares/rbac"
import { employeeService } from "@/services/employees"
import type { App } from "@/types/index"

const route = createRoute({
	tags: ["employees"],
	summary: "Delete an employee",
	method: "delete",
	path: "/{id}",
	request: {
		params: EmployeesDeleteParams,
	},
	security: [
		{
			CookieAuth: [],
		},
	],
	middleware: [requirePermission({ user: ["delete"] })],
	responses: {
		200: {
			content: {
				"application/json": {
					schema: EmployeesDeleteResponse,
				},
			},
			description: "Employee deleted successfully",
		},
		...BadRequestErrorRoute,
		...UnauthorizedErrorRoute,
		...ForbiddenErrorRoute,
		...NotFoundErrorRoute,
		...ServerErrorRoute,
	},
})

export function deleteEmployeeRoute(_app: App, employeeRoute: OpenAPIHono) {
	employeeRoute.openapi(route, async (c) => {
		const { id } = EmployeesDeleteParams.parse(c.req.param())
		const user = c.get("user")
		const logger = c.get("logger")

		logger.info(
			{
				userId: user.id,
				userEmail: user.email,
				employeeId: id,
			},
			"Deleting employee",
		)

		const employee = await employeeService.deleteEmployee(id)

		logger.info(
			{
				employeeId: employee.data.id,
			},
			"Employee deleted successfully",
		)

		return c.json(
			{
				status: "success" as const,
				data: {
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
				},
				message: "Employee deleted successfully",
			},
			200,
		)
	})
}
