import type { MeResponse, MeUpdatePayload } from "@hris-v2/contracts/me"
import type { ProfileFormErrors, ProfileFormValues } from "./profile.schemas"
import { ProfileFormSchema } from "./profile.schemas"

export function toProfileFormValues(
	profile: MeResponse["data"],
): ProfileFormValues {
	return {
		firstName: profile.firstName,
		lastName: profile.lastName,
		middleName: profile.middleName ?? "",
		suffix: profile.suffix ?? "",
		image: profile.image ?? "",
	}
}

function normalizeOptionalString(value: string): string | null {
	const trimmed = value.trim()
	return trimmed.length > 0 ? trimmed : null
}

function firstError(
	fieldErrors: Record<string, string[] | undefined>,
	field: keyof ProfileFormValues,
) {
	return fieldErrors[field]?.[0]
}

export function validateProfileForm(values: ProfileFormValues): {
	values?: ProfileFormValues
	errors?: ProfileFormErrors
} {
	const parsed = ProfileFormSchema.safeParse(values)
	if (parsed.success) {
		return { values: parsed.data }
	}

	const flatErrors = parsed.error.flatten().fieldErrors
	return {
		errors: {
			firstName: firstError(flatErrors, "firstName"),
			lastName: firstError(flatErrors, "lastName"),
			middleName: firstError(flatErrors, "middleName"),
			suffix: firstError(flatErrors, "suffix"),
			image: firstError(flatErrors, "image"),
		},
	}
}

export function createProfileUpdatePayload(
	initial: ProfileFormValues,
	next: ProfileFormValues,
): MeUpdatePayload | null {
	const payload: Partial<MeUpdatePayload> = {}

	if (next.firstName !== initial.firstName) {
		payload.firstName = next.firstName
	}
	if (next.lastName !== initial.lastName) {
		payload.lastName = next.lastName
	}

	const normalizedNextMiddleName = normalizeOptionalString(next.middleName)
	const normalizedInitialMiddleName = normalizeOptionalString(
		initial.middleName,
	)
	if (normalizedNextMiddleName !== normalizedInitialMiddleName) {
		payload.middleName = normalizedNextMiddleName
	}

	const normalizedNextSuffix = normalizeOptionalString(next.suffix)
	const normalizedInitialSuffix = normalizeOptionalString(initial.suffix)
	if (normalizedNextSuffix !== normalizedInitialSuffix) {
		payload.suffix = normalizedNextSuffix
	}

	const normalizedNextImage = normalizeOptionalString(next.image)
	const normalizedInitialImage = normalizeOptionalString(initial.image)
	if (normalizedNextImage !== normalizedInitialImage) {
		payload.image = normalizedNextImage
	}

	return Object.keys(payload).length > 0 ? (payload as MeUpdatePayload) : null
}
