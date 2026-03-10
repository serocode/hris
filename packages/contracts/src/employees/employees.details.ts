import { z } from "zod"
import { EmployeeData } from "./_base.js"

export const EmployeesDetailsParams = z.object({
	id: z.string(),
})
export type EmployeesDetailsParams = z.infer<typeof EmployeesDetailsParams>

export const EmployeesDetailsResponse = z.object({
	status: z.literal("success"),
	data: EmployeeData,
})
export type EmployeesDetailsResponse = z.infer<typeof EmployeesDetailsResponse>
