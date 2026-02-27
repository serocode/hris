import { runAwait } from "@hris-v2/utils"
import { eq, inArray } from "drizzle-orm"
import postgres from "postgres"
import { INVITE_EXPIRY_HOURS } from "@/constants/env"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { user } from "@/schema/auth"
import { userProvisioning } from "@/schema/provisioning"

export const inviteStatuses = [
	"PENDING_INVITE",
	"ACTIVE",
	"INVITE_EXPIRED",
	"UNTRACKED",
] as const

export type InviteStatus = (typeof inviteStatuses)[number]

type ProvisioningRow = {
	userId: string
	status: string
	invitedBy: string | null
	inviteSentAt: Date
	inviteExpiresAt: Date
	activatedAt: Date | null
}

function getPostgresError(error: unknown): postgres.PostgresError | null {
	if (!error || typeof error !== "object") return null

	if ("cause" in error && error.cause instanceof postgres.PostgresError) {
		return error.cause
	}

	if (error instanceof postgres.PostgresError) {
		return error
	}

	return null
}

async function fallbackUpsertWithoutConflict(
	userId: string,
	invitedBy: string,
	now: Date,
	inviteExpiresAt: Date,
) {
	const updated = await db
		.update(userProvisioning)
		.set({
			status: "PENDING_INVITE",
			invitedBy,
			inviteSentAt: now,
			inviteExpiresAt,
			activatedAt: null,
			updatedAt: now,
		})
		.where(eq(userProvisioning.userId, userId))
		.returning({ userId: userProvisioning.userId })

	if (updated.length > 0) return

	await db.insert(userProvisioning).values({
		userId,
		status: "PENDING_INVITE",
		invitedBy,
		inviteSentAt: now,
		inviteExpiresAt,
		activatedAt: null,
		createdAt: now,
		updatedAt: now,
	})
}

export function getInviteExpiryDate(now = new Date()): Date {
	const expiry = new Date(now)
	expiry.setHours(expiry.getHours() + INVITE_EXPIRY_HOURS)
	return expiry
}

export function resolveInviteStatus(
	emailVerified: boolean,
	provisioning: ProvisioningRow | null,
	now = new Date(),
): InviteStatus {
	if (emailVerified) return "ACTIVE"
	if (!provisioning) return "UNTRACKED"
	if (provisioning.status === "ACTIVE") return "ACTIVE"
	if (provisioning.inviteExpiresAt < now) return "INVITE_EXPIRED"
	return "PENDING_INVITE"
}

export async function upsertPendingProvisioning(
	userId: string,
	invitedBy: string,
	now = new Date(),
) {
	const inviteExpiresAt = getInviteExpiryDate(now)
	const [_, error] = await runAwait(
		db
			.insert(userProvisioning)
			.values({
				userId,
				status: "PENDING_INVITE",
				invitedBy,
				inviteSentAt: now,
				inviteExpiresAt,
				activatedAt: null,
				createdAt: now,
				updatedAt: now,
			})
			.onConflictDoUpdate({
				target: userProvisioning.userId,
				set: {
					status: "PENDING_INVITE",
					invitedBy,
					inviteSentAt: now,
					inviteExpiresAt,
					activatedAt: null,
					updatedAt: now,
				},
			}),
	)

	if (error) {
		const pgError = getPostgresError(error)

		if (pgError?.code === "42P10") {
			await fallbackUpsertWithoutConflict(
				userId,
				invitedBy,
				now,
				inviteExpiresAt,
			)
			return inviteExpiresAt
		}

		if (pgError?.code === "42P01") {
			throw new ServiceError(
				"PROVISIONING_SCHEMA_MISSING",
				"Missing user_provisioning table. Run API migrations.",
				500,
			)
		}

		throw error
	}

	return inviteExpiresAt
}

export async function markProvisioningActive(userId: string, now = new Date()) {
	await db
		.update(userProvisioning)
		.set({
			status: "ACTIVE",
			activatedAt: now,
			updatedAt: now,
		})
		.where(eq(userProvisioning.userId, userId))
}

export async function getInviteStatusesByUserIds(userIds: string[]) {
	if (userIds.length === 0) return []

	return db
		.select({
			userId: user.id,
			emailVerified: user.emailVerified,
			invitedBy: userProvisioning.invitedBy,
			inviteSentAt: userProvisioning.inviteSentAt,
			inviteExpiresAt: userProvisioning.inviteExpiresAt,
			activatedAt: userProvisioning.activatedAt,
			provisioningStatus: userProvisioning.status,
		})
		.from(user)
		.leftJoin(userProvisioning, eq(user.id, userProvisioning.userId))
		.where(inArray(user.id, userIds))
}
