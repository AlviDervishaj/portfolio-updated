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
import { LenisContext, useLenisSetup } from '../hooks/useLenis'
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

function RootErrorComponent({ error }: Readonly<ErrorComponentProps>) {
	return (
		<main className="mx-auto max-w-300 px-6 py-32 text-center">
			<span className="mb-8 block font-mono text-[clamp(4rem,15vw,10rem)] font-bold leading-none text-accent-strong opacity-20">
				500
			</span>
			<p className="mb-4 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground">
				An unexpected error occurred
			</p>
			<p className="mb-8 font-mono text-mono-lg text-muted-foreground opacity-60">
				{error.message}
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
			<span className="font-mono text-[clamp(4rem,15vw,10rem)] font-bold leading-none text-accent-strong opacity-20">
				404
			</span>
			<p className="font-mono text-sm uppercase tracking-widest text-muted-foreground">
				Page not found
			</p>
			<a
				href="/"
				className="mt-4 font-mono text-xs uppercase tracking-widest text-foreground underline underline-offset-4 hover:text-accent-strong"
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

function RootDocument({ children }: Readonly<{ children: React.ReactNode }>) {
	const lenis = useLenisSetup()

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
				className="font-sans antialiased wrap-anywhere selection:bg-acid selection:text-on-acid"
				suppressHydrationWarning
			>
				<LenisContext value={lenis}>
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
				</LenisContext>
			</body>
		</html>
	)
}
