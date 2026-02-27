import { MeUpdateFieldsSchema } from "@hris-v2/contracts/me"
import { z } from "zod"

const firstNameFieldSchema = MeUpdateFieldsSchema.pick({ firstName: true })
const lastNameFieldSchema = MeUpdateFieldsSchema.pick({ lastName: true })
const middleNameFieldSchema = MeUpdateFieldsSchema.pick({ middleName: true })
const suffixFieldSchema = MeUpdateFieldsSchema.pick({ suffix: true })
const imageFieldSchema = MeUpdateFieldsSchema.pick({ image: true })

export const ProfileFormSchema = z.object({
	firstName: z
		.string()
		.trim()
		.refine(
			(value) => firstNameFieldSchema.safeParse({ firstName: value }).success,
			"First name must be at least 2 characters.",
		),
	lastName: z
		.string()
		.trim()
		.refine(
			(value) => lastNameFieldSchema.safeParse({ lastName: value }).success,
			"Last name must be at least 2 characters.",
		),
	middleName: z
		.string()
		.trim()
		.refine(
			(value) =>
				middleNameFieldSchema.safeParse({
					middleName: value.length === 0 ? null : value,
				}).success,
			"Middle name must be at least 2 characters when provided.",
		),
	suffix: z
		.string()
		.trim()
		.refine(
			(value) =>
				suffixFieldSchema.safeParse({
					suffix: value.length === 0 ? null : value,
				}).success,
			"Suffix must be at least 1 character when provided.",
		),
	image: z
		.string()
		.trim()
		.refine(
			(value) =>
				imageFieldSchema.safeParse({
					image: value.length === 0 ? null : value,
				}).success,
			"Avatar URL must be a valid URL.",
		),
})

export type ProfileFormValues = z.infer<typeof ProfileFormSchema>

export type ProfileFormErrors = Partial<Record<keyof ProfileFormValues, string>>
