import type { QueryClient } from '@tanstack/react-query'
import {
	createRootRouteWithContext,
	type ErrorComponentProps,
	HeadContent,
	Scripts,
} from '@tanstack/react-router'
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/react'
import { ArrowLeft } from 'lucide-react'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import Footer from '../components/Footer'
import Header from '../components/Header'
import appCss from '../styles.css?url'

const TanStackDevtools = import.meta.env.DEV
	? (await import('@tanstack/react-devtools')).TanStackDevtools
	: () => null

const TanStackRouterDevtoolsPanel = import.meta.env.DEV
	? (await import('@tanstack/react-router-devtools')).TanStackRouterDevtoolsPanel
	: () => null

const TanStackQueryDevtools = import.meta.env.DEV
	? (await import('../integrations/tanstack-query/devtools')).default
	: null

interface MyRouterContext {
	queryClient: QueryClient
}

const THEME_INIT_SCRIPT = `(function(){try{var stored=window.localStorage.getItem('theme');var mode=(stored==='light'||stored==='dark'||stored==='auto')?stored:'auto';var prefersDark=window.matchMedia('(prefers-color-scheme: dark)').matches;var resolved=mode==='auto'?(prefersDark?'dark':'light'):mode;var root=document.documentElement;root.classList.remove('light','dark');root.classList.add(resolved);if(mode==='auto'){root.removeAttribute('data-theme')}else{root.setAttribute('data-theme',mode)}root.style.colorScheme=resolved;}catch(e){}})();`

function RootErrorComponent({ error }: ErrorComponentProps) {
	const message = error instanceof Error ? error.message : 'Something went wrong'
	return (
		<main
			style={{
				maxWidth: '1200px',
				margin: '0 auto',
				padding: '8rem 1.5rem',
				textAlign: 'center',
			}}
		>
			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: 'clamp(4rem, 15vw, 10rem)',
					fontWeight: 700,
					lineHeight: 1,
					color: 'var(--acid)',
					opacity: 0.2,
					display: 'block',
					marginBottom: '2rem',
				}}
			>
				500
			</span>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.75rem',
					letterSpacing: '0.15em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
					marginBottom: '1rem',
				}}
			>
				An unexpected error occurred
			</p>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.7rem',
					color: 'var(--muted-foreground)',
					opacity: 0.6,
					marginBottom: '2rem',
				}}
			>
				{message}
			</p>
			<a href="/" className="ghost-btn">
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back home
			</a>
		</main>
	)
}

function NotFound() {
	return (
		<main className="flex min-h-[60vh] flex-col items-center justify-center gap-4">
			<span className="font-mono text-[clamp(4rem,15vw,10rem)] font-bold leading-none text-[var(--acid)] opacity-20">
				404
			</span>
			<p className="font-mono text-sm uppercase tracking-widest text-[var(--ink-muted)]">
				Page not found
			</p>
			<a
				href="/"
				className="mt-4 font-mono text-xs uppercase tracking-widest text-[var(--ink)] underline underline-offset-4 hover:text-[var(--acid)]"
			>
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back home
			</a>
		</main>
	)
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
	head: () => ({
		meta: [
			{ charSet: 'utf-8' },
			{ name: 'viewport', content: 'width=device-width, initial-scale=1' },
			{ title: `${USER.FULL_NAME} — ${USER.POSITION}` },
			{
				name: 'description',
				content:
					'Full-stack developer building for the web with TypeScript, React, and PostgreSQL.',
			},
		],
		links: [
			{ rel: 'stylesheet', href: appCss },
			{
				rel: 'alternate',
				type: 'application/rss+xml',
				title: `Writing - ${USER.FULL_NAME}`,
				href: '/api/rss',
			},
		],
	}),
	errorComponent: RootErrorComponent,
	notFoundComponent: NotFound,
	shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<script
					// biome-ignore lint/security/noDangerouslySetInnerHtml: static inline script to prevent theme flash before hydration
					dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }}
				/>
				<HeadContent />
				{env.VITE_UMAMI_URL && env.VITE_UMAMI_WEBSITE_ID && (
					<script
						defer
						src={`${env.VITE_UMAMI_URL}/script.js`}
						data-website-id={env.VITE_UMAMI_WEBSITE_ID}
					/>
				)}
			</head>
			<body
				className="font-sans antialiased [overflow-wrap:anywhere] selection:bg-[var(--acid)] selection:text-[var(--void)]"
				suppressHydrationWarning
			>
				<Header />
				{children}
				<Footer />
				{import.meta.env.DEV && (
					<TanStackDevtools
						config={{ position: 'bottom-right' }}
						plugins={[
							{ name: 'Tanstack Router', render: <TanStackRouterDevtoolsPanel /> },
							...(TanStackQueryDevtools ? [TanStackQueryDevtools] : []),
						]}
					/>
				)}
				<Scripts />
				<Analytics />
				<SpeedInsights />
			</body>
		</html>
	)
}
