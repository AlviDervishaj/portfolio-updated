import { createFileRoute, useNavigate, useRouterState } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { useState } from 'react'

import {
	AUTH_EMAIL_LABEL,
	AUTH_EMAIL_PLACEHOLDER,
	AUTH_FORGOT_PASSWORD_LABEL,
	AUTH_MIN_NAME_LENGTH,
	AUTH_MIN_PASSWORD_LENGTH,
	AUTH_NAME_LABEL,
	AUTH_NAME_PLACEHOLDER,
	AUTH_PASSWORD_LABEL,
	AUTH_PASSWORD_PLACEHOLDER,
	AUTH_RESET_PASSWORD_SUCCESS,
	AUTH_RESET_PASSWORD_SUCCESS_SEARCH,
	AUTH_SIGN_IN_LABEL,
	AUTH_SIGN_IN_REDIRECT,
	AUTH_SIGN_IN_SUBMIT,
	AUTH_SIGN_UP_LABEL,
	AUTH_SIGN_UP_REDIRECT,
	AUTH_SIGN_UP_SUBMIT,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'

export const Route = createFileRoute('/sign-in')({
	component: AuthPage,
	head: () => ({
		meta: [{ title: `Sign in — ${USER.FULL_NAME}` }],
	}),
})

type Tab = 'sign-in' | 'sign-up'

const TABS: { id: Tab; label: string }[] = [
	{ id: 'sign-in', label: AUTH_SIGN_IN_LABEL },
	{ id: 'sign-up', label: AUTH_SIGN_UP_LABEL },
]

function AuthPage() {
	const navigate = useNavigate()
	const { location } = useRouterState()
	const { data: session } = authClient.useSession()
	const [tab, setTab] = useState<Tab>('sign-in')
	const showPasswordResetSuccess =
		new URLSearchParams(location.search).get('reset') === AUTH_RESET_PASSWORD_SUCCESS_SEARCH

	if (session?.user) {
		navigate({ to: AUTH_SIGN_IN_REDIRECT })
		return null
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
						{tab === 'sign-in' ? 'Welcome back.' : 'Join the site.'}
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
						{tab === 'sign-in'
							? 'Sign in to leave comments and reactions'
							: 'Create an account to join the discussion'}
					</p>
				</div>
				{showPasswordResetSuccess && (
					<div
						style={{
							border: '1px solid var(--acid-border)',
							backgroundColor: 'var(--acid-dim)',
							padding: '0.875rem 1rem',
							marginBottom: '1.5rem',
							fontFamily: 'var(--font-mono)',
							fontSize: '0.7rem',
							letterSpacing: '0.04em',
							lineHeight: 1.5,
						}}
					>
						{AUTH_RESET_PASSWORD_SUCCESS}
					</div>
				)}

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						borderBottom: '1px solid var(--line-strong)',
						marginBottom: '2rem',
					}}
					role="tablist"
					aria-label="Authentication mode"
				>
					{TABS.map(({ id, label }) => (
						<button
							key={id}
							type="button"
							role="tab"
							aria-selected={tab === id}
							onClick={() => setTab(id)}
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.65rem',
								letterSpacing: '0.14em',
								textTransform: 'uppercase',
								padding: '0.875rem 0',
								background: 'none',
								border: 'none',
								borderBottom: '2px solid',
								borderColor: tab === id ? 'var(--acid)' : 'transparent',
								color: tab === id ? 'var(--foreground)' : 'var(--muted-foreground)',
								cursor: 'pointer',
								transition: 'color 150ms ease, border-color 150ms ease',
								marginBottom: '-1px',
							}}
						>
							{label}
						</button>
					))}
				</div>

				{tab === 'sign-in' ? (
					<SignInForm onSuccess={() => navigate({ to: AUTH_SIGN_IN_REDIRECT })} />
				) : (
					<SignUpForm onSuccess={() => navigate({ to: AUTH_SIGN_UP_REDIRECT })} />
				)}
			</div>
		</main>
	)
}

type SignInFormProps = {
	onSuccess: () => void
}

function SignInForm({ onSuccess }: SignInFormProps) {
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setLoading(true)

		const result = await authClient.signIn.email({ email, password })

		if (result.error) {
			setError(result.error.message ?? 'Sign in failed. Check your credentials.')
			setLoading(false)
			return
		}

		onSuccess()
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
		>
			{error && <ErrorBanner message={error} />}

			<Field
				id="signin-email"
				label={AUTH_EMAIL_LABEL}
				type="email"
				value={email}
				onChange={setEmail}
				placeholder={AUTH_EMAIL_PLACEHOLDER}
				autoComplete="email"
				required
				disabled={loading}
			/>

			<Field
				id="signin-password"
				label={AUTH_PASSWORD_LABEL}
				type="password"
				value={password}
				onChange={setPassword}
				placeholder={AUTH_PASSWORD_PLACEHOLDER}
				autoComplete="current-password"
				required
				disabled={loading}
			/>
			<a
				href="/forgot-password"
				className="nav-item"
				style={{ width: 'fit-content', marginTop: '-0.5rem' }}
			>
				{AUTH_FORGOT_PASSWORD_LABEL}
			</a>

			<SubmitButton label={AUTH_SIGN_IN_SUBMIT} loading={loading} />
		</form>
	)
}

