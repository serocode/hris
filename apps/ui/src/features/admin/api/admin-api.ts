import {
	type ProvisionUserPayload,
	provisioningApi,
} from "@/features/provisioning/api/provisioning.api"
import { ApiError } from "@/lib/api-error"
import { authClient } from "@/lib/auth-client"

function handleAuthError(result: { error: unknown }, defaultMessage: string) {
	if (result.error) {
		const err = result.error as { status?: number; message?: string }
		throw new ApiError({
			message: err.message ?? defaultMessage,
			status: err.status ?? 500,
		})
	}
}

export interface CreateUserPayload {
	email: string
	name: string
	password?: string
	role?: "user" | "admin"
	data?: Record<string, unknown>
}

export interface UpdateUserPayload {
	email?: string
	name?: string
	role?: "user" | "admin"
	data?: Record<string, unknown>
}

export interface AdminUser {
	id: string
	name: string
	email: string
	emailVerified: boolean
	image?: string | null
	createdAt: Date | string
	updatedAt: Date | string
	role?: string | null
	banned?: boolean | null
	banReason?: string | null
	banExpires?: Date | null
}

export interface AdminSession {
	id: string
	userId: string
	token: string
	expiresAt: Date | string
	ipAddress?: string | null
	userAgent?: string | null
	createdAt: Date | string
	updatedAt: Date | string
	impersonatedBy?: string | null
}

export const adminApi = {
	async listUsers(page = 1, limit = 10) {
		const result = await authClient.admin.listUsers({
			query: {
				limit,
				sortBy: "createdAt",
				sortDirection: "desc",
				offset: (page - 1) * limit,
			},
		})
		handleAuthError(result, "Failed to load users.")

		const users = result.data?.users.map((u) => u as unknown as AdminUser) ?? []
		return {
			users,
			total: result.data?.total ?? users.length,
		}
	},

	async getUser(userId: string) {
		const result = await authClient.admin.getUser({
			query: {
				id: userId,
			},
		})
		handleAuthError(result, "Failed to load user.")

		const item = result.data as { user?: AdminUser } | AdminUser | undefined
		const resolved =
			item && "user" in item && item.user ? item.user : (item as AdminUser)

		if (!resolved?.id) {
			throw new ApiError({ message: "User not found", status: 404 })
		}
		return resolved
	},

	async banUser(userId: string, banReason?: string) {
		const result = await authClient.admin.banUser({
			userId,
			banReason,
		})
		handleAuthError(result, "Failed to ban user.")
		return result.data
	},

	async unbanUser(userId: string) {
		const result = await authClient.admin.unbanUser({
			userId,
		})
		handleAuthError(result, "Failed to unban user.")
		return result.data
	},

	async createUser(data: CreateUserPayload) {
		const result = await authClient.admin.createUser(data)
		handleAuthError(result, "Failed to create user.")
		const payload = result.data as { user?: AdminUser } | AdminUser | undefined
		return payload && "user" in payload && payload.user
			? payload.user
			: (payload as AdminUser)
	},

	async updateUser(userId: string, data: UpdateUserPayload) {
		const result = await authClient.admin.updateUser({
			userId,
			data,
		})
		handleAuthError(result, "Failed to update user.")
		const payload = result.data as { user?: AdminUser } | AdminUser | undefined
		return payload && "user" in payload && payload.user
			? payload.user
			: (payload as AdminUser)
	},

	async setUserPassword(userId: string, password: string) {
		const result = await authClient.admin.setUserPassword({
			userId,
			newPassword: password,
		})
		handleAuthError(result, "Failed to set user password.")
		return result.data
	},

	async setRole(userId: string, role: "user" | "admin" | string) {
		const result = await authClient.admin.setRole({
			userId,
			role: role as "user" | "admin",
		})
		handleAuthError(result, "Failed to update role.")
		return result.data
	},

	async removeUser(userId: string) {
		const result = await authClient.admin.removeUser({
			userId,
		})
		handleAuthError(result, "Failed to remove user.")
		return result.data
	},

	async listUserSessions(userId: string) {
		const result = await authClient.admin.listUserSessions({
			userId,
		})
		handleAuthError(result, "Failed to load sessions.")
		return (result.data?.sessions ?? []) as AdminSession[]
	},

	async revokeUserSession(sessionToken: string) {
		const result = await authClient.admin.revokeUserSession({
			sessionToken,
		})
		handleAuthError(result, "Failed to revoke session.")
		return result.data
	},

	async revokeUserSessions(userId: string) {
		const result = await authClient.admin.revokeUserSessions({
			userId,
		})
		handleAuthError(result, "Failed to revoke sessions.")
		return result.data
	},

	async impersonateUser(userId: string) {
		const result = await authClient.admin.impersonateUser({
			userId,
		})
		handleAuthError(result, "Failed to impersonate user.")
		return result.data
	},

	async stopImpersonating() {
		const result = await authClient.admin.stopImpersonating()
		handleAuthError(result, "Failed to stop impersonating.")
		return result.data
	},

	async provisionUser(data: ProvisionUserPayload) {
		return provisioningApi.provisionUser(data)
	},

	async resendInvite(userId: string) {
		return provisioningApi.resendInvite(userId)
	},

	async listInviteStatuses(userIds: string[]) {
		return provisioningApi.listInviteStatuses(userIds)
	},
}
