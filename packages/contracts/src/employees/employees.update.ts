import { z } from "zod"
import { EmployeeData } from "./_base.js"

export const EmployeesUpdateParams = z.object({
	id: z.string(),
})
export type EmployeesUpdateParams = z.infer<typeof EmployeesUpdateParams>

export const EmployeesUpdatePayload = z
	.object({
		firstName: z.string().min(2).optional(),
		lastName: z.string().min(2).optional(),
		middleName: z.string().min(2).optional(),
		suffix: z.string().min(2).optional(),
		dateOfBirth: z.coerce.date().optional(),
		hireDate: z.coerce.date().optional(),
	})
	.refine((value) => Object.keys(value).length > 0, {
		message: "Please provide at least one field to update.",
	})
export type EmployeesUpdatePayload = z.infer<typeof EmployeesUpdatePayload>

export const EmployeesUpdateResponse = z.object({
	status: z.literal("success"),
	data: EmployeeData,
})
export type EmployeesUpdateResponse = z.infer<typeof EmployeesUpdateResponse>
