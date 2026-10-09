import { createFileRoute } from '@tanstack/react-router'
import { ProjectsPage } from '#/components/ProjectsPage'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'

export const Route = createFileRoute('/projects')({
	component: ProjectsPage,
	head: () => ({
		meta: [
			{ title: `Projects — ${USER.FULL_NAME}` },
			{ name: 'description', content: "A collection of projects I've built." },
			{ property: 'og:title', content: `Projects — ${USER.FULL_NAME}` },
			{ property: 'og:description', content: "A collection of projects I've built." },
			{ property: 'og:url', content: `${env.VITE_APP_URL}/projects` },
			{ property: 'og:image', content: `${env.VITE_APP_URL}/api/og?title=Projects&type=page` },
			{ name: 'twitter:card', content: 'summary_large_image' },
		],
		links: [{ rel: 'canonical', href: `${env.VITE_APP_URL}/projects` }],
	}),
})
