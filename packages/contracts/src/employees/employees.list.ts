import { z } from "zod"
import { EmployeeData } from "./_base.js"

export const EmployeesListQuery = z.object({
	limit: z.coerce.number().min(1).max(100).default(100),
	offset: z.coerce.number().min(0).default(0),
})
export type EmployeesListQuery = z.infer<typeof EmployeesListQuery>

export const EmployeesListResponse = z.object({
	status: z.literal("success"),
	data: z.array(EmployeeData),
	meta: z.object({
		limit: z.number(),
		offset: z.number(),
		total: z.number(),
	}),
})
export type EmployeesListResponse = z.infer<typeof EmployeesListResponse>
