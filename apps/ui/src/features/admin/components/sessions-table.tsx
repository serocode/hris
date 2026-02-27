import { useSuspenseQuery } from "@tanstack/react-query"
import { getErrorMessage } from "@/lib/error-message"
import { useConfirmDialog, useToast } from "@/lib/feedback"
import type { AdminSession } from "../api/admin-api"
import {
	listUserSessionsQueryOptions,
	useRevokeAllUserSessionsMutation,
	useRevokeUserSessionMutation,
} from "../api/admin-query-options"

export function SessionsTable({ userId }: { userId: string }) {
	const query = useSuspenseQuery(listUserSessionsQueryOptions(userId))
	const sessions = query.data

	const revokeMutation = useRevokeUserSessionMutation()
	const revokeAllMutation = useRevokeAllUserSessionsMutation()
	const confirm = useConfirmDialog()
	const toast = useToast()

	async function handleRevoke(sessionToken: string) {
		const shouldRevoke = await confirm({
			title: "Revoke this session?",
			description: "The session will be immediately invalidated.",
			confirmLabel: "Revoke Session",
		})
		if (!shouldRevoke) return
		try {
			await revokeMutation.mutateAsync({ sessionToken, userId })
			toast({
				tone: "success",
				title: "Session revoked.",
			})
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to revoke session."),
			})
		}
	}

	async function handleRevokeAll() {
		const shouldRevokeAll = await confirm({
			title: "Revoke all sessions?",
			description:
				"The user will be logged out from all active sessions immediately.",
			confirmLabel: "Revoke All",
			tone: "danger",
		})
		if (!shouldRevokeAll) return
		try {
			await revokeAllMutation.mutateAsync(userId)
			toast({
				tone: "success",
				title: "All sessions revoked.",
			})
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to revoke all sessions."),
			})
		}
	}

	return (
		<div className="card mt-6">
			<div className="flex items-center justify-between mb-4">
				<h3 className="font-semibold text-lg">Active Sessions</h3>
				{sessions.length > 0 && (
					<button
						type="button"
						className="btn btn--destructive"
						onClick={handleRevokeAll}
						disabled={revokeAllMutation.isPending}
					>
						Revoke All
					</button>
				)}
			</div>

			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th>Token Preview</th>
							<th>OS / Browser</th>
							<th>IP Address</th>
							<th>Expires</th>
							<th className="text-right">Action</th>
						</tr>
					</thead>
					<tbody>
						{sessions.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center py-6 text-muted">
									No active sessions
								</td>
							</tr>
						) : (
							sessions.map((session: AdminSession) => (
								<tr key={session.id}>
									<td className="font-mono text-xs text-muted">
										...{session.token.slice(-8)}
									</td>
									<td>
										<div className="text-sm">
											{session.userAgent ? (
												<span title={session.userAgent}>
													{session.userAgent.split(" ").slice(0, 3).join(" ")}
													...
												</span>
											) : (
												<span className="text-muted">Unknown</span>
											)}
										</div>
									</td>
									<td>
										<span className="text-sm">
											{session.ipAddress || "Unknown"}
										</span>
									</td>
									<td>
										<span className="text-sm">
											{new Date(session.expiresAt).toLocaleDateString()}
										</span>
									</td>
									<td className="text-right">
										<button
											type="button"
											className="btn-icon text-destructive hover:text-destructive text-sm"
											title="Revoke Session"
											onClick={() => handleRevoke(session.token)}
											disabled={revokeMutation.isPending}
										>
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
												<title>Revoke session</title>
												<path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
												<line x1="12" y1="2" x2="12" y2="12" />
											</svg>
										</button>
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
