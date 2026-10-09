import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Diamond } from 'lucide-react'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { i18next } from '#/lib/i18n'

export const Route = createFileRoute('/about')({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: `About — ${USER.FULL_NAME}` },
			{
				name: 'description',
				content: `${USER.FULL_NAME} — ${USER.POSITION} based in ${USER.LOCATION}.`,
			},
			{ property: 'og:title', content: `About — ${USER.FULL_NAME}` },
			{ property: 'og:url', content: `${env.VITE_APP_URL}/about` },
			{ property: 'og:image', content: `${env.VITE_APP_URL}/api/og?title=About&type=page` },
			{ name: 'twitter:card', content: 'summary_large_image' },
		],
		links: [{ rel: 'canonical', href: `${env.VITE_APP_URL}/about` }],
	}),
})

const SKILLS = [
	'TypeScript',
	'React',
	'Node.js',
	'TanStack Start',
	'PostgreSQL',
	'Drizzle ORM',
	'BetterAuth',
	'Tailwind CSS',
	'Bun',
	'Upstash Redis',
	'Cloudflare R2',
	'Resend',
	'Zod',
	'Biome',
	'Docker',
	'Git',
	'Vercel',
	'GoLang',
]

const EXPERIENCE = [
	{
		company: USER.CURRENT_COMPANY,
		role: USER.CURRENT_WORK_POSITION,
		period: i18next.t('portfolio.period'),
		description: i18next.t('portfolio.experience'),
	},
]

const SOCIAL_LINKS = [
	{ label: 'GitHub', href: 'https://github.com/alvidervishaj', handle: '@alvidervishaj' },
	{ label: 'X / Twitter', href: 'https://x.com/alvi_d1', handle: '@alvi_d1' },
]

function AboutPage() {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<header className="mb-24">
				<p className="mb-6 font-mono text-mono-md uppercase tracking-mono-lg text-acid">— About</p>
				<h1 className="animate-fade-up mb-10 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-display-tighter">
					Full-Stack
					<br />
					<span className="text-stroke">Developer</span>
				</h1>
				<p className="m-0 max-w-[60ch] text-[1.0625rem] leading-[1.7] text-muted-foreground">
					{i18next.t('portfolio.aboutIntro', { name: USER.FIRST_NAME, location: USER.LOCATION })}
				</p>
			</header>

			<div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-[1fr_320px]">
				<div>
					<section className="mb-20">
						<p className="mb-8 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							Background
						</p>
						<div className="flex max-w-[65ch] flex-col gap-5 text-[0.9375rem] leading-[1.75] text-foreground">
							<p className="m-0">{i18next.t('portfolio.background')}</p>
							<p className="m-0">{i18next.t('portfolio.quality')}</p>
							<p className="m-0">
								Currently working as a {USER.CURRENT_WORK_POSITION} at {USER.CURRENT_COMPANY}.
								Available for freelance and contract work.
							</p>
						</div>
					</section>

					<section>
						<p className="mb-8 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							Experience
						</p>
						<div className="flex flex-col">
							{EXPERIENCE.map((exp) => (
								<div key={exp.company} className="border-t border-line-strong py-8">
									<div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
										<h2 className="m-0 font-display text-xl font-bold tracking-[-0.01em]">
											{exp.role}
										</h2>
										<span className="whitespace-nowrap font-mono text-mono-sm uppercase tracking-mono text-muted-foreground">
											{exp.period}
										</span>
									</div>
									<p className="mb-3 font-mono text-[0.72rem] tracking-mono-sm text-acid">
										{exp.company}
									</p>
									<p className="m-0 max-w-[60ch] text-[0.9rem] leading-[1.65] text-muted-foreground">
										{exp.description}
									</p>
								</div>
							))}
						</div>
					</section>
				</div>

				<aside>
					<section className="mb-12">
						<p className="mb-6 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							Stack
						</p>
						<div className="flex flex-wrap gap-2">
							{SKILLS.map((skill) => (
								<span
									key={skill}
									className="border border-line-strong px-2.5 py-1 font-mono text-mono-xs uppercase tracking-mono text-muted-foreground"
								>
									{skill}
								</span>
							))}
						</div>
					</section>

					<section className="mb-12">
						<p className="mb-6 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							Find me
						</p>
						<div className="flex flex-col gap-3">
							{SOCIAL_LINKS.map((link) => (
								<a
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between border-b border-line-strong pb-3 font-mono text-[0.72rem] tracking-[0.06em] text-foreground no-underline transition-colors duration-150 hover:text-acid"
								>
									<span>{link.label}</span>
									<span className="flex items-center gap-1.5 text-mono-sm text-muted-foreground">
										{link.handle}
										<ArrowUpRight aria-hidden="true" className="size-3.5" />
									</span>
								</a>
							))}
							<a
								href={`mailto:${USER.EMAIL}`}
								className="flex items-center justify-between border-b border-line-strong pb-3 font-mono text-[0.72rem] tracking-[0.06em] text-foreground no-underline transition-colors duration-150 hover:text-acid"
							>
								<span>Email</span>
								<span className="flex items-center gap-1.5 text-mono-sm text-muted-foreground">
									{USER.EMAIL}
									<ArrowUpRight aria-hidden="true" className="size-3.5" />
								</span>
							</a>
						</div>
					</section>

					<section>
						<p className="mb-6 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							Details
						</p>
						<div className="flex flex-col gap-2.5">
							{[
								{ label: 'Location', value: USER.LOCATION },
								{ label: 'Role', value: USER.CURRENT_WORK_POSITION },
								{ label: 'Company', value: USER.CURRENT_COMPANY },
								{ label: 'Available', value: 'Freelance / Contract' },
							].map(({ label, value }) => (
								<div key={label} className="flex items-baseline justify-between gap-4">
									<span className="shrink-0 font-mono text-mono-xs uppercase tracking-mono text-muted-foreground">
										{label}
									</span>
									<span className="text-right font-sans text-sm text-foreground">{value}</span>
								</div>
							))}
						</div>
					</section>
				</aside>
			</div>

			<div className="mt-24 flex items-center gap-3 border-t border-line-strong pt-12">
				<Diamond aria-hidden="true" className="size-3.5 text-acid" />
				<p className="m-0 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground">
					Based in {USER.LOCATION} — open to remote worldwide
				</p>
			</div>
		</main>
	)
}
