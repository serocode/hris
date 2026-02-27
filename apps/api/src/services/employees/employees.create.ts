import type { EmployeesCreatePayload } from "@hris-v2/contracts/employees"
import { formatDate, generateFullName, runAwait } from "@hris-v2/utils"
import { eq } from "drizzle-orm"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { employeeRepository } from "@/repositories/employees"
import { user } from "@/schema/auth"

export const createEmployee = async (
	payload: EmployeesCreatePayload,
	authenticatedUserId: string,
) => {
	const fullName = generateFullName({
		firstName: payload.firstName,
		lastName: payload.lastName,
		middleName: payload.middleName,
		suffix: payload.suffix,
	})

	const userId = payload.userId || authenticatedUserId

	const employee = await db.transaction(async (tx) => {
		const [created, err] = await runAwait(
			employeeRepository.createEmployee(
				{
					id: crypto.randomUUID(),
					userId,
					firstName: payload.firstName,
					lastName: payload.lastName,
					fullName,
					middleName: payload.middleName || null,
					suffix: payload.suffix || null,
					dateOfBirth: formatDate(payload.dateOfBirth),
					hireDate: formatDate(payload.hireDate),
				},
				tx,
			),
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

		await tx.update(user).set({ name: fullName }).where(eq(user.id, userId))
		return created
	})

	return {
		success: true,
		data: employee,
	}
}
