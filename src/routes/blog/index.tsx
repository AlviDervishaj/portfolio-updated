import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowUpRight, ChevronDown, Heart, MessageSquare } from 'lucide-react'
import { useCallback, useState } from 'react'
import { USER } from '#/constants/user'
import { getPostsServerFn } from '#/server/posts.ts'
import type { PostSortStrategy, PostSummary } from '#/services/posts.ts'

export const Route = createFileRoute('/blog/')({
	component: BlogPage,
	head: () => ({
		meta: [
			{ title: `Blog — ${USER.FULL_NAME}` },
			{
				name: 'description',
				content: 'Writing about TypeScript, full-stack development, and building for the web.',
			},
		],
	}),
	loader: async () => {
		return getPostsServerFn({ data: { strategy: 'date' } })
	},
	pendingComponent: BlogPageSkeleton,
})

const SORT_OPTIONS: { label: string; value: PostSortStrategy }[] = [
	{ label: 'Latest', value: 'date' },
	{ label: 'Most Liked', value: 'likes' },
	{ label: 'Most Discussed', value: 'comments' },
]

function PostRow({ post }: { post: PostSummary }) {
	const publishedDate = post.publishedAt
		? new Date(post.publishedAt).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric',
			})
		: null

	return (
		<Link
			to="/blog/$slug"
			params={{ slug: post.slug }}
			className="post-row block py-10 no-underline"
		>
			<div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-[1fr_4rem]">
				<div className="flex min-w-0 flex-col gap-3 pl-3">
					<h2 className="m-0 font-display text-[clamp(1.25rem,3vw,2rem)] font-bold leading-[1.1] tracking-display-tight">
						{post.title}
					</h2>

					<p className="m-0 max-w-[65ch] text-sm leading-[1.6] text-muted-foreground">
						{post.excerpt}
					</p>

					<div className="mt-1 flex flex-wrap items-center gap-4 font-mono text-mono-sm uppercase tracking-mono-md text-muted-foreground sm:gap-6">
						{publishedDate && <span>{publishedDate}</span>}
						<span className="flex items-center gap-1.5">
							<Heart aria-hidden="true" className="size-3.5 text-acid" />
							{post.likeCount}
						</span>
						<span className="flex items-center gap-1.5">
							<MessageSquare aria-hidden="true" className="size-3.5 text-acid" />
							{post.commentCount}
						</span>
					</div>
				</div>

				<ArrowUpRight
					aria-hidden="true"
					className="project-arrow hidden size-5 pr-6 pt-1 text-acid sm:block"
				/>
			</div>
		</Link>
	)
}

function PostRowSkeleton() {
	return (
		<div className="border-b border-line-strong py-10">
			<div className="flex flex-col gap-3">
				<div className="skeleton h-8 w-3/5 rounded-sm" />
				<div className="skeleton h-4 w-[85%] rounded-sm" />
				<div className="skeleton h-4 w-2/5 rounded-sm" />
			</div>
		</div>
	)
}

function BlogPageSkeleton() {
	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<div className="mb-16">
				<div className="skeleton mb-4 h-14 w-[30%] rounded-sm" />
				<div className="skeleton h-4 w-1/2 rounded-sm" />
			</div>
			{[1, 2, 3, 4].map((i) => (
				<PostRowSkeleton key={i} />
			))}
		</main>
	)
}

function BlogPage() {
	const initialData = Route.useLoaderData()
	const [strategy, setStrategy] = useState<PostSortStrategy>('date')
	const [posts, setPosts] = useState<PostSummary[]>(initialData.items)
	const [cursor, setCursor] = useState<string | null>(initialData.nextCursor)
	const [totalCount, setTotalCount] = useState<number>(initialData.totalCount)
	const [loading, setLoading] = useState(false)
	const [loadingMore, setLoadingMore] = useState(false)

	const switchStrategy = useCallback(
		async (next: PostSortStrategy) => {
			if (next === strategy || loading) return
			setStrategy(next)
			setLoading(true)
			try {
				const result = await getPostsServerFn({ data: { strategy: next } })
				setPosts(result.items)
				setCursor(result.nextCursor)
				setTotalCount(result.totalCount)
			} finally {
				setLoading(false)
			}
		},
		[strategy, loading],
	)

	const loadMore = useCallback(async () => {
		if (!cursor || loadingMore) return
		setLoadingMore(true)
		try {
			const result = await getPostsServerFn({ data: { strategy, cursor } })
			setPosts((prev) => [...prev, ...result.items])
			setCursor(result.nextCursor)
		} finally {
			setLoadingMore(false)
		}
	}, [cursor, strategy, loadingMore])

	return (
		<main className="mx-auto max-w-[1200px] px-6 py-24">
			<div className="mb-16">
				<h1 className="animate-fade-up mb-4 mt-0 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-display-tighter">
					Writing
				</h1>
				<p className="m-0 font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
					{posts.length < totalCount
						? `Showing ${posts.length} of ${totalCount} posts`
						: `${totalCount} ${totalCount === 1 ? 'post' : 'posts'}`}
				</p>
			</div>

			<div className="flex items-center justify-between gap-4 border-b border-line-strong pb-6">
				<div className="flex flex-wrap items-center gap-1">
					{SORT_OPTIONS.map((opt) => {
						const active = strategy === opt.value
						return (
							<button
								key={opt.value}
								type="button"
								onClick={() => switchStrategy(opt.value)}
								className={`cursor-pointer border px-3 py-1.5 font-mono text-mono-sm uppercase tracking-mono-md transition-all duration-150 ${
									active
										? 'border-acid bg-acid text-on-acid'
										: 'border-transparent bg-transparent text-muted-foreground'
								}`}
							>
								{opt.label}
							</button>
						)
					})}
				</div>
			</div>

			<div className={`transition-opacity duration-200 ${loading ? 'opacity-40' : 'opacity-100'}`}>
				{posts.length === 0 ? (
					<div className="py-20 text-center font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
						No posts yet. Check back soon.
					</div>
				) : (
					posts.map((post) => (
						<div key={post.id} className="border-b border-line-strong">
							<PostRow post={post} />
						</div>
					))
				)}
			</div>

			{cursor && (
				<div className="flex justify-center pt-12">
					<button
						type="button"
						onClick={loadMore}
						disabled={loadingMore}
						className="ghost-btn disabled:opacity-50"
					>
						{loadingMore ? 'Loading...' : 'Load more'}
						{!loadingMore && <ChevronDown aria-hidden="true" className="size-4" />}
					</button>
				</div>
			)}
		</main>
	)
}
