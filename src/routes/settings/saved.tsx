import { createFileRoute, Link } from '@tanstack/react-router'
import { Eye, Heart, MessageSquare } from 'lucide-react'
import { useEffect, useState } from 'react'
import { USER } from '#/constants/user'
import { getSavedPostsServerFn } from '#/server/savedPosts.ts'
import type { SavedPostSummary } from '#/services/savedPosts.ts'

export const Route = createFileRoute('/settings/saved')({
	component: SavedPostsPage,
	head: () => ({
		meta: [{ title: `Saved — ${USER.FULL_NAME}` }, { name: 'robots', content: 'noindex' }],
	}),
})

function SavedPostsPage() {
	const [posts, setPosts] = useState<SavedPostSummary[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function load() {
			try {
				const result = await getSavedPostsServerFn()
				if (result.success) {
					setPosts(result.data)
				} else {
					setError(result.error)
				}
			} finally {
				setLoading(false)
			}
		}
		load()
	}, [])

	if (loading) {
		return (
			<div className="flex flex-col gap-6">
				{[1, 2, 3].map((i) => (
					<div key={i} className="flex flex-col gap-2">
						<div className="skeleton h-5 w-3/4 rounded-sm" />
						<div className="skeleton h-4 w-full rounded-sm" />
						<div className="skeleton h-3 w-1/3 rounded-sm" />
					</div>
				))}
			</div>
		)
	}

	if (error) {
		return (
			<p className="font-mono text-mono-sm text-[oklch(0.577_0.245_27.325)]">
				Failed to load saved posts: {error}
			</p>
		)
	}

	if (posts.length === 0) {
		return (
			<div>
				<p className="mb-2 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					Saved posts
				</p>
				<p className="font-mono text-mono-lg text-muted-foreground">No saved posts yet.</p>
			</div>
		)
	}

	return (
		<div>
			<p className="mb-6 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
				Saved posts ({posts.length})
			</p>
			<div className="flex flex-col divide-y divide-line-strong">
				{posts.map((post) => {
					const savedDate = new Date(post.savedAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})
					return (
						<div key={post.id} className="py-5">
							<Link
								to="/blog/$slug"
								params={{ slug: post.slug }}
								className="mb-1 block font-display text-[1rem] font-bold tracking-display-tight no-underline transition-colors duration-150 hover:text-acid"
							>
								{post.title}
							</Link>
							<p className="mb-3 mt-1 text-[0.85rem] leading-[1.5] text-muted-foreground">
								{post.excerpt}
							</p>
							<div className="flex flex-wrap items-center gap-4 font-mono text-mono-sm uppercase tracking-mono-md text-muted-foreground">
								<span>Saved on {savedDate}</span>
								<span className="flex items-center gap-1.5">
									<Heart aria-hidden="true" className="size-3 text-acid" />
									{post.likeCount}
								</span>
								<span className="flex items-center gap-1.5">
									<MessageSquare aria-hidden="true" className="size-3 text-acid" />
									{post.commentCount}
								</span>
								<span className="flex items-center gap-1.5">
									<Eye aria-hidden="true" className="size-3 text-acid" />
									{post.viewCount}
								</span>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
