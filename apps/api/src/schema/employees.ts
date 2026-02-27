import { relations } from "drizzle-orm"
import { date, index, pgTable, text } from "drizzle-orm/pg-core"
import { user } from "@/schema/auth"
import { dates } from "@/schema/helpers"

export const employees = pgTable(
	"employees",
	{
		id: text("id").primaryKey(),

		userId: text("user_id")
			.notNull()
			.unique()
			.references(() => user.id, { onDelete: "cascade" }),

		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		fullName: text("full_name").notNull().default(""),
		middleName: text("middle_name"),
		suffix: text("suffix"),
		dateOfBirth: date("date_of_birth").notNull(),
		hireDate: date("hire_date").notNull(),

		...dates,
	},
	(table) => [index("employees_userId_idx").on(table.userId)],
)

export type EmployeeRecord = typeof employees.$inferSelect

export const employeeRelations = relations(employees, ({ one }) => ({
	user: one(user, {
		fields: [employees.userId],
		references: [user.id],
	}),
}))
