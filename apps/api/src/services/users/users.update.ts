import { generateFullName } from "@hris-v2/utils"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { employeeRepository } from "@/repositories/employees"
import { userRepository } from "@/repositories/users"
import { getProfile } from "./users.get"
import type { UpdateOwnProfileCommand } from "./users.types"

export async function updateProfile(
	userId: string,
	payload: UpdateOwnProfileCommand,
) {
	const existingEmployee = await employeeRepository.getEmployeeByUserId(userId)
	if (!existingEmployee) {
		throw new ServiceError(
			"PROFILE_NOT_FOUND",
			"No employee profile found for this user",
			404,
		)
	}

	const existingUser = await userRepository.getUserById(userId)
	if (!existingUser) {
		throw new ServiceError("USER_NOT_FOUND", "User not found", 404)
	}

	const hasNameChanges =
		payload.firstName !== undefined ||
		payload.lastName !== undefined ||
		payload.middleName !== undefined ||
		payload.suffix !== undefined

	const hasImageChange = payload.image !== undefined

	const nextFirstName = payload.firstName ?? existingEmployee.firstName
	const nextLastName = payload.lastName ?? existingEmployee.lastName
	const nextMiddleName =
		payload.middleName === undefined
			? existingEmployee.middleName
			: payload.middleName
	const nextSuffix =
		payload.suffix === undefined ? existingEmployee.suffix : payload.suffix

	const fullName = generateFullName({
		firstName: nextFirstName,
		lastName: nextLastName,
		middleName: nextMiddleName ?? undefined,
		suffix: nextSuffix ?? undefined,
	})

	await db.transaction(async (tx) => {
		if (hasNameChanges) {
			await employeeRepository.updateEmployee(
				existingEmployee.id,
				{
					...(payload.firstName !== undefined
						? { firstName: payload.firstName }
						: {}),
					...(payload.lastName !== undefined
						? { lastName: payload.lastName }
						: {}),
					...(payload.middleName !== undefined
						? { middleName: payload.middleName }
						: {}),
					...(payload.suffix !== undefined ? { suffix: payload.suffix } : {}),
					fullName,
				},
				tx,
			)
		}

		if (hasNameChanges || hasImageChange) {
			await userRepository.updateUserProfile(
				userId,
				{
					...(hasNameChanges ? { name: fullName } : {}),
					...(payload.image !== undefined ? { image: payload.image } : {}),
				},
				tx,
			)
		}
	})

	return getProfile(userId)
}
