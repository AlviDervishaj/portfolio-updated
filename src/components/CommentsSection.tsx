import { useMutation, useQuery } from '@tanstack/react-query'
import { ArrowRight, ChevronDown, CornerDownLeft } from 'lucide-react'
import { useState } from 'react'

import { MAX_COMMENT_LENGTH } from '#/constants/content.ts'
import {
	createCommentServerFn,
	deleteCommentServerFn,
	getCommentsServerFn,
} from '#/server/comments.ts'
import type { CommentWithReplies } from '#/services/comments.ts'

type Props = {
	postId: string
	currentUserId?: string
	currentUserName?: string
}

function commentsQueryKey(postId: string) {
	return ['comments', postId]
}

export default function CommentsSection({ postId, currentUserId, currentUserName }: Props) {
	const [replyingTo, setReplyingTo] = useState<string | null>(null)
	const [allComments, setAllComments] = useState<CommentWithReplies[]>([])
	const [nextCursor, setNextCursor] = useState<string | null>(null)
	const [loadingMore, setLoadingMore] = useState(false)
	const [initialLoaded, setInitialLoaded] = useState(false)

	useQuery({
		queryKey: commentsQueryKey(postId),
		queryFn: async () => {
			const result = await getCommentsServerFn({ data: { postId } })
			if (!result.success) throw new Error(result.error)
			setAllComments(result.data.items)
			setNextCursor(result.data.nextCursor)
			setInitialLoaded(true)
			return result.data
		},
		staleTime: 60_000,
	})

	async function loadMoreComments() {
		if (!nextCursor || loadingMore) return
		setLoadingMore(true)
		try {
			const result = await getCommentsServerFn({
				data: { postId, cursor: nextCursor },
			})
			if (result.success) {
				setAllComments((prev) => [...prev, ...result.data.items])
				setNextCursor(result.data.nextCursor)
			}
		} finally {
			setLoadingMore(false)
		}
	}

	const createMutation = useMutation({
		mutationFn: async (vars: { content: string; parentId?: string }) => {
			const result = await createCommentServerFn({
				data: { postId, content: vars.content, parentId: vars.parentId },
			})
			if (!result.success) throw new Error(result.error)
			return result.data
		},
		onSuccess: (newComment, vars) => {
			if (!vars.parentId) {
				setAllComments((prev) => [...prev, newComment])
			} else {
				setAllComments((prev) =>
					prev.map((c) =>
						c.id === vars.parentId ? { ...c, replies: [...c.replies, newComment] } : c,
					),
				)
			}
			setReplyingTo(null)
		},
	})

	const deleteMutation = useMutation({
		mutationFn: async (vars: { commentId: string }) => {
			const result = await deleteCommentServerFn({
				data: { commentId: vars.commentId, postId },
			})
			if (!result.success) throw new Error(result.error)
			return vars.commentId
		},
		onSuccess: (deletedId) => {
			setAllComments((prev) =>
				prev
					.map((c) => ({
						...c,
						replies: c.replies.filter((r) => r.id !== deletedId),
						...(c.id === deletedId ? { deletedAt: new Date() } : {}),
					}))
					.filter((c) => !(c.id === deletedId && c.replies.length === 0)),
			)
		},
	})

	const totalVisible = allComments.length

	return (
		<div>
			<h3
				style={{
					fontFamily: 'var(--font-display)',
					fontSize: '1.25rem',
					fontWeight: 700,
					letterSpacing: '-0.01em',
					margin: '0 0 2rem',
				}}
			>
				{totalVisible === 0 ? 'Discussion' : `Discussion ( ${totalVisible} )`}
			</h3>

			{currentUserId && currentUserName ? (
				<CommentForm
					onSubmit={(content) => createMutation.mutate({ content })}
					isSubmitting={createMutation.isPending && !replyingTo}
					placeholder="Share your thoughts..."
				/>
			) : (
				<SignInPrompt />
			)}

			{initialLoaded && allComments.length === 0 && (
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.72rem',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
						marginTop: '2.5rem',
					}}
				>
					No comments yet. Be the first.
				</p>
			)}

			<div
				style={{
					marginTop: '2.5rem',
					display: 'flex',
					flexDirection: 'column',
					gap: '0',
				}}
			>
				{allComments.map((comment) => (
					<CommentThread
						key={comment.id}
						comment={comment}
						currentUserId={currentUserId}
						currentUserName={currentUserName}
						replyingTo={replyingTo}
						setReplyingTo={setReplyingTo}
						onReply={(content, parentId) => createMutation.mutate({ content, parentId })}
						onDelete={(commentId) => deleteMutation.mutate({ commentId })}
						isReplySubmitting={createMutation.isPending && replyingTo !== null}
						isDeleting={deleteMutation.isPending}
					/>
				))}
			</div>

			{nextCursor && (
				<div
					style={{
						marginTop: '2rem',
						display: 'flex',
						justifyContent: 'center',
					}}
				>
					<button
						type="button"
						onClick={loadMoreComments}
						disabled={loadingMore}
						className="ghost-btn"
						style={{ opacity: loadingMore ? 0.5 : 1 }}
					>
						{loadingMore ? 'Loading...' : 'Load more comments'}
						{!loadingMore && <ChevronDown aria-hidden="true" className="size-4" />}
					</button>
				</div>
			)}
		</div>
	)
}

