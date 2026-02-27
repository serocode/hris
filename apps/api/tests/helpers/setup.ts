import { Hono } from "hono"
import type { Logger } from "pino"

/**
 * Standard API Error Response structure
 */
export interface ApiErrorResponse {
	status: "error"
	message: string
	error?:
		| string
		| {
				issues: Array<{
					message: string
					path: Array<string | number>
				}>
		  }
	stack?: string
}

/**
 * Standard API Success Response structure (generic)
 */
export interface ApiSuccessResponse<T> {
	status: "success"
	data: T
}

export function createTestApp() {
	const app = new Hono()

	app.use("*", async (c, next) => {
		c.set("logger", mockLogger())
		await next()
	})

	return app
}

export function mockLogger(): Logger {
	const noop = () => {}
	const logger = {
		level: "info",
		silent: noop,
		msgPrefix: "",
		version: "1.0.0",
		bindings: () => ({}),
		flush: noop,
		child: () => logger,
		debug: noop,
		error: noop,
		fatal: noop,
		info: noop,
		trace: noop,
		warn: noop,
		pino: "10.2.0",
		levelVal: 30,
		on: noop,
		emit: noop,
		addListener: noop,
		removeListener: noop,
		removeAllListeners: noop,
		listeners: () => [],
		setMaxListeners: () => logger,
		getMaxListeners: () => 0,
		off: noop,
		once: noop,
		raw: noop,
	} as unknown as Logger

	return logger
}
