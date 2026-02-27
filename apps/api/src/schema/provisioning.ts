import { relations } from "drizzle-orm"
import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core"
import { dates } from "@/schema/helpers"
import { user } from "./auth"

export const userProvisioning = pgTable(
	"user_provisioning",
	{
		userId: text("user_id")
			.primaryKey()
			.references(() => user.id, { onDelete: "cascade" }),
		status: text("status").notNull().default("PENDING_INVITE"),
		invitedBy: text("invited_by").references(() => user.id, {
			onDelete: "set null",
		}),
		inviteSentAt: timestamp("invite_sent_at").defaultNow().notNull(),
		inviteExpiresAt: timestamp("invite_expires_at").notNull(),
		activatedAt: timestamp("activated_at"),

		...dates,
	},
	(table) => [
		index("user_provisioning_status_idx").on(table.status),
		index("user_provisioning_invited_by_idx").on(table.invitedBy),
	],
)

export const userProvisioningRelations = relations(
	userProvisioning,
	({ one }) => ({
		user: one(user, {
			fields: [userProvisioning.userId],
			references: [user.id],
			relationName: "provisioning-user",
		}),
		inviter: one(user, {
			fields: [userProvisioning.invitedBy],
			references: [user.id],
			relationName: "provisioning-inviter",
		}),
	}),
)
