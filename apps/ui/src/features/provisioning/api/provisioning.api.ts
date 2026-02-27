import {
	type AdminInviteStatusData,
	AdminInviteStatusListResponse,
	type AdminProvisionUserPayload,
	AdminProvisionUserResponse,
	AdminResendInviteResponse,
} from "@hris-v2/contracts/admin"
import { http } from "@/lib/http"

export interface ProvisionUserPayload extends AdminProvisionUserPayload {}

export const provisioningApi = {
	provisionUser(data: ProvisionUserPayload) {
		return http<AdminProvisionUserResponse>("/api/v1/admin/provision-user", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: data,
			schema: AdminProvisionUserResponse,
		})
	},

	resendInvite(userId: string) {
		return http<AdminResendInviteResponse>(
			`/api/v1/admin/users/${userId}/resend-invite`,
			{
				method: "POST",
				schema: AdminResendInviteResponse,
			},
		)
	},

	async listInviteStatuses(userIds: string[]) {
		if (userIds.length === 0) {
			return [] as AdminInviteStatusData[]
		}

		const query = new URLSearchParams({
			userIds: userIds.join(","),
		})

		const result = await http<AdminInviteStatusListResponse>(
			`/api/v1/admin/users/invite-status?${query.toString()}`,
			{
				schema: AdminInviteStatusListResponse,
			},
		)

		return result.data
	},
}
