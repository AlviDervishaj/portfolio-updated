import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import CommentsSection from '#/components/CommentsSection.tsx'
import ReactionBar from '#/components/ReactionBar.tsx'
import ScrollProgress from '#/components/ScrollProgress.tsx'
import { USER } from '#/constants/user'
import { useLenisInstance } from '#/hooks/useLenis'
import { authClient } from '#/lib/auth-client.ts'
import type { TocEntry } from '#/lib/mdx.ts'
import { getPostBySlugServerFn } from '#/server/posts.ts'

type PostPageData = {
	post: {
		id: string
		slug: string
		title: string
		excerpt: string
		content: string
		coverImageKey: string | null
		status: string
		likeCount: number
		dislikeCount: number
		commentCount: number
		publishedAt: Date | string | null
		createdAt: Date | string
		updatedAt: Date | string
	}
	html: string
	readingTimeMinutes: number
	toc: TocEntry[]
	coverImageUrl: string | null
}

export const Route = createFileRoute('/blog/$slug')({
	component: PostPage,
	errorComponent: PostPageError,
	head: ({ loaderData }) => {
		if (!loaderData) return { meta: [{ title: 'Post Not Found' }] }
		const data = loaderData as Record<string, unknown>
		const post = data.post as Record<string, unknown>
		return {
			meta: [
				{ title: `${post.title} — ${USER.FULL_NAME}` },
				{ name: 'description', content: String(post.excerpt ?? '') },
				{ property: 'og:title', content: String(post.title ?? '') },
				{ property: 'og:description', content: String(post.excerpt ?? '') },
				{ property: 'og:type', content: 'article' },
				{ name: 'twitter:card', content: 'summary_large_image' },
			],
		}
	},
	loader: async ({ params }) => {
		const result = await getPostBySlugServerFn({ data: { slug: params.slug } })
		if (!result) throw notFound()
		return result
	},
	notFoundComponent: PostNotFound,
	pendingComponent: PostPageSkeleton,
})

function PostPageError({ error }: { error: Error }) {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-32 text-center">
			<span className="mb-8 block font-mono text-[clamp(4rem,15vw,10rem)] font-bold leading-none text-acid opacity-20">
				err
			</span>
			<p className="mb-3 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground">
				Something went wrong loading this post
			</p>
			{error.message && (
				<p className="mb-10 font-mono text-mono-sm tracking-mono-sm text-muted-foreground opacity-60">
					{error.message}
				</p>
			)}
			<Link to="/blog" className="ghost-btn">
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back to writing
			</Link>
		</main>
	)
}

function PostNotFound() {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-32 text-center">
			<span className="mb-8 block font-mono text-[clamp(4rem,15vw,10rem)] font-bold leading-none text-acid opacity-20">
				404
			</span>
			<p className="mb-8 font-mono text-[0.75rem] uppercase tracking-[0.15em] text-muted-foreground">
				Post not found
			</p>
			<Link to="/blog" className="ghost-btn">
				<ArrowLeft aria-hidden="true" className="size-4" />
				Back to writing
			</Link>
		</main>
	)
}

function PostPageSkeleton() {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<div className="mx-auto max-w-[72ch]">
				<div className="skeleton mb-8 h-4 w-1/5 rounded-sm" />
				<div className="skeleton mb-6 h-16 w-[90%] rounded-sm" />
				<div className="skeleton mb-16 h-4 w-2/5 rounded-sm" />
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="skeleton mb-3 h-4 rounded-sm"
						style={{ width: `${60 + (i % 3) * 15}%` }}
					/>
				))}
			</div>
		</main>
	)
}

