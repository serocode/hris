import { z } from "@hono/zod-openapi"

export const EmployeesDetailsParams = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
})
export type EmployeesDetailsParams = z.infer<typeof EmployeesDetailsParams>

const EmployeesResponseData = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
	userId: z.string().openapi({ example: "adt819234masdf1m" }),
	firstName: z.string().openapi({ example: "John" }),
	lastName: z.string().openapi({ example: "Doe" }),
	position: z.string().openapi({ example: "Software Engineer" }),
	hireDate: z.string().openapi({ example: "2025-12-31" }),
	createdAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
	updatedAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
})

export const EmployeesDetailsResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: EmployeesResponseData,
})
export type EmployeesDetailsResponse = z.infer<typeof EmployeesDetailsResponse>
