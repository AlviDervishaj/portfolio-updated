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
		<main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-16">
			<div className="w-full max-w-[420px]">
				<div className="mb-12 text-center">
					<Diamond aria-hidden="true" className="mb-5 inline-block size-6 text-acid" />
					<h1 className="mb-2 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-display-tight">
						{AUTH_FORGOT_PASSWORD_TITLE}
					</h1>
					<p className="m-0 font-mono text-mono-md uppercase tracking-mono text-muted-foreground">
						{AUTH_FORGOT_PASSWORD_INSTRUCTION}
					</p>
				</div>

				{submitted ? (
					<div className="border border-acid-border bg-acid-dim px-[1.125rem] py-4 font-mono text-mono-lg leading-[1.5] tracking-[0.04em]">
						{AUTH_FORGOT_PASSWORD_SUCCESS}
						<div className="mt-4">
							<Link to="/sign-in" className="nav-item">
								{AUTH_SIGN_IN_LABEL}
							</Link>
						</div>
					</div>
				) : (
					<form onSubmit={handleSubmit} className="flex flex-col gap-5">
						{error && <ErrorBanner message={error} />}

						<div className="flex flex-col gap-2">
							<label
								htmlFor="forgot-email"
								className="font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground"
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
								className="w-full border border-line-strong bg-transparent px-4 py-3.5 font-sans text-[0.9375rem] text-foreground outline-none disabled:opacity-50"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="acid-btn mt-1 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
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
			className="border border-[oklch(0.577_0.245_27.325)] bg-[rgba(220,38,38,0.06)] px-4 py-3.5 font-mono text-mono-lg leading-[1.5] tracking-[0.04em] text-[oklch(0.637_0.237_25.331)]"
		>
			{message}
		</div>
	)
}
