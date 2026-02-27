import type { ReactNode } from "react"

export function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
	return (
		<div className="public-layout">
			<main className="public-main">{children}</main>
		</div>
	)
}
