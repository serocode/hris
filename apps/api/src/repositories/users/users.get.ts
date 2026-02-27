import { eq } from "drizzle-orm"
import { db } from "@/lib/database"
import { user } from "@/schema/auth"

export type UserProfileRecord = {
	id: string
	name: string | null
	email: string
	image: string | null
}

export async function getUserById(
	userId: string,
): Promise<UserProfileRecord | null> {
	const [record] = await db
		.select({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
		})
		.from(user)
		.where(eq(user.id, userId))
		.limit(1)

	return record ?? null
}
