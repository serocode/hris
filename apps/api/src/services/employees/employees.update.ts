import type { EmployeesUpdatePayload } from "@hris-v2/contracts/employees"
import { formatDate, generateFullName, runAwait } from "@hris-v2/utils"
import { eq } from "drizzle-orm"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { employeeRepository } from "@/repositories/employees"
import { user } from "@/schema/auth"

export const updateEmployee = async (
	id: string,
	payload: EmployeesUpdatePayload,
) => {
	const existing = await employeeRepository.getEmployeeById(id)
	if (!existing) {
		throw new ServiceError("EMPLOYEE_NOT_FOUND", "Employee not found", 404)
	}

	const { hireDate, dateOfBirth, ...rest } = payload

	const nextFirstName = payload.firstName ?? existing.firstName
	const nextLastName = payload.lastName ?? existing.lastName
	const nextMiddleName = payload.middleName ?? existing.middleName ?? undefined
	const nextSuffix = payload.suffix ?? existing.suffix ?? undefined

	const fullName = generateFullName({
		firstName: nextFirstName,
		lastName: nextLastName,
		middleName: nextMiddleName ?? undefined,
		suffix: nextSuffix ?? undefined,
	})

	const updateData = {
		...rest,
		...(payload.firstName !== undefined
			? { firstName: payload.firstName }
			: {}),
		...(payload.lastName !== undefined ? { lastName: payload.lastName } : {}),
		...(payload.middleName !== undefined
			? { middleName: payload.middleName }
			: {}),
		...(payload.suffix !== undefined ? { suffix: payload.suffix } : {}),
		fullName,
		...(dateOfBirth ? { dateOfBirth: formatDate(dateOfBirth) } : {}),
		...(hireDate ? { hireDate: formatDate(hireDate) } : {}),
	}

	const updated = await db.transaction(async (tx) => {
		const [result, err] = await runAwait(
			employeeRepository.updateEmployee(id, updateData, tx),
		)

		if (err) {
			if (err instanceof ServiceError) {
				throw err
			}
			throw new ServiceError(
				"DATABASE_ERROR",
				err instanceof Error ? err.message : "Unknown error occurred",
				500,
			)
		}

		await tx
			.update(user)
			.set({ name: fullName })
			.where(eq(user.id, result.userId))
		return result
	})

	return {
		success: true,
		data: updated,
	}
}
