import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, openAPI, organization } from "better-auth/plugins";
import { BETTER_AUTH_URL } from "@/constants/env";
import { ac, admin as adminRole, user as userRole } from "@/lib/access";
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
  user: {
    fields: {
      name: "employee_number",
      
    },
},
  plugins: [ 
        openAPI(),
        admin({
            ac,
            roles: {
                admin: adminRole,
                user: userRole,
            },
            defaultRole: 'user',
        }),
        organization(),
    ] 
});