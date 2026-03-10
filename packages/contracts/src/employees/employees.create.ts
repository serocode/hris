import { z } from "zod"
import { EmployeeData } from "./_base.js"

export const EmployeesCreatePayload = z.object({
	firstName: z.string().min(2),
	lastName: z.string().min(2),
	middleName: z.string().min(2).optional(),
	suffix: z.string().min(2).optional(),
	dateOfBirth: z.coerce.date(),
	hireDate: z.coerce.date(),
	userId: z.string().optional(),
})
export type EmployeesCreatePayload = z.infer<typeof EmployeesCreatePayload>

export const EmployeesCreateResponse = z.object({
	status: z.literal("success"),
	data: EmployeeData,
})
export type EmployeesCreateResponse = z.infer<typeof EmployeesCreateResponse>
