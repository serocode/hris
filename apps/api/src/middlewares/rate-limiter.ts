import { createMiddleware } from "hono/factory"
import { createTooManyRequestsResponse } from "@/lib/http/response-factory"
import { redisClient } from "@/lib/redis"

export type RateLimitOptions = {
	windowMs: number
	max: number
	keyPrefix?: string
}

export const rateLimit = (options: RateLimitOptions) => {
	const { windowMs, max, keyPrefix = "rl:" } = options

	const getClientIp = (rawIp: string | undefined): string => {
		if (!rawIp) {
			return "unknown"
		}

		const firstForwarded = rawIp.split(",")[0]?.trim()
		return firstForwarded || "unknown"
	}

	return createMiddleware(async (c, next) => {
		const ip = getClientIp(
			c.req.header("x-forwarded-for") ||
				c.req.header("cf-connecting-ip") ||
				c.req.header("x-real-ip"),
		)
		const key = `${keyPrefix}${ip}`

		try {
			const current = await redisClient.incr(key)

			if (current === 1) {
				await redisClient.pexpire(key, windowMs)
			}

			if (current > max) {
				const ttl = await redisClient.pttl(key)
				const retryAfter = Math.max(
					1,
					Math.ceil((ttl > 0 ? ttl : windowMs) / 1000),
				)

				c.header("Retry-After", retryAfter.toString())

				return c.json(
					createTooManyRequestsResponse(
						`Too many requests, please try again in ${retryAfter} seconds.`,
						retryAfter,
					),
					429,
				)
			}

			c.res.headers.set("X-RateLimit-Limit", max.toString())
			c.res.headers.set(
				"X-RateLimit-Remaining",
				Math.max(0, max - current).toString(),
			)

			await next()
		} catch (error) {
			const logger = c.get("logger")
			logger?.error({ error }, "Rate limiter Redis error")
			await next()
		}
	})
}
