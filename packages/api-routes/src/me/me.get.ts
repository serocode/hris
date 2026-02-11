import { z } from "@hono/zod-openapi"

const MeResponseData = z.object({
	id: z.string().openapi({ example: "adt819234masdf1m" }),
	userId: z.string().openapi({ example: "adt819234masdf1m" }),
	employeeNumber: z.string().openapi({ example: "EMP-001" }),
	firstName: z.string().openapi({ example: "John" }),
	lastName: z.string().openapi({ example: "Doe" }),
	position: z.string().openapi({ example: "Software Engineer" }),
	hireDate: z.string().openapi({ example: "2025-12-31" }),
	createdAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
	updatedAt: z.string().openapi({ example: "2025-01-15T10:30:00Z" }),
})

export const MeResponse = z.object({
	status: z.literal("success").openapi({ example: "success" }),
	data: MeResponseData,
})
export type MeResponse = z.infer<typeof MeResponse>
