import { useEffect, useState } from "react"
import type { ProfileFormErrors, ProfileFormValues } from "../profile.schemas"

type ProfileFormProps = {
	email: string
	initialValues: ProfileFormValues
	isSubmitting: boolean
	submitError: string | null
	successMessage: string | null
	fieldErrors: ProfileFormErrors
	onSubmit: (values: ProfileFormValues) => Promise<void>
}

export function ProfileForm({
	email,
	initialValues,
	isSubmitting,
	submitError,
	successMessage,
	fieldErrors,
	onSubmit,
}: ProfileFormProps) {
	const [values, setValues] = useState<ProfileFormValues>(initialValues)

	useEffect(() => {
		setValues(initialValues)
	}, [initialValues])

	return (
		<form
			onSubmit={async (event) => {
				event.preventDefault()
				await onSubmit(values)
			}}
			className="card p-6 space-y-6"
		>
			{successMessage && (
				<div className="login-success">
					<span>{successMessage}</span>
				</div>
			)}

			{submitError && (
				<div className="error-banner">
					<span>{submitError}</span>
				</div>
			)}

			<div className="grid grid-cols-2 gap-4">
				<div className="form-group">
					<label htmlFor="profileFirstName" className="form-label">
						First Name
					</label>
					<input
						id="profileFirstName"
						type="text"
						className="form-input"
						value={values.firstName}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								firstName: event.target.value,
							}))
						}
					/>
					{fieldErrors.firstName && (
						<p className="form-error">{fieldErrors.firstName}</p>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="profileLastName" className="form-label">
						Last Name
					</label>
					<input
						id="profileLastName"
						type="text"
						className="form-input"
						value={values.lastName}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								lastName: event.target.value,
							}))
						}
					/>
					{fieldErrors.lastName && (
						<p className="form-error">{fieldErrors.lastName}</p>
					)}
				</div>
			</div>

			<div className="grid grid-cols-2 gap-4">
				<div className="form-group">
					<label htmlFor="profileMiddleName" className="form-label">
						Middle Name
					</label>
					<input
						id="profileMiddleName"
						type="text"
						className="form-input"
						value={values.middleName}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								middleName: event.target.value,
							}))
						}
					/>
					{fieldErrors.middleName && (
						<p className="form-error">{fieldErrors.middleName}</p>
					)}
				</div>

				<div className="form-group">
					<label htmlFor="profileSuffix" className="form-label">
						Suffix
					</label>
					<input
						id="profileSuffix"
						type="text"
						className="form-input"
						value={values.suffix}
						onChange={(event) =>
							setValues((current) => ({
								...current,
								suffix: event.target.value,
							}))
						}
					/>
					{fieldErrors.suffix && (
						<p className="form-error">{fieldErrors.suffix}</p>
					)}
				</div>
			</div>

			<div className="form-group">
				<label htmlFor="profileEmail" className="form-label">
					Email (read-only)
				</label>
				<input
					id="profileEmail"
					type="email"
					className="form-input"
					value={email}
					readOnly
					disabled
				/>
			</div>

			<div className="form-group">
				<label htmlFor="profileImage" className="form-label">
					Avatar URL
				</label>
				<input
					id="profileImage"
					type="url"
					className="form-input"
					value={values.image}
					onChange={(event) =>
						setValues((current) => ({
							...current,
							image: event.target.value,
						}))
					}
					placeholder="https://example.com/avatar.jpg"
				/>
				{fieldErrors.image && <p className="form-error">{fieldErrors.image}</p>}
			</div>

			<div className="flex justify-end">
				<button
					type="submit"
					className="btn btn--primary"
					disabled={isSubmitting}
				>
					{isSubmitting ? "Saving..." : "Save Profile"}
				</button>
			</div>
		</form>
	)
}
