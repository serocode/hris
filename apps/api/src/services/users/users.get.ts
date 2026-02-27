import { ServiceError } from "@/lib/service-error"
import { employeeRepository } from "@/repositories/employees"
import { userRepository } from "@/repositories/users"

export const getProfile = async (userId: string) => {
	const employee = await employeeRepository.getEmployeeByUserId(userId)
	if (!employee) {
		throw new ServiceError(
			"PROFILE_NOT_FOUND",
			"No employee profile found for this user",
			404,
		)
	}

	const account = await userRepository.getUserById(userId)
	if (!account) {
		throw new ServiceError("USER_NOT_FOUND", "User not found", 404)
	}

	return {
		employee,
		account,
	}
}
