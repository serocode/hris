import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { admin, openAPI, organization } from "better-auth/plugins"
import { eq } from "drizzle-orm"
import {
	ALLOWED_ORIGINS,
	BETTER_AUTH_URL,
	COOKIE_DOMAIN,
	FRONTEND_URL,
	INVITE_EXPIRY_HOURS,
	NODE_ENV,
} from "@/constants/env"
import { ac, admin as adminRole, user as userRole } from "@/lib/access"
import { db } from "@/lib/database"
import { sendEmail } from "@/lib/email"
import { markProvisioningActive } from "@/lib/provisioning"
import { user as userTable } from "@/schema/auth"

export const auth = betterAuth({
	database: drizzleAdapter(db, {
		provider: "pg",
	}),
	baseURL: BETTER_AUTH_URL,
	trustedOrigins: ALLOWED_ORIGINS,
	emailAndPassword: {
		enabled: true,
		disableSignUp: true,
		requireEmailVerification: true,
		resetPasswordTokenExpiresIn: INVITE_EXPIRY_HOURS * 60 * 60,
		onPasswordReset: async ({ user }) => {
			await db
				.update(userTable)
				.set({ emailVerified: true })
				.where(eq(userTable.id, user.id))
			await markProvisioningActive(user.id)
		},
		sendResetPassword: async ({ user, token }) => {
			const resetUrl = `${FRONTEND_URL}/activate-account?token=${encodeURIComponent(token)}`

			void sendEmail({
				to: user.email,
				subject: "You're invited to HRIS - activate your account",
				html: `
				<!DOCTYPE html>
				<html>
					<body style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #111;">
					<h2>Activate your account</h2>
					<p>Your account has been created by an administrator.</p>
					<p>Use this one-time link to set your password and verify your email.</p>
					<a href="${resetUrl}"
						style="display: inline-block; padding: 12px 24px; background: #000; color: #fff;
								text-decoration: none; border-radius: 6px; margin: 16px 0;">
						Activate account
					</a>
					<p style="color: #666; font-size: 13px;">
						If the button doesn't work, copy and paste this link into your browser:<br/>
						<a href="${resetUrl}" style="color: #666;">${resetUrl}</a>
					</p>
					<p style="color: #666; font-size: 13px;">
						This link expires in ${INVITE_EXPIRY_HOURS} hour(s).
					</p>
					</body>
				</html>
				`,
			})
		},
	},
	session: {
		cookieCache: {
			enabled: true,
			maxAge: 5 * 60, // 5 minutes
		},
	},
	advanced: {
		crossSubDomainCookies: {
			enabled: true,
			domain: COOKIE_DOMAIN,
		},
		useSecureCookies: NODE_ENV === "production",
	},
	plugins: [
		openAPI(),
		admin({
			ac,
			roles: {
				admin: adminRole,
				user: userRole,
			},
			defaultRole: "user",
		}),
		organization(),
	],
})
