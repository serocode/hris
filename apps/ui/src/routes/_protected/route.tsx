// Protected layout route — auth gate that fetches session and injects into context
import { createFileRoute, Outlet, redirect } from "@tanstack/react-router"
import { ProtectedLayout } from "@/components/layouts/ProtectedLayout"
import { getServerSession } from "@/server/auth"

export const Route = createFileRoute("/_protected")({
	beforeLoad: async ({ location }) => {
		const session = await getServerSession()

		if (!session) {
			throw redirect({
				to: "/",
				search: {
					redirect: location.href,
				},
			})
		}

		return { session }
	},
	component: ProtectedRoute,
})

function ProtectedRoute() {
	return (
		<ProtectedLayout>
			<Outlet />
		</ProtectedLayout>
	)
}
