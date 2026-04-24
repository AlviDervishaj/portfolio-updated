import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, ArrowUpRight, ChevronDown, Diamond, Github, Twitter } from 'lucide-react'
import { USER } from '#/constants/user'
import { useLenisInstance } from '#/hooks/useLenis'

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
	const lenis = useLenisInstance()

	function scrollToWork() {
		const target = document.getElementById('work')
		if (target) lenis?.scrollTo(target)
	}

	return (
		<section className="relative mx-auto flex min-h-[calc(100vh-56px)] max-w-[1200px] flex-col justify-between overflow-hidden px-6 pb-12 pt-16">
			<div className="animate-fade-in flex items-center gap-2 font-mono text-mono-md uppercase tracking-mono-lg text-muted-foreground">
				<span
					aria-hidden="true"
					className="animate-blink inline-block size-1.5 rounded-full bg-acid shadow-[0_0_8px_var(--acid)]"
				/>
				Available for work
			</div>

			<div className="mt-12 flex flex-col gap-6">
				<h1 className="animate-fade-up m-0 font-display text-[clamp(4.5rem,16vw,14rem)] font-bold leading-[0.9] tracking-display-tighter">
					ALVI
					<br />
					<span className="text-stroke animate-fade-up delay-100">DERVISHAJ</span>
				</h1>

				<div className="animate-fade-up delay-200 flex flex-wrap items-center gap-6">
					<p className="m-0 font-mono text-[clamp(0.75rem,1.5vw,0.9rem)] uppercase tracking-[0.06em] text-muted-foreground">
						Full-Stack Developer — Building for the web
					</p>
					<span aria-hidden="true" className="block h-px flex-1 min-w-[60px] bg-line-strong" />
					<span className="font-mono text-mono-md uppercase tracking-mono text-muted-foreground">
						Est. 2021
					</span>
				</div>
			</div>

			<div className="animate-fade-up delay-300 mt-16 flex flex-wrap gap-4">
				<button type="button" onClick={scrollToWork} className="acid-btn">
					View work
					<ChevronDown aria-hidden="true" className="size-4" />
				</button>
				<Link to="/about" className="ghost-btn">
					About me
					<ArrowRight aria-hidden="true" className="size-4" />
				</Link>
			</div>

			<div className="animate-fade-up delay-500 absolute bottom-12 right-6 hidden items-center gap-3 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground [writing-mode:vertical-rl] sm:flex">
				<span aria-hidden="true" className="block h-[60px] w-px bg-line-strong" />
				Scroll
			</div>
		</section>
	)
}

function TickerSection() {
	return (
		<div className="overflow-hidden border-y border-line-strong bg-acid py-4">
			<div className="ticker-wrap">
				<div className="ticker-track animate-marquee gap-0">
					{TICKER_TRACK_ITEMS.map(({ id, item }) => (
						<span
							key={id}
							className="inline-flex items-center gap-8 whitespace-nowrap px-8 font-mono text-mono-lg font-medium uppercase tracking-mono-md text-on-acid"
						>
							{item}
							<Diamond aria-hidden="true" className="size-2.5 opacity-40" />
						</span>
					))}
				</div>
			</div>
		</div>
	)
}

