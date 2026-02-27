import { createFileRoute } from "@tanstack/react-router"
import { UserDetails } from "@/features/admin/components/user-details"

export const Route = createFileRoute("/_protected/admin/users/$userId")({
	component: AdminUserDetailsPage,
})

function AdminUserDetailsPage() {
	const { userId } = Route.useParams()

	return (
		<div>
			<UserDetails userId={userId} />
		</div>
	)
}
