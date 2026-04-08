import { createFileRoute } from '@tanstack/react-router'
import { ArrowUpRight, Diamond } from 'lucide-react'
import { USER } from '#/constants/user'

export const Route = createFileRoute('/about')({
	component: AboutPage,
	head: () => ({
		meta: [
			{ title: `About — ${USER.FULL_NAME}` },
			{
				name: 'description',
				content: `${USER.FULL_NAME} — ${USER.POSITION} based in ${USER.LOCATION}.`,
			},
		],
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
]

const EXPERIENCE = [
	{
		company: USER.CURRENT_COMPANY,
		role: USER.CURRENT_WORK_POSITION,
		period: '2023 – Present',
		description:
			'Building and maintaining frontend systems. Collaborating on UI architecture, design system components, and performance improvements.',
	},
]

const SOCIAL_LINKS = [
	{ label: 'GitHub', href: 'https://github.com/alvidervishaj', handle: '@alvidervishaj' },
	{ label: 'X / Twitter', href: 'https://x.com/alvi_d1', handle: '@alvi_d1' },
]

function AboutPage() {
	return (
		<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<header style={{ marginBottom: '6rem' }}>
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.68rem',
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: 'var(--acid)',
						marginBottom: '1.5rem',
					}}
				>
					— About
				</p>
				<h1
					className="animate-fade-up"
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(2.5rem, 7vw, 5rem)',
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 0.95,
						margin: '0 0 2.5rem',
					}}
				>
					Full-Stack
					<br />
					<span className="text-stroke">Developer</span>
				</h1>
				<p
					style={{
						fontSize: '1.0625rem',
						color: 'var(--muted-foreground)',
						lineHeight: 1.7,
						margin: 0,
						maxWidth: '60ch',
					}}
				>
					I'm {USER.FIRST_NAME}, a {USER.POSITION} based in {USER.LOCATION}. I build full-stack web
					applications with a focus on type safety, clean architecture, and developer experience. I
					started programming in {new Date().getFullYear() - 4} and have been building for the web
					ever since.
				</p>
			</header>

			<div
				className="grid grid-cols-1 gap-16 lg:grid-cols-[1fr_320px]"
				style={{ alignItems: 'start' }}
			>
				<div>
					<section style={{ marginBottom: '5rem' }}>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.2em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								marginBottom: '2rem',
							}}
						>
							Background
						</p>
						<div
							style={{
								display: 'flex',
								flexDirection: 'column',
								gap: '1.25rem',
								fontSize: '0.9375rem',
								lineHeight: 1.75,
								color: 'var(--foreground)',
								maxWidth: '65ch',
							}}
						>
							<p style={{ margin: 0 }}>
								I got into programming out of curiosity — wanted to understand how the things I used
								every day were built. That curiosity turned into a craft. I've spent the last few
								years getting very good at the TypeScript ecosystem: React on the frontend,
								Node.js/Bun on the backend, and the full spectrum of tooling in between.
							</p>
							<p style={{ margin: 0 }}>
								I care a lot about the quality of the code I ship. No magic numbers, no implicit
								state, no mystery logic buried three abstractions deep. I write things I'd be proud
								to show a colleague six months later.
							</p>
							<p style={{ margin: 0 }}>
								Currently working as a {USER.CURRENT_WORK_POSITION} at {USER.CURRENT_COMPANY}.
								Available for freelance and contract work.
							</p>
						</div>
					</section>

					<section>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.2em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								marginBottom: '2rem',
							}}
						>
							Experience
						</p>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
							{EXPERIENCE.map((exp) => (
								<div
									key={exp.company}
									style={{
										borderTop: '1px solid var(--line-strong)',
										padding: '2rem 0',
									}}
								>
									<div
										className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between"
										style={{ marginBottom: '0.75rem' }}
									>
										<h2
											style={{
												fontFamily: 'var(--font-display)',
												fontSize: '1.25rem',
												fontWeight: 700,
												letterSpacing: '-0.01em',
												margin: 0,
											}}
										>
											{exp.role}
										</h2>
										<span
											style={{
												fontFamily: 'var(--font-mono)',
												fontSize: '0.65rem',
												letterSpacing: '0.1em',
												textTransform: 'uppercase',
												color: 'var(--muted-foreground)',
												whiteSpace: 'nowrap',
											}}
										>
											{exp.period}
										</span>
									</div>
									<p
										style={{
											fontFamily: 'var(--font-mono)',
											fontSize: '0.72rem',
											letterSpacing: '0.08em',
											color: 'var(--acid)',
											marginBottom: '0.75rem',
										}}
									>
										{exp.company}
									</p>
									<p
										style={{
											fontSize: '0.9rem',
											color: 'var(--muted-foreground)',
											lineHeight: 1.65,
											margin: 0,
											maxWidth: '60ch',
										}}
									>
										{exp.description}
									</p>
								</div>
							))}
						</div>
					</section>
				</div>

				<aside>
					<section style={{ marginBottom: '3rem' }}>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.2em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								marginBottom: '1.5rem',
							}}
						>
							Stack
						</p>
						<div
							style={{
								display: 'flex',
								flexWrap: 'wrap',
								gap: '0.5rem',
							}}
						>
							{SKILLS.map((skill) => (
								<span
									key={skill}
									style={{
										fontFamily: 'var(--font-mono)',
										fontSize: '0.62rem',
										letterSpacing: '0.1em',
										textTransform: 'uppercase',
										color: 'var(--muted-foreground)',
										border: '1px solid var(--line-strong)',
										padding: '0.3rem 0.65rem',
									}}
								>
									{skill}
								</span>
							))}
						</div>
					</section>

					<section style={{ marginBottom: '3rem' }}>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.2em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								marginBottom: '1.5rem',
							}}
						>
							Find me
						</p>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
							{SOCIAL_LINKS.map((link) => (
								<a
									key={link.label}
									href={link.href}
									target="_blank"
									rel="noreferrer"
									className="flex items-center justify-between"
									style={{
										fontFamily: 'var(--font-mono)',
										fontSize: '0.72rem',
										letterSpacing: '0.06em',
										color: 'var(--foreground)',
										textDecoration: 'none',
										borderBottom: '1px solid var(--line-strong)',
										paddingBottom: '0.75rem',
										transition: 'color 150ms ease',
									}}
									onMouseEnter={(e) => {
										;(e.currentTarget as HTMLElement).style.color = 'var(--acid)'
									}}
									onMouseLeave={(e) => {
										;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
									}}
								>
									<span>{link.label}</span>
									<span
										style={{
											display: 'flex',
											alignItems: 'center',
											gap: '0.35rem',
											color: 'var(--muted-foreground)',
											fontSize: '0.65rem',
										}}
									>
										{link.handle}
										<ArrowUpRight aria-hidden="true" className="size-3.5" />
									</span>
								</a>
							))}
							<a
								href={`mailto:${USER.EMAIL}`}
								className="flex items-center justify-between"
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.72rem',
									letterSpacing: '0.06em',
									color: 'var(--foreground)',
									textDecoration: 'none',
									borderBottom: '1px solid var(--line-strong)',
									paddingBottom: '0.75rem',
									transition: 'color 150ms ease',
								}}
								onMouseEnter={(e) => {
									;(e.currentTarget as HTMLElement).style.color = 'var(--acid)'
								}}
								onMouseLeave={(e) => {
									;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
								}}
							>
								<span>Email</span>
								<span
									style={{
										display: 'flex',
										alignItems: 'center',
										gap: '0.35rem',
										color: 'var(--muted-foreground)',
										fontSize: '0.65rem',
									}}
								>
									{USER.EMAIL}
									<ArrowUpRight aria-hidden="true" className="size-3.5" />
								</span>
							</a>
						</div>
					</section>

					<section>
						<p
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.2em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								marginBottom: '1.5rem',
							}}
						>
							Details
						</p>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
							{[
								{ label: 'Location', value: USER.LOCATION },
								{ label: 'Role', value: USER.CURRENT_WORK_POSITION },
								{ label: 'Company', value: USER.CURRENT_COMPANY },
								{ label: 'Available', value: 'Freelance / Contract' },
							].map(({ label, value }) => (
								<div
									key={label}
									className="flex items-baseline justify-between"
									style={{ gap: '1rem' }}
								>
									<span
										style={{
											fontFamily: 'var(--font-mono)',
											fontSize: '0.62rem',
											letterSpacing: '0.1em',
											textTransform: 'uppercase',
											color: 'var(--muted-foreground)',
											flexShrink: 0,
										}}
									>
										{label}
									</span>
									<span
										style={{
											fontFamily: 'var(--font-sans)',
											fontSize: '0.875rem',
											color: 'var(--foreground)',
											textAlign: 'right',
										}}
									>
										{value}
									</span>
								</div>
							))}
						</div>
					</section>
				</aside>
			</div>

			<div
				style={{
					marginTop: '6rem',
					borderTop: '1px solid var(--line-strong)',
					paddingTop: '3rem',
					display: 'flex',
					alignItems: 'center',
					gap: '0.75rem',
				}}
			>
				<Diamond aria-hidden="true" className="size-3.5" style={{ color: 'var(--acid)' }} />
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.65rem',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
						margin: 0,
					}}
				>
					Based in {USER.LOCATION} — open to remote worldwide
				</p>
			</div>
		</main>
	)
}