function WorkSection() {
	return (
		<section id="work" className="mx-auto max-w-[1200px] px-6 py-32">
			<div className="flex flex-col gap-3 border-b border-line-strong pb-8 sm:flex-row sm:items-end sm:justify-between">
				<h2 className="m-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold tracking-display-tight">
					Selected Work
				</h2>
				<span className="font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground">
					{FEATURED_PROJECTS.length} projects
				</span>
			</div>

			<div>
				{FEATURED_PROJECTS.map((project) => (
					<a
						key={project.number}
						href={project.url}
						className="project-row block py-10 no-underline"
					>
						<div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[3rem_1fr_4rem]">
							<span className="pl-3 pt-2 font-mono text-[0.72rem] tracking-mono text-muted-foreground">
								{project.number}
							</span>

							<div className="flex min-w-0 flex-col gap-3">
								<h3 className="m-0 font-display text-[clamp(1.5rem,3.5vw,2.5rem)] font-bold leading-none tracking-display-tight">
									{project.title}
								</h3>

								<p className="m-0 max-w-[60ch] text-sm text-muted-foreground">
									{project.description}
								</p>

								<div className="flex flex-wrap gap-2">
									{project.tags.map((tag) => (
										<span
											key={tag}
											className="border border-line-strong px-2.5 py-1 font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground"
										>
											{tag}
										</span>
									))}
								</div>
							</div>

							<ArrowUpRight
								aria-hidden="true"
								className="project-arrow hidden size-6 pr-6 pt-1 text-acid sm:block"
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
		<section className="mx-auto max-w-[1200px] border-t border-line-strong px-6 py-32">
			<div className="flex flex-col gap-10 sm:flex-row sm:items-end sm:justify-between">
				<blockquote className="m-0 max-w-[22ch] font-display text-[clamp(1.75rem,4vw,3rem)] font-bold leading-[1.15] tracking-display-tight">
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
		<section className="relative overflow-hidden border-t border-line-strong">
			<span
				aria-hidden="true"
				className="absolute right-6 top-0 block h-24 w-px bg-acid opacity-55"
			/>

			<div className="mx-auto max-w-[1200px] px-6 py-36">
				<div className="mb-10 inline-flex items-center gap-3 font-mono text-mono-lg uppercase tracking-[0.22em] text-muted-foreground">
					<span aria-hidden="true" className="inline-block size-[0.55rem] rotate-45 bg-acid" />
					Let's talk
					<span aria-hidden="true" className="inline-block h-px w-10 bg-line-strong" />
				</div>

				<h2 className="mb-8 mt-0 font-display text-[clamp(3rem,10vw,9rem)] font-bold leading-[0.88] tracking-display-tighter text-foreground">
					HAVE AN
					<br />
					<span className="text-stroke-heavy">IDEA?</span>
				</h2>

				<p className="mb-14 mt-0 max-w-[38ch] font-sans text-[clamp(1rem,1.6vw,1.15rem)] leading-[1.55] text-muted-foreground">
					Open to freelance projects, full-stack collaborations, and full-time roles. Drop a line —
					I read everything.
				</p>

				<div className="mb-16 flex flex-wrap items-center gap-3">
					<a
						href={`mailto:${USER.EMAIL}`}
						className="acid-btn w-full justify-center text-[0.75rem] sm:w-auto"
					>
						{USER.EMAIL}
						<ArrowUpRight aria-hidden="true" className="size-4" />
					</a>

					<a
						href={USER.GITHUB_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="GitHub"
						className="ghost-btn justify-center px-[1.1rem] py-3.5"
					>
						<Github aria-hidden="true" className="size-4" />
					</a>

					<a
						href={USER.X_URL}
						target="_blank"
						rel="noreferrer"
						aria-label="X (Twitter)"
						className="ghost-btn justify-center px-[1.1rem] py-3.5"
					>
						<Twitter aria-hidden="true" className="size-4" />
					</a>
				</div>

				<div className="flex flex-wrap items-center gap-6 border-t border-line-strong pt-8 font-mono text-mono-md uppercase tracking-mono-md text-muted-foreground">
					<span className="inline-flex items-center gap-2">
						<span aria-hidden="true" className="relative inline-block size-2 rounded-full bg-acid">
							<span
								aria-hidden="true"
								className="animate-blink-slow absolute inset-0 rounded-full bg-acid opacity-55"
							/>
						</span>
						Available for new work
					</span>
					<span aria-hidden="true">·</span>
					<span>{USER.LOCATION}</span>
					<span aria-hidden="true">·</span>
					<span>Replies within 24h</span>
				</div>
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
