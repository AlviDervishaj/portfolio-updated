import { createFileRoute, notFound } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import type { TocEntry } from '#/lib/mdx.ts'
import { getDraftByTokenServerFn } from '#/server/draftTokens.ts'
import type { PostDetail } from '#/services/posts.ts'

type PreviewPageData = {
	post: PostDetail
	html: string
	readingTimeMinutes: number
	toc: TocEntry[]
	coverImageUrl: string | null
}

export const Route = createFileRoute('/preview/$token')({
	component: PreviewPage,
	head: () => ({
		meta: [{ name: 'robots', content: 'noindex,nofollow' }, { title: 'Draft Preview' }],
	}),
	loader: async ({ params }) => {
		const token = (params as Record<string, string>).token ?? ''
		const result = await getDraftByTokenServerFn({ data: { token } })
		if (!result) throw notFound()
		return result
	},
})

function PreviewPage() {
	const { post, html, readingTimeMinutes, toc, coverImageUrl } =
		Route.useLoaderData() as PreviewPageData

	const publishedDate = post.publishedAt
		? new Date(post.publishedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		: null

	return (
		<main className="mx-auto max-w-300 px-6 py-24">
			<div className="mx-auto mb-8 max-w-[72ch] border border-[oklch(0.75_0.15_55)] bg-[oklch(0.75_0.15_55)]/10 px-4 py-3">
				<p className="m-0 font-mono text-[0.7rem] uppercase tracking-mono-md text-[oklch(0.75_0.15_55)]">
					Draft preview — not published
				</p>
			</div>

			<div
				className={`grid items-start ${
					toc.length > 0 ? 'grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]' : 'grid-cols-1'
				}`}
			>
				<article>
					<header className="mb-16">
						<a
							href="/admin/posts"
							className="mb-10 inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-[0.15em] text-muted-foreground no-underline transition-colors duration-150 hover:text-acid"
						>
							<ArrowLeft aria-hidden="true" className="size-4" />
							Admin
						</a>

						<h1 className="mb-6 mt-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-display-tight">
							{post.title}
						</h1>

						<p className="mb-8 mt-0 max-w-[60ch] text-[1.05rem] leading-[1.65] text-muted-foreground">
							{post.excerpt}
						</p>

						<div className="flex flex-wrap items-center gap-4 border-y border-line-strong py-4 font-mono text-mono-sm uppercase tracking-mono-md text-muted-foreground sm:gap-6">
							{publishedDate && <span>{publishedDate}</span>}
							<span>{readingTimeMinutes} min read</span>
							<span className="font-medium text-[oklch(0.75_0.15_55)]">{post.status}</span>
						</div>

						{coverImageUrl && (
							<figure className="m-0 mt-12">
								<img
									src={coverImageUrl}
									alt={post.title}
									className="block aspect-video w-full border border-line-strong object-cover"
								/>
							</figure>
						)}
					</header>

					<div
						className="prose"
						// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted HTML generated on the server from MDX pipeline
						dangerouslySetInnerHTML={{ __html: html }}
					/>
				</article>

				{toc.length > 0 && (
					<aside className="sticky top-24 hidden max-h-[calc(100vh-8rem)] overflow-y-auto lg:block">
						<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
							On this page
						</p>
						<ul className="m-0 flex list-none flex-col gap-2 p-0">
							{toc.map((entry) => (
								<li
									key={entry.id}
									style={
										entry.depth > 2 ? { paddingLeft: `${(entry.depth - 2) * 0.75}rem` } : undefined
									}
								>
									<a
										href={`#${entry.id}`}
										className="block font-mono text-mono-lg leading-[1.4] tracking-[0.04em] text-muted-foreground no-underline transition-colors duration-150 hover:text-foreground"
									>
										{entry.text}
									</a>
								</li>
							))}
						</ul>
					</aside>
				)}
			</div>
		</main>
	)
}
