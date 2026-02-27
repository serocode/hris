import type {
	AdminInviteStatusData,
	AdminProvisionUserPayload,
} from "@hris-v2/contracts/admin"
import { generateFullName } from "@hris-v2/utils"
import { eq } from "drizzle-orm"
import { FRONTEND_URL } from "@/constants/env"
import { auth } from "@/lib/auth"
import { db } from "@/lib/database"
import {
	getInviteStatusesByUserIds,
	markProvisioningActive,
	resolveInviteStatus,
	upsertPendingProvisioning,
} from "@/lib/provisioning"
import { ServiceError } from "@/lib/service-error"
import { user } from "@/schema/auth"
import { employeeService } from "@/services/employees"

function createTemporaryPassword() {
	return `tmp_${crypto.randomUUID()}_${Math.random().toString(36).slice(2)}`
}

function normalizeEmail(email: string) {
	return email.trim().toLowerCase()
}

function toIsoString(date: Date | null) {
	return date ? date.toISOString() : null
}

async function sendAccountInvite(email: string) {
	await auth.api.requestPasswordReset({
		body: {
			email,
			redirectTo: `${FRONTEND_URL}/activate-account`,
		},
	})
}

function toStatusData(
	row: Awaited<ReturnType<typeof getInviteStatusesByUserIds>>[number],
): AdminInviteStatusData {
	return {
		userId: row.userId,
		status: resolveInviteStatus(
			Boolean(row.emailVerified),
			row.provisioningStatus
				? {
						userId: row.userId,
						status: row.provisioningStatus,
						invitedBy: row.invitedBy,
						inviteSentAt: row.inviteSentAt ?? new Date(0),
						inviteExpiresAt: row.inviteExpiresAt ?? new Date(0),
						activatedAt: row.activatedAt,
					}
				: null,
		),
		emailVerified: Boolean(row.emailVerified),
		invitedByUserId: row.invitedBy,
		inviteSentAt: toIsoString(row.inviteSentAt),
		inviteExpiresAt: toIsoString(row.inviteExpiresAt),
		activatedAt: toIsoString(row.activatedAt),
	}
}

export async function provisionUserWithInvite(
	payload: AdminProvisionUserPayload,
	actorId: string,
	headers: Headers,
) {
	const email = normalizeEmail(payload.email)
	const fullName = generateFullName({
		firstName: payload.firstName,
		lastName: payload.lastName,
		middleName: payload.middleName,
		suffix: payload.suffix,
	})

	let createdUserId: string | null = null

	try {
		const createUserResult = await auth.api.createUser({
			headers,
			body: {
				email,
				name: fullName,
				role: payload.role,
				password: createTemporaryPassword(),
			},
		})

		const createdUserPayload = createUserResult as
			| { user?: { id?: string }; id?: string }
			| undefined
		const createdUser =
			createdUserPayload?.user ??
			(createdUserPayload?.id ? { id: createdUserPayload.id } : null)

		if (!createdUser?.id) {
			throw new ServiceError("USER_CREATE_FAILED", "Failed to create user", 500)
		}

		createdUserId = createdUser.id

		const createdEmployee = await employeeService.createEmployee(
			{
				userId: createdUser.id,
				firstName: payload.firstName,
				lastName: payload.lastName,
				middleName: payload.middleName,
				suffix: payload.suffix,
				dateOfBirth: payload.dateOfBirth,
				hireDate: payload.hireDate,
			},
			actorId,
		)

		await upsertPendingProvisioning(createdUser.id, actorId)
		await sendAccountInvite(email)

		const [statusRow] = await getInviteStatusesByUserIds([createdUser.id])

		if (!statusRow) {
			throw new ServiceError(
				"PROVISIONING_STATUS_NOT_FOUND",
				"Failed to read invite status",
				500,
			)
		}

		return {
			userId: createdUser.id,
			employeeId: createdEmployee.data.id,
			invite: toStatusData(statusRow),
		}
	} catch (error) {
		if (createdUserId) {
			await auth.api
				.removeUser({
					headers,
					body: {
						userId: createdUserId,
					},
				})
				.catch(() => null)
		}

		if (error instanceof ServiceError) {
			throw error
		}

		const message =
			error instanceof Error ? error.message : "Failed to provision user"
		throw new ServiceError("PROVISIONING_FAILED", message, 500)
	}
}

export async function resendUserInvite(userId: string, actorId: string) {
	const [targetUser] = await db
		.select({
			id: user.id,
			email: user.email,
			emailVerified: user.emailVerified,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1)

	if (!targetUser) {
		throw new ServiceError("USER_NOT_FOUND", "User not found", 404)
	}

	if (targetUser.emailVerified) {
		await markProvisioningActive(userId)
	}

	if (!targetUser.emailVerified) {
		await upsertPendingProvisioning(userId, actorId)
		await sendAccountInvite(normalizeEmail(targetUser.email))
	}

	const [statusRow] = await getInviteStatusesByUserIds([userId])

	if (!statusRow) {
		throw new ServiceError(
			"PROVISIONING_STATUS_NOT_FOUND",
			"Failed to read invite status",
			500,
		)
	}

	return toStatusData(statusRow)
}

export async function listInviteStatusesForUsers(userIds: string[]) {
	const rows = await getInviteStatusesByUserIds(userIds)
	return rows.map(toStatusData)
}
