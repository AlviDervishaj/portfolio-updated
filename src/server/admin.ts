'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { and, count, desc, eq, isNotNull, isNull, sql } from 'drizzle-orm'
import { z } from 'zod'
import {
	MAX_POST_CONTENT_LENGTH,
	MAX_POST_SLUG_LENGTH,
	MAX_POST_TITLE_LENGTH,
} from '#/constants/content.ts'
import {
	ERROR_CODE_FORBIDDEN,
	ERROR_CODE_NOT_FOUND,
	ERROR_CODE_UNAUTHORIZED,
} from '#/constants/errorCodes.ts'
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from '#/constants/pagination.ts'
import { db } from '#/db/index.ts'
import { comments, newsletterSubscribers, posts, reactions } from '#/db/schema.ts'
import { env } from '#/env.ts'
import { auth } from '#/lib/auth.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import { getPresignedUploadUrl } from '#/lib/storage.ts'
import { adminRestoreComment, adminSoftDeleteComment } from '#/services/comments.ts'
import type { PostDetail } from '#/services/posts.ts'
import {
	createPost,
	getAllPosts,
	publishPost,
	unpublishPost,
	updatePost,
} from '#/services/posts.ts'
import type { ApiResponse } from '#/types/api.ts'

async function requireAdmin() {
	const sessionResult = await auth.api.getSession({
		headers: new Headers({
			cookie: getRequestHeader('cookie') ?? '',
		}),
	})

	if (!sessionResult?.user) return null
	if (sessionResult.user.email !== env.ADMIN_EMAIL) return null

	return sessionResult.user
}

const CreatePostInputSchema = z.object({
	slug: z.string().min(1).max(MAX_POST_SLUG_LENGTH),
	title: z.string().min(1).max(MAX_POST_TITLE_LENGTH),
	excerpt: z.string().min(1).max(500),
	content: z.string().min(1).max(MAX_POST_CONTENT_LENGTH),
	coverImageKey: z.string().optional(),
})

const UpdatePostInputSchema = z.object({
	postId: z.uuid(),
	slug: z.string().min(1).max(MAX_POST_SLUG_LENGTH).optional(),
	title: z.string().min(1).max(MAX_POST_TITLE_LENGTH).optional(),
	excerpt: z.string().min(1).max(500).optional(),
	content: z.string().min(1).max(MAX_POST_CONTENT_LENGTH).optional(),
	coverImageKey: z.string().nullable().optional(),
})

const PublishInputSchema = z.object({
	postId: z.uuid(),
})

const GetPresignedUrlInputSchema = z.object({
	filename: z.string().min(1),
	contentType: z.string().min(1),
})

export const adminGetAllPostsServerFn = createServerFn({
	method: 'GET',
}).handler(async (): Promise<ApiResponse<PostDetail[]>> => {
	const admin = await requireAdmin()
	if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

	const allPosts = await getAllPosts()
	return createSuccessResponse(allPosts)
})

export const adminHasAccessServerFn = createServerFn({
	method: 'GET',
}).handler(async (): Promise<boolean> => {
	const admin = await requireAdmin()
	return Boolean(admin)
})

export const adminCreatePostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => CreatePostInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<PostDetail>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

		const post = await createPost({
			slug: data.slug,
			title: data.title,
			excerpt: data.excerpt,
			content: data.content,
			coverImageKey: data.coverImageKey ?? null,
			status: 'draft',
		})

		return createSuccessResponse(post)
	})

export const adminUpdatePostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => UpdatePostInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<PostDetail>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

		const { postId, ...rest } = data
		const updated = await updatePost(postId, rest)

		if (!updated) return createErrorResponse('Post not found', ERROR_CODE_NOT_FOUND)

		return createSuccessResponse(updated)
	})

export const adminPublishPostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => PublishInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<PostDetail>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

		const published = await publishPost(data.postId)
		if (!published)
			return createErrorResponse('Post not found or already published', ERROR_CODE_NOT_FOUND)

		return createSuccessResponse(published)
	})

export const adminUnpublishPostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => PublishInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<PostDetail>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

		const unpublished = await unpublishPost(data.postId)
		if (!unpublished)
			return createErrorResponse('Post not found or not published', ERROR_CODE_NOT_FOUND)

		return createSuccessResponse(unpublished)
	})

export const adminGetPresignedUploadUrlServerFn = createServerFn({
	method: 'POST',
})
	.inputValidator((input: unknown) => GetPresignedUrlInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<{ url: string; key: string }>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)

		const key = `covers/${Date.now()}-${data.filename.replace(/[^a-zA-Z0-9._-]/g, '_')}`
		const url = await getPresignedUploadUrl(key, data.contentType)

		return createSuccessResponse({ url, key })
	})

export type AdminAnalytics = {
	totalPosts: number
	publishedPosts: number
	draftPosts: number
	totalComments: number
	totalReactions: number
	totalSubscribers: number
	topPostsByViews: {
		id: string
		slug: string
		title: string
		viewCount: number
		likeCount: number
		commentCount: number
	}[]
	topPostsByLikes: {
		id: string
		slug: string
		title: string
		viewCount: number
		likeCount: number
		commentCount: number
	}[]
}

