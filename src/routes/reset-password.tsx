import { createFileRoute, useRouterState } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { useMemo, useState } from 'react'

import {
	AUTH_MIN_PASSWORD_LENGTH,
	AUTH_PASSWORD_PLACEHOLDER,
	AUTH_RESET_PASSWORD_CONFIRM_LABEL,
	AUTH_RESET_PASSWORD_CONFIRM_PLACEHOLDER,
	AUTH_RESET_PASSWORD_INSTRUCTION,
	AUTH_RESET_PASSWORD_INVALID_TOKEN,
	AUTH_RESET_PASSWORD_MISMATCH,
	AUTH_RESET_PASSWORD_NEW_LABEL,
	AUTH_RESET_PASSWORD_REDIRECT,
	AUTH_RESET_PASSWORD_SUBMIT,
	AUTH_RESET_PASSWORD_SUCCESS_SEARCH,
	AUTH_RESET_PASSWORD_TITLE,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'

export const Route = createFileRoute('/reset-password')({
	component: ResetPasswordPage,
	head: () => ({
		meta: [{ title: `Reset password — ${USER.FULL_NAME}` }],
	}),
})

function ResetPasswordPage() {
	const { location } = useRouterState()
	const { token, routeError } = useMemo(() => {
		const params = new URLSearchParams(location.search as string)
		return {
			token: params.get('token')?.trim() ?? '',
			routeError: params.get('error')?.trim() ?? '',
		}
	}, [location.search])

	const [newPassword, setNewPassword] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		if (!token) {
			setError(AUTH_RESET_PASSWORD_INVALID_TOKEN)
			return
		}

		if (newPassword.length < AUTH_MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${AUTH_MIN_PASSWORD_LENGTH} characters.`)
			return
		}

		if (newPassword !== confirmPassword) {
			setError(AUTH_RESET_PASSWORD_MISMATCH)
			return
		}

		setLoading(true)
		const result = await authClient.resetPassword({
			newPassword,
			token,
		})
		setLoading(false)

		if (result.error) {
			setError(result.error.message ?? AUTH_RESET_PASSWORD_INVALID_TOKEN)
			return
		}

		window.location.href = `${AUTH_RESET_PASSWORD_REDIRECT}?reset=${AUTH_RESET_PASSWORD_SUCCESS_SEARCH}`
	}

	return (
		<main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-16">
			<div className="w-full max-w-[420px]">
				<div className="mb-12 text-center">
					<Diamond aria-hidden="true" className="mb-5 inline-block size-6 text-acid" />
					<h1 className="mb-2 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-display-tight">
						{AUTH_RESET_PASSWORD_TITLE}
					</h1>
					<p className="m-0 font-mono text-mono-md uppercase tracking-mono text-muted-foreground">
						{AUTH_RESET_PASSWORD_INSTRUCTION}
					</p>
				</div>

				<form onSubmit={handleSubmit} className="flex flex-col gap-5">
					{(!token || routeError || error) && (
						<ErrorBanner message={error ?? AUTH_RESET_PASSWORD_INVALID_TOKEN} />
					)}

					<Field
						id="reset-new-password"
						label={AUTH_RESET_PASSWORD_NEW_LABEL}
						value={newPassword}
						onChange={setNewPassword}
						placeholder={AUTH_PASSWORD_PLACEHOLDER}
						disabled={loading}
					/>
					<Field
						id="reset-confirm-password"
						label={AUTH_RESET_PASSWORD_CONFIRM_LABEL}
						value={confirmPassword}
						onChange={setConfirmPassword}
						placeholder={AUTH_RESET_PASSWORD_CONFIRM_PLACEHOLDER}
						disabled={loading}
					/>

					<button
						type="submit"
						disabled={loading || !token}
						className="acid-btn mt-1 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
					>
						{AUTH_RESET_PASSWORD_SUBMIT}
					</button>
				</form>
			</div>
		</main>
	)
}

type FieldProps = {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
	placeholder: string
	disabled: boolean
}

function Field({ id, label, value, onChange, placeholder, disabled }: FieldProps) {
	return (
		<div className="flex flex-col gap-2">
			<label
				htmlFor={id}
				className="font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground"
			>
				{label}
			</label>
			<input
				id={id}
				type="password"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				autoComplete="new-password"
				required
				disabled={disabled}
				className="w-full border border-line-strong bg-transparent px-4 py-3.5 font-sans text-[0.9375rem] text-foreground outline-none disabled:opacity-50"
			/>
		</div>
	)
}

function ErrorBanner({ message }: { message: string }) {
	return (
		<div
			role="alert"
			className="border border-[oklch(0.577_0.245_27.325)] bg-[rgba(220,38,38,0.06)] px-4 py-3.5 font-mono text-mono-lg leading-[1.5] tracking-[0.04em] text-[oklch(0.637_0.237_25.331)]"
		>
			{message}
		</div>
	)
}
