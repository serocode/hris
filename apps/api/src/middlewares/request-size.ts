import type { Context, Next } from 'hono';
import { getLogger } from './logger';

export const MAX_REQUEST_SIZE = 10 * 1024 * 1024; // 10MB

/**
 * Validates that incoming request body size doesn't exceed the limit
 * This helps prevent DoS attacks with large payloads
 */
export const requestSizeLimit = () => {
	return async (c: Context, next: Next) => {
		const logger = getLogger();
		const contentLength = c.req.header('content-length');

		if (contentLength) {
			const size = parseInt(contentLength, 10);

			if (Number.isNaN(size)) {
				logger.warn(
					{
						path: c.req.url,
						contentLength,
					},
					'Invalid content-length header',
				);

				return c.json(
					{
						status: 'error',
						message: 'Invalid Content-Length header',
					},
					400,
				);
			}

			if (size > MAX_REQUEST_SIZE) {
				logger.warn(
					{
						path: c.req.url,
						ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip'),
						contentLength: size,
						maxSize: MAX_REQUEST_SIZE,
					},
					'Request body too large',
				);

				return c.json(
					{
						status: 'error',
						message: `Request body exceeds maximum size of ${MAX_REQUEST_SIZE / 1024 / 1024}MB`,
					},
					413,
				);
			}
		}

		await next();
	};
};
