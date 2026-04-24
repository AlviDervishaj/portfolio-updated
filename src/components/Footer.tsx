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
		<footer className="mt-32 border-t border-line-strong">
			<div className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-12 sm:flex-row sm:items-end sm:justify-between">
				<div className="flex flex-col gap-4">
					<Link
						to="/"
						className="flex w-fit items-center gap-2 font-mono text-[0.8rem] tracking-[0.04em]"
					>
						<Diamond aria-hidden="true" className="size-4 text-acid" />
						{USER.SITE_NAME}
					</Link>
					<p className="m-0 font-mono text-mono-md uppercase tracking-mono text-muted-foreground">
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
