import {
	listInviteStatusesForUsers,
	provisionUserWithInvite,
	resendUserInvite,
} from "./admin.provisioning"

export const adminService = {
	provisionUserWithInvite,
	resendUserInvite,
	listInviteStatusesForUsers,
}
