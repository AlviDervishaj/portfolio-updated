import { createFileRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import { type AdminAnalytics, adminGetAnalyticsServerFn } from '#/server/admin.ts'

export const Route = createFileRoute('/admin/analytics')({
	component: AdminAnalyticsPage,
})

function StatCard({ label, value }: { label: string; value: number }) {
	return (
		<div className="border border-line-strong p-6">
			<p className="mb-2 font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground">
				{label}
			</p>
			<p className="m-0 font-display text-[clamp(2rem,5vw,3rem)] font-bold tracking-display-tight">
				{value.toLocaleString()}
			</p>
		</div>
	)
}

function AdminAnalyticsPage() {
	const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		async function load() {
			try {
				const result = await adminGetAnalyticsServerFn()
				if (result.success) {
					setAnalytics(result.data)
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
			<div className="grid grid-cols-2 gap-4 md:grid-cols-4">
				{[1, 2, 3, 4].map((i) => (
					<div key={i} className="skeleton h-28 rounded-sm" />
				))}
			</div>
		)
	}

	if (error) {
		return (
			<p className="font-mono text-mono-sm text-[oklch(0.577_0.245_27.325)]">
				Failed to load analytics: {error}
			</p>
		)
	}

	if (!analytics) return null

	return (
		<div className="flex flex-col gap-10">
			<section>
				<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					Overview
				</p>
				<div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
					<StatCard label="Total posts" value={analytics.totalPosts} />
					<StatCard label="Published" value={analytics.publishedPosts} />
					<StatCard label="Drafts" value={analytics.draftPosts} />
					<StatCard label="Comments" value={analytics.totalComments} />
					<StatCard label="Reactions" value={analytics.totalReactions} />
					<StatCard label="Subscribers" value={analytics.totalSubscribers} />
				</div>
			</section>

			<div className="grid grid-cols-1 gap-10 md:grid-cols-2">
				<section>
					<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
						Top by views
					</p>
					{analytics.topPostsByViews.length === 0 ? (
						<p className="font-mono text-mono-lg text-muted-foreground">No data yet.</p>
					) : (
						<div className="flex flex-col gap-1">
							{analytics.topPostsByViews.map((post, index) => (
								<div
									key={post.id}
									className="flex items-center justify-between gap-4 border-b border-line-strong py-3 last:border-b-0"
								>
									<div className="min-w-0 flex-1">
										<span className="mr-3 font-mono text-mono-xs text-muted-foreground">
											{String(index + 1).padStart(2, '0')}
										</span>
										<a
											href={`/blog/${post.slug}`}
											target="_blank"
											rel="noreferrer"
											className="font-sans text-[0.85rem] font-medium text-foreground no-underline hover:text-acid"
										>
											{post.title}
										</a>
									</div>
									<span className="shrink-0 font-mono text-mono-sm tabular-nums text-muted-foreground">
										{post.viewCount.toLocaleString()} views
									</span>
								</div>
							))}
						</div>
					)}
				</section>

				<section>
					<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
						Top by likes
					</p>
					{analytics.topPostsByLikes.length === 0 ? (
						<p className="font-mono text-mono-lg text-muted-foreground">No data yet.</p>
					) : (
						<div className="flex flex-col gap-1">
							{analytics.topPostsByLikes.map((post, index) => (
								<div
									key={post.id}
									className="flex items-center justify-between gap-4 border-b border-line-strong py-3 last:border-b-0"
								>
									<div className="min-w-0 flex-1">
										<span className="mr-3 font-mono text-mono-xs text-muted-foreground">
											{String(index + 1).padStart(2, '0')}
										</span>
										<a
											href={`/blog/${post.slug}`}
											target="_blank"
											rel="noreferrer"
											className="font-sans text-[0.85rem] font-medium text-foreground no-underline hover:text-acid"
										>
											{post.title}
										</a>
									</div>
									<span className="shrink-0 font-mono text-mono-sm tabular-nums text-muted-foreground">
										{post.likeCount.toLocaleString()} likes
									</span>
								</div>
							))}
						</div>
					)}
				</section>
			</div>
		</div>
	)
}
