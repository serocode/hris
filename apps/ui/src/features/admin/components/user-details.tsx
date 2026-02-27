import {
	useMutation,
	useQuery,
	useQueryClient,
	useSuspenseQuery,
} from "@tanstack/react-query"
import { useState } from "react"
import { getErrorMessage } from "@/lib/error-message"
import { useToast } from "@/lib/feedback"
import { adminApi, type UpdateUserPayload } from "../api/admin-api"
import {
	adminQueryKeys,
	getUserQueryOptions,
	listInviteStatusesQueryOptions,
} from "../api/admin-query-options"
import { useAdminUserActions } from "../hooks/use-admin-user-actions"
import {
	getInviteStatusBadgeClass,
	getInviteStatusLabel,
	resolveInviteStatus,
} from "../model/invite-status"
import { SessionsTable } from "./sessions-table"
import { UserForm } from "./user-form"

export function UserDetails({ userId }: { userId: string }) {
	const query = useSuspenseQuery(getUserQueryOptions(userId))
	const user = query.data

	const queryClient = useQueryClient()
	const {
		banToggle,
		impersonate,
		resendInvite,
		isBanPending,
		isImpersonatePending,
		isResendInvitePending,
	} = useAdminUserActions()
	const toast = useToast()
	const inviteStatusQuery = useQuery(listInviteStatusesQueryOptions([userId]))
	const inviteStatus = inviteStatusQuery.data?.[0]
	const resolvedInviteStatus = resolveInviteStatus(
		inviteStatus?.status,
		user.emailVerified,
	)

	const updateMutation = useMutation({
		mutationFn: (data: UpdateUserPayload) => adminApi.updateUser(userId, data),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(userId) })
			queryClient.invalidateQueries({
				queryKey: adminQueryKeys.users(),
				exact: false,
			})
			toast({
				tone: "success",
				title: "User updated successfully.",
			})
		},
		onError: (err) => {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to update user."),
			})
		},
	})

	const setPasswordMutation = useMutation({
		mutationFn: (password: string) =>
			adminApi.setUserPassword(userId, password),
		onSuccess: () =>
			toast({
				tone: "success",
				title: "Password updated successfully.",
			}),
		onError: (err) =>
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to reset password."),
			}),
	})

	const [newPassword, setNewPassword] = useState("")

	function handlePasswordReset(e: React.FormEvent) {
		e.preventDefault()
		if (!newPassword || newPassword.length < 8) {
			toast({
				tone: "error",
				title: "Password must be at least 8 characters.",
			})
			return
		}
		setPasswordMutation.mutate(newPassword)
		setNewPassword("")
	}

	return (
		<div className="space-y-6">
			<div className="card">
				<div className="flex items-center justify-between mb-6">
					<div className="flex items-center gap-4">
						{user.image ? (
							<img
								src={user.image}
								alt={user.name}
								className="w-16 h-16 rounded-full bg-secondary"
							/>
						) : (
							<div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center font-medium text-2xl">
								{user.name.charAt(0).toUpperCase()}
							</div>
						)}
						<div>
							<h2 className="text-xl font-semibold flex items-center gap-2">
								{user.name}
								{user.banned && (
									<span className="badge badge--destructive text-xs py-0.5 px-2">
										Banned
									</span>
								)}
								<span
									className={`badge ${user.role === "admin" ? "badge--primary" : "badge--secondary"} text-xs py-0.5 px-2`}
								>
									{user.role}
								</span>
								<span
									className={`${getInviteStatusBadgeClass(resolvedInviteStatus)} text-xs py-0.5 px-2`}
								>
									{getInviteStatusLabel(resolvedInviteStatus)}
								</span>
							</h2>
							<p className="text-muted">{user.email}</p>
							<p className="text-xs text-muted mt-1">
								Joined {new Date(user.createdAt).toLocaleDateString()}
							</p>
							{inviteStatus?.invitedByUserId && (
								<p className="text-xs text-muted mt-1">
									Created by admin: {inviteStatus.invitedByUserId}
								</p>
							)}
						</div>
					</div>
					<div className="flex gap-2">
						<button
							type="button"
							className="btn btn--secondary"
							onClick={() => impersonate(user)}
							disabled={isImpersonatePending}
						>
							Impersonate
						</button>
						<button
							type="button"
							className="btn btn--secondary"
							onClick={() => resendInvite(user)}
							disabled={
								isResendInvitePending || resolvedInviteStatus === "ACTIVE"
							}
						>
							Resend Invite
						</button>
						<button
							type="button"
							className={`btn ${user.banned ? "btn--secondary" : "btn--warning"}`}
							onClick={() => banToggle(user)}
							disabled={isBanPending}
						>
							{user.banned ? "Unban User" : "Ban User"}
						</button>
					</div>
				</div>

				<div className="border-t border-border pt-6">
					<h3 className="font-semibold text-lg mb-4">Edit Details</h3>
					<UserForm
						user={user}
						onSubmit={(data) =>
							updateMutation.mutate(data as UpdateUserPayload)
						}
						isPending={updateMutation.isPending}
					/>
				</div>
			</div>

			<div className="card mt-6">
				<h3 className="font-semibold text-lg mb-4">Reset Password</h3>
				<form onSubmit={handlePasswordReset} className="flex gap-4 items-end">
					<div className="form-group flex-1 max-w-sm">
						<label htmlFor="newPassword" className="form-label">
							New Password
						</label>
						<input
							type="password"
							id="newPassword"
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className="form-input"
							placeholder="Enter new strong password"
							required
							minLength={8}
						/>
					</div>
					<button
						type="submit"
						className="btn btn--secondary"
						disabled={setPasswordMutation.isPending || newPassword.length < 8}
					>
						Reset Password
					</button>
				</form>
			</div>

			<SessionsTable userId={user.id} />
		</div>
	)
}
