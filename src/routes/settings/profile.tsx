import { createFileRoute, type ErrorComponentProps } from '@tanstack/react-router'
import {
	SETTINGS_PROFILE_DESCRIPTION,
	SETTINGS_PROFILE_EMAIL_LABEL,
	SETTINGS_PROFILE_MEMBER_SINCE_LABEL,
	SETTINGS_PROFILE_NAME_HINT,
	SETTINGS_PROFILE_NAME_LABEL,
	SETTINGS_PROFILE_TITLE,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { getCurrentUserServerFn } from '#/server/users.ts'
import type { AppUser } from '#/types/user.ts'

type ProfileLoaderData = {
	user: AppUser
}

const MEMBER_SINCE_LOCALE = 'en-US'
const MEMBER_SINCE_OPTIONS: Intl.DateTimeFormatOptions = {
	year: 'numeric',
	month: 'long',
	day: 'numeric',
}

export const Route = createFileRoute('/settings/profile')({
	component: ProfileSection,
	errorComponent: ProfileErrorComponent,
	pendingComponent: ProfilePendingComponent,
	head: () => ({
		meta: [{ title: `${SETTINGS_PROFILE_TITLE} — ${USER.FULL_NAME}` }],
	}),
	loader: async (): Promise<ProfileLoaderData> => {
		const user = await getCurrentUserServerFn()

		if (!user) {
			throw new Error('Not signed in')
		}

		return { user }
	},
})

function ProfileSection(): React.ReactElement {
	const { user } = Route.useLoaderData()
	const createdAt = user.createdAt instanceof Date ? user.createdAt : new Date(user.createdAt)
	const memberSince = createdAt.toLocaleDateString(MEMBER_SINCE_LOCALE, MEMBER_SINCE_OPTIONS)

	return (
		<article>
			<SectionHeading title={SETTINGS_PROFILE_TITLE} description={SETTINGS_PROFILE_DESCRIPTION} />

			<dl className="m-0 grid grid-cols-1 gap-8 border border-line-strong p-8">
				<ReadOnlyField
					label={SETTINGS_PROFILE_NAME_LABEL}
					value={user.name}
					hint={SETTINGS_PROFILE_NAME_HINT}
				/>
				<ReadOnlyField label={SETTINGS_PROFILE_EMAIL_LABEL} value={user.email} />
				<ReadOnlyField label={SETTINGS_PROFILE_MEMBER_SINCE_LABEL} value={memberSince} />
			</dl>
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

type ReadOnlyFieldProps = {
	label: string
	value: string
	hint?: string
}

function ReadOnlyField({ label, value, hint }: ReadOnlyFieldProps): React.ReactElement {
	return (
		<div className="flex flex-col gap-[0.4rem]">
			<dt className="font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground">
				{label}
			</dt>
			<dd className="m-0 font-sans text-[0.95rem] text-foreground">{value}</dd>
			{hint && (
				<span className="font-mono text-[0.6rem] tracking-mono-sm text-muted-foreground opacity-75">
					{hint}
				</span>
			)}
		</div>
	)
}

function ProfilePendingComponent(): React.ReactElement {
	return (
		<p className="font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground">
			Loading profile…
		</p>
	)
}

function ProfileErrorComponent({ error }: ErrorComponentProps): React.ReactElement {
	const message = error instanceof Error ? error.message : 'Something went wrong'

	return (
		<div role="alert">
			<p className="mb-3 font-mono text-mono-lg uppercase tracking-mono-md text-muted-foreground">
				Could not load profile
			</p>
			<p className="font-mono text-mono-lg text-muted-foreground">{message}</p>
		</div>
	)
}
