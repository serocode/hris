import { runAwait } from "@hris-v2/utils"
import { eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { POSTGRES_ERR } from "@/constants/common"
import type { Schema } from "@/lib/database"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { type EmployeeRecord, employees } from "@/schema/employees"

type DbClient = PostgresJsDatabase<Schema>

export const updateEmployee = async (
	id: string,
	data: Partial<Omit<EmployeeRecord, "id" | "createdAt" | "updatedAt">>,
	dbClient: DbClient = db,
): Promise<EmployeeRecord> => {
	const [result, err] = await runAwait(
		dbClient
			.update(employees)
			.set(data)
			.where(eq(employees.id, id))
			.returning(),
	)

	if (err) {
		const pgError =
			err &&
			typeof err === "object" &&
			"cause" in err &&
			err.cause instanceof postgres.PostgresError
				? err.cause
				: err instanceof postgres.PostgresError
					? err
					: null

		if (pgError) {
			switch (pgError.constraint_name) {
				case POSTGRES_ERR.employees_userId_unique:
					throw new ServiceError(
						"EMPLOYEE_EXISTS_FOR_USER",
						"Employee record already exists for this user",
						409,
					)
				case POSTGRES_ERR.employees_userId_fkey:
					throw new ServiceError("USER_NOT_FOUND", "User not found", 404)
				default:
					throw new ServiceError(
						"DATABASE_ERROR",
						pgError.message || "Database error occurred",
						500,
					)
			}
		}

		throw err
	}

	const [updated] = result

	if (!updated) {
		throw new ServiceError("EMPLOYEE_NOT_FOUND", "Employee not found", 404)
	}

	return updated
}
