import type { ErrorHandler } from "hono"
import type { ContentfulStatusCode, StatusCode } from "hono/utils/http-status"
import { INTERNAL_SERVER_ERROR, OK } from "stoker/http-status-codes"
import { INTERNAL_SERVER_ERROR as SERVER_ERROR_MESSAGE } from "stoker/http-status-phrases"
import {
	createBadRequestResponse,
	createConflictResponse,
	createNotFoundResponse,
	createServerErrorResponse,
} from "@/lib/http/response-factory"
import { ServiceError } from "@/lib/service-error"
import { getLogger } from "./logger"

export const onError: ErrorHandler = (err, ctx) => {
	const logger = ctx.get("logger") || getLogger()
	const env = ctx.env?.NODE_ENV || process.env?.NODE_ENV
	const isProduction = env === "production"

	if (err instanceof ServiceError) {
		logger.error({ code: err.code, statusCode: err.statusCode }, err.message)

		const responseCreator =
			{
				400: () => createBadRequestResponse(null, [{ message: err.message }]),
				404: () => createNotFoundResponse([{ message: err.message }]),
				409: () => createConflictResponse([{ message: err.message }]),
				500: () => createServerErrorResponse(SERVER_ERROR_MESSAGE),
			}[err.statusCode] ||
			(() => createServerErrorResponse(SERVER_ERROR_MESSAGE))

		return ctx.json(responseCreator(), err.statusCode as ContentfulStatusCode)
	}

	const currentStatus =
		"status" in err ? err.status : ctx.newResponse(null).status

	const statusCode =
		currentStatus !== OK ? (currentStatus as StatusCode) : INTERNAL_SERVER_ERROR

	logger.error(
		{
			err,
			statusCode,
			url: ctx.req.url,
			method: ctx.req.method,
		},
		err.message,
	)

	return ctx.json(
		{
			status: "error",
			message: SERVER_ERROR_MESSAGE,
			error: isProduction ? SERVER_ERROR_MESSAGE : err.message,
			stack: isProduction ? undefined : err.stack,
		},
		statusCode as ContentfulStatusCode,
	)
}
