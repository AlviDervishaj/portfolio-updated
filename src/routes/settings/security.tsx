import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router'
import { useState } from 'react'
import { z } from 'zod'
import {
	AUTH_MAX_PASSWORD_LENGTH,
	AUTH_MIN_PASSWORD_LENGTH,
	SETTINGS_SECURITY_CONFIRM_PASSWORD_LABEL,
	SETTINGS_SECURITY_CURRENT_PASSWORD_LABEL,
	SETTINGS_SECURITY_DESCRIPTION,
	SETTINGS_SECURITY_GENERIC_ERROR,
	SETTINGS_SECURITY_MISMATCH,
	SETTINGS_SECURITY_NEW_PASSWORD_LABEL,
	SETTINGS_SECURITY_SAME_AS_CURRENT,
	SETTINGS_SECURITY_SUBMIT,
	SETTINGS_SECURITY_SUCCESS,
	SETTINGS_SECURITY_TITLE,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'

const ChangePasswordInputSchema = z
	.object({
		currentPassword: z.string().min(AUTH_MIN_PASSWORD_LENGTH).max(AUTH_MAX_PASSWORD_LENGTH),
		newPassword: z.string().min(AUTH_MIN_PASSWORD_LENGTH).max(AUTH_MAX_PASSWORD_LENGTH),
		confirmPassword: z.string().min(AUTH_MIN_PASSWORD_LENGTH).max(AUTH_MAX_PASSWORD_LENGTH),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: SETTINGS_SECURITY_MISMATCH,
		path: ['confirmPassword'],
	})
	.refine((data) => data.newPassword !== data.currentPassword, {
		message: SETTINGS_SECURITY_SAME_AS_CURRENT,
		path: ['newPassword'],
	})

type ChangePasswordInput = z.infer<typeof ChangePasswordInputSchema>

export const Route = createFileRoute('/settings/security')({
	component: SecuritySection,
	errorComponent: SecurityErrorComponent,
	pendingComponent: SecurityPendingComponent,
	head: () => ({
		meta: [{ title: `${SETTINGS_SECURITY_TITLE} — ${USER.FULL_NAME}` }],
	}),
})

const EMPTY_FORM: ChangePasswordInput = {
	currentPassword: '',
	newPassword: '',
	confirmPassword: '',
}

function SecuritySection(): React.ReactElement {
	const [form, setForm] = useState<ChangePasswordInput>(EMPTY_FORM)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [loading, setLoading] = useState(false)

	function updateField(field: keyof ChangePasswordInput, value: string): void {
		setForm((prev) => ({ ...prev, [field]: value }))
	}

	async function handleSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
		event.preventDefault()
		setError(null)
		setSuccess(null)

		const parsed = ChangePasswordInputSchema.safeParse(form)

		if (!parsed.success) {
			const firstIssue = parsed.error.issues[0]
			setError(firstIssue?.message ?? SETTINGS_SECURITY_GENERIC_ERROR)
			return
		}

		setLoading(true)

		const result = await authClient.changePassword({
			currentPassword: parsed.data.currentPassword,
			newPassword: parsed.data.newPassword,
			revokeOtherSessions: true,
		})

		if (result.error) {
			setError(result.error.message ?? SETTINGS_SECURITY_GENERIC_ERROR)
			setLoading(false)
			return
		}

		setSuccess(SETTINGS_SECURITY_SUCCESS)
		setForm(EMPTY_FORM)
		setLoading(false)
	}

	return (
		<article>
			<SectionHeading title={SETTINGS_SECURITY_TITLE} description={SETTINGS_SECURITY_DESCRIPTION} />

			<form onSubmit={handleSubmit} className="flex flex-col gap-5 border border-line-strong p-8">
				{error && <Banner tone="error" message={error} />}
				{success && <Banner tone="success" message={success} />}

				<PasswordField
					id="current-password"
					label={SETTINGS_SECURITY_CURRENT_PASSWORD_LABEL}
					value={form.currentPassword}
					onChange={(value) => updateField('currentPassword', value)}
					autoComplete="current-password"
					disabled={loading}
					required
				/>

				<PasswordField
					id="new-password"
					label={SETTINGS_SECURITY_NEW_PASSWORD_LABEL}
					value={form.newPassword}
					onChange={(value) => updateField('newPassword', value)}
					autoComplete="new-password"
					disabled={loading}
					required
					hint={`Minimum ${AUTH_MIN_PASSWORD_LENGTH} characters`}
				/>

				<PasswordField
					id="confirm-password"
					label={SETTINGS_SECURITY_CONFIRM_PASSWORD_LABEL}
					value={form.confirmPassword}
					onChange={(value) => updateField('confirmPassword', value)}
					autoComplete="new-password"
					disabled={loading}
					required
				/>

				<button
					type="submit"
					disabled={loading}
					className="acid-btn mt-2 justify-center disabled:cursor-not-allowed disabled:opacity-60"
				>
					{loading ? 'Updating…' : SETTINGS_SECURITY_SUBMIT}
				</button>
			</form>
		</article>
	)
}

type SectionHeadingProps = {
	title: string
	description: string
}

function SectionHeading({ title, description }: SectionHeadingProps): React.ReactElement {
	return (
		<header className="mb-8">
			<h2 className="mb-2 font-display text-xl font-bold tracking-[-0.01em]">{title}</h2>
			<p className="m-0 font-mono text-mono-md tracking-mono-sm text-muted-foreground">
				{description}
			</p>
		</header>
	)
}

type PasswordFieldProps = {
	id: string
	label: string
	value: string
	onChange: (value: string) => void
	autoComplete: 'current-password' | 'new-password'
	disabled: boolean
	required: boolean
	hint?: string
}

function PasswordField({
	id,
	label,
	value,
	onChange,
	autoComplete,
	disabled,
	required,
	hint,
}: PasswordFieldProps): React.ReactElement {
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
				type="password"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				autoComplete={autoComplete}
				required={required}
				disabled={disabled}
				minLength={AUTH_MIN_PASSWORD_LENGTH}
				maxLength={AUTH_MAX_PASSWORD_LENGTH}
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

type BannerProps = {
	tone: 'error' | 'success'
	message: string
}

function Banner({ tone, message }: BannerProps): React.ReactElement {
	const isError = tone === 'error'
	return (
		<div
			role={isError ? 'alert' : 'status'}
			className={
				isError
					? 'border border-[oklch(0.577_0.245_27.325)] bg-[rgba(220,38,38,0.06)] px-4 py-3.5 font-mono text-mono-lg leading-[1.5] tracking-[0.04em] text-[oklch(0.637_0.237_25.331)]'
					: 'border border-acid-border bg-acid-dim px-4 py-3.5 font-mono text-mono-lg leading-[1.5] tracking-[0.04em] text-foreground'
			}
		>
			{message}
		</div>
	)
}

function SecurityPendingComponent(): React.ReactElement {
	return (
		<p className="font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground">
			Loading security…
		</p>
	)
}

function SecurityErrorComponent({ error }: ErrorComponentProps): React.ReactElement {
	const message = error instanceof Error ? error.message : 'Something went wrong'

	return (
		<div role="alert">
			<p className="mb-3 font-mono text-mono-lg uppercase tracking-mono-md text-muted-foreground">
				Could not load security settings
			</p>
			<p className="font-mono text-mono-lg text-muted-foreground">{message}</p>
		</div>
	)
}
