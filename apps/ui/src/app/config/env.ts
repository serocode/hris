import { z } from "zod"

const ClientEnvSchema = z.object({
	VITE_API_URL: z.url(),
})

const ServerEnvSchema = z.object({
	API_URL: z.url().optional(),
	VITE_API_URL: z.url().optional(),
})

function trimTrailingSlash(url: string): string {
	return url.endsWith("/") ? url.slice(0, -1) : url
}

function deriveAppOriginFromApiOrigin(apiOrigin: string): string | null {
	try {
		const parsed = new URL(apiOrigin)
		const hostname = parsed.hostname

		// Dev convention: https://api.hris.localhost -> https://hris.localhost
		if (hostname.startsWith("api.") && hostname.endsWith(".localhost")) {
			return `${parsed.protocol}//${hostname.slice(4)}`
		}
	} catch {
		return null
	}

	return null
}

export function getClientApiUrl(): string {
	const parsed = ClientEnvSchema.safeParse(import.meta.env)

	if (!parsed.success) {
		throw new Error("Missing or invalid VITE_API_URL. Check apps/ui/.env.")
	}

	return trimTrailingSlash(parsed.data.VITE_API_URL)
}

export function getClientAppUrl(): string | null {
	return deriveAppOriginFromApiOrigin(getClientApiUrl())
}

export function getServerApiUrl(): string {
	const parsed = ServerEnvSchema.safeParse(process.env)

	if (!parsed.success) {
		throw new Error("Missing or invalid API_URL/VITE_API_URL in server env.")
	}

	const serverUrl = parsed.data.API_URL ?? parsed.data.VITE_API_URL

	if (!serverUrl) {
		throw new Error("API_URL or VITE_API_URL is required for server requests.")
	}

	return trimTrailingSlash(serverUrl)
}
