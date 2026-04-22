import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Heart, ThumbsDown } from 'lucide-react'
import type React from 'react'

import {
	getReactionStateServerFn,
	removeReactionServerFn,
	upsertReactionServerFn,
} from '#/server/reactions.ts'
import type { ReactionState } from '#/services/reactions.ts'

type Props = {
	postId: string
	initialLikeCount: number
	initialDislikeCount: number
}

function reactionQueryKey(postId: string) {
	return ['reactions', postId]
}

export default function ReactionBar({ postId, initialLikeCount, initialDislikeCount }: Props) {
	const queryClient = useQueryClient()

	const { data } = useQuery({
		queryKey: reactionQueryKey(postId),
		queryFn: async () => {
			const result = await getReactionStateServerFn({ data: { postId } })
			if (!result.success) throw new Error(result.error)
			return result.data
		},
		initialData: {
			liked: false,
			disliked: false,
			likeCount: initialLikeCount,
			dislikeCount: initialDislikeCount,
		} satisfies ReactionState,
		staleTime: 30_000,
	})

	const mutation = useMutation({
		mutationFn: async (action: { type: 'like' | 'dislike' | 'remove' }) => {
			if (action.type === 'remove') {
				const result = await removeReactionServerFn({ data: { postId } })
				if (!result.success) throw new Error(result.error)
				return result.data
			}
			const result = await upsertReactionServerFn({ data: { postId, type: action.type } })
			if (!result.success) throw new Error(result.error)
			return result.data
		},
		onMutate: async (action) => {
			await queryClient.cancelQueries({ queryKey: reactionQueryKey(postId) })
			const previous = queryClient.getQueryData<ReactionState>(reactionQueryKey(postId))

			queryClient.setQueryData<ReactionState>(reactionQueryKey(postId), (old) => {
				if (!old) return old

				if (action.type === 'remove') {
					return {
						liked: false,
						disliked: false,
						likeCount: old.liked ? old.likeCount - 1 : old.likeCount,
						dislikeCount: old.disliked ? old.dislikeCount - 1 : old.dislikeCount,
					}
				}

				const wasSameType = action.type === 'like' ? old.liked : old.disliked
				const wasOtherType = action.type === 'like' ? old.disliked : old.liked

				return {
					liked: action.type === 'like' ? !wasSameType : false,
					disliked: action.type === 'dislike' ? !wasSameType : false,
					likeCount:
						action.type === 'like'
							? old.likeCount + (wasSameType ? -1 : 1) + (wasOtherType ? 0 : 0)
							: old.likeCount + (old.liked ? -1 : 0),
					dislikeCount:
						action.type === 'dislike'
							? old.dislikeCount + (wasSameType ? -1 : 1) + (wasOtherType ? 0 : 0)
							: old.dislikeCount + (old.disliked ? -1 : 0),
				}
			})

			return { previous }
		},
		onError: (_err, _action, context) => {
			if (context?.previous) {
				queryClient.setQueryData(reactionQueryKey(postId), context.previous)
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries({ queryKey: reactionQueryKey(postId) })
		},
	})

	function handleReaction(type: 'like' | 'dislike') {
		const isActive = type === 'like' ? data.liked : data.disliked
		if (isActive) {
			mutation.mutate({ type: 'remove' })
		} else {
			mutation.mutate({ type })
		}
	}

	const isDisabled = mutation.isPending

	return (
		<div className="flex flex-wrap items-center gap-3" style={{}}>
			<ReactionButton
				icon={<Heart className="size-4" />}
				label="Like"
				count={data.likeCount}
				active={data.liked}
				disabled={isDisabled}
				onClick={() => handleReaction('like')}
			/>
			<ReactionButton
				icon={<ThumbsDown className="size-4" />}
				label="Dislike"
				count={data.dislikeCount}
				active={data.disliked}
				disabled={isDisabled}
				onClick={() => handleReaction('dislike')}
			/>

			<span
				style={{
					fontFamily: 'var(--font-mono)',
					fontSize: '0.62rem',
					letterSpacing: '0.1em',
					textTransform: 'uppercase',
					color: 'var(--muted-foreground)',
				}}
			>
				No account required
			</span>
		</div>
	)
}

type ReactionButtonProps = {
	icon: React.ReactNode
	label: string
	count: number
	active: boolean
	disabled: boolean
	onClick: () => void
}

function ReactionButton({ icon, label, count, active, disabled, onClick }: ReactionButtonProps) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-pressed={active}
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: '0.5rem',
				padding: '0.5rem 1rem',
				border: '1px solid',
				borderColor: active ? 'var(--acid)' : 'var(--line-strong)',
				backgroundColor: active ? 'var(--acid)' : 'transparent',
				color: active ? 'var(--on-acid)' : 'var(--muted-foreground)',
				fontFamily: 'var(--font-mono)',
				fontSize: '0.72rem',
				letterSpacing: '0.08em',
				cursor: disabled ? 'not-allowed' : 'pointer',
				transition: 'all 150ms ease',
				opacity: disabled ? 0.6 : 1,
			}}
			onMouseEnter={(e) => {
				if (!active && !disabled) {
					;(e.currentTarget as HTMLElement).style.borderColor = 'var(--accent-strong-border)'
					;(e.currentTarget as HTMLElement).style.backgroundColor = 'var(--accent-strong-dim)'
					;(e.currentTarget as HTMLElement).style.color = 'var(--foreground)'
				}
			}}
			onMouseLeave={(e) => {
				if (!active) {
					;(e.currentTarget as HTMLElement).style.borderColor = 'var(--line-strong)'
					;(e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
					;(e.currentTarget as HTMLElement).style.color = 'var(--muted-foreground)'
				}
			}}
		>
			<span aria-hidden="true" className="flex items-center">
				{icon}
			</span>
			<span>{count}</span>
		</button>
	)
}
