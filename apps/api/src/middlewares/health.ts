import type { Context } from 'hono';
import { auth } from '@/lib/auth';
import { pg } from '@/lib/database';
import { redisClient } from '@/lib/redis';
import { getLogger } from './logger';

const logger = getLogger();

interface HealthCheckResult {
	status: 'healthy' | 'unhealthy';
	checks: {
		db: boolean;
		redis: boolean;
		auth: boolean;
	};
	timestamp: string;
	version: string;
	uptime: number;
}

/**
 * Checks if the database connection is healthy
 */
async function checkDatabase(): Promise<boolean> {
	try {
		await pg`SELECT 1`;
		return true;
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'Health check failed: Database',
		);
		return false;
	}
}

/**
 * Checks if the Redis connection is healthy
 */
async function checkRedis(): Promise<boolean> {
	try {
		await redisClient.ping();
		return true;
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'Health check failed: Redis',
		);
		return false;
	}
}

/**
 * Checks if the auth service is reachable
 */
async function checkAuth(): Promise<boolean> {
	try {
		// Quick check - just verify auth API is responsive
		// This doesn't need a valid session, just connectivity
		await auth.api.getSession({ headers: new Headers() }).catch(() => null);
		return true;
	} catch (error) {
		logger.error(
			{ error: error instanceof Error ? error.message : String(error) },
			'Health check failed: Auth Service',
		);
		return false;
	}
}

/**
 * Comprehensive health check endpoint
 * Verifies all critical dependencies are functional
 */
export function healthCheck() {
	return async (c: Context) => {
		const startTime = Date.now();

		const [dbHealthy, redisHealthy, authHealthy] = await Promise.all([
			checkDatabase(),
			checkRedis(),
			checkAuth(),
		]);

		const allHealthy = dbHealthy && redisHealthy && authHealthy;

		const healthResult: HealthCheckResult = {
			status: allHealthy ? 'healthy' : 'unhealthy',
			checks: {
				db: dbHealthy,
				redis: redisHealthy,
				auth: authHealthy,
			},
			timestamp: new Date().toISOString(),
			version: process.env.npm_package_version || '1.0.0',
			uptime: Math.floor(process.uptime()),
		};

		const responseTime = Date.now() - startTime;
		logger.info(
			{
				...healthResult,
				responseTimeMs: responseTime,
			},
			'Health check completed',
		);

		return c.json(healthResult, allHealthy ? 200 : 503);
	};
}

/**
 * Simple liveness probe - just checks if the server is running
 * Used by Kubernetes/container orchestrators
 */
export function livenessProbe() {
	return async (c: Context) => {
		return c.json({ status: 'alive', timestamp: new Date().toISOString() }, 200);
	};
}

/**
 * Readiness probe - checks if the server can accept traffic
 * More comprehensive than liveness
 */
export function readinessProbe() {
	return async (c: Context) => {
		const [dbHealthy] = await Promise.all([checkDatabase()]);

		if (dbHealthy) {
			return c.json({ status: 'ready', timestamp: new Date().toISOString() }, 200);
		}

		return c.json({ status: 'not ready', reason: 'Database unavailable' }, 503);
	};
}
