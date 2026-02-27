import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"
import { useEmployeeQuery } from "@/features/employees"
import type { AuthSession } from "@/lib/auth-utils"
import { getErrorMessage } from "@/lib/error-message"

export const Route = createFileRoute("/_protected/employee/$employeeId/")({
	component: EmployeeDetailPage,
})

function EmployeeDetailPage() {
	const { employeeId } = Route.useParams()
	const employeeQuery = useEmployeeQuery(employeeId)
	const employee = employeeQuery.data?.data ?? null
	const { session } = useRouteContext({ from: "/_protected" }) as {
		session: AuthSession | undefined
	}
	const isAdmin = session?.user?.role === "admin"
	const error = employeeQuery.error
		? getErrorMessage(employeeQuery.error, "Failed to load employee details.")
		: null

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
			<div className="page">
				<div className="error-banner">
					<span>{error || "Employee not found"}</span>
				</div>
				<Link to="/employee" className="btn btn--secondary mt-4">
					Back to Employees
				</Link>
			</div>
		)
	}

	return (
		<div className="page">
			<div className="page-header">
				<div className="flex flex-col gap-2">
					<Link to="/employee" className="back-link">
						<svg
							width="16"
							height="16"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Back</title>
							<polyline points="15 18 9 12 15 6" />
						</svg>
						Back to Employees
					</Link>
					<h1 className="page-title">
						{employee.firstName} {employee.lastName}
					</h1>
					<p className="page-description">{employee.userId}</p>
				</div>
				{isAdmin && (
					<Link
						to="/employee/$employeeId/edit"
						params={{ employeeId }}
						className="btn btn--secondary"
					>
						<svg
							width="20"
							height="20"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						>
							<title>Edit Employee</title>
							<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
							<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
						</svg>
						Edit
					</Link>
				)}
			</div>

			<div className="detail-card">
				<div className="detail-section">
					<h2 className="detail-section-title">Personal Information</h2>
					<div className="detail-grid">
						<div className="detail-field">
							<span className="detail-label">Employee ID</span>
							<span className="detail-value">{employee.id}</span>
						</div>
						<div className="detail-field">
							<span className="detail-label">User ID</span>
							<span className="detail-value">{employee.userId}</span>
						</div>
						<div className="detail-field">
							<span className="detail-label">Date of Birth</span>
							<span className="detail-value">
								{new Date(employee.dateOfBirth).toLocaleDateString()}
							</span>
						</div>
						<div className="detail-field">
							<span className="detail-label">Hire Date</span>
							<span className="detail-value">
								{new Date(employee.hireDate).toLocaleDateString()}
							</span>
						</div>
						<div className="detail-field">
							<span className="detail-label">Joined At</span>
							<span className="detail-value">
								{new Date(employee.createdAt).toLocaleDateString()}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	)
}
