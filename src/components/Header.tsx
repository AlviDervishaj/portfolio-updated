import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import { ChevronDown, ChevronUp, Diamond, Menu, X } from 'lucide-react'
import { useState } from 'react'

import { AUTH_SIGN_IN_LABEL, AUTH_SIGN_OUT_LABEL } from '#/constants/auth.ts'
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
		<header
			className="sticky top-0 z-50 backdrop-blur-md"
			style={{
				borderBottom: '1px solid var(--line-strong)',
				backgroundColor: 'color-mix(in srgb, var(--background) 82%, transparent)',
			}}
		>
			<div
				className="flex h-14 items-center justify-between gap-4"
				style={{
					maxWidth: '1200px',
					margin: '0 auto',
					padding: '0 1.5rem',
				}}
			>
				<Link
					to="/"
					className="flex items-center gap-2 shrink-0"
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.8rem',
						letterSpacing: '0.04em',
					}}
				>
					<Diamond aria-hidden="true" className="size-4" style={{ color: 'var(--acid)' }} />
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
					{/* <a
            href="https://github.com/alvidervishaj"
            target="_blank"
            rel="noreferrer"
            className="transition-colors"
            aria-label="GitHub"
            style={{ color: 'var(--muted-foreground)' }}
            onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--foreground)' }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--muted-foreground)' }}
          >
            <svg width="18" height="18" viewBox="0 0 16 16" aria-hidden="true" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </a> */}

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
						className="inline-flex items-center justify-center rounded-md border border-[var(--line-strong)] p-2 text-[var(--foreground)]"
					>
						{mobileMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
					</button>
				</div>
			</div>

			{mobileMenuOpen && (
				<div
					className="border-t border-[var(--line-strong)] px-6 py-4 md:hidden"
					style={{
						backgroundColor: 'color-mix(in srgb, var(--background) 92%, transparent)',
					}}
				>
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
								className="w-fit font-mono text-[0.68rem] uppercase tracking-[0.12em] text-[var(--muted-foreground)]"
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
		<div style={{ position: 'relative' }}>
			<button
				type="button"
				onClick={() => setOpen((prev) => !prev)}
				aria-expanded={open}
				aria-haspopup="menu"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '0.4rem',
					fontFamily: 'var(--font-mono)',
					fontSize: '0.68rem',
					letterSpacing: '0.1em',
					textTransform: 'uppercase',
					color: 'var(--foreground)',
					background: 'none',
					border: 'none',
					cursor: 'pointer',
					padding: '0',
				}}
			>
				<span
					style={{
						width: '22px',
						height: '22px',
						borderRadius: '50%',
						backgroundColor: 'var(--acid)',
						color: 'var(--on-acid)',
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '0.6rem',
						fontWeight: 700,
						flexShrink: 0,
						letterSpacing: 0,
					}}
					aria-hidden="true"
				>
					{firstName.charAt(0).toUpperCase()}
				</span>
				{firstName}
				<span aria-hidden="true" className="flex items-center" style={{ opacity: 0.6 }}>
					{open ? <ChevronUp className="size-3" /> : <ChevronDown className="size-3" />}
				</span>
			</button>

			{open && (
				<>
					<div
						style={{ position: 'fixed', inset: 0, zIndex: 40 }}
						aria-hidden="true"
						onClick={() => setOpen(false)}
					/>
					<div
						role="menu"
						style={{
							position: 'absolute',
							top: 'calc(100% + 12px)',
							right: 0,
							zIndex: 50,
							minWidth: '160px',
							border: '1px solid var(--line-strong)',
							backgroundColor: 'var(--background)',
							boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
						}}
					>
						<Link
							to="/admin"
							role="menuitem"
							onClick={() => setOpen(false)}
							style={{
								display: 'block',
								padding: '0.75rem 1rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.65rem',
								letterSpacing: '0.1em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								textDecoration: 'none',
								borderBottom: '1px solid var(--line-strong)',
								transition: 'color 120ms ease, background-color 120ms ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--foreground)'
								e.currentTarget.style.backgroundColor = 'var(--hover-surface)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--muted-foreground)'
								e.currentTarget.style.backgroundColor = 'transparent'
							}}
						>
							Admin
						</Link>
						<button
							type="button"
							role="menuitem"
							onClick={() => {
								setOpen(false)
								onSignOut()
							}}
							style={{
								display: 'block',
								width: '100%',
								padding: '0.75rem 1rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.65rem',
								letterSpacing: '0.1em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								textAlign: 'left',
								transition: 'color 120ms ease, background-color 120ms ease',
							}}
							onMouseEnter={(e) => {
								e.currentTarget.style.color = 'var(--foreground)'
								e.currentTarget.style.backgroundColor = 'var(--hover-surface)'
							}}
							onMouseLeave={(e) => {
								e.currentTarget.style.color = 'var(--muted-foreground)'
								e.currentTarget.style.backgroundColor = 'transparent'
							}}
						>
							{AUTH_SIGN_OUT_LABEL}
						</button>
					</div>
				</>
			)}
		</div>
	)
}
