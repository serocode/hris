import type {
	BadRequestError,
	ConflictError,
	ForbiddenError,
	NotFoundError,
	ServerError,
	TooManyRequestsError,
	UnauthorizedError,
	ValidationError,
} from "@hris-v2/contracts/errors"
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

export function createSuccessResponse<TData>(
	data: TData,
	meta?: unknown,
): { status: "success"; data: TData; meta?: unknown } {
	const response = {
		status: "success" as const,
		data,
	}

	if (meta !== undefined) {
		return { ...response, meta }
	}

	return response
}

export function createCreatedResponse<TData>(data: TData) {
	return createSuccessResponse(data)
}

export function createNoContentResponse() {
	return createSuccessResponse(null)
}

type PaginationMeta = {
	limit: number
	total: number
	cursor?: string
	page?: number
	totalPages?: number
	hasNext?: boolean
	hasPrev?: boolean
	nextCursor?: string
	prevCursor?: string
}

export function createPaginatedResponse<TData>(
	data: TData[],
	meta: PaginationMeta & { limit: number; total: number },
) {
	const totalPages = meta.totalPages || Math.ceil(meta.total / meta.limit)
	const hasNext = meta.page ? meta.page < totalPages : !!meta.cursor
	const hasPrev = meta.page ? meta.page > 1 : false

	return createSuccessResponse(data, {
		...meta,
		totalPages,
		hasNext,
		hasPrev,
	})
}

export function createBadRequestResponse(
	error: unknown,
	issues?: Array<{ message: string }>,
): BadRequestError {
	const errorObj = issues ? { issues } : error
	return {
		status: "error" as const,
		message: BAD_REQUEST,
		error: errorObj,
	}
}

export function createNotFoundResponse(
	error: string | Array<{ message: string }>,
): NotFoundError {
	const errorObj = Array.isArray(error) ? { issues: error } : error
	return {
		status: "error" as const,
		message: NOT_FOUND,
		error: errorObj,
	}
}

export function createServerErrorResponse(error?: Error | string): ServerError {
	const errMessage =
		typeof error === "string" ? error : error?.message || INTERNAL_SERVER_ERROR

	return {
		status: "error" as const,
		message: INTERNAL_SERVER_ERROR,
		error: errMessage,
	}
}

export function createUnauthorizedResponse(
	issues?: Array<{ message: string }>,
): UnauthorizedError {
	return {
		status: "error" as const,
		message: UNAUTHORIZED,
		error: { issues: issues || [{ message: "Unauthorized" }] },
	}
}

export function createValidationErrorResponse(
	issues: Array<{ message: string; path?: (string | number)[] }>,
): ValidationError {
	return {
		status: "error" as const,
		message: UNPROCESSABLE_ENTITY,
		error: { issues },
	}
}

export function createForbiddenResponse(
	error: string | Array<{ message: string }>,
): ForbiddenError {
	const errorObj = Array.isArray(error) ? { issues: error } : error
	return {
		status: "error" as const,
		message: FORBIDDEN,
		error: errorObj,
	}
}

export function createConflictResponse(
	error: string | Array<{ message: string }>,
): ConflictError {
	const errorObj = Array.isArray(error) ? { issues: error } : error
	return {
		status: "error" as const,
		message: CONFLICT,
		error: errorObj,
	}
}

export function createTooManyRequestsResponse(
	error: string | Array<{ message: string }>,
	retryAfter?: string | number,
): TooManyRequestsError & { retryAfter?: string | number } {
	const errorObj = Array.isArray(error) ? { issues: error } : error
	const response: TooManyRequestsError & { retryAfter?: string | number } = {
		status: "error" as const,
		message: TOO_MANY_REQUESTS,
		error: errorObj,
	}

	if (retryAfter !== undefined) {
		response.retryAfter = retryAfter
	}

	return response
}
