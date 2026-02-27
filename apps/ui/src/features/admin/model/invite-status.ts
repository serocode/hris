export type InviteStatus =
	| "ACTIVE"
	| "PENDING_INVITE"
	| "INVITE_EXPIRED"
	| "UNTRACKED"

export function resolveInviteStatus(
	status: string | undefined,
	emailVerified: boolean,
): InviteStatus {
	if (status === "ACTIVE") return "ACTIVE"
	if (status === "PENDING_INVITE") return "PENDING_INVITE"
	if (status === "INVITE_EXPIRED") return "INVITE_EXPIRED"
	return emailVerified ? "ACTIVE" : "UNTRACKED"
}

export function getInviteStatusLabel(status: InviteStatus) {
	switch (status) {
		case "ACTIVE":
			return "Active"
		case "PENDING_INVITE":
			return "Pending Invite"
		case "INVITE_EXPIRED":
			return "Invite Expired"
		default:
			return "Untracked"
	}
}

export function getInviteStatusBadgeClass(status: InviteStatus) {
	switch (status) {
		case "ACTIVE":
			return "badge badge--active"
		case "PENDING_INVITE":
			return "badge badge--warning"
		case "INVITE_EXPIRED":
			return "badge badge--banned"
		default:
			return "badge badge--role"
	}
}
