import type { authClient } from "./auth-client"

export type AuthSession = typeof authClient.$Infer.Session
export type AuthUser = typeof authClient.$Infer.Session.user
