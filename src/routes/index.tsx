import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, ChevronDown, Diamond } from 'lucide-react'
import { USER } from '#/constants/user'

export const Route = createFileRoute('/')({
	component: HomePage,
	head: () => ({
		meta: [{ title: `${USER.FULL_NAME} - ${USER.POSITION}` }],
	}),
})

type Project = {
	number: string
	title: string
	description: string
	tags: string[]
	url: string
}

//  - Dummy projects until filled in
const FEATURED_PROJECTS: Project[] = [
	{
		number: '01',
		title: 'This Portfolio',
		description:
			'Designed and built from scratch — TanStack Start, Drizzle ORM, BetterAuth, Neon, and Upstash Redis.',
		tags: ['TanStack Start', 'TypeScript', 'PostgreSQL', 'BetterAuth'],
		url: '/',
	},
	{
		number: '02',
		title: 'Project Two',
		description: 'Description coming soon.',
		tags: ['React', 'Node.js', 'Redis'],
		url: '#',
	},
	{
		number: '03',
		title: 'Project Three',
		description: 'Description coming soon.',
		tags: ['Next.js', 'Prisma', 'Tailwind'],
		url: '#',
	},
]

const TICKER_ITEMS = [
	'TypeScript',
	'React',
	'TanStack Start',
	'PostgreSQL',
	'Drizzle ORM',
	'Tailwind CSS',
	'BetterAuth',
	'Node.js',
	'Bun',
	'Upstash Redis',
	'Cloudflare R2',
	'Resend',
	'Neon',
	'Zod',
	'Biome',
]
const TICKER_TRACK_ITEMS = [
	...TICKER_ITEMS.map((item) => ({ id: `ticker-a-${item}`, item })),
	...TICKER_ITEMS.map((item) => ({ id: `ticker-b-${item}`, item })),
]

function HeroSection() {
	return (
		<section
			className="relative flex flex-col justify-between overflow-hidden"
			style={{
				minHeight: 'calc(100vh - 56px)',
				padding: '4rem 1.5rem 3rem',
				maxWidth: '1200px',
				margin: '0 auto',
			}}
		>
			<div
				className="animate-fade-in"
				style={{
					display: 'flex',
					alignItems: 'center',
					gap: '0.5rem',
					fontFamily: 'var(--font-mono)',
					fontSize: '0.68rem',
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
				}}
			>
				<span
					style={{
						width: '6px',
						height: '6px',
						borderRadius: '50%',
						backgroundColor: 'var(--acid)',
						display: 'inline-block',
						boxShadow: '0 0 8px var(--acid)',
					}}
					className="animate-blink"
				/>
				Available for work
			</div>

			<div className="flex flex-col gap-6" style={{ marginTop: '3rem' }}>
				<h1
					className="animate-fade-up"
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(4.5rem, 16vw, 14rem)',
						fontWeight: 700,
						lineHeight: 0.9,
						letterSpacing: '-0.03em',
						margin: 0,
					}}
				>
					ALVI
					<br />
					<span className="text-stroke animate-fade-up delay-100">DERVISHAJ</span>
				</h1>

				<div
					className="animate-fade-up delay-200"
					style={{
						display: 'flex',
						alignItems: 'center',
						gap: '1.5rem',
						flexWrap: 'wrap',
					}}
				>
					<p
						style={{
							fontFamily: 'var(--font-mono)',
							fontSize: 'clamp(0.75rem, 1.5vw, 0.9rem)',
							letterSpacing: '0.06em',
							textTransform: 'uppercase',
							color: 'var(--muted-foreground)',
							margin: 0,
						}}
					>
						Full-Stack Developer — Building for the web
					</p>
					<span
						style={{
							height: '1px',
							flex: 1,
							minWidth: '60px',
							backgroundColor: 'var(--line-strong)',
							display: 'block',
						}}
					/>
					<span
						style={{
							fontFamily: 'var(--font-mono)',
							fontSize: '0.68rem',
							letterSpacing: '0.12em',
							textTransform: 'uppercase',
							color: 'var(--muted-foreground)',
						}}
					>
						Est. 2021
					</span>
				</div>
			</div>

			<div
				className="animate-fade-up delay-300"
				style={{
					display: 'flex',
					gap: '1rem',
					flexWrap: 'wrap',
					marginTop: '4rem',
				}}
			>
				<a href="#work" className="acid-btn">
					View work
					<ChevronDown aria-hidden="true" className="size-4" />
				</a>
				<Link to="/about" className="ghost-btn">
					About me
					<ArrowRight aria-hidden="true" className="size-4" />
				</Link>
			</div>

			<div
				className="animate-fade-up delay-500 hidden sm:flex"
				style={{
					position: 'absolute',
					bottom: '3rem',
					right: '1.5rem',
					writingMode: 'vertical-rl',
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
					display: 'flex',
					alignItems: 'center',
					gap: '0.75rem',
				}}
			>
				<span
					style={{
						width: '1px',
						height: '60px',
						backgroundColor: 'var(--line-strong)',
						display: 'block',
					}}
				/>
				Scroll
			</div>
		</section>
	)
}

