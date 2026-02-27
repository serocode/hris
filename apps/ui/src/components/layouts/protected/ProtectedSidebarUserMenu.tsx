interface ProtectedSidebarUserMenuProps {
	initials: string
	displayName: string
	displaySubtitle: string
	isImpersonating: boolean
	onLogout: () => void | Promise<void>
}

export function ProtectedSidebarUserMenu({
	initials,
	displayName,
	displaySubtitle,
	isImpersonating,
	onLogout,
}: ProtectedSidebarUserMenuProps) {
	return (
		<div className="sidebar-footer">
			<div className="user-info">
				<div className="user-avatar">{initials}</div>
				<div className="user-details">
					<span className="user-name">{displayName}</span>
					<span className="user-email">{displaySubtitle}</span>
					{isImpersonating && (
						<span className="badge badge--warning user-mode-badge">
							Impersonating
						</span>
					)}
				</div>
			</div>
			<button
				type="button"
				className="logout-btn"
				onClick={onLogout}
				title="Sign out"
			>
				<svg
					width="20"
					height="20"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<title>Sign out</title>
					<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
					<polyline points="16 17 21 12 16 7" />
					<line x1="21" y1="12" x2="9" y2="12" />
				</svg>
			</button>
		</div>
	)
}
