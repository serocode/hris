import { createFileRoute, Link, useRouteContext } from "@tanstack/react-router"
import {
	useDeleteEmployeeMutation,
	useEmployeesQuery,
} from "@/features/employees"
import type { AuthSession } from "@/lib/auth-utils"
import { getErrorMessage } from "@/lib/error-message"
import { useConfirmDialog, useToast } from "@/lib/feedback"

export const Route = createFileRoute("/_protected/employee/")({
	component: EmployeeListPage,
})

const EMPLOYEE_LIST_LIMIT = 25

function EmployeeListPage() {
	const { session } = useRouteContext({ from: "/_protected" }) as {
		session: AuthSession | undefined
	}
	const isAdmin = session?.user?.role === "admin"
	const employeesQuery = useEmployeesQuery({
		limit: EMPLOYEE_LIST_LIMIT,
		offset: 0,
	})
	const deleteEmployeeMutation = useDeleteEmployeeMutation()
	const confirm = useConfirmDialog()
	const toast = useToast()
	const employees = employeesQuery.data?.data ?? []
	const rawError = employeesQuery.error ?? deleteEmployeeMutation.error
	const error = rawError
		? getErrorMessage(rawError, "Failed to load employees.")
		: null

	async function handleDelete(id: string) {
		const shouldDelete = await confirm({
			title: "Delete this employee?",
			description: "This action cannot be undone.",
			confirmLabel: "Delete Employee",
			tone: "danger",
		})
		if (!shouldDelete) return

		try {
			await deleteEmployeeMutation.mutateAsync(id)
			toast({
				tone: "success",
				title: "Employee deleted.",
			})
		} catch (err) {
			toast({
				tone: "error",
				title: getErrorMessage(err, "Failed to delete employee."),
			})
		}
	}

	return (
		<div className="page">
			<div className="page-header">
				<div className="header-content">
					<h1 className="page-title">Employees</h1>
					<p className="page-description">Manage organization hierarchy</p>
				</div>
				{isAdmin && (
					<Link to="/employee/create" className="btn btn--primary">
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
							<title>Add Employee</title>
							<line x1="12" y1="5" x2="12" y2="19" />
							<line x1="5" y1="12" x2="19" y2="12" />
						</svg>
						Add Employee
					</Link>
				)}
			</div>

			{error && (
				<div className="error-banner">
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
						<title>Error</title>
						<circle cx="12" cy="12" r="10" />
						<line x1="15" y1="9" x2="9" y2="15" />
						<line x1="9" y1="9" x2="15" y2="15" />
					</svg>
					<span>{error}</span>
				</div>
			)}

			<div className="card">
				{employeesQuery.isPending ? (
					<div className="loading-state">
						<div className="spinner" />
						<span>Loading employees...</span>
					</div>
				) : (
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th>Employee</th>
									<th>Joined</th>
									{isAdmin && <th className="text-right">Actions</th>}
								</tr>
							</thead>
							<tbody>
								{employees.length === 0 ? (
									<tr>
										<td
											colSpan={isAdmin ? 3 : 2}
											className="text-center py-8 text-muted"
										>
											No employees found
										</td>
									</tr>
								) : (
									employees.map((employee) => (
										<tr key={employee.id}>
											<td>
												<div className="employee-cell">
													<div className="avatar">
														{employee.firstName[0]}
														{employee.lastName[0]}
													</div>
													<div className="employee-info">
														<span className="font-medium">
															{employee.firstName} {employee.lastName}
														</span>
														<span className="text-sm text-muted">
															{employee.userId}
														</span>
													</div>
												</div>
											</td>
											<td>
												{new Date(employee.hireDate).toLocaleDateString()}
											</td>
											{isAdmin && (
												<td className="text-right">
													<div className="actions">
														<Link
															to="/employee/$employeeId/edit"
															params={{
																employeeId: employee.id,
															}}
															className="btn-icon"
															title="Edit"
														>
															<svg
																width="18"
																height="18"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<title>Edit</title>
																<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
																<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
															</svg>
														</Link>
														<button
															type="button"
															className="btn-icon text-danger"
															title="Delete"
															disabled={deleteEmployeeMutation.isPending}
															onClick={() => handleDelete(employee.id)}
														>
															<svg
																width="18"
																height="18"
																viewBox="0 0 24 24"
																fill="none"
																stroke="currentColor"
																strokeWidth="2"
																strokeLinecap="round"
																strokeLinejoin="round"
															>
																<title>Delete</title>
																<polyline points="3 6 5 6 21 6" />
																<path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
																<line x1="10" y1="11" x2="10" y2="17" />
																<line x1="14" y1="11" x2="14" y2="17" />
															</svg>
														</button>
													</div>
												</td>
											)}
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	)
}
