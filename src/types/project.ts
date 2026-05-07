export type ProjectStatus = 'production' | 'archived' | 'wip'

export type Project = {
	id: string
	name: string
	description: string
	stack: string[]
	githubUrl?: string
	liveUrl?: string
	featured: boolean
	status: ProjectStatus
}
