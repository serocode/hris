import { eq } from "drizzle-orm"
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js"
import type { Schema } from "@/lib/database"
import { db } from "@/lib/database"
import { ServiceError } from "@/lib/service-error"
import { user } from "@/schema/auth"
import type { UserProfileRecord } from "./users.get"

type DbClient = PostgresJsDatabase<Schema>

type UpdateUserProfileInput = {
	name?: string
	image?: string | null
}

export async function updateUserProfile(
	userId: string,
	data: UpdateUserProfileInput,
	dbClient: DbClient = db,
): Promise<UserProfileRecord> {
	const [updated] = await dbClient
		.update(user)
		.set(data)
		.where(eq(user.id, userId))
		.returning({
			id: user.id,
			name: user.name,
			email: user.email,
			image: user.image,
		})

	if (!updated) {
		throw new ServiceError("USER_NOT_FOUND", "User not found", 404)
	}

	return updated
}
