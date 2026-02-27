import type {
	AdminUser,
	CreateUserPayload,
	UpdateUserPayload,
} from "../api/admin-api"

interface UserFormProps {
	user?: AdminUser
	onSubmit: (data: CreateUserPayload | UpdateUserPayload) => void
	isPending: boolean
	isCreate?: boolean
}

export function UserForm({
	user,
	onSubmit,
	isPending,
	isCreate = false,
}: UserFormProps) {
	function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault()
		const formData = new FormData(e.currentTarget)

		const data: CreateUserPayload | UpdateUserPayload = {
			name: formData.get("name") as string,
			email: formData.get("email") as string,
			role: formData.get("role") as "user" | "admin",
		}

		onSubmit(data)
	}

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div className="form-group">
					<label htmlFor="name" className="form-label">
						Full Name
					</label>
					<input
						type="text"
						id="name"
						name="name"
						required
						defaultValue={user?.name ?? ""}
						className="form-input"
						placeholder="Jane Doe"
					/>
				</div>
				<div className="form-group">
					<label htmlFor="email" className="form-label">
						Email Address
					</label>
					<input
						type="email"
						id="email"
						name="email"
						required
						defaultValue={user?.email ?? ""}
						className="form-input"
						placeholder="jane@example.com"
					/>
				</div>
				<div className="form-group">
					<label htmlFor="role" className="form-label">
						System Role
					</label>
					<select
						id="role"
						name="role"
						defaultValue={user?.role ?? "user"}
						className="form-input"
					>
						<option value="user">User</option>
						<option value="admin">Administrator</option>
					</select>
				</div>
			</div>

			<div className="flex justify-end gap-3 mt-6">
				<button type="submit" className="btn btn--primary" disabled={isPending}>
					{isPending ? "Saving..." : isCreate ? "Create User" : "Update User"}
				</button>
			</div>
		</form>
	)
}
