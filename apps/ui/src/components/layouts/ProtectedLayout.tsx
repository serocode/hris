import { useNavigate, useRouteContext } from "@tanstack/react-router"
import { useState } from "react"
import { useStopImpersonatingMutation } from "@/features/admin/api/admin-query-options"
import { useMeQuery } from "@/features/profile/profile.query"
import { authClient } from "@/lib/auth-client"
import type { AuthSession } from "@/lib/auth-utils"
import { getErrorMessage } from "@/lib/error-message"
import { useToast } from "@/lib/feedback"
import { ProtectedSidebar } from "./protected/ProtectedSidebar"
import { ProtectedStatusBanners } from "./protected/ProtectedStatusBanners"

function getImpersonatedByUserId(
	session: AuthSession | undefined,
): string | null {
	const sessionData = session?.session as Record<string, unknown> | undefined
	if (!sessionData) return null

	const impersonatedBy =
		sessionData.impersonatedBy ?? sessionData.impersonated_by ?? null

	return typeof impersonatedBy === "string" && impersonatedBy.length > 0
		? impersonatedBy
		: null
}

export function ProtectedLayout({
	children,
}: Readonly<{ children: React.ReactNode }>) {
	const { session } = useRouteContext({ from: "/_protected" }) as {
		session: AuthSession | undefined
	}
	const navigate = useNavigate()
	const [sidebarOpen, setSidebarOpen] = useState(false)
	const stopImpersonatingMutation = useStopImpersonatingMutation()
	const toast = useToast()
	const { data: profileResponse } = useMeQuery({
		enabled: Boolean(session?.user),
	})
	const profile = profileResponse?.data ?? null

	// During SSR, the redirect may not prevent rendering — guard against undefined session
	if (!session?.user) {
		return null
	}

	const user = session.user
	const isAdmin = user.role === "admin"
	const impersonatedByUserId = getImpersonatedByUserId(session)
	const isImpersonating = Boolean(impersonatedByUserId)

	const displayName = profile?.name ?? user.name ?? user.email ?? "User"

	const displaySubtitle = user.email

	const initials = (
		profile?.name?.[0] ??
		user.name?.[0] ??
		user.email?.[0] ??
		"?"
	).toUpperCase()

	async function handleLogout() {
		await authClient.signOut()
		navigate({ to: "/" })
	}

	async function handleExitImpersonation() {
		try {
			await stopImpersonatingMutation.mutateAsync()
			await navigate({ to: "/admin/users" })
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to exit impersonation mode."),
			})
		}
	}

	return (
		<div className="protected-layout">
			<button
				type="button"
				className="mobile-menu-btn"
				onClick={() => setSidebarOpen(!sidebarOpen)}
			>
				<svg
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Toggle menu</title>
					<line x1="3" y1="6" x2="21" y2="6" />
					<line x1="3" y1="12" x2="21" y2="12" />
					<line x1="3" y1="18" x2="21" y2="18" />
				</svg>
			</button>

			{sidebarOpen && (
				<button
					type="button"
					className="sidebar-overlay"
					onClick={() => setSidebarOpen(false)}
					onKeyDown={(e) => {
						if (e.key === "Escape") setSidebarOpen(false)
					}}
					aria-label="Close sidebar"
					tabIndex={-1}
				/>
			)}

			<ProtectedSidebar
				sidebarOpen={sidebarOpen}
				isAdmin={isAdmin}
				initials={initials}
				displayName={displayName}
				displaySubtitle={displaySubtitle}
				isImpersonating={isImpersonating}
				onLogout={handleLogout}
			/>

			<main className="protected-main">
				<ProtectedStatusBanners
					isImpersonating={isImpersonating}
					isExitingImpersonation={stopImpersonatingMutation.isPending}
					onExitImpersonation={handleExitImpersonation}
				/>
				{children}
			</main>
		</div>
	)
}
