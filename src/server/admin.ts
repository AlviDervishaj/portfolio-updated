'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import {
	MAX_POST_CONTENT_LENGTH,
	MAX_POST_SLUG_LENGTH,
	MAX_POST_TITLE_LENGTH,
} from '#/constants/content.ts'
import { ERROR_CODE_NOT_FOUND, ERROR_CODE_UNAUTHORIZED } from '#/constants/errorCodes.ts'
import { env } from '#/env.ts'
import { auth } from '#/lib/auth.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import { getPresignedUploadUrl } from '#/lib/storage.ts'
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
