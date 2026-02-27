import { describe, expect, it } from "vitest"
import {
	getInviteStatusBadgeClass,
	getInviteStatusLabel,
	resolveInviteStatus,
} from "./invite-status"

describe("invite status model", () => {
	it("resolves ACTIVE when email is verified and status is missing", () => {
		expect(resolveInviteStatus(undefined, true)).toBe("ACTIVE")
	})

	it("resolves UNTRACKED when email is unverified and status is missing", () => {
		expect(resolveInviteStatus(undefined, false)).toBe("UNTRACKED")
	})

	it("preserves explicit API-provided status", () => {
		expect(resolveInviteStatus("PENDING_INVITE", true)).toBe("PENDING_INVITE")
		expect(resolveInviteStatus("INVITE_EXPIRED", true)).toBe("INVITE_EXPIRED")
	})

	it("returns consistent labels and badge classes", () => {
		expect(getInviteStatusLabel("ACTIVE")).toBe("Active")
		expect(getInviteStatusLabel("PENDING_INVITE")).toBe("Pending Invite")
		expect(getInviteStatusLabel("INVITE_EXPIRED")).toBe("Invite Expired")
		expect(getInviteStatusLabel("UNTRACKED")).toBe("Untracked")

		expect(getInviteStatusBadgeClass("ACTIVE")).toContain("badge--active")
		expect(getInviteStatusBadgeClass("PENDING_INVITE")).toContain(
			"badge--warning",
		)
		expect(getInviteStatusBadgeClass("INVITE_EXPIRED")).toContain(
			"badge--banned",
		)
		expect(getInviteStatusBadgeClass("UNTRACKED")).toContain("badge--role")
	})
})
