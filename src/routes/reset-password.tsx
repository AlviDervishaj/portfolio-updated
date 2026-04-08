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
		<main
			style={{
				minHeight: 'calc(100vh - 57px)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '4rem 1.5rem',
			}}
		>
			<div style={{ width: '100%', maxWidth: '420px' }}>
				<div style={{ marginBottom: '3rem', textAlign: 'center' }}>
					<Diamond
						aria-hidden="true"
						className="size-6 inline-block"
						style={{ color: 'var(--acid)', marginBottom: '1.25rem' }}
					/>
					<h1
						style={{
							fontFamily: 'var(--font-display)',
							fontSize: 'clamp(1.75rem, 5vw, 2.5rem)',
							fontWeight: 700,
							letterSpacing: '-0.02em',
							lineHeight: 1.05,
							margin: '0 0 0.5rem',
						}}
					>
						{AUTH_RESET_PASSWORD_TITLE}
					</h1>
					<p
						style={{
							fontFamily: 'var(--font-mono)',
							fontSize: '0.68rem',
							letterSpacing: '0.1em',
							textTransform: 'uppercase',
							color: 'var(--muted-foreground)',
							margin: 0,
						}}
					>
						{AUTH_RESET_PASSWORD_INSTRUCTION}
					</p>
				</div>

				<form
					onSubmit={handleSubmit}
					style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
				>
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
						className="acid-btn"
						style={{
							width: '100%',
							justifyContent: 'center',
							marginTop: '0.25rem',
							opacity: loading || !token ? 0.6 : 1,
							cursor: loading || !token ? 'not-allowed' : 'pointer',
						}}
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
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
			<label
				htmlFor={id}
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
				}}
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
				style={{
					width: '100%',
					padding: '0.875rem 1rem',
					background: 'transparent',
					border: '1px solid var(--line-strong)',
					color: 'var(--foreground)',
					fontFamily: 'var(--font-sans)',
					fontSize: '0.9375rem',
					outline: 'none',
					boxSizing: 'border-box',
					opacity: disabled ? 0.5 : 1,
				}}
			/>
		</div>
	)
}

function ErrorBanner({ message }: { message: string }) {
	return (
		<div
			role="alert"
			style={{
				padding: '0.875rem 1rem',
				border: '1px solid oklch(0.577 0.245 27.325)',
				backgroundColor: 'rgba(220, 38, 38, 0.06)',
				fontFamily: 'var(--font-mono)',
				fontSize: '0.7rem',
				letterSpacing: '0.04em',
				color: 'oklch(0.637 0.237 25.331)',
				lineHeight: 1.5,
			}}
		>
			{message}
		</div>
	)
}
