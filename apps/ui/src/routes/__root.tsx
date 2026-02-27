/// <reference types="vite/client" />
import {
	createRootRouteWithContext,
	HeadContent,
	Outlet,
	Scripts,
} from "@tanstack/react-router"
import type { ReactNode } from "react"
import { useEffect } from "react"
import { getClientAppUrl } from "@/app/config/env"
import { AppQueryProvider } from "@/app/providers/query-client"
import type { AuthSession } from "@/lib/auth-utils"
import { FeedbackProvider } from "@/lib/feedback"
import appCss from "@/styles/app.css?url"

export interface RouterContext {
	session: AuthSession | null | undefined
}

export const Route = createRootRouteWithContext<RouterContext>()({
	head: () => ({
		meta: [
			{
				charSet: "utf-8",
			},
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1",
			},
			{
				title: "HRIS",
			},
		],
		links: [
			{ rel: "stylesheet", href: appCss },
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com",
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous",
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap",
			},
		],
	}),
	component: RootComponent,
	notFoundComponent: () => (
		<div style={{ textAlign: "center", padding: "4rem 1rem" }}>
			<h1 style={{ fontSize: "3rem", fontWeight: 700, color: "#6366f1" }}>
				404
			</h1>
			<p style={{ color: "#64748b", marginTop: "0.5rem" }}>Page not found</p>
		</div>
	),
})

function RootComponent() {
	useEffect(() => {
		if (typeof window === "undefined") return

		const isLocalhost =
			window.location.hostname === "localhost" ||
			window.location.hostname === "127.0.0.1"
		if (!isLocalhost) return

		const canonicalAppUrl = getClientAppUrl()
		if (!canonicalAppUrl) return

		const target = new URL(
			`${window.location.pathname}${window.location.search}${window.location.hash}`,
			canonicalAppUrl,
		)

		if (target.origin !== window.location.origin) {
			window.location.replace(target.toString())
		}
	}, [])

	return (
		<RootDocument>
			<AppQueryProvider>
				<FeedbackProvider>
					<Outlet />
				</FeedbackProvider>
			</AppQueryProvider>
		</RootDocument>
	)
}

function RootDocument({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<html lang="en">
			<head>
				<HeadContent />
			</head>
			<body>
				{children}
				<Scripts />
			</body>
		</html>
	)
}
