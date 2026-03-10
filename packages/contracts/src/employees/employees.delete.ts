import { z } from "zod"
import { EmployeeData } from "./_base.js"

export const EmployeesDeleteParams = z.object({
	id: z.string(),
})
export type EmployeesDeleteParams = z.infer<typeof EmployeesDeleteParams>

export const EmployeesDeleteResponse = z.object({
	status: z.literal("success"),
	data: EmployeeData,
	message: z.string(),
})
export type EmployeesDeleteResponse = z.infer<typeof EmployeesDeleteResponse>
