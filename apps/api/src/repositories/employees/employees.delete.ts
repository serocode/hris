import { eq } from "drizzle-orm"
import { db } from "@/lib/database"
import { employees } from "@/schema/employees"

export const deleteEmployee = async (id: string): Promise<void> => {
	await db.delete(employees).where(eq(employees.id, id))
}
