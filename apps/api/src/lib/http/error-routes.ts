import {
	BadRequestErrorSchema,
	ConflictErrorSchema,
	ForbiddenErrorSchema,
	NotFoundErrorSchema,
	ServerErrorSchema,
	TooManyRequestsErrorSchema,
	UnauthorizedErrorSchema,
	ValidationErrorSchema,
} from "@hris-v2/contracts/errors"
import type { ZodType } from "zod"

export function createErrorRoute(
	status: number,
	schema: ZodType<unknown>,
	description: string,
) {
	return {
		[status]: {
			content: {
				"application/json": { schema },
			},
			description,
		},
	}
}

export const BadRequestErrorRoute = createErrorRoute(
	400,
	BadRequestErrorSchema,
	"Bad Request",
)

export const UnauthorizedErrorRoute = createErrorRoute(
	401,
	UnauthorizedErrorSchema,
	"Unauthorized",
)

export const ForbiddenErrorRoute = createErrorRoute(
	403,
	ForbiddenErrorSchema,
	"Forbidden",
)

export const NotFoundErrorRoute = createErrorRoute(
	404,
	NotFoundErrorSchema,
	"Not Found",
)

export const ConflictErrorRoute = createErrorRoute(
	409,
	ConflictErrorSchema,
	"Conflict",
)

export const ValidationErrorRoute = createErrorRoute(
	422,
	ValidationErrorSchema,
	"Unprocessable Entity",
)

export const TooManyRequestsErrorRoute = createErrorRoute(
	429,
	TooManyRequestsErrorSchema,
	"Too Many Requests",
)

export const ServerErrorRoute = createErrorRoute(
	500,
	ServerErrorSchema,
	"Internal Server Error",
)
