import { createMiddleware } from "hono/factory"
import { auth } from "@/lib/auth"
import { createUnauthorizedResponse } from "@/lib/http/response-factory"

export const sessionCheck = createMiddleware(async (c, next) => {
	const logger = c.get("logger")

	try {
		const session = await auth.api.getSession({
			headers: c.req.raw.headers,
		})

		if (!session) {
			logger.warn("No valid session found")

			return c.json(
				createUnauthorizedResponse([{ message: "No valid session found" }]),
				401,
			)
		}

		c.set("session", session.session)
		c.set("user", session.user)

		await next()
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			"Session validation failed",
		)

		return c.json(
			createUnauthorizedResponse([{ message: "Session validation failed" }]),
			401,
		)
	}
})
