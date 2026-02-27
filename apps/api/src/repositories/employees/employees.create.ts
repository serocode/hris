import { runAwait } from "@hris-v2/utils"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { POSTGRES_ERR } from "@/constants/common"
import type { Schema } from "@/lib/database"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { type EmployeeRecord, employees } from "@/schema/employees"

type DbClient = PostgresJsDatabase<Schema>

export const createEmployee = async (
	data: Omit<EmployeeRecord, "createdAt" | "updatedAt">,
	dbClient: DbClient = db,
) => {
	const [result, err] = await runAwait(
		dbClient.insert(employees).values(data).returning(),
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

	const [created] = result
	return created
}
