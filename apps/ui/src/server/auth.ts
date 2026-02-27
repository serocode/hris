// Server-only session fetcher — forwards browser cookies to the Hono API
import { createServerFn } from "@tanstack/react-start"
import { getCookies } from "@tanstack/react-start/server"
import { z } from "zod"
import { getServerApiUrl } from "@/app/config/env"
import type { AuthSession } from "@/lib/auth-types"

const SessionPayloadSchema = z.object({
	user: z.record(z.string(), z.unknown()),
	session: z.record(z.string(), z.unknown()),
})

export const getServerSession = createServerFn({ method: "GET" }).handler(
	async (): Promise<AuthSession | null> => {
		try {
			const apiUrl = getServerApiUrl()

			// Use getCookies() to access H3's raw request cookies
			const cookies = getCookies()
			const cookieHeader = Object.entries(cookies ?? {})
				.map(([name, value]) => `${name}=${value}`)
				.join("; ")

			if (!cookieHeader) {
				console.warn(
					"[SSR Auth] No cookies — ensure access via https://hris.localhost (not localhost:5173)",
				)
				return null
			}

			const controller = new AbortController()
			const timeoutId = setTimeout(() => controller.abort(), 5000)

			let response: Response
			try {
				response = await fetch(`${apiUrl}/api/auth/get-session`, {
					headers: { cookie: cookieHeader },
					credentials: "include",
					signal: controller.signal,
				})
			} finally {
				clearTimeout(timeoutId)
			}

			if (!response.ok) {
				console.error("[SSR Auth] API responded with status:", response.status)
				return null
			}

			const data = await response.json()
			const parsed = SessionPayloadSchema.safeParse(data)

			if (!parsed.success) {
				return null
			}

			return parsed.data as AuthSession
		} catch (error) {
			console.error("[SSR Auth] Error fetching session:", error)
			return null
		}
	},
)