function TableOfContents({ entries }: { entries: TocEntry[] }) {
	const [activeId, setActiveId] = useState<string>('')
	const headingElementsRef = useRef<HTMLElement[]>([])
	const lenis = useLenisInstance()

	useEffect(() => {
		headingElementsRef.current = entries
			.map((entry) => document.getElementById(entry.id))
			.filter((el): el is HTMLElement => el !== null)

		const visibleIds = new Set<string>()

		const observer = new IntersectionObserver(
			(observations) => {
				for (const obs of observations) {
					if (obs.isIntersecting) {
						visibleIds.add(obs.target.id)
					} else {
						visibleIds.delete(obs.target.id)
					}
				}

				const firstVisible = headingElementsRef.current.find((el) => visibleIds.has(el.id))
				if (firstVisible) setActiveId(firstVisible.id)
			},
			{ rootMargin: '-56px 0px -60% 0px', threshold: 0 },
		)

		for (const el of headingElementsRef.current) {
			observer.observe(el)
		}

		return () => observer.disconnect()
	}, [entries])

	if (entries.length === 0) return null

	return (
		<nav
			aria-label="Table of contents"
			className="sticky top-20 max-h-[calc(100vh-120px)] overflow-y-auto pr-4"
		>
			<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
				Contents
			</p>
			<ul className="m-0 flex list-none flex-col gap-2 p-0">
				{entries.map((entry) => {
					const isActive = activeId === entry.id
					return (
						<li
							key={entry.id}
							style={
								entry.depth > 2 ? { paddingLeft: `${(entry.depth - 2) * 0.75}rem` } : undefined
							}
						>
							<a
								href={`#${entry.id}`}
								aria-current={isActive ? 'location' : undefined}
								className={`block font-mono text-mono-lg leading-[1.4] tracking-[0.04em] no-underline transition-colors duration-150 ${
									isActive
										? 'font-medium text-acid'
										: 'font-normal text-muted-foreground hover:text-foreground'
								}`}
								onClick={(e) => {
									const target = document.getElementById(entry.id)
									if (target && lenis) {
										e.preventDefault()
										lenis.scrollTo(target, { offset: -80 })
									}
								}}
							>
								{entry.text}
							</a>
						</li>
					)
				})}
			</ul>
		</nav>
	)
}

function PostPage() {
	const loaderData = Route.useLoaderData() as PostPageData | undefined
	const { data: session } = authClient.useSession()
	if (!loaderData) return null
	const { post, html, readingTimeMinutes, toc, coverImageUrl } = loaderData

	const publishedDate = post.publishedAt
		? new Date(post.publishedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'long',
				day: 'numeric',
			})
		: null

	return (
		<>
			<ScrollProgress />
			<main className="mx-auto max-w-[1200px] px-6 py-24">
				<div
					className={`grid items-start ${
						toc.length > 0 ? 'grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]' : 'grid-cols-1'
					}`}
				>
					<article>
						<header className="mb-16">
							<Link
								to="/blog"
								className="mb-10 inline-flex items-center gap-2 font-mono text-mono-sm uppercase tracking-[0.15em] text-muted-foreground no-underline transition-colors duration-150 hover:text-acid"
							>
								<ArrowLeft aria-hidden="true" className="size-4" />
								Writing
							</Link>

							<h1 className="mb-6 mt-0 font-display text-[clamp(2rem,5vw,3.5rem)] font-bold leading-[1.05] tracking-display-tight">
								{post.title}
							</h1>

							<p className="mb-8 mt-0 max-w-[60ch] text-[1.05rem] leading-[1.65] text-muted-foreground">
								{post.excerpt}
							</p>

							<div className="flex flex-wrap items-center gap-4 border-y border-line-strong py-4 font-mono text-mono-sm uppercase tracking-mono-md text-muted-foreground sm:gap-6">
								{publishedDate && <span>{publishedDate}</span>}
								<span>{readingTimeMinutes} min read</span>
								<span className="flex items-center gap-1.5">
									<Heart aria-hidden="true" className="size-3.5 text-acid" />
									{post.likeCount}
								</span>
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

						<div id="reactions" className="mt-20 border-t border-line-strong pt-12">
							<ReactionBar
								postId={post.id}
								initialLikeCount={post.likeCount}
								initialDislikeCount={post.dislikeCount}
							/>
						</div>

						<div id="comments" className="mt-16 border-t border-line-strong pt-12">
							<CommentsSection
								postId={post.id}
								currentUserId={session?.user?.id}
								currentUserName={session?.user?.name}
							/>
						</div>
					</article>

					{toc.length > 0 && (
						<aside className="hidden lg:block">
							<TableOfContents entries={toc} />
						</aside>
					)}
				</div>
			</main>
		</>
	)
}
