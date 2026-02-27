import { createHonoApp } from "@/lib/hono"
import type { App } from "@/types"
import { adminRoutes } from "./admin"
import { employeeRoutes } from "./employees"
import { meRoutes } from "./me"

export function v1Routes(app: App) {
	const v1 = createHonoApp()

	v1.route("/admin", adminRoutes(app))
	v1.route("/employees", employeeRoutes(app))
	v1.route("/me", meRoutes(app))

	return v1
}
