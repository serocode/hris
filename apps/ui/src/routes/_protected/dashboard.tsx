// Dashboard page — welcome message with user info from route context
import { createFileRoute } from "@tanstack/react-router"
import type { AuthSession } from "@/lib/auth-utils"

export const Route = createFileRoute("/_protected/dashboard")({
	component: DashboardPage,
})

function DashboardPage() {
	const { session } = Route.useRouteContext() as { session: AuthSession }

	return (
		<div className="page">
			<div className="page-header">
				<h1 className="page-title">Dashboard</h1>
				<p className="page-description">
					Welcome back, {session.user.name || session.user.email}
				</p>
			</div>

			<div className="dashboard-grid">
				<div className="dashboard-card">
					<div className="dashboard-card-header">
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
							<title>Profile</title>
							<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
							<circle cx="9" cy="7" r="4" />
						</svg>
						<span>Profile</span>
					</div>
					<div className="dashboard-card-body">
						<p>
							<strong>Name:</strong> {session.user.name}
						</p>
						<p>
							<strong>Email:</strong> {session.user.email}
						</p>
						<p>
							<strong>Role:</strong>{" "}
							<span className="badge badge--role">
								{session.user.role ?? "user"}
							</span>
						</p>
					</div>
				</div>

				<div className="dashboard-card">
					<div className="dashboard-card-header">
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
							<title>Session</title>
							<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
							<line x1="16" y1="2" x2="16" y2="6" />
							<line x1="8" y1="2" x2="8" y2="6" />
							<line x1="3" y1="10" x2="21" y2="10" />
						</svg>
						<span>Session</span>
					</div>
					<div className="dashboard-card-body">
						<p>
							<strong>Session ID:</strong>{" "}
							<code>{session.session.id.slice(0, 8)}…</code>
						</p>
						<p>
							<strong>Expires:</strong>{" "}
							{new Date(session.session.expiresAt).toLocaleDateString()}
						</p>
					</div>
				</div>
			</div>
		</div>
	)
}
