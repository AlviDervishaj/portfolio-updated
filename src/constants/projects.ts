import type { Project } from '#/types/project.ts'

export const PROJECTS: Project[] = [
	{
		id: 'portfolio',
		name: 'Portfolio',
		description:
			'This site — a production-grade full-stack portfolio built with TanStack Start, Drizzle ORM, BetterAuth, and Cloudflare R2. Features a blog with MDX, comments, reactions, and an admin dashboard.',
		stack: ['TypeScript', 'TanStack Start', 'Drizzle ORM', 'PostgreSQL', 'Tailwind CSS'],
		githubUrl: 'https://github.com/AlviDervishaj/portfolio',
		liveUrl: 'https://alvidervishaj.com',
		featured: true,
		status: 'production',
	},
]
