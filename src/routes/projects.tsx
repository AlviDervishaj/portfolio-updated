import { createFileRoute } from '@tanstack/react-router'
import { ExternalLink, Github } from 'lucide-react'
import { useState } from 'react'
import { PROJECTS } from '#/constants/projects.ts'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { i18next } from '#/lib/i18n'
import type { Project, ProjectStatus } from '#/types/project.ts'

const STATUS_LABELS: Record<ProjectStatus, string> = {
	production: i18next.t('portfolio.liveStatus'),
	archived: 'Archived',
	wip: 'In progress',
	local: i18next.t('portfolio.localStatus'),
}

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

const STATUS_CLASS_NAMES: Record<ProjectStatus, string> = {
	production: 'text-acid',
	wip: 'text-[oklch(0.75_0.15_55)]',
	local: 'text-acid',
	archived: 'text-muted-foreground',
}

const getStatusClassNames = (status: ProjectStatus) => {
	return STATUS_CLASS_NAMES[status] || 'text-muted-foreground'
}

function ProjectCard({ project }: Readonly<{ project: Project }>) {
	return (
		<article
			id={project.id}
			className="scroll-mt-24 flex flex-col gap-4 border border-line-strong p-6 transition-colors duration-150 hover:border-acid-border"
		>
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex flex-col gap-1">
					<h2 className="m-0 font-display text-[1.1rem] font-bold tracking-display-tight">
						{project.name}
					</h2>
					<span
						className={`font-mono text-[0.6rem] uppercase tracking-mono-md ${getStatusClassNames(
							project.status,
						)}`}
					>
						{STATUS_LABELS[project.status]}
					</span>
				</div>
				<div className="flex shrink-0 flex-wrap items-center gap-3">
					{project.githubUrl && (
						<a
							href={project.githubUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={i18next.t('portfolio.viewSourceLabel', { name: project.name })}
							className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-150 hover:text-acid"
						>
							<Github aria-hidden="true" className="size-4" />
							<span className="text-xs">{i18next.t('portfolio.viewSource')}</span>
						</a>
					)}
					{project.liveUrl && (
						<a
							href={project.liveUrl}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={i18next.t('portfolio.viewLiveLabel', { name: project.name })}
							className="inline-flex items-center gap-2 text-muted-foreground transition-colors duration-150 hover:text-acid"
						>
							<ExternalLink aria-hidden="true" className="size-4" />
							<span className="text-xs">{i18next.t('portfolio.viewLive')}</span>
						</a>
					)}
				</div>
			</div>

			<p className="m-0 text-[0.875rem] leading-[1.6] text-muted-foreground">
				{i18next.t(project.description)}
			</p>

			<dl className="m-0 flex flex-col gap-5">
				{(project.featured
					? (['problem', 'contribution', 'decisions', 'evidence'] as const)
					: (['decisions', 'evidence'] as const)
				).map((section) => (
					<div key={section}>
						<dt className="mb-2 font-mono text-mono-xs uppercase tracking-mono text-acid">
							{i18next.t(`portfolio.${section}`)}
						</dt>
						<dd className="m-0 text-sm leading-relaxed text-muted-foreground">
							{i18next.t(project[section])}
						</dd>
					</div>
				))}
			</dl>
			{project.walkthrough && (
				<div>
					<h3 className="text-base font-bold">{i18next.t('portfolio.walkthrough')}</h3>
					<p className="text-sm leading-relaxed text-muted-foreground">
						{i18next.t('portfolio.walkthroughNote')}
					</p>
					<pre className="overflow-x-auto border border-line-strong p-4 text-xs leading-relaxed">
						<code>{project.walkthrough}</code>
					</pre>
				</div>
			)}

			{project.stack.length > 0 && (
				<div className="flex flex-wrap gap-1.5">
					{project.stack.map((tech) => (
						<span
							key={tech}
							className="border border-line-strong px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-mono-md text-muted-foreground"
						>
							{tech}
						</span>
					))}
				</div>
			)}
		</article>
	)
}

export function ProjectsPage() {
	const allStacks = Array.from(new Set(PROJECTS.flatMap((p) => p.stack))).sort()
	const [activeStack, setActiveStack] = useState<string | null>(null)

	const filtered = activeStack ? PROJECTS.filter((p) => p.stack.includes(activeStack)) : PROJECTS

	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<div className="mb-16">
				<h1 className="animate-fade-up mb-4 mt-0 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-display-tighter">
					Projects
				</h1>
				<p className="m-0 font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
					{filtered.length} {filtered.length === 1 ? 'project' : 'projects'}
				</p>
			</div>

			{allStacks.length > 0 && (
				<div className="mb-8 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={() => setActiveStack(null)}
						className={`cursor-pointer border px-3 py-1.5 font-mono text-mono-sm uppercase tracking-mono-md transition-all duration-150 ${
							activeStack === null
								? 'border-acid bg-acid text-on-acid'
								: 'border-transparent bg-transparent text-muted-foreground'
						}`}
					>
						All
					</button>
					{allStacks.map((tech) => (
						<button
							key={tech}
							type="button"
							onClick={() => setActiveStack(activeStack === tech ? null : tech)}
							className={`cursor-pointer border px-3 py-1.5 font-mono text-mono-sm uppercase tracking-mono-md transition-all duration-150 ${
								activeStack === tech
									? 'border-acid bg-acid text-on-acid'
									: 'border-transparent bg-transparent text-muted-foreground'
							}`}
						>
							{tech}
						</button>
					))}
				</div>
			)}

			{filtered.length === 0 ? (
				<p className="py-20 text-center font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
					No projects match this filter.
				</p>
			) : (
				<div className="flex max-w-[900px] flex-col gap-8">
					{filtered.map((project) => (
						<ProjectCard key={project.id} project={project} />
					))}
				</div>
			)}
		</main>
	)
}
