import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { CreateEmployeeInput } from "@/features/employees"
import { useCreateEmployeeMutation } from "@/features/employees"
import { requireRole } from "@/lib/auth-utils"
import { getErrorMessage } from "@/lib/error-message"

export const Route = createFileRoute("/_protected/employee/create")({
	beforeLoad: async () => {
		await requireRole("admin")
	},
	component: EmployeeCreatePage,
})

function EmployeeCreatePage() {
	const navigate = useNavigate()
	const createEmployeeMutation = useCreateEmployeeMutation()
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		const formData = new FormData(e.currentTarget)
		const middleName = (formData.get("middleName") as string)?.trim()
		const suffix = (formData.get("suffix") as string)?.trim()

		const data: CreateEmployeeInput = {
			email: (formData.get("email") as string).trim(),
			role: formData.get("role") as CreateEmployeeInput["role"],
			firstName: (formData.get("firstName") as string).trim(),
			lastName: (formData.get("lastName") as string).trim(),
			dateOfBirth: formData.get("dateOfBirth") as string,
			hireDate: formData.get("hireDate") as string,
			...(middleName && { middleName }),
			...(suffix && { suffix }),
		}

		try {
			await createEmployeeMutation.mutateAsync(data)
			navigate({ to: "/employee" })
		} catch (err) {
			const message = getErrorMessage(
				err,
				"Failed to create employee. Please try again.",
			)
			setError(message)
		}
	}

	return (
		<div className="page max-w-2xl mx-auto">
			<div className="page-header">
				<h1 className="page-title">Add Employee</h1>
				<p className="page-description">
					Create a new employee record and send an account invite
				</p>
			</div>

			{error && (
				<div className="error-banner mb-6">
					<span>{error}</span>
				</div>
			)}

			<form onSubmit={handleSubmit} className="card p-6 space-y-6">
				{/* Account Details Section */}
				<div className="form-section">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Account Details
					</h3>
					<div className="grid grid-cols-1 gap-4">
						<div className="form-group">
							<label htmlFor="email" className="form-label">
								Email Address
							</label>
							<input
								type="email"
								id="email"
								name="email"
								required
								className="form-input"
								placeholder="john.doe@example.com"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="role" className="form-label">
								Role
							</label>
							<select
								id="role"
								name="role"
								className="form-input"
								defaultValue="user"
							>
								<option value="user">User</option>
								<option value="admin">Admin</option>
							</select>
						</div>
					</div>
				</div>

				<hr className="border-gray-200" />

				{/* Employee Details Section */}
				<div className="form-section">
					<h3 className="text-lg font-medium text-gray-900 mb-4">
						Employee Information
					</h3>
					<div className="grid grid-cols-2 gap-4">
						<div className="form-group">
							<label htmlFor="firstName" className="form-label">
								First Name
							</label>
							<input
								type="text"
								id="firstName"
								name="firstName"
								required
								className="form-input"
								placeholder="e.g. John"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="lastName" className="form-label">
								Last Name
							</label>
							<input
								type="text"
								id="lastName"
								name="lastName"
								required
								className="form-input"
								placeholder="e.g. Doe"
							/>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-4 mt-4">
						<div className="form-group">
							<label htmlFor="middleName" className="form-label">
								Middle Name
							</label>
							<input
								type="text"
								id="middleName"
								name="middleName"
								className="form-input"
								placeholder="e.g. David"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="suffix" className="form-label">
								Suffix
							</label>
							<input
								type="text"
								id="suffix"
								name="suffix"
								className="form-input"
								placeholder="e.g. Jr."
							/>
						</div>
					</div>

					<div className="grid grid-cols-2 gap-4 mt-4">
						<div className="form-group">
							<label htmlFor="dateOfBirth" className="form-label">
								Date of Birth
							</label>
							<input
								type="date"
								id="dateOfBirth"
								name="dateOfBirth"
								required
								className="form-input"
							/>
						</div>
						<div className="form-group">
							<label htmlFor="hireDate" className="form-label">
								Hire Date
							</label>
							<input
								type="date"
								id="hireDate"
								name="hireDate"
								required
								className="form-input"
							/>
						</div>
					</div>
				</div>

				<div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
					<button
						type="button"
						className="btn btn--secondary"
						onClick={() => navigate({ to: "/employee" })}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="btn btn--primary"
						disabled={createEmployeeMutation.isPending}
					>
						{createEmployeeMutation.isPending
							? "Creating..."
							: "Create Employee & Send Invite"}
					</button>
				</div>
			</form>
		</div>
	)
}
