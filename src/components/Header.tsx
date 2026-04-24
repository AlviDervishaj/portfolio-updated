import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, Diamond, Menu, X } from 'lucide-react'
import { useState } from 'react'

import { AUTH_SIGN_IN_LABEL, AUTH_SIGN_OUT_LABEL, SETTINGS_TITLE } from '#/constants/auth.ts'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'
import ThemeToggle from './ThemeToggle'

const NAV_LINKS = [
	{ to: '/' as const, label: 'Home' },
	{ to: '/about' as const, label: 'About' },
	{ to: '/blog' as const, label: 'Blog' },
	{ to: '/now' as const, label: 'Now' },
]

export default function Header() {
	const { location } = useRouterState()
	const navigate = useNavigate()
	const { data: session } = authClient.useSession()
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

	async function handleSignOut() {
		await authClient.signOut()
		setMobileMenuOpen(false)
		navigate({ to: '/' })
	}

	return (
		<header className="sticky top-0 z-50 border-b border-line-strong bg-[color-mix(in_srgb,var(--background)_82%,transparent)] backdrop-blur-md">
			<div className="mx-auto flex h-14 max-w-[1200px] items-center justify-between gap-4 px-6">
				<Link
					to="/"
					className="flex shrink-0 items-center gap-2 font-mono text-[0.8rem] tracking-[0.04em]"
				>
					<Diamond aria-hidden="true" className="size-4 text-acid" />
					{USER.SITE_NAME}
				</Link>

				<nav className="hidden items-center gap-8 md:flex">
					{NAV_LINKS.map(({ to, label }) => (
						<Link
							key={to}
							to={to}
							className="nav-item"
							data-active={location.pathname === to ? 'true' : 'false'}
							onClick={() => setMobileMenuOpen(false)}
						>
							{label}
						</Link>
					))}
				</nav>

				<div className="hidden shrink-0 items-center gap-4 md:flex">
					{session?.user ? (
						<UserMenu name={session.user.name} onSignOut={handleSignOut} />
					) : (
						<Link
							to="/sign-in"
							className="nav-item"
							data-active={location.pathname === '/sign-in' ? 'true' : 'false'}
							onClick={() => setMobileMenuOpen(false)}
						>
							{AUTH_SIGN_IN_LABEL}
						</Link>
					)}

					<ThemeToggle />
				</div>

				<div className="flex items-center gap-2 md:hidden">
					<ThemeToggle />
					<button
						type="button"
						onClick={() => setMobileMenuOpen((prev) => !prev)}
						aria-expanded={mobileMenuOpen}
						aria-label="Toggle navigation menu"
						className="inline-flex items-center justify-center rounded-md border border-line-strong p-2 text-foreground"
					>
						{mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
					</button>
				</div>
			</div>

			{mobileMenuOpen && (
				<div className="border-t border-line-strong bg-[color-mix(in_srgb,var(--background)_92%,transparent)] px-6 py-4 md:hidden">
					<nav className="flex flex-col gap-4">
						{NAV_LINKS.map(({ to, label }) => (
							<Link
								key={to}
								to={to}
								className="nav-item w-fit"
								data-active={location.pathname === to ? 'true' : 'false'}
								onClick={() => setMobileMenuOpen(false)}
							>
								{label}
							</Link>
						))}
						{session?.user ? (
							<button
								type="button"
								onClick={handleSignOut}
								className="w-fit cursor-pointer border-none bg-transparent p-0 font-mono text-mono-md uppercase tracking-mono text-muted-foreground"
							>
								{AUTH_SIGN_OUT_LABEL}
							</button>
						) : (
							<Link
								to="/sign-in"
								className="nav-item w-fit"
								data-active={location.pathname === '/sign-in' ? 'true' : 'false'}
								onClick={() => setMobileMenuOpen(false)}
							>
								{AUTH_SIGN_IN_LABEL}
							</Link>
						)}
					</nav>
				</div>
			)}
		</header>
	)
}

type UserMenuProps = {
	name: string
	onSignOut: () => void
}

function UserMenu({ name, onSignOut }: UserMenuProps) {
	const [open, setOpen] = useState(false)
	const firstName = name.split(' ')[0]

	return (
		<div className="relative">
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-haspopup="menu"
				className="flex cursor-pointer items-center gap-1.5 border-none bg-transparent p-0 font-mono text-mono-md uppercase tracking-mono text-foreground"
			>
				<span
					aria-hidden="true"
					className="flex size-[22px] shrink-0 items-center justify-center rounded-full bg-acid text-[0.6rem] font-bold tracking-normal text-on-acid"
				>
					{firstName.charAt(0).toUpperCase()}
				</span>
				{firstName}
				<span aria-hidden="true" className="flex items-center opacity-60">
					{open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
				</span>
			</button>

			{open && (
				<>
					<div className="fixed inset-0 z-40" aria-hidden="true" onClick={() => setOpen(false)} />
					<div
						role="menu"
						className="absolute right-0 top-[calc(100%+12px)] z-50 min-w-[160px] border border-line-strong bg-background shadow-[0_8px_32px_rgba(0,0,0,0.18)]"
					>
						<Link
							to="/admin"
							role="menuitem"
							onClick={() => setOpen(false)}
							className="block border-b border-line-strong px-4 py-3 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground no-underline transition-colors duration-150 hover:bg-hover-surface hover:text-foreground"
						>
							Admin
						</Link>
						<Link
							to="/settings"
							role="menuitem"
							onClick={() => setOpen(false)}
							className="block border-b border-line-strong px-4 py-3 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground no-underline transition-colors duration-150 hover:bg-hover-surface hover:text-foreground"
						>
							{SETTINGS_TITLE}
						</Link>
						<button
							type="button"
							role="menuitem"
							onClick={() => {
								setOpen(false)
								onSignOut()
							}}
							className="block w-full cursor-pointer border-none bg-transparent px-4 py-3 text-left font-mono text-mono-sm uppercase tracking-mono text-muted-foreground transition-colors duration-150 hover:bg-hover-surface hover:text-foreground"
						>
							{AUTH_SIGN_OUT_LABEL}
						</button>
					</div>
				</>
			)}
		</div>
	)
}
