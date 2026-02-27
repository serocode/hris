import type { NotFoundHandler } from "hono"
import { NOT_FOUND } from "stoker/http-status-codes"
import { NOT_FOUND as NOT_FOUND_MESSAGE } from "stoker/http-status-phrases"

export const notFound: NotFoundHandler = (c) => {
	return c.json(
		{
			status: "error",
			message: NOT_FOUND_MESSAGE,
			error: `Cannot ${c.req.method} ${c.req.path}`,
		},
		NOT_FOUND,
	)
}
