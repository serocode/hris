import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import type { UpdateEmployeeInput } from "@/features/employees"
import {
	useEmployeeQuery,
	useUpdateEmployeeMutation,
} from "@/features/employees"
import { requireRole } from "@/lib/auth-utils"
import { getErrorMessage } from "@/lib/error-message"

export const Route = createFileRoute("/_protected/employee/$employeeId/edit")({
	beforeLoad: async () => {
		await requireRole("admin")
	},
	component: EmployeeEditPage,
})

function EmployeeEditPage() {
	const { employeeId } = Route.useParams()
	const navigate = useNavigate()
	const employeeQuery = useEmployeeQuery(employeeId)
	const employee = employeeQuery.data?.data ?? null
	const updateEmployeeMutation = useUpdateEmployeeMutation()
	const [error, setError] = useState<string | null>(null)

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		setError(null)

		if (!employee) return

		const formData = new FormData(e.currentTarget)
		const updates: UpdateEmployeeInput = {}

		const firstName = (formData.get("firstName") as string).trim()
		if (firstName && firstName !== employee.firstName) {
			updates.firstName = firstName
		}

		const lastName = (formData.get("lastName") as string).trim()
		if (lastName && lastName !== employee.lastName) {
			updates.lastName = lastName
		}

		const hireDate = formData.get("hireDate") as string
		if (hireDate && hireDate !== String(employee.hireDate).slice(0, 10)) {
			updates.hireDate = hireDate
		}

		if (Object.keys(updates).length === 0) {
			navigate({
				to: "/employee/$employeeId",
				params: { employeeId },
			})
			return
		}

		try {
			await updateEmployeeMutation.mutateAsync({
				id: employeeId,
				input: updates,
			})
			navigate({
				to: "/employee/$employeeId",
				params: { employeeId },
			})
		} catch (err) {
			setError(
				getErrorMessage(err, "Failed to update employee. Please try again."),
			)
		}
	}

	if (employeeQuery.isPending) {
		return (
			<div className="page">
				<div className="loading-state">
					<div className="spinner" />
					<span>Loading employee...</span>
				</div>
			</div>
		)
	}

	if (employeeQuery.isError || !employee) {
		return (
			<div className="p-8 text-center text-danger">
				{getErrorMessage(employeeQuery.error, "Employee not found")}
			</div>
		)
	}

	return (
		<div className="page max-w-2xl mx-auto">
			<div className="page-header">
				<h1 className="page-title">Edit Employee</h1>
				<p className="page-description">
					Update employee record for {employee.firstName} {employee.lastName}
				</p>
			</div>

			{error && (
				<div className="error-banner mb-6">
					<span>{error}</span>
				</div>
			)}

			<form onSubmit={handleSubmit} className="card p-6 space-y-6">
				<div className="grid grid-cols-2 gap-4">
					<div className="form-group">
						<label htmlFor="firstName" className="form-label">
							First Name
						</label>
						<input
							type="text"
							id="firstName"
							name="firstName"
							defaultValue={employee.firstName}
							required
							className="form-input"
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
							defaultValue={employee.lastName}
							required
							className="form-input"
						/>
					</div>
				</div>

				<div className="form-group">
					<label htmlFor="hireDate" className="form-label">
						Hire Date
					</label>
					<input
						type="date"
						id="hireDate"
						name="hireDate"
						defaultValue={employee.hireDate.slice(0, 10)}
						required
						className="form-input"
					/>
				</div>

				<div className="flex justify-end gap-3 pt-4">
					<button
						type="button"
						className="btn btn--secondary"
						onClick={() =>
							navigate({
								to: "/employee/$employeeId",
								params: { employeeId },
							})
						}
					>
						Cancel
					</button>
					<button
						type="submit"
						className="btn btn--primary"
						disabled={updateEmployeeMutation.isPending}
					>
						{updateEmployeeMutation.isPending ? "Saving..." : "Save Changes"}
					</button>
				</div>
			</form>
		</div>
	)
}
