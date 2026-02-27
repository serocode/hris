import { ZodError } from "zod"
import { isApiError } from "./api-error"

export function getErrorMessage(
	error: unknown,
	fallback = "Something went wrong. Please try again.",
): string {
	if (isApiError(error)) {
		switch (error.status) {
			case 400:
			case 422:
				return error.message || "Please check the form and try again."
			case 401:
				return "Your session has expired. Please sign in again."
			case 403:
				return "You are not allowed to perform this action."
			case 404:
				return "The requested resource was not found."
			case 413:
				return "Request is too large. Reduce payload size and try again."
			case 429:
				return error.retryAfter
					? `Too many requests. Try again in ${error.retryAfter}s.`
					: "Too many requests. Please wait and try again."
			default:
				return error.message || fallback
		}
	}

	if (error instanceof ZodError) {
		const firstIssue = error.issues[0]
		return firstIssue?.message ?? "Invalid data. Please review your input."
	}

	if (error instanceof Error && error.message) {
		return error.message
	}

	return fallback
}
