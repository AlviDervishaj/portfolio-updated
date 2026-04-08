import { Link } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { USER } from '#/constants/user'

const FOOTER_LINKS = [
	{ href: 'https://github.com/alvidervishaj', label: 'GitHub', external: true },
	{ href: 'https://x.com/alvi_d1', label: 'X / Twitter', external: true },
	{ href: '/blog', label: 'Blog', external: false },
	{ href: '/now', label: 'Now', external: false },
]

export default function Footer() {
	const year = new Date().getFullYear()

	return (
		<footer
			style={{
				borderTop: '1px solid var(--line-strong)',
				marginTop: '8rem',
			}}
		>
			<div
				className="flex flex-col gap-8 py-12 sm:flex-row sm:items-end sm:justify-between"
				style={{ maxWidth: '1200px', margin: '0 auto', padding: '3rem 1.5rem' }}
			>
				<div className="flex flex-col gap-4">
					<Link
						to="/"
						className="flex items-center gap-2 w-fit"
						style={{
							fontFamily: 'var(--font-mono)',
							fontSize: '0.8rem',
							letterSpacing: '0.04em',
						}}
					>
						<Diamond aria-hidden="true" className="size-4" style={{ color: 'var(--acid)' }} />
						{USER.SITE_NAME}
					</Link>
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
						&copy; {year} {USER.FULL_NAME}
					</p>
				</div>

				<nav className="flex flex-wrap gap-x-8 gap-y-3">
					{FOOTER_LINKS.map(({ href, label, external }) =>
						external ? (
							<a key={label} href={href} target="_blank" rel="noreferrer" className="nav-item">
								{label}
							</a>
						) : (
							<Link key={label} to={href as '/'} className="nav-item">
								{label}
							</Link>
						),
					)}
				</nav>
			</div>
		</footer>
	)
}
