import { createHonoApp } from "@/lib/hono"
import { sessionCheck } from "@/middlewares/session"
import type { App } from "@/types"
import { createEmployeeRoute } from "./create"
import { deleteEmployeeRoute } from "./delete"
import { getEmployeeRoute } from "./details"
import { getEmployeeByUserIdRoute } from "./get-by-user"
import { listEmployeesRoute } from "./list"
import { updateEmployeeRoute } from "./update"

export function employeeRoutes(app: App) {
	const employeeRoute = createHonoApp()

	employeeRoute.use("*", sessionCheck)

	createEmployeeRoute(app, employeeRoute)
	getEmployeeRoute(app, employeeRoute)
	getEmployeeByUserIdRoute(app, employeeRoute)
	listEmployeesRoute(app, employeeRoute)
	updateEmployeeRoute(app, employeeRoute)
	deleteEmployeeRoute(app, employeeRoute)

	return employeeRoute
}
