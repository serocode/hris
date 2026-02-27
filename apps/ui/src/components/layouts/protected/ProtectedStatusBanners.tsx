interface ProtectedStatusBannersProps {
	isImpersonating: boolean
	isExitingImpersonation: boolean
	onExitImpersonation: () => void | Promise<void>
}

export function ProtectedStatusBanners({
	isImpersonating,
	isExitingImpersonation,
	onExitImpersonation,
}: ProtectedStatusBannersProps) {
	return (
		<>
			{isImpersonating && (
				<output className="impersonation-banner" aria-live="polite">
					<div className="impersonation-copy">
						<span className="impersonation-label">
							Impersonation mode active
						</span>
						<p className="impersonation-text">
							You are acting as another user. Exit to return to your admin
							session.
						</p>
					</div>
					<button
						type="button"
						className="btn btn--secondary impersonation-exit-btn"
						onClick={onExitImpersonation}
						disabled={isExitingImpersonation}
					>
						{isExitingImpersonation ? "Exiting…" : "Exit Impersonation"}
					</button>
				</output>
			)}
		</>
	)
}
