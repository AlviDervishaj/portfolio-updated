import { createFileRoute } from '@tanstack/react-router'
import { RotateCcw, Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { AdminComment, AdminCommentFilter } from '#/server/admin.ts'
import {
	adminDeleteCommentServerFn,
	adminGetCommentsServerFn,
	adminRestoreCommentServerFn,
} from '#/server/admin.ts'

export const Route = createFileRoute('/admin/comments')({
	component: AdminCommentsPage,
})

const FILTER_OPTIONS: { label: string; value: AdminCommentFilter }[] = [
	{ label: 'Active', value: 'active' },
	{ label: 'Deleted', value: 'deleted' },
	{ label: 'All', value: 'all' },
]

function AdminCommentsPage() {
	const [filter, setFilter] = useState<AdminCommentFilter>('active')
	const [comments, setComments] = useState<AdminComment[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [cursor, setCursor] = useState<string | null>(null)
	const [loadingMore, setLoadingMore] = useState(false)

	const fetchComments = useCallback(async (f: AdminCommentFilter, c?: string) => {
		try {
			const result = await adminGetCommentsServerFn({
				data: { filter: f, cursor: c },
			})
			if (!result.success) {
				setError(result.error)
				return
			}
			if (c) {
				setComments((prev) => [...prev, ...result.data.items])
			} else {
				setComments(result.data.items)
			}
			setCursor(result.data.nextCursor)
		} catch {
			setError('Failed to load comments.')
		} finally {
			setLoading(false)
			setLoadingMore(false)
		}
	}, [])

	useEffect(() => {
		setLoading(true)
		setComments([])
		setCursor(null)
		fetchComments(filter)
	}, [filter, fetchComments])

	async function handleDelete(commentId: string) {
		const result = await adminDeleteCommentServerFn({ data: { commentId } })
		if (result.success) {
			setComments((prev) =>
				filter === 'active'
					? prev.filter((c) => c.id !== commentId)
					: prev.map((c) => (c.id === commentId ? { ...c, deletedAt: new Date() } : c)),
			)
		}
	}

	async function handleRestore(commentId: string) {
		const result = await adminRestoreCommentServerFn({ data: { commentId } })
		if (result.success) {
			setComments((prev) =>
				filter === 'deleted'
					? prev.filter((c) => c.id !== commentId)
					: prev.map((c) => (c.id === commentId ? { ...c, deletedAt: null } : c)),
			)
		}
	}

	return (
		<div>
			<div className="mb-8 flex flex-wrap items-center gap-1">
				{FILTER_OPTIONS.map((opt) => {
					const active = filter === opt.value
					return (
						<button
							key={opt.value}
							type="button"
							onClick={() => setFilter(opt.value)}
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

			{error && (
				<p className="mb-6 font-mono text-[0.72rem] text-[oklch(0.577_0.245_27.325)]">{error}</p>
			)}

			{loading && comments.length === 0 && (
				<div className="flex flex-col gap-4">
					{[1, 2, 3].map((i) => (
						<div key={i} className="skeleton h-16 rounded-sm" />
					))}
				</div>
			)}

			{!loading && comments.length === 0 && (
				<p className="font-mono text-mono-lg text-muted-foreground">No comments.</p>
			)}

			<div className="flex flex-col divide-y divide-line-strong">
				{comments.map((comment) => {
					const date = new Date(comment.createdAt).toLocaleDateString('en-US', {
						year: 'numeric',
						month: 'short',
						day: 'numeric',
					})
					const isDeleted = comment.deletedAt !== null

					return (
						<div key={comment.id} className={`py-4 ${isDeleted ? 'opacity-50' : ''}`}>
							<div className="mb-1 flex items-start justify-between gap-4">
								<div className="min-w-0">
									<span className="font-sans text-[0.85rem] font-semibold text-foreground">
										{comment.authorName}
									</span>
									<span className="mx-2 font-mono text-mono-xs text-muted-foreground">on</span>
									<a
										href={`/blog/${comment.postSlug}`}
										target="_blank"
										rel="noreferrer"
										className="font-mono text-mono-xs text-muted-foreground no-underline hover:text-acid"
									>
										{comment.postTitle}
									</a>
									<span className="ml-4 font-mono text-mono-xs text-muted-foreground">{date}</span>
									{isDeleted && (
										<span className="ml-3 font-mono text-[0.6rem] uppercase tracking-mono text-[oklch(0.577_0.245_27.325)]">
											Deleted
										</span>
									)}
								</div>
								<div className="flex shrink-0 items-center gap-1">
									{!isDeleted && (
										<button
											type="button"
											onClick={() => handleDelete(comment.id)}
											aria-label="Delete comment"
											className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground transition-colors duration-150 hover:text-[oklch(0.577_0.245_27.325)]"
										>
											<Trash2 aria-hidden="true" className="size-3.5" />
										</button>
									)}
									{isDeleted && (
										<button
											type="button"
											onClick={() => handleRestore(comment.id)}
											aria-label="Restore comment"
											className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground transition-colors duration-150 hover:text-acid"
										>
											<RotateCcw aria-hidden="true" className="size-3.5" />
										</button>
									)}
								</div>
							</div>
							<p className="m-0 max-w-[70ch] text-[0.875rem] leading-[1.6] text-muted-foreground">
								{comment.content}
							</p>
						</div>
					)
				})}
			</div>

			{cursor && (
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={() => {
							setLoadingMore(true)
							fetchComments(filter, cursor)
						}}
						disabled={loadingMore}
						className="ghost-btn disabled:opacity-50"
					>
						{loadingMore ? 'Loading…' : 'Load more'}
					</button>
				</div>
			)}
		</div>
	)
}
