import { createFileRoute } from '@tanstack/react-router'
import { ContactPage } from '#/components/ContactPage'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { i18next } from '#/lib/i18n'

export const Route = createFileRoute('/contact')({
	component: ContactPage,
	head: () => ({
		meta: [
			{ title: `Contact — ${USER.FULL_NAME}` },
			{ name: 'description', content: i18next.t('portfolio.cta') },
			{ property: 'og:title', content: `Contact — ${USER.FULL_NAME}` },
			{ property: 'og:description', content: i18next.t('portfolio.cta') },
			{ property: 'og:url', content: `${env.VITE_APP_URL}/contact` },
			{ property: 'og:image', content: `${env.VITE_APP_URL}/api/og?title=Contact&type=page` },
			{ name: 'twitter:card', content: 'summary_large_image' },
		],
		links: [{ rel: 'canonical', href: `${env.VITE_APP_URL}/contact` }],
	}),
})
