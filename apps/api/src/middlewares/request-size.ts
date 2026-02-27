import type { Context, Next } from "hono"
import { getLogger } from "./logger"

export const MAX_REQUEST_SIZE = 10 * 1024 * 1024 // 10MB

/**
 * Validates that incoming request body size doesn't exceed the limit
 * This helps prevent DoS attacks with large payloads
 */
export const requestSizeLimit = () => {
	const methodsWithBody = new Set(["POST", "PUT", "PATCH"])

	const getBodySize = async (request: Request): Promise<number> => {
		if (!request.body) {
			return 0
		}

		const reader = request.body.getReader()
		let totalSize = 0

		try {
			while (true) {
				const { done, value } = await reader.read()
				if (done) {
					break
				}

				totalSize += value.byteLength
				if (totalSize > MAX_REQUEST_SIZE) {
					await reader.cancel()
					break
				}
			}
		} finally {
			reader.releaseLock()
		}

		return totalSize
	}

	return async (c: Context, next: Next) => {
		if (!methodsWithBody.has(c.req.method)) {
			await next()
			return
		}

		const logger = c.get("logger") || getLogger()
		const contentLength = c.req.header("content-length")

		if (contentLength) {
			const size = Number.parseInt(contentLength, 10)

			if (Number.isNaN(size) || size < 0) {
				logger.warn(
					{
						path: c.req.url,
						contentLength,
					},
					"Invalid content-length header",
				)

				return c.json(
					{
						status: "error",
						message: "Invalid Content-Length header",
					},
					400,
				)
			}

			if (size > MAX_REQUEST_SIZE) {
				logger.warn(
					{
						path: c.req.url,
						ip:
							c.req.header("x-forwarded-for") ||
							c.req.header("cf-connecting-ip"),
						contentLength: size,
						maxSize: MAX_REQUEST_SIZE,
					},
					"Request body too large",
				)

				return c.json(
					{
						status: "error",
						message: `Request body exceeds maximum size of ${MAX_REQUEST_SIZE / 1024 / 1024}MB`,
					},
					413,
				)
			}
		}

		// Fallback for chunked bodies without content-length header.
		if (!contentLength && c.req.raw.body) {
			const actualSize = await getBodySize(c.req.raw.clone())

			if (actualSize > MAX_REQUEST_SIZE) {
				logger.warn(
					{
						path: c.req.url,
						contentLength: actualSize,
						maxSize: MAX_REQUEST_SIZE,
					},
					"Request body too large",
				)

				return c.json(
					{
						status: "error",
						message: `Request body exceeds maximum size of ${MAX_REQUEST_SIZE / 1024 / 1024}MB`,
					},
					413,
				)
			}
		}

		await next()
	}
}
