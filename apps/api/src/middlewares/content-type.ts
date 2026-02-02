import type { Context, Next } from 'hono';
import { getLogger } from './logger';

/**
 * Validates that incoming requests have the correct content-type
 * for POST, PUT, PATCH requests
 */
export const contentTypeValidator = () => {
	return async (c: Context, next: Next) => {
		const logger = getLogger();
		const method = c.req.method;

		// Only validate for methods that typically have bodies
		if (!['POST', 'PUT', 'PATCH'].includes(method)) {
			await next();
			return;
		}

		const contentType = c.req.header('content-type')?.toLowerCase() || '';
		const allowedTypes = [
			'application/json',
			'application/json; charset=utf-8',
			'multipart/form-data',
			'multipart/form-data; charset=utf-8',
		];

		const isValid = allowedTypes.some((type) => contentType.startsWith(type));

		if (!isValid) {
			logger.warn(
				{
					contentType,
					path: c.req.url,
					ip: c.req.header('x-forwarded-for') || c.req.header('cf-connecting-ip'),
				},
				'Invalid content-type received',
			);

			return c.json(
				{
					status: 'error',
					message: 'Invalid Content-Type',
					error: {
						issues: [
							{
								message: `Expected one of: ${allowedTypes.join(', ')}. Got: ${contentType || 'undefined'}`,
							},
						],
					},
				},
				415,
			);
		}

		await next();
	};
};
