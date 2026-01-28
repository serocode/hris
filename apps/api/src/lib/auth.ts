import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins";
import { BETTER_AUTH_URL } from "@/constants/env";
import { db } from "@/lib/database";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
    }),
    baseURL: BETTER_AUTH_URL,
    emailAndPassword: { 
    enabled: true, 
    requireEmailVerification: false,
  }, 
  plugins: [ 
        username(),
        openAPI(),
    ] 
});