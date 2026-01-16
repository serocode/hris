import { z } from "@hono/zod-openapi"
import {
	BAD_REQUEST,
	CONFLICT,
	FORBIDDEN,
	INTERNAL_SERVER_ERROR,
	NOT_FOUND,
	TOO_MANY_REQUESTS,
	UNAUTHORIZED,
	UNPROCESSABLE_ENTITY,
} from "stoker/http-status-phrases"

export const RESPONSE_STATUS = z.enum(["error", "success"])
export type ResponseStatus = z.infer<typeof RESPONSE_STATUS>

function createErrorSchema(message: string) {
	return z.object({
		status: RESPONSE_STATUS,
		message: z.string().openapi({ example: message }),
		error: z.any().optional(),
	})
}

export const ValidationErrorSchema = createErrorSchema(UNPROCESSABLE_ENTITY)
export const BadRequestErrorSchema = createErrorSchema(BAD_REQUEST)
export const ServerErrorSchema = createErrorSchema(INTERNAL_SERVER_ERROR)
export const NotFoundErrorSchema = createErrorSchema(NOT_FOUND)
export const ForbiddenErrorSchema = createErrorSchema(FORBIDDEN)
export const ConflictErrorSchema = createErrorSchema(CONFLICT)
export const TooManyRequestsErrorSchema = createErrorSchema(TOO_MANY_REQUESTS)
export const UnauthorizedErrorSchema = z.object({
	status: RESPONSE_STATUS,
	message: z.string().openapi({ example: UNAUTHORIZED }),
	error: z
		.object({
			issues: z.array(
				z.object({
					message: z.string(),
				}),
			),
		})
		.openapi({
			example: {
				issues: [{ message: "Unauthorized" }],
			},
		}),
})

export type ValidationError = z.infer<typeof ValidationErrorSchema>
export type BadRequestError = z.infer<typeof BadRequestErrorSchema>
export type ServerError = z.infer<typeof ServerErrorSchema>
export type NotFoundError = z.infer<typeof NotFoundErrorSchema>
export type UnauthorizedError = z.infer<typeof UnauthorizedErrorSchema>
export type ForbiddenError = z.infer<typeof ForbiddenErrorSchema>
export type ConflictError = z.infer<typeof ConflictErrorSchema>
export type TooManyRequestsError = z.infer<typeof TooManyRequestsErrorSchema>

export function createErrorRoute(
	status: number,
	schema: z.ZodType,
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
	"Internal server error",
)
