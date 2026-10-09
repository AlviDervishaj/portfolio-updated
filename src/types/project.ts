export type ProjectStatus = 'production' | 'archived' | 'wip' | 'local'

export type Project = {
	id: string
	name: string
	description: string
	problem: string
	contribution: string
	decisions: string
	evidence: string
	walkthrough?: string
	stack: string[]
	githubUrl?: string
	liveUrl?: string
	featured: boolean
	status: ProjectStatus
}
