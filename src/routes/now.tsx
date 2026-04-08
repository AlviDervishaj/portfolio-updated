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
		<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<header style={{ marginBottom: '5rem' }}>
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
					— Now
				</p>
				<h1
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(2.5rem, 7vw, 5rem)',
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 0.95,
						margin: 0,
					}}
				>
					What I'm
					<br />
					<span className="text-stroke">up to</span>
				</h1>
			</header>

			<div
				style={{
					display: 'grid',
					gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
					gap: '3rem',
					maxWidth: '900px',
				}}
			>
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

			<div
				style={{
					marginTop: '6rem',
					borderTop: '1px solid var(--line-strong)',
					paddingTop: '2rem',
					fontFamily: 'var(--font-mono)',
					fontSize: '0.65rem',
					letterSpacing: '0.1em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
				}}
			>
				Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' })} —
				inspired by{' '}
				<a
					href="https://nownownow.com"
					target="_blank"
					rel="noreferrer"
					style={{ color: 'var(--acid)', textDecoration: 'none' }}
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
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.18em',
					textTransform: 'uppercase',
					color: 'var(--acid)',
					marginBottom: '1rem',
				}}
			>
				{label}
			</p>
			<ul
				style={{
					listStyle: 'none',
					padding: 0,
					margin: 0,
					display: 'flex',
					flexDirection: 'column',
					gap: '0.6rem',
				}}
			>
				{items.map((item) => (
					<li
						key={item}
						style={{
							fontSize: '0.9375rem',
							lineHeight: 1.55,
							color: 'var(--foreground)',
							display: 'flex',
							alignItems: 'flex-start',
							gap: '0.75rem',
						}}
					>
						<Diamond
							aria-hidden="true"
							className="size-3"
							style={{ color: 'var(--acid)', flexShrink: 0, marginTop: '0.1rem' }}
						/>
						{item}
					</li>
				))}
			</ul>
		</div>
	)
}
