import { createFileRoute, useNavigate } from "@tanstack/react-router"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

type ActivateAccountSearch = {
	token?: string
}

type ActivationStatus = "idle" | "error"

export const Route = createFileRoute("/activate-account")({
	validateSearch: (search: Record<string, unknown>): ActivateAccountSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	component: ActivateAccountPage,
})

function ActivateAccountPage() {
	const navigate = useNavigate()
	const { token } = Route.useSearch()
	const [password, setPassword] = useState("")
	const [confirmPassword, setConfirmPassword] = useState("")
	const [status, setStatus] = useState<ActivationStatus>("idle")
	const [error, setError] = useState<string | null>(null)
	const [submitting, setSubmitting] = useState(false)

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
		event.preventDefault()
		setError(null)
		setStatus("idle")

		if (!token) {
			setStatus("error")
			setError("Missing activation token.")
			return
		}

		if (password.length < 8) {
			setStatus("error")
			setError("Password must be at least 8 characters.")
			return
		}

		if (password !== confirmPassword) {
			setStatus("error")
			setError("Passwords do not match.")
			return
		}

		setSubmitting(true)

		try {
			const result = await authClient.resetPassword({
				token,
				newPassword: password,
			})

			if (result.error) {
				setStatus("error")
				setError(
					result.error.message ||
						"Activation failed. Please request a new invite.",
				)
				return
			}

			navigate({
				to: "/",
				state: { activated: true },
			})
		} catch {
			setStatus("error")
			setError("Activation failed. Please request a new invite.")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="public-layout">
			<div className="public-main">
				<div className="login-card">
					<div className="login-header">
						<h1 className="login-title">Activate Your Account</h1>
						<p className="login-subtitle">
							Create your password to activate your account and verify your
							email.
						</p>
					</div>

					<form onSubmit={handleSubmit} className="login-form">
						{status === "error" && error && (
							<div className="login-error">
								<span>{error}</span>
							</div>
						)}

						<div className="form-field">
							<label htmlFor="password" className="form-label">
								New Password
							</label>
							<input
								id="password"
								type="password"
								className="form-input"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								placeholder="At least 8 characters"
								required
								minLength={8}
							/>
						</div>

						<div className="form-field">
							<label htmlFor="confirmPassword" className="form-label">
								Confirm Password
							</label>
							<input
								id="confirmPassword"
								type="password"
								className="form-input"
								value={confirmPassword}
								onChange={(event) => setConfirmPassword(event.target.value)}
								required
								minLength={8}
							/>
						</div>

						<button type="submit" className="login-btn" disabled={submitting}>
							{submitting ? "Activating..." : "Activate Account"}
						</button>
					</form>
				</div>
			</div>
		</div>
	)
}
