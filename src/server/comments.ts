'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { MAX_COMMENT_LENGTH } from '#/constants/content.ts'
import {
	ERROR_CODE_FORBIDDEN,
	ERROR_CODE_NOT_FOUND,
	ERROR_CODE_RATE_LIMITED,
	ERROR_CODE_UNAUTHORIZED,
} from '#/constants/errorCodes.ts'
import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import {
	COMMENT_RATE_LIMIT_REQUESTS,
	COMMENT_RATE_LIMIT_WINDOW_SECONDS,
} from '#/constants/rateLimit.ts'
import { auth } from '#/lib/auth.ts'
import { buildRateLimitKey, checkRateLimit } from '#/lib/rateLimit.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import type { CommentsPage, CommentWithReplies } from '#/services/comments.ts'
import {
	createComment,
	getCommentById,
	getCommentsForPost,
	softDeleteComment,
} from '#/services/comments.ts'
import { syncPostCommentCount } from '#/services/posts.ts'
import type { ApiResponse } from '#/types/api.ts'

const GetCommentsInputSchema = z.object({
	postId: z.uuid(),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(50).optional().default(DEFAULT_PAGE_SIZE),
})

const CreateCommentInputSchema = z.object({
	postId: z.uuid(),
	content: z.string().min(1).max(MAX_COMMENT_LENGTH),
	parentId: z.uuid().optional(),
})

const DeleteCommentInputSchema = z.object({
	commentId: z.uuid(),
	postId: z.uuid(),
})

async function requireSession() {
	const sessionResult = await auth.api.getSession({
		headers: new Headers({
			cookie: getRequestHeader('cookie') ?? '',
		}),
	})

	return sessionResult ?? null
}

export const getCommentsServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => GetCommentsInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<CommentsPage>> => {
		const page = await getCommentsForPost(data.postId, data.cursor, data.limit)
		return createSuccessResponse(page)
	})

export const createCommentServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => CreateCommentInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<CommentWithReplies>> => {
		const session = await requireSession()

		if (!session) {
			return createErrorResponse('You must be logged in to comment.', ERROR_CODE_UNAUTHORIZED)
		}

		const rateLimitKey = buildRateLimitKey('comment', session.user.id)
		const rateLimit = await checkRateLimit(
			rateLimitKey,
			COMMENT_RATE_LIMIT_REQUESTS,
			COMMENT_RATE_LIMIT_WINDOW_SECONDS,
		)

		if (!rateLimit.success) {
			return createErrorResponse('Too many comments. Please slow down.', ERROR_CODE_RATE_LIMITED)
		}

		const comment = await createComment({
			postId: data.postId,
			authorId: session.user.id,
			authorName: session.user.name,
			content: data.content,
			parentId: data.parentId,
		})

		await syncPostCommentCount(data.postId)

		return createSuccessResponse(comment)
	})

export const deleteCommentServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => DeleteCommentInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<{ deleted: boolean }>> => {
		const session = await requireSession()

		if (!session) {
			return createErrorResponse(
				'You must be logged in to delete a comment.',
				ERROR_CODE_UNAUTHORIZED,
			)
		}

		const existing = await getCommentById(data.commentId)

		if (!existing) {
			return createErrorResponse('Comment not found.', ERROR_CODE_NOT_FOUND)
		}

		if (existing.authorId !== session.user.id) {
			return createErrorResponse('You can only delete your own comments.', ERROR_CODE_FORBIDDEN)
		}

		const deleted = await softDeleteComment(data.commentId, session.user.id)

		if (deleted) {
			await syncPostCommentCount(data.postId)
		}

		return createSuccessResponse({ deleted })
	})
