import type { ReactNode } from "react"
import { createContext, useContext, useMemo, useState } from "react"

type ToastTone = "info" | "success" | "error"

type ToastInput = {
	title: string
	description?: string
	tone?: ToastTone
	durationMs?: number
}

type ToastItem = ToastInput & {
	id: string
	tone: ToastTone
}

type ConfirmDialogInput = {
	title: string
	description?: string
	confirmLabel?: string
	cancelLabel?: string
	tone?: "default" | "danger"
}

type PromptDialogInput = ConfirmDialogInput & {
	placeholder?: string
	defaultValue?: string
	required?: boolean
}

type ConfirmDialogState = {
	type: "confirm"
	options: ConfirmDialogInput
	resolve: (accepted: boolean) => void
}

type PromptDialogState = {
	type: "prompt"
	options: PromptDialogInput
	value: string
	error: string | null
	resolve: (value: string | null) => void
}

type DialogState = ConfirmDialogState | PromptDialogState | null

type FeedbackContextValue = {
	toast: (input: ToastInput) => void
	confirm: (input: ConfirmDialogInput) => Promise<boolean>
	prompt: (input: PromptDialogInput) => Promise<string | null>
}

const FeedbackContext = createContext<FeedbackContextValue | null>(null)

function getConfirmButtonClass(
	tone: ConfirmDialogInput["tone"] | PromptDialogInput["tone"],
) {
	return tone === "danger" ? "btn btn--danger" : "btn btn--primary"
}

export function FeedbackProvider({
	children,
}: Readonly<{ children: ReactNode }>) {
	const [toasts, setToasts] = useState<ToastItem[]>([])
	const [dialog, setDialog] = useState<DialogState>(null)

	const value = useMemo<FeedbackContextValue>(() => {
		return {
			toast: (input) => {
				const id = crypto.randomUUID()
				const tone = input.tone ?? "info"
				const nextToast: ToastItem = { ...input, id, tone }

				setToasts((current) => [...current, nextToast])

				const durationMs = input.durationMs ?? 3500
				window.setTimeout(() => {
					setToasts((current) => current.filter((toast) => toast.id !== id))
				}, durationMs)
			},
			confirm: (input) =>
				new Promise<boolean>((resolve) => {
					setDialog({
						type: "confirm",
						options: input,
						resolve,
					})
				}),
			prompt: (input) =>
				new Promise<string | null>((resolve) => {
					setDialog({
						type: "prompt",
						options: input,
						value: input.defaultValue ?? "",
						error: null,
						resolve,
					})
				}),
		}
	}, [])

	function closeConfirm(accepted: boolean) {
		setDialog((current) => {
			if (!current || current.type !== "confirm") return current
			current.resolve(accepted)
			return null
		})
	}

	function closePrompt(nextValue: string | null) {
		setDialog((current) => {
			if (!current || current.type !== "prompt") return current
			current.resolve(nextValue)
			return null
		})
	}

	function handlePromptConfirm() {
		setDialog((current) => {
			if (!current || current.type !== "prompt") return current

			const trimmed = current.value.trim()
			if (current.options.required && trimmed.length === 0) {
				return { ...current, error: "This field is required." }
			}

			current.resolve(trimmed.length === 0 ? "" : trimmed)
			return null
		})
	}

	return (
		<FeedbackContext.Provider value={value}>
			{children}

			<output className="feedback-toast-stack" aria-live="polite">
				{toasts.map((toast) => (
					<span
						key={toast.id}
						className={`feedback-toast feedback-toast--${toast.tone}`}
					>
						<span className="feedback-toast-title">{toast.title}</span>
						{toast.description && (
							<span className="feedback-toast-description">
								{toast.description}
							</span>
						)}
					</span>
				))}
			</output>

			{dialog && (
				<div className="feedback-modal-backdrop" role="presentation">
					<div
						className="feedback-modal"
						role="dialog"
						aria-modal="true"
						aria-labelledby="feedback-modal-title"
					>
						<h3 id="feedback-modal-title" className="feedback-modal-title">
							{dialog.options.title}
						</h3>
						{dialog.options.description && (
							<p className="feedback-modal-description">
								{dialog.options.description}
							</p>
						)}

						{dialog.type === "prompt" && (
							<div className="feedback-modal-field">
								<input
									type="text"
									className="form-input"
									value={dialog.value}
									placeholder={dialog.options.placeholder}
									onChange={(event) => {
										const nextValue = event.target.value
										setDialog((current) => {
											if (!current || current.type !== "prompt") return current
											return {
												...current,
												value: nextValue,
												error: null,
											}
										})
									}}
								/>
								{dialog.error && (
									<span className="feedback-modal-error">{dialog.error}</span>
								)}
							</div>
						)}

						<div className="feedback-modal-actions">
							<button
								type="button"
								className="btn btn--secondary"
								onClick={() => {
									if (dialog.type === "confirm") {
										closeConfirm(false)
									} else {
										closePrompt(null)
									}
								}}
							>
								{dialog.options.cancelLabel ?? "Cancel"}
							</button>
							<button
								type="button"
								className={getConfirmButtonClass(dialog.options.tone)}
								onClick={() => {
									if (dialog.type === "confirm") {
										closeConfirm(true)
									} else {
										handlePromptConfirm()
									}
								}}
							>
								{dialog.options.confirmLabel ?? "Confirm"}
							</button>
						</div>
					</div>
				</div>
			)}
		</FeedbackContext.Provider>
	)
}

function useFeedbackContext() {
	const ctx = useContext(FeedbackContext)
	if (!ctx) {
		throw new Error("useFeedbackContext must be used within FeedbackProvider")
	}
	return ctx
}

export function useToast() {
	return useFeedbackContext().toast
}

export function useConfirmDialog() {
	return useFeedbackContext().confirm
}

export function usePromptDialog() {
	return useFeedbackContext().prompt
}
