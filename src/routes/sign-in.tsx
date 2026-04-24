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
		<main className="flex min-h-[calc(100vh-57px)] items-center justify-center px-6 py-16">
			<div className="w-full max-w-[420px]">
				<div className="mb-12 text-center">
					<Diamond aria-hidden="true" className="mb-5 inline-block size-6 text-acid" />
					<h1 className="mb-2 font-display text-[clamp(1.75rem,5vw,2.5rem)] font-bold leading-[1.05] tracking-display-tight">
						{tab === 'sign-in' ? 'Welcome back.' : 'Join the site.'}
					</h1>
					<p className="m-0 font-mono text-mono-md uppercase tracking-mono text-muted-foreground">
						{tab === 'sign-in'
							? 'Sign in to leave comments and reactions'
							: 'Create an account to join the discussion'}
					</p>
				</div>
				{showPasswordResetSuccess && (
					<div className="mb-6 border border-acid-border bg-acid-dim px-4 py-3.5 font-mono text-mono-lg leading-[1.5] tracking-[0.04em]">
						{AUTH_RESET_PASSWORD_SUCCESS}
					</div>
				)}

				<div
					className="mb-8 grid grid-cols-2 border-b border-line-strong"
					role="tablist"
					aria-label="Authentication mode"
				>
					{TABS.map(({ id, label }) => {
						const active = tab === id
						return (
							<button
								key={id}
								type="button"
								role="tab"
								aria-selected={active}
								onClick={() => setTab(id)}
								className={`-mb-px cursor-pointer border-none border-b-2 bg-transparent py-3.5 font-mono text-mono-sm uppercase tracking-mono-md transition-colors duration-150 ${
									active
										? 'border-acid text-foreground'
										: 'border-transparent text-muted-foreground'
								}`}
							>
								{label}
							</button>
						)
					})}
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
		<form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
			<a href="/forgot-password" className="nav-item -mt-2 w-fit">
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
		<form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
	return (
		<div className="flex flex-col gap-2">
			<label
				htmlFor={id}
				className="font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground transition-colors duration-150 has-[+input:focus]:text-foreground"
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
				className="w-full border border-line-strong bg-transparent px-4 py-3.5 font-sans text-[0.9375rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border disabled:opacity-50"
			/>
			{hint && (
				<span className="font-mono text-[0.6rem] tracking-mono-sm text-muted-foreground">
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
			className="acid-btn mt-1 w-full justify-center disabled:cursor-not-allowed disabled:opacity-60"
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
			className="inline-block size-1 rounded-full bg-current animate-blink-dot"
			style={{ animationDelay: `${delay}s` }}
		/>
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
