import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"

export const Route = createFileRoute("/_protected/admin")({
	beforeLoad: ({ context }) => {
		// Enforce admin access
		if (context.session?.user?.role !== "admin") {
			throw redirect({
				to: "/dashboard",
				search: {
					error: "unauthorized",
				},
			})
		}
	},
	component: AdminLayout,
})

function AdminLayout() {
	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold tracking-tight">Administration</h1>
				<p className="text-muted">
					Manage system settings, users, and organization data.
				</p>
			</div>

			<Outlet />
		</div>
	)
}
