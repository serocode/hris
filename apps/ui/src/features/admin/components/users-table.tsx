import { useQuery, useSuspenseQuery } from "@tanstack/react-query"
import { Link } from "@tanstack/react-router"
import { getErrorMessage } from "@/lib/error-message"
import { useConfirmDialog, useToast } from "@/lib/feedback"
import type { AdminUser } from "../api/admin-api"
import {
	listInviteStatusesQueryOptions,
	listUsersQueryOptions,
	useRemoveUserMutation,
} from "../api/admin-query-options"
import { useAdminUserActions } from "../hooks/use-admin-user-actions"
import {
	getInviteStatusBadgeClass,
	getInviteStatusLabel,
	resolveInviteStatus,
} from "../model/invite-status"

export function UsersTable({
	page = 1,
	limit = 10,
}: {
	page?: number
	limit?: number
}) {
	const query = useSuspenseQuery(listUsersQueryOptions(page, limit))
	const users = query.data.users as AdminUser[]
	const inviteStatusesQuery = useQuery(
		listInviteStatusesQueryOptions(users.map((currentUser) => currentUser.id)),
	)
	const inviteStatuses = new Map(
		(inviteStatusesQuery.data ?? []).map((status) => [status.userId, status]),
	)

	const removeMutation = useRemoveUserMutation()
	const {
		banToggle,
		impersonate,
		resendInvite,
		isBanPending,
		isImpersonatePending,
		isResendInvitePending,
	} = useAdminUserActions()
	const confirm = useConfirmDialog()
	const toast = useToast()

	async function handleDelete(user: AdminUser) {
		const shouldDelete = await confirm({
			title: `Delete ${user.name}?`,
			description: "This action cannot be undone.",
			confirmLabel: "Delete User",
			tone: "danger",
		})
		if (!shouldDelete) return
		try {
			await removeMutation.mutateAsync(user.id)
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to delete user."),
			})
		}
	}

	return (
		<div className="card">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th>User</th>
							<th>Role</th>
							<th>Status</th>
							<th>Joined</th>
							<th className="text-right">Actions</th>
						</tr>
					</thead>
					<tbody>
						{users.length === 0 ? (
							<tr>
								<td colSpan={5} className="text-center py-8 text-muted">
									No users found
								</td>
							</tr>
						) : (
							users.map((user) => {
								const invite = inviteStatuses.get(user.id)
								const status = resolveInviteStatus(
									invite?.status,
									user.emailVerified,
								)

								return (
									<tr key={user.id} className={user.banned ? "opacity-75" : ""}>
										<td>
											<div className="flex items-center gap-3">
												{user.image ? (
													<img
														src={user.image}
														alt={user.name}
														className="w-8 h-8 rounded-full bg-secondary"
													/>
												) : (
													<div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-medium text-sm">
														{user.name.charAt(0).toUpperCase()}
													</div>
												)}
												<div>
													<div className="font-medium flex items-center gap-2">
														{user.name}
														{user.banned && (
															<span className="badge badge--destructive text-xs py-0 px-1.5">
																Banned
															</span>
														)}
													</div>
													<div className="text-sm text-muted">{user.email}</div>
												</div>
											</div>
										</td>
										<td>
											<span
												className={`badge ${user.role === "admin" ? "badge--primary" : "badge--secondary"}`}
											>
												{user.role}
											</span>
										</td>
										<td>
											<div className="flex flex-col gap-1">
												<span className={getInviteStatusBadgeClass(status)}>
													{getInviteStatusLabel(status)}
												</span>
												<span className="text-xs text-muted">
													{user.emailVerified
														? "Email verified"
														: "Email unverified"}
												</span>
											</div>
										</td>
										<td>
											<span className="text-sm">
												{new Date(user.createdAt).toLocaleDateString()}
											</span>
										</td>
										<td className="text-right">
											<div className="flex items-center justify-end gap-2">
												<button
													type="button"
													className="btn-icon"
													title="Impersonate"
													onClick={() => impersonate(user)}
													disabled={isImpersonatePending}
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
														<title>Impersonate</title>
														<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
														<circle cx="12" cy="7" r="4" />
														<path d="M12 11v8" />
														<path d="m9 16 3-3 3 3" />
													</svg>
												</button>
												<button
													type="button"
													className="btn-icon"
													title="Resend Invite"
													onClick={() => resendInvite(user)}
													disabled={
														isResendInvitePending || status === "ACTIVE"
													}
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
														<title>Resend Invite</title>
														<path d="M4 4h16v16H4z" />
														<path d="m22 6-10 7L2 6" />
													</svg>
												</button>
												<Link
													to="/admin/users/$userId"
													params={{ userId: user.id }}
													className="btn-icon"
													title="Edit User"
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
														<title>Edit User</title>
														<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
														<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
													</svg>
												</Link>
												<button
													type="button"
													className="btn-icon text-warning hover:text-warning"
													title={user.banned ? "Unban User" : "Ban User"}
													onClick={() => banToggle(user)}
													disabled={isBanPending}
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
														<title>
															{user.banned ? "Unban User" : "Ban User"}
														</title>
														<circle cx="12" cy="12" r="10" />
														<line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
													</svg>
												</button>
												<button
													type="button"
													className="btn-icon text-destructive hover:text-destructive"
													title="Delete User"
													onClick={() => handleDelete(user)}
													disabled={removeMutation.isPending}
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
														<title>Delete User</title>
														<path d="M3 6h18" />
														<path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
														<path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
														<line x1="10" y1="11" x2="10" y2="17" />
														<line x1="14" y1="11" x2="14" y2="17" />
													</svg>
												</button>
											</div>
										</td>
									</tr>
								)
							})
						)}
					</tbody>
				</table>
			</div>
		</div>
	)
}
