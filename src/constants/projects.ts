import type { Project } from '#/types/project.ts'

export const PROJECTS: Project[] = [
	{
		id: 'rite-electric',
		name: 'Rite Electric',
		description: 'portfolio.projects.rite-electric.description',
		problem: 'portfolio.projects.rite-electric.problem',
		contribution: 'portfolio.projects.rite-electric.contribution',
		decisions: 'portfolio.projects.rite-electric.decisions',
		evidence: 'portfolio.projects.rite-electric.evidence',
		stack: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'],
		liveUrl: 'https://www.riteelectricllc.com',
		featured: true,
		status: 'production',
	},
	{
		id: 'junior-assistant',
		name: 'Junior Assistant',
		description: 'portfolio.projects.junior-assistant.description',
		problem: 'portfolio.projects.junior-assistant.problem',
		contribution: 'portfolio.projects.junior-assistant.contribution',
		decisions: 'portfolio.projects.junior-assistant.decisions',
		evidence: 'portfolio.projects.junior-assistant.evidence',
		stack: ['Go', 'macOS'],
		githubUrl: 'https://github.com/AlviDervishaj/junior-assistant',
		featured: true,
		status: 'local',
		walkthrough: `assistant task add "Fix login after sleep" --type bug --planned "$(date +%F)"
assistant task log 42 "Only happens after the Mac wakes up"
assistant task log 42 "Next: check session expiry"
assistant today
assistant task show 42`,
	},
	{
		id: 'portfolio',
		name: 'Portfolio',
		description: 'portfolio.projects.portfolio.description',
		problem: 'portfolio.projects.portfolio.problem',
		contribution: 'portfolio.projects.portfolio.contribution',
		decisions: 'portfolio.projects.portfolio.decisions',
		evidence: 'portfolio.projects.portfolio.evidence',
		stack: [
			'TypeScript',
			'TanStack Start',
			'Drizzle ORM',
			'PostgreSQL',
			'BetterAuth',
			'Cloudflare R2',
			'Tailwind CSS',
		],
		githubUrl: 'https://github.com/AlviDervishaj/Portfolio',
		liveUrl: 'https://shunger.dev',
		featured: false,
		status: 'wip',
	},
]
