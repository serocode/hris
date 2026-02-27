export type ApiErrorOptions = {
	message: string
	status: number
	code?: string
	details?: unknown
	retryAfter?: number
}

export class ApiError extends Error {
	status: number
	code?: string
	details?: unknown
	retryAfter?: number

	constructor(options: ApiErrorOptions) {
		super(options.message)
		this.name = "ApiError"
		this.status = options.status
		this.code = options.code
		this.details = options.details
		this.retryAfter = options.retryAfter
	}
}

export function isApiError(value: unknown): value is ApiError {
	return value instanceof ApiError
}
