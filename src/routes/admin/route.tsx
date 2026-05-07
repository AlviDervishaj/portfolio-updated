import {
	createFileRoute,
	type ErrorComponentProps,
	Link,
	Outlet,
	redirect,
	useRouterState,
} from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { USER } from '#/constants/user'
import { adminHasAccessServerFn } from '#/server/admin.ts'

const ADMIN_NAV: { to: string; label: string }[] = [
	{ to: '/admin/posts', label: 'Posts' },
	{ to: '/admin/tags', label: 'Tags' },
	{ to: '/admin/analytics', label: 'Analytics' },
	{ to: '/admin/comments', label: 'Comments' },
]

export const Route = createFileRoute('/admin')({
	component: AdminLayout,
	errorComponent: AdminErrorComponent,
	head: () => ({ meta: [{ title: `Admin — ${USER.FULL_NAME}` }] }),
	loader: async () => {
		const isAuthorized = await adminHasAccessServerFn()
		if (!isAuthorized) throw redirect({ to: '/sign-in' })
		return { isAuthorized }
	},
})

function AdminLayout(): React.ReactElement {
	const { location } = useRouterState()

	return (
		<main className="mx-auto max-w-[1400px] px-6 py-24">
			<header className="mb-10 border-b border-line-strong pb-6">
				<p className="mb-2 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					Admin
				</p>
				<h1 className="m-0 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-display-tight">
					{USER.FULL_NAME}
				</h1>
			</header>

			<nav
				aria-label="Admin sections"
				className="mb-10 flex gap-1 border-b border-line-strong pb-0"
			>
				{ADMIN_NAV.map(({ to, label }) => {
					const active = location.pathname.startsWith(to)
					return (
						<Link
							key={to}
							to={to}
							data-active={active ? 'true' : 'false'}
							className="-mb-px border-b-2 border-transparent px-4 py-2.5 font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground no-underline transition-[color,border-color] duration-150 data-[active=true]:border-acid data-[active=true]:text-foreground"
						>
							{label}
						</Link>
					)
				})}
			</nav>

			<Outlet />
		</main>
	)
}

function AdminErrorComponent({ error }: ErrorComponentProps): React.ReactElement {
	const message = error instanceof Error ? error.message : 'Something went wrong'

	return (
		<main className="mx-auto max-w-[1400px] px-6 py-24 text-center">
			<p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground">
				Admin error
			</p>
			<p className="mb-8 font-mono text-mono-lg text-muted-foreground opacity-60">{message}</p>
			<a href="/" className="ghost-btn">
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back home
			</a>
		</main>
	)
}
