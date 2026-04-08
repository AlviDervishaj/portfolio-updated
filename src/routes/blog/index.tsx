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
			className="post-row"
			style={{ display: 'block', padding: '2.5rem 0', textDecoration: 'none' }}
		>
			<div
				className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_4rem]"
				style={{
					alignItems: 'start',
				}}
			>
				<div className="flex flex-col gap-3 min-w-0" style={{ paddingLeft: '0.75rem' }}>
					<h2
						style={{
							fontFamily: 'var(--font-display)',
							fontSize: 'clamp(1.25rem, 3vw, 2rem)',
							fontWeight: 700,
							letterSpacing: '-0.02em',
							margin: 0,
							lineHeight: 1.1,
						}}
					>
						{post.title}
					</h2>

					<p
						style={{
							fontSize: '0.875rem',
							color: 'var(--muted-foreground)',
							margin: 0,
							maxWidth: '65ch',
							lineHeight: 1.6,
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
							marginTop: '0.25rem',
						}}
					>
						{publishedDate && <span>{publishedDate}</span>}
						<span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
							<Heart aria-hidden="true" className="size-3.5" style={{ color: 'var(--acid)' }} />
							{post.likeCount}
						</span>
						<span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
							<MessageSquare
								aria-hidden="true"
								className="size-3.5"
								style={{ color: 'var(--acid)' }}
							/>
							{post.commentCount}
						</span>
					</div>
				</div>

				<ArrowUpRight
					aria-hidden="true"
					className="project-arrow hidden size-5 sm:block"
					style={{
						color: 'var(--acid)',
						paddingTop: '0.25rem',
						paddingRight: '1.5rem',
					}}
				/>
			</div>
		</Link>
	)
}

function PostRowSkeleton() {
	return (
		<div style={{ padding: '2.5rem 0', borderBottom: '1px solid var(--line-strong)' }}>
			<div className="flex flex-col gap-3">
				<div className="skeleton" style={{ height: '2rem', width: '60%', borderRadius: '2px' }} />
				<div className="skeleton" style={{ height: '1rem', width: '85%', borderRadius: '2px' }} />
				<div className="skeleton" style={{ height: '1rem', width: '40%', borderRadius: '2px' }} />
			</div>
		</div>
	)
}

function BlogPageSkeleton() {
	return (
		<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<div style={{ marginBottom: '4rem' }}>
				<div
					className="skeleton"
					style={{ height: '3.5rem', width: '30%', borderRadius: '2px', marginBottom: '1rem' }}
				/>
				<div className="skeleton" style={{ height: '1rem', width: '50%', borderRadius: '2px' }} />
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
		<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<div style={{ marginBottom: '4rem' }}>
				<h1
					className="animate-fade-up"
					style={{
						fontFamily: 'var(--font-display)',
						fontSize: 'clamp(2.5rem, 7vw, 5rem)',
						fontWeight: 700,
						letterSpacing: '-0.03em',
						lineHeight: 0.95,
						margin: '0 0 1rem',
					}}
				>
					Writing
				</h1>
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.75rem',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
						margin: 0,
					}}
				>
					{posts.length < totalCount
						? `Showing ${posts.length} of ${totalCount} posts`
						: `${totalCount} ${totalCount === 1 ? 'post' : 'posts'}`}
				</p>
			</div>

			<div
				className="flex items-center justify-between gap-4"
				style={{
					borderBottom: '1px solid var(--line-strong)',
					paddingBottom: '1.5rem',
					marginBottom: '0',
				}}
			>
				<div className="flex flex-wrap items-center gap-1">
					{SORT_OPTIONS.map((opt) => (
						<button
							key={opt.value}
							type="button"
							onClick={() => switchStrategy(opt.value)}
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.65rem',
								letterSpacing: '0.14em',
								textTransform: 'uppercase',
								padding: '0.4rem 0.75rem',
								border: '1px solid',
								borderColor: strategy === opt.value ? 'var(--acid)' : 'transparent',
								backgroundColor: strategy === opt.value ? 'var(--acid)' : 'transparent',
								color: strategy === opt.value ? 'var(--void)' : 'var(--muted-foreground)',
								cursor: 'pointer',
								transition: 'all 0.15s ease',
							}}
						>
							{opt.label}
						</button>
					))}
				</div>
			</div>

			<div style={{ opacity: loading ? 0.4 : 1, transition: 'opacity 0.2s ease' }}>
				{posts.length === 0 ? (
					<div
						style={{
							padding: '5rem 0',
							textAlign: 'center',
							fontFamily: 'var(--font-mono)',
							fontSize: '0.75rem',
							letterSpacing: '0.1em',
							textTransform: 'uppercase',
							color: 'var(--muted-foreground)',
						}}
					>
						No posts yet. Check back soon.
					</div>
				) : (
					posts.map((post) => (
						<div key={post.id} style={{ borderBottom: '1px solid var(--line-strong)' }}>
							<PostRow post={post} />
						</div>
					))
				)}
			</div>

			{cursor && (
				<div style={{ paddingTop: '3rem', display: 'flex', justifyContent: 'center' }}>
					<button
						type="button"
						onClick={loadMore}
						disabled={loadingMore}
						className="ghost-btn"
						style={{ opacity: loadingMore ? 0.5 : 1 }}
					>
						{loadingMore ? 'Loading...' : 'Load more'}
						{!loadingMore && <ChevronDown aria-hidden="true" className="size-4" />}
					</button>
				</div>
			)}
		</main>
	)
}
