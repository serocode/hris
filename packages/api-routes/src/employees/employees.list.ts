import { z } from "@hono/zod-openapi"

export const EmployeesListQuery = z.object({
	limit: z.coerce
		.number()
		.min(1)
		.max(100)
		.default(100)
		.openapi({ example: 100 }),
	offset: z.coerce.number().min(0).default(0).openapi({ example: 0 }),
})
export type EmployeesListQuery = z.infer<typeof EmployeesListQuery>

const EmployeeListItemData = z.object({
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

export const EmployeesListResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: z.array(EmployeeListItemData),
	meta: z.object({
		limit: z.number().openapi({ example: 100 }),
		offset: z.number().openapi({ example: 0 }),
		total: z.number().openapi({ example: 50 }),
	}),
})
export type EmployeesListResponse = z.infer<typeof EmployeesListResponse>
