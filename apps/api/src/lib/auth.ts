import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { openAPI, username } from "better-auth/plugins"
import { db } from "@/lib/database";

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: "pg", 
    }),
    emailAndPassword: { 
    enabled: true, 
  }, 
  plugins: [ 
        username(),
        openAPI(),
    ] 
});