type CommentThreadProps = {
	comment: CommentWithReplies
	currentUserId?: string
	currentUserName?: string
	replyingTo: string | null
	setReplyingTo: (id: string | null) => void
	onReply: (content: string, parentId: string) => void
	onDelete: (commentId: string) => void
	isReplySubmitting: boolean
	isDeleting: boolean
}

function CommentThread({
	comment,
	currentUserId,
	currentUserName,
	replyingTo,
	setReplyingTo,
	onReply,
	onDelete,
	isReplySubmitting,
	isDeleting,
}: CommentThreadProps) {
	const isOwn = currentUserId === comment.authorId

	return (
		<div
			style={{
				borderTop: '1px solid var(--line-strong)',
				paddingTop: '1.5rem',
				paddingBottom: '1.5rem',
			}}
		>
			<CommentBubble
				id={comment.id}
				authorName={comment.authorName}
				content={comment.content}
				createdAt={comment.createdAt}
				deletedAt={comment.deletedAt}
				isOwn={isOwn}
				onDelete={isOwn ? () => onDelete(comment.id) : undefined}
				isDeleting={isDeleting}
			/>

			{comment.replies.length > 0 && (
				<div
					style={{
						marginTop: '1rem',
						paddingLeft: '2rem',
						borderLeft: '1px solid var(--line-strong)',
						display: 'flex',
						flexDirection: 'column',
						gap: '1rem',
					}}
				>
					{comment.replies.map((reply) => (
						<CommentBubble
							key={reply.id}
							id={reply.id}
							authorName={reply.authorName}
							content={reply.content}
							createdAt={reply.createdAt}
							deletedAt={reply.deletedAt}
							isOwn={currentUserId === reply.authorId}
							onDelete={currentUserId === reply.authorId ? () => onDelete(reply.id) : undefined}
							isDeleting={isDeleting}
						/>
					))}
				</div>
			)}

			{currentUserId && currentUserName && !comment.deletedAt && (
				<div style={{ marginTop: '0.75rem', paddingLeft: '0' }}>
					{replyingTo === comment.id ? (
						<CommentForm
							onSubmit={(content) => onReply(content, comment.id)}
							onCancel={() => setReplyingTo(null)}
							isSubmitting={isReplySubmitting}
							placeholder={`Reply to ${comment.authorName}...`}
							compact
						/>
					) : (
						<button
							type="button"
							onClick={() => setReplyingTo(comment.id)}
							className="inline-flex items-center gap-1"
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.62rem',
								letterSpacing: '0.12em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								padding: '0',
								transition: 'color 150ms ease',
							}}
							onMouseEnter={(e) => {
								;(e.currentTarget as HTMLElement).style.color = 'var(--acid)'
							}}
							onMouseLeave={(e) => {
								;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
							}}
						>
							<CornerDownLeft aria-hidden="true" className="size-3" />
							Reply
						</button>
					)}
				</div>
			)}
		</div>
	)
}

type CommentBubbleProps = {
	id: string
	authorName: string
	content: string
	createdAt: Date
	deletedAt: Date | null
	isOwn: boolean
	onDelete?: () => void
	isDeleting: boolean
}

