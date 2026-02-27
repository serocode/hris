import {
	createFileRoute,
	useRouterState,
	useSearch,
} from "@tanstack/react-router"
import { useState } from "react"
import { getClientAppUrl } from "@/app/config/env"
import { PublicLayout } from "@/components/layouts/PublicLayout"
import { authClient } from "@/lib/auth-client"
import { requireGuest } from "@/lib/auth-utils"

type LoginSearch = {
	redirect?: string
	// activated?: string
}

function isSafeRedirect(target?: string): target is string {
	return Boolean(target?.startsWith("/") && !target.startsWith("//"))
}

function resolvePostLoginUrl(path: string): string {
	const canonicalAppUrl = getClientAppUrl()
	if (!canonicalAppUrl) return path
	return new URL(path, canonicalAppUrl).toString()
}

export const Route = createFileRoute("/")({
	validateSearch: (search: Record<string, unknown>): LoginSearch => ({
		redirect: (search.redirect as string) ?? undefined,
		// activated: (search.activated as string) ?? undefined,
	}),
	beforeLoad: async () => {
		await requireGuest("/dashboard")
	},
	component: LoginPage,
})

function LoginPage() {
	const search = useSearch({ from: "/" })
	const [email, setEmail] = useState("")
	const [password, setPassword] = useState("")
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const activationComplete = useRouterState({
		select: (s) => s.location.state.activated === true,
	})

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		try {
			const result = await authClient.signIn.email({
				email,
				password,
			})

			if (result.error) {
				setError(result.error.message ?? "Sign in failed. Please try again.")
				setLoading(false)
				return
			}

			// Get the updated session to determine redirect based on role
			const session = await authClient.getSession()

			if (!session?.data?.user) {
				setError("Failed to retrieve session. Please try again.")
				setLoading(false)
				return
			}

			// Role-based redirect: admins go to /admin, others to /dashboard
			const defaultRedirect =
				session.data.user.role === "admin" ? "/admin" : "/dashboard"
			const redirectTo = isSafeRedirect(search.redirect)
				? search.redirect
				: defaultRedirect

			// Full page reload to ensure server picks up the new session cookie
			window.location.href = resolvePostLoginUrl(redirectTo)
		} catch {
			setError("An unexpected error occurred. Please try again.")
			setLoading(false)
		}
	}

	return (
		<PublicLayout>
			<div className="login-container">
				<div className="login-card">
					<div className="login-header">
						<svg
							width="40"
							height="40"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="login-logo"
						>
							<title>HRIS Logo</title>
							<path d="M12 2L2 7l10 5 10-5-10-5z" />
							<path d="M2 17l10 5 10-5" />
							<path d="M2 12l10 5 10-5" />
						</svg>
						<h1 className="login-title">HRIS</h1>
						<p className="login-subtitle">
							Sign in to your account to continue
						</p>
					</div>

					<form onSubmit={handleSubmit} className="login-form">
						{activationComplete && (
							<div className="login-success">
								<span>
									Account activated successfully. Sign in with your new
									password.
								</span>
							</div>
						)}

						{error && (
							<div className="login-error">
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<title>Error</title>
									<circle cx="12" cy="12" r="10" />
									<line x1="15" y1="9" x2="9" y2="15" />
									<line x1="9" y1="9" x2="15" y2="15" />
								</svg>
								<span>{error}</span>
							</div>
						)}

						<div className="form-field">
							<label htmlFor="email" className="form-label">
								Email address
							</label>
							<input
								id="email"
								type="email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className="form-input"
								placeholder="you@example.com"
								required
								autoComplete="email"
							/>
						</div>

						<div className="form-field">
							<label htmlFor="password" className="form-label">
								Password
							</label>
							<input
								id="password"
								type="password"
								value={password}
								onChange={(e) => setPassword(e.target.value)}
								className="form-input"
								placeholder="••••••••"
								required
								autoComplete="current-password"
							/>
						</div>

						<button type="submit" className="login-btn" disabled={loading}>
							{loading ? (
								<span className="login-btn-loading">
									<svg
										width="20"
										height="20"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="spinner"
									>
										<title>Loading</title>
										<path d="M21 12a9 9 0 1 1-6.219-8.56" />
									</svg>
									Signing in…
								</span>
							) : (
								"Sign in"
							)}
						</button>
					</form>
				</div>
			</div>
		</PublicLayout>
	)
}
