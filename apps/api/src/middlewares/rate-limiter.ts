import { createTooManyRequestsResponse } from "@hris-v2/api-routes"
import { createMiddleware } from "hono/factory"
import { redisClient } from "@/lib/redis"

export type RateLimitOptions = {
	windowMs: number
	max: number
	keyPrefix?: string
}

export const rateLimit = (options: RateLimitOptions) => {
	const { windowMs, max, keyPrefix = "rl:" } = options

	return createMiddleware(async (c, next) => {
		const ip = c.req.header("x-forwarded-for") || "unknown"
		const key = `${keyPrefix}${ip}`

		try {
			const current = await redisClient.incr(key)

			if (current === 1) {
				await redisClient.pexpire(key, windowMs)
			}

			if (current > max) {
				const ttl = await redisClient.pttl(key)
				const retryAfter = Math.ceil(ttl / 1000)

				return c.json(
					createTooManyRequestsResponse(
						`Too many requests, please try again in ${retryAfter} seconds.`,
						retryAfter,
					),
					429,
				)
			}

			c.res.headers.set("X-RateLimit-Limit", max.toString())
			c.res.headers.set("X-RateLimit-Remaining", Math.max(0, max - current).toString())

			await next()
		} catch (error) {
			const logger = c.get("logger")
			logger?.error({ error }, "Rate limiter Redis error")
			await next()
		}
	})
}