function TickerSection() {
	return (
		<div
			style={{
				borderTop: '1px solid var(--line-strong)',
				borderBottom: '1px solid var(--line-strong)',
				padding: '1rem 0',
				backgroundColor: 'var(--acid)',
				overflow: 'hidden',
			}}
		>
			<div className="ticker-wrap">
				<div className="ticker-track animate-marquee" style={{ gap: 0 }}>
					{TICKER_TRACK_ITEMS.map(({ id, item }) => (
						<span
							key={id}
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.7rem',
								fontWeight: 500,
								letterSpacing: '0.14em',
								textTransform: 'uppercase',
								color: 'var(--void)',
								padding: '0 2rem',
								whiteSpace: 'nowrap',
								display: 'inline-flex',
								alignItems: 'center',
								gap: '2rem',
							}}
						>
							{item}
							<Diamond aria-hidden="true" className="size-2.5" style={{ opacity: 0.4 }} />
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

function WorkSection() {
	return (
		<section id="work" style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem' }}>
			<div
				className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between"
				style={{
					borderBottom: '1px solid var(--line-strong)',
					paddingBottom: '2rem',
					marginBottom: '0',
				}}
			>
				<h2
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(2rem, 5vw, 3.5rem)',
						fontWeight: 700,
						letterSpacing: '-0.02em',
						margin: 0,
					}}
				>
					Selected Work
				</h2>
				<span
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.68rem',
						letterSpacing: '0.14em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
					}}
				>
					{FEATURED_PROJECTS.length} projects
				</span>
			</div>

			<div>
				{FEATURED_PROJECTS.map((project) => (
					<a
						key={project.number}
						href={project.url}
						className="project-row"
						style={{
							display: 'block',
							padding: '2.5rem 0',
							textDecoration: 'none',
						}}
					>
						<div
							className="grid grid-cols-1 gap-4 sm:grid-cols-[3rem_1fr_4rem]"
							style={{
								alignItems: 'start',
							}}
						>
							<span
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.72rem',
									color: 'var(--muted-foreground)',
									letterSpacing: '0.1em',
									paddingTop: '0.5rem',
									paddingLeft: '0.75rem',
								}}
							>
								{project.number}
							</span>

							<div className="flex flex-col gap-3 min-w-0">
								<h3
									style={{
										fontFamily: 'var(--font-display)',
										fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
										fontWeight: 700,
										letterSpacing: '-0.02em',
										margin: 0,
										lineHeight: 1,
									}}
								>
									{project.title}
								</h3>

								<p
									style={{
										fontSize: '0.875rem',
										color: 'var(--muted-foreground)',
										margin: 0,
										maxWidth: '60ch',
									}}
								>
									{project.description}
								</p>

								<div className="flex flex-wrap gap-2">
									{project.tags.map((tag) => (
										<span
											key={tag}
											style={{
												fontFamily: 'var(--font-mono)',
												fontSize: '0.62rem',
												letterSpacing: '0.12em',
												textTransform: 'uppercase',
												color: 'var(--muted-foreground)',
												border: '1px solid var(--line-strong)',
												padding: '0.25rem 0.6rem',
											}}
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							<ArrowUpRight
								aria-hidden="true"
								className="project-arrow hidden size-6 sm:block"
								style={{
									color: 'var(--acid)',
									paddingTop: '0.25rem',
									paddingRight: '1.5rem',
								}}
							/>
						</div>
					</a>
				))}
			</div>
		</section>
	)
}

function AboutTeaser() {
	return (
		<section
			style={{
				borderTop: '1px solid var(--line-strong)',
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '8rem 1.5rem',
			}}
		>
			<div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
				<blockquote
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(1.75rem, 4vw, 3rem)',
						fontWeight: 700,
						letterSpacing: '-0.02em',
						lineHeight: 1.15,
						margin: 0,
						maxWidth: '22ch',
					}}
				>
					"I write code that ships, scales, and doesn't embarrass me six months later."
				</blockquote>

				<Link to="/about" className="ghost-btn w-full shrink-0 justify-center sm:w-auto">
					More about me
					<ArrowRight aria-hidden="true" className="size-4" />
				</Link>
			</div>
		</section>
	)
}

function ContactSection() {
	return (
		<section
			style={{
				borderTop: '1px solid var(--line-strong)',
			}}
		>
			<div
				style={{
					maxWidth: '1200px',
					margin: '0 auto',
					padding: '8rem 1.5rem',
				}}
			>
				<div
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.68rem',
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: 'var(--acid)',
						marginBottom: '2rem',
					}}
				>
					— Let's talk
				</div>

				<h2
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(3rem, 10vw, 9rem)',
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 0.88,
						margin: '0 0 3rem',
						color: 'var(--foreground)',
					}}
				>
					HAVE AN
					<br />
					<span
						style={{
							WebkitTextStroke: '2px var(--foreground)',
							color: 'transparent',
						}}
					>
						IDEA?
					</span>
				</h2>

				<a
					href={`mailto:${USER.EMAIL}`}
					className="acid-btn w-full justify-center sm:w-auto"
					style={{ fontSize: '0.75rem' }}
				>
					{USER.EMAIL}
					<ArrowUpRight aria-hidden="true" className="size-4" />
				</a>
			</div>
		</section>
	)
}

function HomePage() {
	return (
		<>
			<HeroSection />
			<TickerSection />
			<WorkSection />
			<AboutTeaser />
			<ContactSection />
		</>
	)
}
