'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { ERROR_CODE_FORBIDDEN } from '#/constants/errorCodes.ts'
import type { Tag } from '#/db/schema.ts'
import { env } from '#/env.ts'
import { auth } from '#/lib/auth.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import type { PostSortStrategy, PostsPage } from '#/services/posts.ts'
import {
	createTag,
	deleteTag,
	getAllTags,
	getPublishedPostsPageByTag,
	getTagsForPost,
	setTagsForPost,
} from '#/services/tags.ts'
import type { ApiResponse } from '#/types/api.ts'

async function requireAdmin(): Promise<boolean> {
	const session = await auth.api.getSession({
		headers: new Headers({ cookie: getRequestHeader('cookie') ?? '' }),
	})
	if (!session?.user) return false
	return session.user.email === env.ADMIN_EMAIL
}

export const getTagsServerFn = createServerFn({ method: 'GET' }).handler(
	async (): Promise<ApiResponse<Tag[]>> => {
		const allTags = await getAllTags()
		return createSuccessResponse(allTags)
	},
)

export const getTagsForPostServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<Tag[]>> => {
		const postTags = await getTagsForPost(data.postId)
		return createSuccessResponse(postTags)
	})

export const getPostsByTagServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) =>
		z
			.object({
				tagSlug: z.string().min(1),
				strategy: z.enum(['date', 'likes', 'comments']).optional(),
			})
			.parse(input),
	)
	.handler(async ({ data }): Promise<PostsPage> => {
		return getPublishedPostsPageByTag(data.tagSlug, (data.strategy ?? 'date') as PostSortStrategy)
	})

export const adminCreateTagServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) =>
		z
			.object({
				name: z.string().min(1).max(50),
				slug: z.string().min(1).max(50),
			})
			.parse(input),
	)
	.handler(async ({ data }): Promise<ApiResponse<Tag>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		const tag = await createTag(data.name, data.slug)
		return createSuccessResponse(tag)
	})

export const adminDeleteTagServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ tagId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		await deleteTag(data.tagId)
		return createSuccessResponse(null)
	})

export const adminSetTagsForPostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) =>
		z
			.object({
				postId: z.uuid(),
				tagIds: z.array(z.uuid()),
			})
			.parse(input),
	)
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		await setTagsForPost(data.postId, data.tagIds)
		return createSuccessResponse(null)
	})
