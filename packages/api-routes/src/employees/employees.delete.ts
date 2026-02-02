import { z } from "@hono/zod-openapi"

export const EmployeesDeleteParams = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
})
export type EmployeesDeleteParams = z.infer<typeof EmployeesDeleteParams>

const EmployeesDeleteResponseData = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
	userId: z.string().openapi({ example: "adt819234masdf1m" }),
	employeeNumber: z.string().openapi({ example: "7865439" }),
	firstName: z.string().openapi({ example: "John" }),
	lastName: z.string().openapi({ example: "Doe" }),
	position: z.string().openapi({ example: "Software Engineer" }),
	hireDate: z.string().openapi({ example: "2025-12-31" }),
	createdAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
	updatedAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
})

export const EmployeesDeleteResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: EmployeesDeleteResponseData,
	message: z.string().openapi({ example: "Employee deleted successfully" }),
})
export type EmployeesDeleteResponse = z.infer<typeof EmployeesDeleteResponse>
