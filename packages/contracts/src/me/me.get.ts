import { z } from "zod"

const MeResponseData = z.object({
	id: z.string(),
	userId: z.string(),
	email: z.string().email(),
	name: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	middleName: z.string().nullable(),
	suffix: z.string().nullable(),
	image: z.string().url().nullable(),
	hireDate: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export const MeResponse = z.object({
	status: z.literal("success"),
	data: MeResponseData,
})
export type MeResponse = z.infer<typeof MeResponse>