function CommentBubble({
	authorName,
	content,
	createdAt,
	deletedAt,
	isOwn,
	onDelete,
	isDeleting,
}: CommentBubbleProps) {
	const formattedDate = new Date(createdAt).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	})

	return (
		<div>
			<div className="flex items-center justify-between gap-2" style={{ marginBottom: '0.5rem' }}>
				<div
					className="flex items-center gap-3"
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.65rem',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
					}}
				>
					<span
						style={{
							color: isOwn ? 'var(--acid)' : 'var(--foreground)',
							fontWeight: 500,
						}}
					>
						{authorName}
					</span>
					<span style={{ color: 'var(--muted-foreground)' }}>{formattedDate}</span>
				</div>

				{isOwn && onDelete && !deletedAt && (
					<button
						type="button"
						onClick={onDelete}
						disabled={isDeleting}
						aria-label="Delete comment"
						style={{
							fontFamily: 'var(--font-mono)',
							fontSize: '0.6rem',
							letterSpacing: '0.1em',
							textTransform: 'uppercase',
							color: 'var(--muted-foreground)',
							background: 'none',
							border: 'none',
							cursor: 'pointer',
							padding: '0',
							opacity: isDeleting ? 0.5 : 1,
							transition: 'color 150ms ease',
						}}
						onMouseEnter={(e) => {
							;(e.currentTarget as HTMLElement).style.color = 'oklch(0.577 0.245 27.325)'
						}}
						onMouseLeave={(e) => {
							;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
						}}
					>
						Delete
					</button>
				)}
			</div>

			{deletedAt ? (
				<p
					style={{
						fontSize: '0.875rem',
						color: 'var(--muted-foreground)',
						fontStyle: 'italic',
						margin: 0,
					}}
				>
					[deleted]
				</p>
			) : (
				<p
					style={{
						fontSize: '0.9375rem',
						lineHeight: 1.65,
						color: 'var(--foreground)',
						margin: 0,
						whiteSpace: 'pre-wrap',
						wordBreak: 'break-word',
					}}
				>
					{content}
				</p>
			)}
		</div>
	)
}

type CommentFormProps = {
	onSubmit: (content: string) => void
	onCancel?: () => void
	isSubmitting: boolean
	placeholder?: string
	compact?: boolean
}

function CommentForm({ onSubmit, onCancel, isSubmitting, placeholder, compact }: CommentFormProps) {
	const [value, setValue] = useState('')
	const remaining = MAX_COMMENT_LENGTH - value.length
	const isOverLimit = remaining < 0

	function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		const trimmed = value.trim()
		if (!trimmed || isOverLimit || isSubmitting) return
		onSubmit(trimmed)
		setValue('')
	}

	return (
		<form
			onSubmit={handleSubmit}
			style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}
		>
			<textarea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder ?? 'Write a comment...'}
				rows={compact ? 3 : 4}
				style={{
					width: '100%',
					padding: '0.875rem 1rem',
					background: 'transparent',
					border: '1px solid var(--line-strong)',
					color: 'var(--foreground)',
					fontFamily: 'var(--font-sans)',
					fontSize: '0.9rem',
					lineHeight: 1.6,
					resize: 'vertical',
					outline: 'none',
					transition: 'border-color 150ms ease',
					boxSizing: 'border-box',
				}}
				onFocus={(e) => {
					e.currentTarget.style.borderColor = 'var(--acid-border)'
				}}
				onBlur={(e) => {
					e.currentTarget.style.borderColor = 'var(--line-strong)'
				}}
				disabled={isSubmitting}
			/>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<span
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.62rem',
						letterSpacing: '0.1em',
						color: isOverLimit ? 'oklch(0.577 0.245 27.325)' : 'var(--muted-foreground)',
					}}
				>
					{remaining}
				</span>

				<div className="flex items-center gap-2">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							style={{
								fontFamily: 'var(--font-mono)',
								fontSize: '0.65rem',
								letterSpacing: '0.1em',
								textTransform: 'uppercase',
								color: 'var(--muted-foreground)',
								background: 'none',
								border: 'none',
								cursor: 'pointer',
								padding: '0.5rem 0.75rem',
							}}
						>
							Cancel
						</button>
					)}
					<button
						type="submit"
						disabled={!value.trim() || isOverLimit || isSubmitting}
						className="acid-btn"
						style={{
							fontSize: '0.65rem',
							padding: '0.5rem 1rem',
							opacity: !value.trim() || isOverLimit || isSubmitting ? 0.5 : 1,
						}}
					>
						{isSubmitting ? 'Posting...' : 'Post'}
					</button>
				</div>
			</div>
		</form>
	)
}

function SignInPrompt() {
	return (
		<div
			style={{
				border: '1px solid var(--line-strong)',
				padding: '1.5rem',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'space-between',
				gap: '1rem',
				flexWrap: 'wrap',
			}}
		>
			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.72rem',
					letterSpacing: '0.08em',
					color: 'var(--muted-foreground)',
				}}
			>
				Sign in to join the discussion
			</span>
			<a
				href="/api/auth/sign-in"
				className="acid-btn w-full justify-center sm:w-auto"
				style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}
			>
				Sign in
				<ArrowRight aria-hidden="true" className="size-3.5" />
			</a>
		</div>
	)
}