export const adminGetAnalyticsServerFn = createServerFn({
	method: 'GET',
}).handler(async (): Promise<ApiResponse<AdminAnalytics>> => {
	const admin = await requireAdmin()
	if (!admin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)

	const TOP_POSTS_LIMIT = 5

	const [[postsRow], [commentsRow], [reactionsRow], [subscribersRow], topByViews, topByLikes] =
		await Promise.all([
			db
				.select({
					total: count(),
					published: sql<number>`sum(case when ${posts.status} = 'published' then 1 else 0 end)::int`,
					draft: sql<number>`sum(case when ${posts.status} = 'draft' then 1 else 0 end)::int`,
				})
				.from(posts),
			db.select({ total: count() }).from(comments).where(isNull(comments.deletedAt)),
			db.select({ total: count() }).from(reactions).where(isNull(reactions.deletedAt)),
			db
				.select({ total: count() })
				.from(newsletterSubscribers)
				.where(
					and(
						isNotNull(newsletterSubscribers.confirmedAt),
						isNull(newsletterSubscribers.unsubscribedAt),
					),
				),
			db
				.select({
					id: posts.id,
					slug: posts.slug,
					title: posts.title,
					viewCount: posts.viewCount,
					likeCount: posts.likeCount,
					commentCount: posts.commentCount,
				})
				.from(posts)
				.where(eq(posts.status, 'published'))
				.orderBy(desc(posts.viewCount))
				.limit(TOP_POSTS_LIMIT),
			db
				.select({
					id: posts.id,
					slug: posts.slug,
					title: posts.title,
					viewCount: posts.viewCount,
					likeCount: posts.likeCount,
					commentCount: posts.commentCount,
				})
				.from(posts)
				.where(eq(posts.status, 'published'))
				.orderBy(desc(posts.likeCount))
				.limit(TOP_POSTS_LIMIT),
		])

	return createSuccessResponse({
		totalPosts: postsRow?.total ?? 0,
		publishedPosts: postsRow?.published ?? 0,
		draftPosts: postsRow?.draft ?? 0,
		totalComments: commentsRow?.total ?? 0,
		totalReactions: reactionsRow?.total ?? 0,
		totalSubscribers: subscribersRow?.total ?? 0,
		topPostsByViews: topByViews,
		topPostsByLikes: topByLikes,
	})
})

export type AdminCommentFilter = 'all' | 'active' | 'deleted'

export type AdminComment = {
	id: string
	postId: string
	postSlug: string
	postTitle: string
	authorName: string
	content: string
	deletedAt: Date | null
	createdAt: Date
}

const AdminGetCommentsInputSchema = z.object({
	filter: z.enum(['all', 'active', 'deleted']).default('active'),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(MAX_PAGE_SIZE).optional().default(DEFAULT_PAGE_SIZE),
})

export const adminGetCommentsServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => AdminGetCommentsInputSchema.parse(input))
	.handler(
		async ({
			data,
		}): Promise<ApiResponse<{ items: AdminComment[]; nextCursor: string | null }>> => {
			const admin = await requireAdmin()
			if (!admin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)

			const filterCondition =
				data.filter === 'active'
					? isNull(comments.deletedAt)
					: data.filter === 'deleted'
						? isNotNull(comments.deletedAt)
						: undefined

			const rows = await db
				.select({
					id: comments.id,
					postId: comments.postId,
					postSlug: posts.slug,
					postTitle: posts.title,
					authorName: comments.authorName,
					content: comments.content,
					deletedAt: comments.deletedAt,
					createdAt: comments.createdAt,
				})
				.from(comments)
				.innerJoin(posts, eq(comments.postId, posts.id))
				.where(filterCondition)
				.orderBy(desc(comments.createdAt))
				.limit(data.limit + 1)

			const hasNextPage = rows.length > data.limit
			const items = hasNextPage ? rows.slice(0, data.limit) : rows
			const nextCursor =
				hasNextPage && items.length > 0 ? items[items.length - 1].createdAt.toISOString() : null

			return createSuccessResponse({ items, nextCursor })
		},
	)

const CommentIdInputSchema = z.object({ commentId: z.uuid() })

export const adminDeleteCommentServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => CommentIdInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)

		const deleted = await adminSoftDeleteComment(data.commentId)
		if (!deleted)
			return createErrorResponse('Comment not found or already deleted', ERROR_CODE_NOT_FOUND)

		return createSuccessResponse(null)
	})

export const adminRestoreCommentServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => CommentIdInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const admin = await requireAdmin()
		if (!admin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)

		const restored = await adminRestoreComment(data.commentId)
		if (!restored) return createErrorResponse('Comment not found', ERROR_CODE_NOT_FOUND)

		return createSuccessResponse(null)
	})
