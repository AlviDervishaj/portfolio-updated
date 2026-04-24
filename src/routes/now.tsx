import { createFileRoute } from '@tanstack/react-router'
import { Diamond } from 'lucide-react'
import { USER } from '#/constants/user'

export const Route = createFileRoute('/now')({
	component: NowPage,
	head: () => ({
		meta: [
			{ title: `Now — ${USER.FULL_NAME}` },
			{
				name: 'description',
				content: "What I'm currently working on, reading, and thinking about.",
			},
		],
	}),
})

function NowPage() {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<header className="mb-20">
				<p className="mb-6 font-mono text-mono-md uppercase tracking-mono-lg text-acid">— Now</p>
				<h1 className="m-0 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-display-tighter">
					What I'm
					<br />
					<span className="text-stroke">up to</span>
				</h1>
			</header>

			<div className="grid max-w-[900px] grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-12">
				<NowSection
					label="Building"
					items={[
						'This portfolio — TanStack Start, Drizzle, BetterAuth',
						'Exploring AI tooling integrations',
					]}
				/>
				<NowSection
					label="Reading"
					items={['The Pragmatic Programmer', 'Technical writing on distributed systems']}
				/>
				<NowSection
					label="Thinking about"
					items={[
						'Full-stack type safety patterns',
						'Developer experience improvements',
						'Edge computing trade-offs',
					]}
				/>
				<NowSection label="Location" items={['Remote — available worldwide']} />
			</div>

			<div className="mt-24 border-t border-line-strong pt-8 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground">
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} —
				inspired by{' '}
				<a
					href="https://nownownow.com"
					target="_blank"
					rel="noreferrer"
					className="text-acid no-underline"
				>
					nownownow.com
				</a>
			</div>
		</main>
	)
}

function NowSection({ label, items }: { label: string; items: string[] }) {
	return (
		<div>
			<p className="mb-4 font-mono text-mono-xs uppercase tracking-[0.18em] text-acid">{label}</p>
			<ul className="m-0 flex list-none flex-col gap-2.5 p-0">
				{items.map((item) => (
					<li
						key={item}
						className="flex items-start gap-3 text-[0.9375rem] leading-[1.55] text-foreground"
					>
						<Diamond aria-hidden="true" className="mt-0.5 size-3 shrink-0 text-acid" />
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}
