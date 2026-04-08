import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { ArrowLeft, Heart } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

import CommentsSection from '#/components/CommentsSection.tsx'
import ReactionBar from '#/components/ReactionBar.tsx'
import ScrollProgress from '#/components/ScrollProgress.tsx'
import { USER } from '#/constants/user'
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
		<main
			style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem', textAlign: 'center' }}
		>
			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: 'clamp(4rem, 15vw, 10rem)',
					fontWeight: 700,
					lineHeight: 1,
					color: 'var(--acid)',
					opacity: 0.2,
					display: 'block',
					marginBottom: '2rem',
				}}
			>
				err
			</span>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.75rem',
					letterSpacing: '0.15em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
					marginBottom: '0.75rem',
				}}
			>
				Something went wrong loading this post
			</p>
			{error.message && (
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.65rem',
						letterSpacing: '0.08em',
						color: 'var(--muted-foreground)',
						opacity: 0.6,
						marginBottom: '2.5rem',
					}}
				>
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
		<main
			style={{ maxWidth: '1200px', margin: '0 auto', padding: '8rem 1.5rem', textAlign: 'center' }}
		>
			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: 'clamp(4rem, 15vw, 10rem)',
					fontWeight: 700,
					lineHeight: 1,
					color: 'var(--acid)',
					opacity: 0.2,
					display: 'block',
					marginBottom: '2rem',
				}}
			>
				404
			</span>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.75rem',
					letterSpacing: '0.15em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
					marginBottom: '2rem',
				}}
			>
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
		<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<div style={{ maxWidth: '72ch', margin: '0 auto' }}>
				<div
					className="skeleton"
					style={{ height: '1rem', width: '20%', borderRadius: '2px', marginBottom: '2rem' }}
				/>
				<div
					className="skeleton"
					style={{ height: '4rem', width: '90%', borderRadius: '2px', marginBottom: '1.5rem' }}
				/>
				<div
					className="skeleton"
					style={{ height: '1rem', width: '40%', borderRadius: '2px', marginBottom: '4rem' }}
				/>
				{[1, 2, 3, 4, 5].map((i) => (
					<div
						key={i}
						className="skeleton"
						style={{
							height: '1rem',
							width: `${60 + (i % 3) * 15}%`,
							borderRadius: '2px',
							marginBottom: '0.75rem',
						}}
					/>
				))}
			</div>
		</main>
	)
}

function TableOfContents({ entries }: { entries: TocEntry[] }) {
	const [activeId, setActiveId] = useState<string>('')
	const headingElementsRef = useRef<HTMLElement[]>([])

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
			style={{
				position: 'sticky',
				top: '80px',
				maxHeight: 'calc(100vh - 120px)',
				overflowY: 'auto',
				paddingRight: '1rem',
			}}
		>
			<p
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.2em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
					marginBottom: '1rem',
				}}
			>
				Contents
			</p>
			<ul
				style={{
					listStyle: 'none',
					padding: 0,
					margin: 0,
					display: 'flex',
					flexDirection: 'column',
					gap: '0.5rem',
				}}
			>
				{entries.map((entry) => {
					const isActive = activeId === entry.id
					return (
						<li
							key={entry.id}
							style={{ paddingLeft: entry.depth > 2 ? `${(entry.depth - 2) * 0.75}rem` : '0' }}
						>
							<a
								href={`#${entry.id}`}
								aria-current={isActive ? 'location' : undefined}
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.7rem',
									letterSpacing: '0.04em',
									color: isActive ? 'var(--acid)' : 'var(--muted-foreground)',
									textDecoration: 'none',
									display: 'block',
									lineHeight: 1.4,
									transition: 'color 150ms ease',
									fontWeight: isActive ? 500 : 400,
								}}
								onMouseEnter={(e) => {
									if (!isActive) e.currentTarget.style.color = 'var(--foreground)'
								}}
								onMouseLeave={(e) => {
									if (!isActive) e.currentTarget.style.color = 'var(--muted-foreground)'
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
			<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
				<div
					className={
						toc.length > 0 ? 'grid grid-cols-1 gap-10 lg:grid-cols-[1fr_220px]' : 'grid grid-cols-1'
					}
					style={{
						alignItems: 'start',
					}}
				>
					<article>
						<header style={{ marginBottom: '4rem' }}>
							<Link
								to="/blog"
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.65rem',
									letterSpacing: '0.15em',
									textTransform: 'uppercase',
									color: 'var(--muted-foreground)',
									textDecoration: 'none',
									display: 'inline-flex',
									alignItems: 'center',
									gap: '0.5rem',
									marginBottom: '2.5rem',
								}}
								onMouseEnter={(e) => {
									;(e.currentTarget as HTMLElement).style.color = 'var(--acid)'
								}}
								onMouseLeave={(e) => {
									;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
								}}
							>
								<ArrowLeft aria-hidden="true" className="size-4" />
								Writing
							</Link>

							<h1
								style={{
									fontFamily: 'var(--font-display)',
									fontSize: 'clamp(2rem, 5vw, 3.5rem)',
									fontWeight: 700,
									letterSpacing: '-0.02em',
									lineHeight: 1.05,
									margin: '0 0 1.5rem',
								}}
							>
								{post.title}
							</h1>

							<p
								style={{
									fontSize: '1.05rem',
									color: 'var(--muted-foreground)',
									lineHeight: 1.65,
									margin: '0 0 2rem',
									maxWidth: '60ch',
								}}
							>
								{post.excerpt}
							</p>

							<div
								className="flex flex-wrap items-center gap-4 sm:gap-6"
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.65rem',
									letterSpacing: '0.12em',
									textTransform: 'uppercase',
									color: 'var(--muted-foreground)',
									borderTop: '1px solid var(--line-strong)',
									borderBottom: '1px solid var(--line-strong)',
									padding: '1rem 0',
								}}
							>
								{publishedDate && <span>{publishedDate}</span>}
								<span>{readingTimeMinutes} min read</span>
								<span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
									<Heart aria-hidden="true" className="size-3.5" style={{ color: 'var(--acid)' }} />
									{post.likeCount}
								</span>
							</div>
							{coverImageUrl && (
								<figure style={{ margin: '3rem 0 0' }}>
									<img
										src={coverImageUrl}
										alt={post.title}
										style={{
											width: '100%',
											aspectRatio: '16 / 9',
											objectFit: 'cover',
											display: 'block',
											border: '1px solid var(--line-strong)',
										}}
									/>
								</figure>
							)}
						</header>

						<div
							className="prose"
							// biome-ignore lint/security/noDangerouslySetInnerHtml: trusted HTML generated on the server from MDX pipeline
							dangerouslySetInnerHTML={{ __html: html }}
						/>

						<div
							id="reactions"
							style={{
								borderTop: '1px solid var(--line-strong)',
								marginTop: '5rem',
								paddingTop: '3rem',
							}}
						>
							<ReactionBar
								postId={post.id}
								initialLikeCount={post.likeCount}
								initialDislikeCount={post.dislikeCount}
							/>
						</div>

						<div
							id="comments"
							style={{
								borderTop: '1px solid var(--line-strong)',
								marginTop: '4rem',
								paddingTop: '3rem',
							}}
						>
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
