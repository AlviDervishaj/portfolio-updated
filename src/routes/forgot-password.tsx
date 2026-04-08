import { createFileRoute, Link } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { useState } from 'react'

import {
	AUTH_EMAIL_LABEL,
	AUTH_EMAIL_PLACEHOLDER,
	AUTH_FORGOT_PASSWORD_INSTRUCTION,
	AUTH_FORGOT_PASSWORD_REDIRECT,
	AUTH_FORGOT_PASSWORD_SUBMIT,
	AUTH_FORGOT_PASSWORD_SUCCESS,
	AUTH_FORGOT_PASSWORD_TITLE,
	AUTH_SIGN_IN_LABEL,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'

export const Route = createFileRoute('/forgot-password')({
	component: ForgotPasswordPage,
	head: () => ({
		meta: [{ title: `Forgot password — ${USER.FULL_NAME}` }],
	}),
})

function ForgotPasswordPage() {
	const [email, setEmail] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)
	const [submitted, setSubmitted] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const result = await authClient.requestPasswordReset({
			email,
			redirectTo: AUTH_FORGOT_PASSWORD_REDIRECT,
		})

		if (result.error) {
			setError(result.error.message ?? 'Unable to send reset email right now.')
			setLoading(false)
			return
		}

		setSubmitted(true)
		setLoading(false)
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
						{AUTH_FORGOT_PASSWORD_TITLE}
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
						{AUTH_FORGOT_PASSWORD_INSTRUCTION}
					</p>
				</div>

				{submitted ? (
					<div
						style={{
							border: '1px solid var(--acid-border)',
							backgroundColor: 'var(--acid-dim)',
							padding: '1rem 1.125rem',
							fontFamily: 'var(--font-mono)',
							fontSize: '0.7rem',
							letterSpacing: '0.04em',
							lineHeight: 1.5,
						}}
					>
						{AUTH_FORGOT_PASSWORD_SUCCESS}
						<div style={{ marginTop: '1rem' }}>
							<Link to="/sign-in" className="nav-item">
								{AUTH_SIGN_IN_LABEL}
							</Link>
						</div>
					</div>
				) : (
					<form
						onSubmit={handleSubmit}
						style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
					>
						{error && <ErrorBanner message={error} />}

						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
							<label
								htmlFor="forgot-email"
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.62rem',
									letterSpacing: '0.14em',
									textTransform: 'uppercase',
									color: 'var(--muted-foreground)',
								}}
							>
								{AUTH_EMAIL_LABEL}
							</label>
							<input
								id="forgot-email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								placeholder={AUTH_EMAIL_PLACEHOLDER}
								autoComplete="email"
								required
								disabled={loading}
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
									opacity: loading ? 0.5 : 1,
								}}
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="acid-btn"
							style={{
								width: '100%',
								justifyContent: 'center',
								marginTop: '0.25rem',
								opacity: loading ? 0.6 : 1,
								cursor: loading ? 'not-allowed' : 'pointer',
							}}
						>
							{AUTH_FORGOT_PASSWORD_SUBMIT}
						</button>
					</form>
				)}
			</div>
		</main>
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
