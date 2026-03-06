import { ApiErrorBody } from "@hris-v2/contracts/errors"
import type { ZodType } from "zod"
import { getClientApiUrl } from "@/app/config/env"
import { ApiError } from "./api-error"

type HttpOptions<TResponse> = Omit<RequestInit, "body"> & {
	body?: unknown
	schema?: ZodType<TResponse>
	baseUrl?: string
	timeoutMs?: number
}

function parseRetryAfter(value: string | null): number | undefined {
	if (!value) return undefined

	const parsed = Number(value)
	return Number.isFinite(parsed) ? parsed : undefined
}

export async function http<TResponse>(
	path: string,
	options: HttpOptions<TResponse> = {},
): Promise<TResponse> {
	const {
		schema,
		baseUrl = getClientApiUrl(),
		body,
		timeoutMs = 15000,
		headers,
		...init
	} = options

	const controller = init.signal ? null : new AbortController()
	const timeoutId =
		controller && timeoutMs > 0
			? setTimeout(() => controller.abort(), timeoutMs)
			: null

	let response: Response
	try {
		response = await fetch(`${baseUrl}${path}`, {
			...init,
			credentials: "include",
			signal: init.signal ?? controller?.signal,
			headers: {
				Accept: "application/json",
				...headers,
			},
			body:
				body === undefined
					? undefined
					: typeof body === "string" || body instanceof FormData
						? body
						: JSON.stringify(body),
		})
	} catch (error) {
		if (
			error instanceof DOMException &&
			error.name === "AbortError" &&
			!init.signal
		) {
			throw new ApiError({
				message: "Request timed out. Please try again.",
				status: 408,
			})
		}
		throw error
	} finally {
		if (timeoutId) clearTimeout(timeoutId)
	}

	const contentType = response.headers.get("content-type") ?? ""
	const hasJsonBody = contentType.includes("application/json")
	const payload =
		response.status === 204
			? null
			: hasJsonBody
				? await response.json().catch(() => null)
				: await response.text().catch(() => null)

	if (!response.ok) {
		const parsedErrorBody = ApiErrorBody.safeParse(payload)
		const errorString =
			parsedErrorBody.success && typeof parsedErrorBody.data.error === "string"
				? parsedErrorBody.data.error
				: undefined
		const message = parsedErrorBody.success
			? (parsedErrorBody.data.message ??
				errorString ??
				`Request failed (${response.status})`)
			: `Request failed (${response.status})`

		throw new ApiError({
			message,
			status: response.status,
			code: parsedErrorBody.success ? parsedErrorBody.data.code : undefined,
			details: parsedErrorBody.success ? parsedErrorBody.data.details : payload,
			retryAfter: parseRetryAfter(response.headers.get("retry-after")),
		})
	}

	if (!schema) {
		return payload as TResponse
	}

	const parsed = schema.safeParse(payload)

	if (!parsed.success) {
		const firstError = parsed.error.issues[0]
		const errorPath = firstError?.path.join(".") || "unknown"
		const errorMessage = firstError?.message || "unknown error"

		throw new ApiError({
			message: `Received an invalid response from the server. (Field: ${errorPath} - ${errorMessage})`,
			status: response.status,
			details: parsed.error.issues,
		})
	}

	return parsed.data
}
