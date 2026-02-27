import { redirect } from "@tanstack/react-router"
import { getServerSession } from "@/server/auth"

import type { AuthSession, AuthUser } from "./auth-types"
export type { AuthSession, AuthUser }

/**
 * Require an authenticated session. Redirects to login if not authenticated.
 * Returns the session if valid.
 */
export async function requireAuth(redirectTo?: string): Promise<AuthSession> {
	const session = await getServerSession()

	if (!session) {
		throw redirect({
			to: "/",
			search: {
				redirect: redirectTo,
			},
		})
	}

	return session
}

/**
 * Require a specific role. Calls requireAuth first, then checks the role field.
 * Redirects to the given path (default: /dashboard) if role does not match.
 */
export async function requireRole(
	role: string,
	redirectTo = "/dashboard",
): Promise<AuthSession> {
	const session = await requireAuth()

	if (session.user.role !== role) {
		throw redirect({
			to: redirectTo,
		})
	}

	return session
}

/**
 * Require the user to be a guest (unauthenticated).
 * Redirects to the given path (default: /dashboard) if already authenticated.
 */
export async function requireGuest(redirectTo = "/dashboard"): Promise<void> {
	const session = await getServerSession()

	if (session) {
		throw redirect({
			to: redirectTo,
		})
	}
}
