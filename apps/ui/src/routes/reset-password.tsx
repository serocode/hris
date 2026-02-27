import { createFileRoute, redirect } from "@tanstack/react-router"

type LegacyResetPasswordSearch = {
	token?: string
}

export const Route = createFileRoute("/reset-password")({
	validateSearch: (
		search: Record<string, unknown>,
	): LegacyResetPasswordSearch => ({
		token: typeof search.token === "string" ? search.token : undefined,
	}),
	beforeLoad: ({ search }) => {
		throw redirect({
			to: "/activate-account",
			search: {
				token: search.token,
			},
		})
	},
	component: LegacyResetPasswordRedirectPage,
})

function LegacyResetPasswordRedirectPage() {
	return null
}
