import type { QueryClient } from "@tanstack/react-query"
import {
	queryOptions,
	useMutation,
	useQueryClient,
} from "@tanstack/react-query"
import { adminApi } from "./admin-api"

export const adminQueryKeys = {
	all: ["admin"] as const,
	users: () => [...adminQueryKeys.all, "users"] as const,
	invites: () => [...adminQueryKeys.all, "invites"] as const,
	usersList: (page: number, limit: number) =>
		[...adminQueryKeys.users(), "list", { page, limit }] as const,
	user: (userId: string) =>
		[...adminQueryKeys.users(), "detail", userId] as const,
	sessions: (userId: string) =>
		[...adminQueryKeys.users(), "sessions", userId] as const,
	inviteStatuses: (userIds: string[]) =>
		[...adminQueryKeys.invites(), "statuses", [...userIds].sort()] as const,
}

// Query Options
export function listUsersQueryOptions(page = 1, limit = 10) {
	return queryOptions({
		queryKey: adminQueryKeys.usersList(page, limit),
		queryFn: () => adminApi.listUsers(page, limit),
	})
}

export function getUserQueryOptions(userId: string) {
	return queryOptions({
		queryKey: adminQueryKeys.user(userId),
		queryFn: () => adminApi.getUser(userId),
		enabled: !!userId,
	})
}

export function listUserSessionsQueryOptions(userId: string) {
	return queryOptions({
		queryKey: adminQueryKeys.sessions(userId),
		queryFn: () => adminApi.listUserSessions(userId),
		enabled: !!userId,
	})
}

export function listInviteStatusesQueryOptions(userIds: string[]) {
	return queryOptions({
		queryKey: adminQueryKeys.inviteStatuses(userIds),
		queryFn: () => adminApi.listInviteStatuses(userIds),
		enabled: userIds.length > 0,
	})
}

function invalidateUserCaches(queryClient: QueryClient, userId: string) {
	return Promise.all([
		queryClient.invalidateQueries({ queryKey: adminQueryKeys.user(userId) }),
		queryClient.invalidateQueries({
			queryKey: adminQueryKeys.users(),
			exact: false,
		}),
	])
}

// Mutation Hooks
export function useBanUserMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
			adminApi.banUser(userId, reason),
		onSuccess: (_, { userId }) => invalidateUserCaches(queryClient, userId),
	})
}

export function useUnbanUserMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userId: string) => adminApi.unbanUser(userId),
		onSuccess: (_, userId) => invalidateUserCaches(queryClient, userId),
	})
}

export function useSetRoleMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ userId, role }: { userId: string; role: string }) =>
			adminApi.setRole(userId, role),
		onSuccess: (_, { userId }) => invalidateUserCaches(queryClient, userId),
	})
}

export function useRemoveUserMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userId: string) => adminApi.removeUser(userId),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() })
		},
	})
}

export function useRevokeUserSessionMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: ({ sessionToken }: { sessionToken: string; userId: string }) =>
			adminApi.revokeUserSession(sessionToken),
		onSuccess: (_data, variables) => {
			queryClient.invalidateQueries({
				queryKey: adminQueryKeys.sessions(variables.userId),
			})
		},
	})
}

export function useRevokeAllUserSessionsMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userId: string) => adminApi.revokeUserSessions(userId),
		onSuccess: (_, userId) => {
			queryClient.invalidateQueries({
				queryKey: adminQueryKeys.sessions(userId),
			})
		},
	})
}

export function useImpersonateUserMutation() {
	return useMutation({
		mutationFn: (userId: string) => adminApi.impersonateUser(userId),
	})
}

export function useStopImpersonatingMutation() {
	return useMutation({
		mutationFn: () => adminApi.stopImpersonating(),
	})
}

export function useResendInviteMutation() {
	const queryClient = useQueryClient()
	return useMutation({
		mutationFn: (userId: string) => adminApi.resendInvite(userId),
		onSuccess: (_data, userId) => {
			queryClient.invalidateQueries({ queryKey: adminQueryKeys.users() })
			queryClient.invalidateQueries({
				queryKey: adminQueryKeys.invites(),
			})
			queryClient.invalidateQueries({
				queryKey: adminQueryKeys.user(userId),
			})
		},
	})
}
