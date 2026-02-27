import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { authClient } from "@/lib/auth-client"

type VerifyEmailSearch = {
	token?: string
}

export const Route = createFileRoute("/verify-email")({
	validateSearch: (search: Record<string, unknown>): VerifyEmailSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: VerifyEmailComponent,
})

type Status = "loading" | "success" | "error"

function VerifyEmailComponent() {
	const navigate = useNavigate()
	const { token } = Route.useSearch()
	const [status, setStatus] = useState<Status>("loading")
	const [errorMessage, setErrorMessage] = useState("")

	useEffect(() => {
		if (!token) {
			setStatus("error")
			setErrorMessage("No verification token provided.")
			return
		}

		let isMounted = true

		authClient.verifyEmail({ query: { token } }).then(({ error }) => {
			if (!isMounted) return
			if (error) {
				setStatus("error")
				setErrorMessage(error.message || "Email verification failed.")
			} else {
				setStatus("success")
			}
		})

		return () => {
			isMounted = false
		}
	}, [token])

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-sm space-y-4 rounded-lg border p-8 shadow-sm">
				<h1 className="text-2xl font-semibold tracking-tight">
					Legacy Email Verification
				</h1>

				{status === "loading" && (
					<p className="text-sm text-muted-foreground">
						Checking verification token...
					</p>
				)}

				{status === "error" && (
					<div className="space-y-4">
						<p className="text-sm text-destructive">{errorMessage}</p>
						<p className="text-sm text-muted-foreground">
							If this is an invited account, ask your admin to resend your
							activation invite.
						</p>
						<button
							type="button"
							onClick={() => navigate({ to: "/" })}
							className="w-full rounded-md bg-secondary px-4 py-2 text-sm font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
						>
							Go Home
						</button>
					</div>
				)}

				{status === "success" && (
					<div className="space-y-4">
						<p className="text-sm text-muted-foreground">
							Your email has been verified. If your account is already active,
							you can continue to sign in.
						</p>
						<button
							type="button"
							onClick={() => navigate({ to: "/" })}
							className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
						>
							Continue
						</button>
					</div>
				)}
			</div>
		</div>
	)
}
