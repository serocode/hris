import { useNavigate } from "@tanstack/react-router"
import { getErrorMessage } from "@/lib/error-message"
import { useConfirmDialog, usePromptDialog, useToast } from "@/lib/feedback"
import type { AdminUser } from "../api/admin-api"
import {
	useBanUserMutation,
	useImpersonateUserMutation,
	useResendInviteMutation,
	useUnbanUserMutation,
} from "../api/admin-query-options"

export type AdminActionUser = Pick<
	AdminUser,
	"id" | "name" | "email" | "banned"
>

type ConfirmDialogFn = (options: {
	title: string
	description: string
	confirmLabel: string
	tone?: "danger"
}) => Promise<boolean>

type PromptDialogFn = (options: {
	title: string
	description: string
	confirmLabel: string
	tone?: "danger"
	placeholder?: string
}) => Promise<string | null>

type ToastFn = (options: {
	tone: "success" | "error"
	title: string
	description?: string
}) => void

export interface AdminUserActionDependencies {
	confirm: ConfirmDialogFn
	prompt: PromptDialogFn
	toast: ToastFn
	navigate: (to: string) => Promise<void> | void
	banUser: (options: { userId: string; reason?: string }) => Promise<unknown>
	unbanUser: (userId: string) => Promise<unknown>
	impersonateUser: (userId: string) => Promise<unknown>
	resendInviteUser: (userId: string) => Promise<unknown>
}

export function createAdminUserActionHandlers({
	confirm,
	prompt,
	toast,
	navigate,
	banUser,
	unbanUser,
	impersonateUser,
	resendInviteUser,
}: AdminUserActionDependencies) {
	async function banToggle(user: AdminActionUser) {
		try {
			if (user.banned) {
				const shouldUnban = await confirm({
					title: `Unban ${user.name}?`,
					description: "The user will regain access immediately.",
					confirmLabel: "Unban User",
				})
				if (!shouldUnban) return
				await unbanUser(user.id)
				return
			}

			const reason = await prompt({
				title: `Ban ${user.name}?`,
				description: "Optional: include a reason for audit records.",
				confirmLabel: "Ban User",
				tone: "danger",
				placeholder: "Reason (optional)",
			})
			if (reason === null) return
			await banUser({ userId: user.id, reason })
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to update ban status."),
			})
		}
	}

	async function impersonate(user: AdminActionUser) {
		const shouldImpersonate = await confirm({
			title: `Impersonate ${user.name}?`,
			description:
				"You will switch to this user's session until you exit impersonation.",
			confirmLabel: "Impersonate User",
		})
		if (!shouldImpersonate) return

		try {
			await impersonateUser(user.id)
			await navigate("/dashboard")
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to impersonate user."),
			})
		}
	}

	async function resendInvite(user: AdminActionUser) {
		const shouldResend = await confirm({
			title: `Resend invite to ${user.email}?`,
			description: "A new activation email will be sent.",
			confirmLabel: "Resend Invite",
		})
		if (!shouldResend) return
		try {
			await resendInviteUser(user.id)
			toast({
				tone: "success",
				title: "Invite sent",
				description: "A new activation email has been sent.",
			})
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to resend invite."),
			})
		}
	}

	return {
		banToggle,
		impersonate,
		resendInvite,
	}
}

export function useAdminUserActions() {
	const banMutation = useBanUserMutation()
	const unbanMutation = useUnbanUserMutation()
	const impersonateMutation = useImpersonateUserMutation()
	const resendInviteMutation = useResendInviteMutation()
	const confirm = useConfirmDialog()
	const prompt = usePromptDialog()
	const toast = useToast()
	const navigate = useNavigate()
	const { banToggle, impersonate, resendInvite } =
		createAdminUserActionHandlers({
			confirm,
			prompt,
			toast,
			navigate: (to) => navigate({ to }),
			banUser: ({ userId, reason }) =>
				banMutation.mutateAsync({ userId, reason }),
			unbanUser: (userId) => unbanMutation.mutateAsync(userId),
			impersonateUser: (userId) => impersonateMutation.mutateAsync(userId),
			resendInviteUser: (userId) => resendInviteMutation.mutateAsync(userId),
		})

	return {
		banToggle,
		impersonate,
		resendInvite,
		isBanPending: banMutation.isPending || unbanMutation.isPending,
		isImpersonatePending: impersonateMutation.isPending,
		isResendInvitePending: resendInviteMutation.isPending,
	}
}