type SignUpFormProps = {
	onSuccess: () => void
}

function SignUpForm({ onSuccess }: SignUpFormProps) {
	const [name, setName] = useState('')
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [error, setError] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)

		if (name.trim().length < AUTH_MIN_NAME_LENGTH) {
			setError(`Name must be at least ${AUTH_MIN_NAME_LENGTH} characters.`)
			return
		}

		if (password.length < AUTH_MIN_PASSWORD_LENGTH) {
			setError(`Password must be at least ${AUTH_MIN_PASSWORD_LENGTH} characters.`)
			return
		}

		setLoading(true)

		const result = await authClient.signUp.email({
			name: name.trim(),
			email,
			password,
		})

		if (result.error) {
			setError(result.error.message ?? 'Sign up failed. Please try again.')
			setLoading(false)
			return
		}

		onSuccess()
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
		>
			{error && <ErrorBanner message={error} />}

			<Field
				id="signup-name"
				label={AUTH_NAME_LABEL}
				type="text"
				value={name}
				onChange={setName}
				placeholder={AUTH_NAME_PLACEHOLDER}
				autoComplete="name"
				required
				disabled={loading}
			/>

			<Field
				id="signup-email"
				label={AUTH_EMAIL_LABEL}
				type="email"
				value={email}
				onChange={setEmail}
				placeholder={AUTH_EMAIL_PLACEHOLDER}
				autoComplete="email"
				required
				disabled={loading}
			/>

			<Field
				id="signup-password"
				label={AUTH_PASSWORD_LABEL}
				type="password"
				value={password}
				onChange={setPassword}
				placeholder={AUTH_PASSWORD_PLACEHOLDER}
				autoComplete="new-password"
				required
				disabled={loading}
				hint={`Minimum ${AUTH_MIN_PASSWORD_LENGTH} characters`}
			/>

			<SubmitButton label={AUTH_SIGN_UP_SUBMIT} loading={loading} />
		</form>
	)
}

type FieldProps = {
	id: string
	label: string
	type: 'text' | 'email' | 'password'
	value: string
	onChange: (value: string) => void
	placeholder?: string
	autoComplete?: string
	required?: boolean
	disabled?: boolean
	hint?: string
}

function Field({
	id,
	label,
	type,
	value,
	onChange,
	placeholder,
	autoComplete,
	required,
	disabled,
	hint,
}: FieldProps) {
	const [focused, setFocused] = useState(false)

	return (
		<div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
			<label
				htmlFor={id}
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.14em',
					textTransform: 'uppercase',
					color: focused ? 'var(--foreground)' : 'var(--muted-foreground)',
					transition: 'color 150ms ease',
				}}
			>
				{label}
			</label>
			<input
				id={id}
				type={type}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				placeholder={placeholder}
				autoComplete={autoComplete}
				required={required}
				disabled={disabled}
				onFocus={() => setFocused(true)}
				onBlur={() => setFocused(false)}
				style={{
					width: '100%',
					padding: '0.875rem 1rem',
					background: 'transparent',
					border: '1px solid',
					borderColor: focused ? 'var(--acid-border)' : 'var(--line-strong)',
					color: 'var(--foreground)',
					fontFamily: 'var(--font-sans)',
					fontSize: '0.9375rem',
					outline: 'none',
					transition: 'border-color 150ms ease',
					boxSizing: 'border-box',
					opacity: disabled ? 0.5 : 1,
				}}
			/>
			{hint && (
				<span
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.6rem',
						letterSpacing: '0.08em',
						color: 'var(--muted-foreground)',
					}}
				>
					{hint}
				</span>
			)}
		</div>
	)
}

function SubmitButton({ label, loading }: { label: string; loading: boolean }) {
	return (
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
			{loading ? (
				<>
					<LoadingDot />
					<LoadingDot delay={0.15} />
					<LoadingDot delay={0.3} />
				</>
			) : (
				label
			)}
		</button>
	)
}

function LoadingDot({ delay = 0 }: { delay?: number }) {
	return (
		<span
			aria-hidden="true"
			style={{
				display: 'inline-block',
				width: '4px',
				height: '4px',
				borderRadius: '50%',
				backgroundColor: 'currentColor',
				animation: 'blink 1s ease-in-out infinite',
				animationDelay: `${delay}s`,
			}}
		/>
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
