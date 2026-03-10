import { z } from "zod"
import { MeResponse } from "./me.get.js"

export const MeUpdateFieldsSchema = z.object({
	firstName: z.string().trim().min(2).optional(),
	lastName: z.string().trim().min(2).optional(),
	middleName: z.string().trim().min(2).nullable().optional(),
	suffix: z.string().trim().min(1).nullable().optional(),
	image: z.string().trim().url().nullable().optional(),
})

export const MeUpdatePayload = MeUpdateFieldsSchema.refine(
	(value) => Object.keys(value).length > 0,
	{
		message: "Please provide at least one field to update.",
	},
)

export type MeUpdatePayload = z.infer<typeof MeUpdatePayload>

export const MeUpdateResponse = MeResponse
export type MeUpdateResponse = z.infer<typeof MeUpdateResponse>
