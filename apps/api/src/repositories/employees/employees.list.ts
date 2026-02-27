import { count } from "drizzle-orm"
import { db } from "@/lib/database"
import { type EmployeeRecord, employees } from "@/schema/employees"

export const listEmployees = async (
	limit = 100,
	offset = 0,
): Promise<{ data: EmployeeRecord[]; total: number }> => {
	const [data, [{ total }]] = await Promise.all([
		db.select().from(employees).limit(limit).offset(offset),
		db.select({ total: count() }).from(employees),
	])

	return { data, total }
}
