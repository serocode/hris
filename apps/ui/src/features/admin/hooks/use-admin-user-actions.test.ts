import { describe, expect, it, vi } from "vitest"
import {
	type AdminActionUser,
	type AdminUserActionDependencies,
	createAdminUserActionHandlers,
} from "./use-admin-user-actions"

function createDependencies(
	overrides: Partial<AdminUserActionDependencies> = {},
): AdminUserActionDependencies {
	return {
		confirm: vi.fn().mockResolvedValue(true),
		prompt: vi.fn().mockResolvedValue("Policy violation"),
		toast: vi.fn(),
		navigate: vi.fn().mockResolvedValue(undefined),
		banUser: vi.fn().mockResolvedValue(undefined),
		unbanUser: vi.fn().mockResolvedValue(undefined),
		impersonateUser: vi.fn().mockResolvedValue(undefined),
		resendInviteUser: vi.fn().mockResolvedValue(undefined),
		...overrides,
	}
}

function createUser(overrides: Partial<AdminActionUser> = {}): AdminActionUser {
	return {
		id: "user-1",
		name: "Jane Admin",
		email: "jane@example.com",
		banned: false,
		...overrides,
	}
}

describe("createAdminUserActionHandlers", () => {
	it("navigates to dashboard after successful impersonation", async () => {
		const deps = createDependencies()
		const handlers = createAdminUserActionHandlers(deps)
		const user = createUser()

		await handlers.impersonate(user)

		expect(deps.impersonateUser).toHaveBeenCalledWith(user.id)
		expect(deps.navigate).toHaveBeenCalledWith("/dashboard")
	})

	it("does not impersonate when confirmation is canceled", async () => {
		const deps = createDependencies({
			confirm: vi.fn().mockResolvedValue(false),
		})
		const handlers = createAdminUserActionHandlers(deps)

		await handlers.impersonate(createUser())

		expect(deps.impersonateUser).not.toHaveBeenCalled()
		expect(deps.navigate).not.toHaveBeenCalled()
	})

	it("unbans user through unban action when currently banned", async () => {
		const deps = createDependencies()
		const handlers = createAdminUserActionHandlers(deps)
		const user = createUser({ banned: true })

		await handlers.banToggle(user)

		expect(deps.unbanUser).toHaveBeenCalledWith(user.id)
		expect(deps.banUser).not.toHaveBeenCalled()
	})

	it("sends success toast after invite resend", async () => {
		const deps = createDependencies()
		const handlers = createAdminUserActionHandlers(deps)
		const user = createUser()

		await handlers.resendInvite(user)

		expect(deps.resendInviteUser).toHaveBeenCalledWith(user.id)
		expect(deps.toast).toHaveBeenCalledWith(
			expect.objectContaining({
				tone: "success",
				title: "Invite sent",
			}),
		)
	})
})
