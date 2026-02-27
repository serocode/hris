import { getUserById } from "./users.get"
import { updateUserProfile } from "./users.update"

export const userRepository = {
	getUserById,
	updateUserProfile,
}
