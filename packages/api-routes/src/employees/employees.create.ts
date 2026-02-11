import { z } from "@hono/zod-openapi"

export const EmployeesCreatePayload = z.object({
	userId: z.string().optional().openapi({ example: "adt819234masdf1m" }),
	firstName: z.string().min(2).openapi({ example: "John" }),
	lastName: z.string().min(2).openapi({ example: "Doe" }),
	position: z.string().min(2).openapi({ example: "Software Engineer" }),
	hireDate: z.coerce.date().openapi({ example: "2025-12-31" }),
})
export type EmployeesCreatePayload = z.infer<typeof EmployeesCreatePayload>

const EmployeesResponseData = z.object({
	id: z.string().optional().openapi({ example: "adt819234masdf1m" }),
	userId: z.string().openapi({ example: "adt819234masdf1m" }),
	firstName: z.string().min(2).openapi({ example: "John" }),
	lastName: z.string().min(2).openapi({ example: "Doe" }),
	position: z.string().min(2).openapi({ example: "Software Engineer" }),
	hireDate: z.string().openapi({ example: "2025-12-31" }),
})

export const EmployeesCreateResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: EmployeesResponseData,
})
export type EmployeesCreateResponse = z.infer<typeof EmployeesCreateResponse>
