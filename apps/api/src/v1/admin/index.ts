import { createHonoApp } from "@/lib/hono"
import { sessionCheck } from "@/middlewares/session"
import type { App } from "@/types"
import { inviteStatusRoute } from "./invite-status"
import { provisionUserRoute } from "./provision-user"
import { resendInviteRoute } from "./resend-invite"

export function adminRoutes(app: App) {
	const adminRoute = createHonoApp()

	adminRoute.use("*", sessionCheck)

	provisionUserRoute(app, adminRoute)
	resendInviteRoute(app, adminRoute)
	inviteStatusRoute(app, adminRoute)

	return adminRoute
}
