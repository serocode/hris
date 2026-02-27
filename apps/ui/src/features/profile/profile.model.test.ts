import { describe, expect, it } from "vitest"
import {
	createProfileUpdatePayload,
	toProfileFormValues,
	validateProfileForm,
} from "./profile.model"
import type { ProfileFormValues } from "./profile.schemas"

describe("profile model", () => {
	it("maps nullable profile fields to editable form values", () => {
		const values = toProfileFormValues({
			id: "emp_1",
			userId: "usr_1",
			email: "user@example.com",
			name: "Jane Doe",
			firstName: "Jane",
			lastName: "Doe",
			middleName: null,
			suffix: null,
			image: null,
			hireDate: "2025-01-01",
			createdAt: "2025-01-01T00:00:00Z",
			updatedAt: "2025-01-01T00:00:00Z",
		})

		expect(values.middleName).toBe("")
		expect(values.suffix).toBe("")
		expect(values.image).toBe("")
	})

	it("returns null payload when nothing changed", () => {
		const initial: ProfileFormValues = {
			firstName: "Jane",
			lastName: "Doe",
			middleName: "",
			suffix: "",
			image: "",
		}

		expect(createProfileUpdatePayload(initial, initial)).toBeNull()
	})

	it("returns only changed editable fields and null for cleared optional fields", () => {
		const initial: ProfileFormValues = {
			firstName: "Jane",
			lastName: "Doe",
			middleName: "David",
			suffix: "Jr.",
			image: "https://cdn.example.com/avatar.jpg",
		}

		const next: ProfileFormValues = {
			firstName: "Janet",
			lastName: "Doe",
			middleName: "",
			suffix: "",
			image: "",
		}

		expect(createProfileUpdatePayload(initial, next)).toEqual({
			firstName: "Janet",
			middleName: null,
			suffix: null,
			image: null,
		})
	})

	it("surfaces field validation errors", () => {
		const result = validateProfileForm({
			firstName: "J",
			lastName: "",
			middleName: "",
			suffix: "",
			image: "not-a-url",
		})

		expect(result.errors?.firstName).toBeTruthy()
		expect(result.errors?.lastName).toBeTruthy()
		expect(result.errors?.image).toBeTruthy()
	})
})
