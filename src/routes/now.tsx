import { createFileRoute } from '@tanstack/react-router'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { i18next } from '#/lib/i18n'

const NOW_DESCRIPTION = "What I'm currently working on, reading, and thinking about."

export const Route = createFileRoute('/now')({
	component: NowPage,
	head: () => ({
		meta: [
			{ title: `Now — ${USER.FULL_NAME}` },
			{ name: 'description', content: NOW_DESCRIPTION },
			{ property: 'og:title', content: `Now — ${USER.FULL_NAME}` },
			{ property: 'og:url', content: `${env.VITE_APP_URL}/now` },
			{ property: 'og:image', content: `${env.VITE_APP_URL}/api/og?title=Now&type=page` },
			{ name: 'twitter:card', content: 'summary_large_image' },
		],
		links: [{ rel: 'canonical', href: `${env.VITE_APP_URL}/now` }],
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

			<p className="max-w-[60ch] text-base leading-relaxed text-muted-foreground">
				{i18next.t('portfolio.nowPending')}
			</p>

			<div className="mt-24 border-t border-line-strong pt-8 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground">
				{i18next.t('portfolio.nowDate')} — inspired by{' '}
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
