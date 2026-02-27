import {
	EmployeesCreatePayload,
	EmployeesListQuery,
	EmployeesUpdatePayload,
} from "@hris-v2/contracts/employees"
import { z } from "zod"

export const EmployeesListParamsSchema = EmployeesListQuery
export type EmployeesListParams = z.input<typeof EmployeesListParamsSchema>
export type EmployeesListParamsResolved = z.output<
	typeof EmployeesListParamsSchema
>

export const CreateEmployeeInputSchema = EmployeesCreatePayload.omit({
	userId: true,
}).extend({
	email: z.email(),
	role: z.enum(["admin", "user"]).default("user"),
})

export type CreateEmployeeInput = z.input<typeof CreateEmployeeInputSchema>

export const UpdateEmployeeInputSchema = EmployeesUpdatePayload

export type UpdateEmployeeInput = z.input<typeof UpdateEmployeeInputSchema>
