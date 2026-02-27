import { createFileRoute } from "@tanstack/react-router"
import { useState } from "react"
import { ProfileForm } from "@/features/profile/components/profile-form"
import {
	createProfileUpdatePayload,
	toProfileFormValues,
	validateProfileForm,
} from "@/features/profile/profile.model"
import {
	useMeQuery,
	useUpdateProfileMutation,
} from "@/features/profile/profile.query"
import type { ProfileFormErrors } from "@/features/profile/profile.schemas"
import { getErrorMessage } from "@/lib/error-message"

export const Route = createFileRoute("/_protected/profile")({
	component: ProfilePage,
})

function ProfilePage() {
	const profileQuery = useMeQuery()
	const updateProfileMutation = useUpdateProfileMutation()

	const [fieldErrors, setFieldErrors] = useState<ProfileFormErrors>({})
	const [submitError, setSubmitError] = useState<string | null>(null)
	const [successMessage, setSuccessMessage] = useState<string | null>(null)

	if (profileQuery.isPending) {
		return (
			<div className="page">
				<div className="loading-state">
					<div className="spinner" />
					<span>Loading profile...</span>
				</div>
			</div>
		)
	}

	if (profileQuery.isError || !profileQuery.data?.data) {
		return (
			<div className="page">
				<div className="error-banner">
					<span>
						{getErrorMessage(profileQuery.error, "Failed to load profile.")}
					</span>
				</div>
			</div>
		)
	}

	const profile = profileQuery.data.data
	const initialValues = toProfileFormValues(profile)

	return (
		<div className="page max-w-3xl mx-auto">
			<div className="page-header">
				<h1 className="page-title">My Profile</h1>
				<p className="page-description">
					View and update your personal profile details.
				</p>
			</div>

			<ProfileForm
				email={profile.email}
				initialValues={initialValues}
				isSubmitting={updateProfileMutation.isPending}
				submitError={submitError}
				successMessage={successMessage}
				fieldErrors={fieldErrors}
				onSubmit={async (values) => {
					setSubmitError(null)
					setSuccessMessage(null)
					setFieldErrors({})

					const validation = validateProfileForm(values)
					if (validation.errors) {
						setFieldErrors(validation.errors)
						return
					}

					const payload = createProfileUpdatePayload(
						initialValues,
						validation.values ?? values,
					)

					if (!payload) {
						setSuccessMessage("No changes to save.")
						return
					}

					try {
						await updateProfileMutation.mutateAsync(payload)
						setSuccessMessage("Profile updated successfully.")
					} catch (error) {
						setSubmitError(
							getErrorMessage(
								error,
								"Failed to update profile. Please try again.",
							),
						)
					}
				}}
			/>
		</div>
	)
}
