import { createFileRoute } from "@tanstack/react-router"
import { UsersTable } from "@/features/admin/components/users-table"

export const Route = createFileRoute("/_protected/admin/users/")({
	component: AdminUsersPage,
})

function AdminUsersPage() {
	return (
		<div className="card">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-semibold">User Management</h2>
			</div>

			<UsersTable />
		</div>
	)
}
