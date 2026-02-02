import { z } from "@hono/zod-openapi"

export const EmployeesUpdateParams = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
})
export type EmployeesUpdateParams = z.infer<typeof EmployeesUpdateParams>

export const EmployeesUpdatePayload = z.object({
	employeeNumber: z.string().min(7).optional().openapi({ example: "7865439" }),
	firstName: z.string().min(2).optional().openapi({ example: "John" }),
	lastName: z.string().min(2).optional().openapi({ example: "Doe" }),
	position: z
		.string()
		.min(2)
		.optional()
		.openapi({ example: "Senior Software Engineer" }),
	hireDate: z.coerce.date().optional().openapi({ example: "2025-12-31" }),
})
export type EmployeesUpdatePayload = z.infer<typeof EmployeesUpdatePayload>

const EmployeesUpdateResponseData = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
	userId: z.string().openapi({ example: "adt819234masdf1m" }),
	employeeNumber: z.string().openapi({ example: "7865439" }),
	firstName: z.string().openapi({ example: "John" }),
	lastName: z.string().openapi({ example: "Doe" }),
	position: z.string().openapi({ example: "Senior Software Engineer" }),
	hireDate: z.string().openapi({ example: "2025-12-31" }),
	createdAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
	updatedAt: z.string().openapi({ example: "2025-01-16T14:45:00Z" }),
})

export const EmployeesUpdateResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: EmployeesUpdateResponseData,
})
export type EmployeesUpdateResponse = z.infer<typeof EmployeesUpdateResponse>
