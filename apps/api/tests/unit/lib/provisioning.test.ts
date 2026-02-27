import { describe, expect, it } from "vitest"
import { getInviteExpiryDate, resolveInviteStatus } from "@/lib/provisioning"

describe("provisioning invite status", () => {
	it("returns ACTIVE for verified users regardless of provisioning row", () => {
		const now = new Date("2026-02-26T00:00:00.000Z")

		expect(
			resolveInviteStatus(
				true,
				{
					userId: "user_1",
					status: "PENDING_INVITE",
					invitedBy: "admin_1",
					inviteSentAt: now,
					inviteExpiresAt: new Date("2026-03-01T00:00:00.000Z"),
					activatedAt: null,
				},
				now,
			),
		).toBe("ACTIVE")
	})

	it("returns PENDING_INVITE when token is still valid and not verified", () => {
		const now = new Date("2026-02-26T00:00:00.000Z")
		const inviteExpiresAt = new Date("2026-02-27T00:00:00.000Z")

		expect(
			resolveInviteStatus(
				false,
				{
					userId: "user_1",
					status: "PENDING_INVITE",
					invitedBy: "admin_1",
					inviteSentAt: now,
					inviteExpiresAt,
					activatedAt: null,
				},
				now,
			),
		).toBe("PENDING_INVITE")
	})

	it("returns INVITE_EXPIRED when invite expiry has passed", () => {
		const now = new Date("2026-02-26T00:00:00.000Z")
		const inviteExpiresAt = new Date("2026-02-25T00:00:00.000Z")

		expect(
			resolveInviteStatus(
				false,
				{
					userId: "user_1",
					status: "PENDING_INVITE",
					invitedBy: "admin_1",
					inviteSentAt: now,
					inviteExpiresAt,
					activatedAt: null,
				},
				now,
			),
		).toBe("INVITE_EXPIRED")
	})

	it("returns UNTRACKED when no provisioning row exists", () => {
		expect(resolveInviteStatus(false, null)).toBe("UNTRACKED")
	})
})

describe("getInviteExpiryDate", () => {
	it("produces a date after the input date", () => {
		const now = new Date("2026-02-26T00:00:00.000Z")
		const expiry = getInviteExpiryDate(now)

		expect(expiry.getTime()).toBeGreaterThan(now.getTime())
	})
})
