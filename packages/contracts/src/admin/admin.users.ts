import { z } from "zod"

export const AdminUserData = z.object({
	id: z.string(),
	name: z.string().nullable().optional(),
	email: z.string().email(),
	role: z.string().optional(),
	banned: z.boolean().optional(),
	createdAt: z
		.union([z.string(), z.date()])
		.transform((value) =>
			typeof value === "string" ? value : value.toISOString(),
		),
})

export type AdminUserData = z.infer<typeof AdminUserData>

export const AdminUsersResponse = z.looseObject({
	users: z.array(AdminUserData),
})

export type AdminUsersResponse = z.infer<typeof AdminUsersResponse>
