import { z } from "zod"

/**
 * Shared base schema for employee data in API responses.
 * All employee response schemas should compose from this base.
 *
 * NOTE: Dates use z.string() (not z.coerce.date()) because JSON
 * serialization converts Date objects to ISO strings. The inferred
 * TypeScript type must match what the frontend actually receives.
 */
export const EmployeeData = z.object({
	id: z.string(),
	userId: z.string(),
	firstName: z.string(),
	lastName: z.string(),
	middleName: z.string().optional(),
	suffix: z.string().optional(),
	dateOfBirth: z.string(),
	hireDate: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
})

export type EmployeeData = z.infer<typeof EmployeeData>
