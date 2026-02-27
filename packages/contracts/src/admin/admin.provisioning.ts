import { z } from "zod"

export const AdminInviteStatus = z.enum([
	"PENDING_INVITE",
	"ACTIVE",
	"INVITE_EXPIRED",
	"UNTRACKED",
])

export type AdminInviteStatus = z.infer<typeof AdminInviteStatus>

export const AdminProvisionUserPayload = z.object({
	email: z.string().email(),
	role: z.enum(["user", "admin"]).default("user"),
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	middleName: z.string().min(2).optional(),
	suffix: z.string().min(2).optional(),
	dateOfBirth: z.coerce.date(),
	hireDate: z.coerce.date(),
})

export type AdminProvisionUserPayload = z.infer<
	typeof AdminProvisionUserPayload
>

export const AdminInviteStatusData = z.object({
	userId: z.string(),
	status: AdminInviteStatus,
	emailVerified: z.boolean(),
	invitedByUserId: z.string().nullable(),
	inviteSentAt: z.string().nullable(),
	inviteExpiresAt: z.string().nullable(),
	activatedAt: z.string().nullable(),
})

export type AdminInviteStatusData = z.infer<typeof AdminInviteStatusData>

export const AdminProvisionUserResponse = z.object({
	status: z.literal("success"),
	data: z.object({
		userId: z.string(),
		employeeId: z.string(),
		invite: AdminInviteStatusData,
	}),
})

export type AdminProvisionUserResponse = z.infer<
	typeof AdminProvisionUserResponse
>

export const AdminResendInviteResponse = z.object({
	status: z.literal("success"),
	data: AdminInviteStatusData,
})

export type AdminResendInviteResponse = z.infer<
	typeof AdminResendInviteResponse
>

export const AdminInviteStatusQuery = z.object({
	userIds: z.string().optional(),
})

export type AdminInviteStatusQuery = z.infer<typeof AdminInviteStatusQuery>

export const AdminInviteStatusListResponse = z.object({
	status: z.literal("success"),
	data: z.array(AdminInviteStatusData),
})

export type AdminInviteStatusListResponse = z.infer<
	typeof AdminInviteStatusListResponse
>
