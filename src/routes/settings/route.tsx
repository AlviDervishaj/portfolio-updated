import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
	Outlet,
	redirect,
	useRouterState,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import {
	SETTINGS_PROFILE_TITLE,
	SETTINGS_SECURITY_TITLE,
	SETTINGS_TITLE,
	SETTINGS_UNAUTHENTICATED_REDIRECT,
} from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { getCurrentUserServerFn } from '#/server/users.ts'

const SETTINGS_NAV: { to: string; label: string }[] = [
	{ to: '/settings/profile', label: SETTINGS_PROFILE_TITLE },
	{ to: '/settings/security', label: SETTINGS_SECURITY_TITLE },
]

export const Route = createFileRoute('/settings')({
	component: SettingsLayout,
	errorComponent: SettingsErrorComponent,
	pendingComponent: SettingsPendingComponent,
	head: () => ({
		meta: [{ title: `${SETTINGS_TITLE} — ${USER.FULL_NAME}` }],
	}),
	beforeLoad: async () => {
		const user = await getCurrentUserServerFn()

		if (!user) {
			throw redirect({ to: SETTINGS_UNAUTHENTICATED_REDIRECT })
		}
	},
})

function SettingsLayout(): React.ReactElement {
	const { location } = useRouterState()

	return (
		<main className="mx-auto max-w-[1000px] px-6 py-16">
			<header className="mb-12">
				<p className="mb-3 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					{SETTINGS_TITLE}
				</p>
				<h1 className="m-0 font-display text-[clamp(1.75rem,4vw,2.25rem)] font-bold leading-[1.1] tracking-display-tight">
					Manage your account
				</h1>
			</header>

			<div className="grid grid-cols-1 gap-12 md:grid-cols-[minmax(0,200px)_minmax(0,1fr)]">
				<aside>
					<nav aria-label="Settings sections" className="flex flex-col gap-1">
						{SETTINGS_NAV.map(({ to, label }) => {
							const active = location.pathname === to
							return (
								<Link
									key={to}
									to={to}
									data-active={active ? 'true' : 'false'}
									className="border-l-2 border-transparent px-3 py-2.5 font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground no-underline transition-[color,border-color] duration-150 data-[active=true]:border-acid data-[active=true]:text-foreground"
								>
									{label}
								</Link>
							)
						})}
					</nav>
				</aside>

				<section>
					<Outlet />
				</section>
			</div>
		</main>
	)
}

function SettingsPendingComponent(): React.ReactElement {
	return (
		<main className="mx-auto max-w-[1000px] px-6 py-24">
			<p className="font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground">
				Loading settings…
			</p>
		</main>
	)
}

function SettingsErrorComponent({ error }: ErrorComponentProps): React.ReactElement {
	const message = error instanceof Error ? error.message : 'Something went wrong'

	return (
		<main className="mx-auto max-w-[1000px] px-6 py-24 text-center">
			<p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground">
				Settings unavailable
			</p>
			<p className="mb-8 font-mono text-mono-lg text-muted-foreground opacity-60">{message}</p>
			<a href="/" className="ghost-btn">
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back home
			</a>
		</main>
	)
}
