import { adminClient } from "better-auth/client/plugins"
import { createAuthClient } from "better-auth/react"
import { getClientApiUrl } from "@/app/config/env"

export const authClient = createAuthClient({
	baseURL: getClientApiUrl(),
	plugins: [adminClient()],
	fetchOptions: {
		credentials: "include",
	},
})

export const { useSession, signIn, signOut, getSession } = authClient
