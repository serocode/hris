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
import { z } from "zod"

export const RESPONSE_STATUS = z.enum(["error", "success"])
export type ResponseStatus = z.infer<typeof RESPONSE_STATUS>

function createErrorSchema(message: string) {
	return z.object({
		status: RESPONSE_STATUS,
		message: z.string().default(message),
		error: z.unknown().optional(),
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
	message: z.string().default(UNAUTHORIZED),
	error: z.object({
		issues: z.array(
			z.object({
				message: z.string(),
			}),
		),
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

export const ApiErrorBody = z.object({
	status: RESPONSE_STATUS.optional(),
	message: z.string().optional(),
	error: z.unknown().optional(),
	code: z.string().optional(),
	details: z.unknown().optional(),
})
export type ApiErrorBody = z.infer<typeof ApiErrorBody>
