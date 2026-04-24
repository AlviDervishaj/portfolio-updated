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
			<h3 className="mb-8 mt-0 font-display text-xl font-bold tracking-[-0.01em]">
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
				<p className="mt-10 font-mono text-[0.72rem] uppercase tracking-mono text-muted-foreground">
					No comments yet. Be the first.
				</p>
			)}

			<div className="mt-10 flex flex-col">
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
				<div className="mt-8 flex justify-center">
					<button
						type="button"
						onClick={loadMoreComments}
						disabled={loadingMore}
						className="ghost-btn disabled:opacity-50"
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
		<div className="border-t border-line-strong py-6">
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
				<div className="mt-4 flex flex-col gap-4 border-l border-line-strong pl-8">
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
				<div className="mt-3">
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
							className="inline-flex cursor-pointer items-center gap-1 border-none bg-transparent p-0 font-mono text-mono-xs uppercase tracking-[0.12em] text-muted-foreground transition-colors duration-150 hover:text-acid"
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
			<div className="mb-2 flex items-center justify-between gap-2">
				<div className="flex items-center gap-3 font-mono text-mono-sm uppercase tracking-mono">
					<span className={isOwn ? 'font-medium text-acid' : 'font-medium text-foreground'}>
						{authorName}
					</span>
					<span className="text-muted-foreground">{formattedDate}</span>
				</div>

				{isOwn && onDelete && !deletedAt && (
					<button
						type="button"
						onClick={onDelete}
						disabled={isDeleting}
						aria-label="Delete comment"
						className="cursor-pointer border-none bg-transparent p-0 font-mono text-[0.6rem] uppercase tracking-mono text-muted-foreground transition-colors duration-150 hover:text-[oklch(0.577_0.245_27.325)] disabled:opacity-50"
					>
						Delete
					</button>
				)}
			</div>

			{deletedAt ? (
				<p className="m-0 text-sm italic text-muted-foreground">[deleted]</p>
			) : (
				<p className="m-0 whitespace-pre-wrap break-words text-[0.9375rem] leading-[1.65] text-foreground">
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
		<form onSubmit={handleSubmit} className="flex flex-col gap-3">
			<textarea
				value={value}
				onChange={(e) => setValue(e.target.value)}
				placeholder={placeholder ?? 'Write a comment...'}
				rows={compact ? 3 : 4}
				className="w-full resize-y border border-line-strong bg-transparent px-4 py-3.5 font-sans text-[0.9rem] leading-[1.6] text-foreground outline-none transition-colors duration-150 focus:border-acid-border"
				disabled={isSubmitting}
			/>

			<div className="flex flex-wrap items-center justify-between gap-3">
				<span
					className={
						isOverLimit
							? 'font-mono text-mono-xs tracking-mono text-[oklch(0.577_0.245_27.325)]'
							: 'font-mono text-mono-xs tracking-mono text-muted-foreground'
					}
				>
					{remaining}
				</span>

				<div className="flex items-center gap-2">
					{onCancel && (
						<button
							type="button"
							onClick={onCancel}
							className="cursor-pointer border-none bg-transparent px-3 py-2 font-mono text-mono-sm uppercase tracking-mono text-muted-foreground"
						>
							Cancel
						</button>
					)}
					<button
						type="submit"
						disabled={!value.trim() || isOverLimit || isSubmitting}
						className="acid-btn px-4 py-2 text-mono-sm disabled:opacity-50"
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
		<div className="flex flex-wrap items-center justify-between gap-4 border border-line-strong p-6">
			<span className="font-mono text-[0.72rem] tracking-mono-sm text-muted-foreground">
				Sign in to join the discussion
			</span>
			<a
				href="/api/auth/sign-in"
				className="acid-btn w-full justify-center px-4 py-2 text-mono-sm sm:w-auto"
			>
				Sign in
				<ArrowRight aria-hidden="true" className="size-3.5" />
			</a>
		</div>
	)
}
