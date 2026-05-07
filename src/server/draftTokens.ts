'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { ERROR_CODE_FORBIDDEN } from '#/constants/errorCodes.ts'
import {
	COVER_IMAGE_FORMAT,
	COVER_IMAGE_QUALITY,
	COVER_IMAGE_WIDTH,
} from '#/constants/imageTransform.ts'
import type { DraftToken } from '#/db/schema.ts'
import { env } from '#/env.ts'
import { auth } from '#/lib/auth.ts'
import type { TocEntry } from '#/lib/mdx.ts'
import { renderMdx } from '#/lib/mdx.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import { getOptimizedImageUrl } from '#/lib/storage.ts'
import {
	getDraftTokenForPost,
	getPostByDraftToken,
	revokeDraftToken,
	upsertDraftToken,
} from '#/services/draftTokens.ts'
import type { PostDetail } from '#/services/posts.ts'
import type { ApiResponse } from '#/types/api.ts'

async function requireAdmin(): Promise<boolean> {
	const session = await auth.api.getSession({
		headers: new Headers({ cookie: getRequestHeader('cookie') ?? '' }),
	})
	if (!session?.user) return false
	return session.user.email === env.ADMIN_EMAIL
}

export const adminGenerateDraftTokenServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<{ token: string; previewUrl: string }>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		const token = crypto.randomUUID()
		await upsertDraftToken(data.postId, token)
		const previewUrl = `${env.VITE_APP_URL}/preview/${token}`
		return createSuccessResponse({ token, previewUrl })
	})

export const adminRevokeDraftTokenServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		await revokeDraftToken(data.postId)
		return createSuccessResponse(null)
	})

export const adminGetDraftTokenServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<DraftToken | null>> => {
		const isAdmin = await requireAdmin()
		if (!isAdmin) return createErrorResponse('Forbidden', ERROR_CODE_FORBIDDEN)
		const token = await getDraftTokenForPost(data.postId)
		return createSuccessResponse(token)
	})

export type DraftPreviewData = {
	post: PostDetail
	html: string
	readingTimeMinutes: number
	toc: TocEntry[]
	coverImageUrl: string | null
}

export const getDraftByTokenServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => z.object({ token: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<DraftPreviewData | null> => {
		const post = await getPostByDraftToken(data.token)
		if (!post) return null
		const { html, readingTimeMinutes, toc } = await renderMdx(post.content)
		const coverImageUrl = post.coverImageKey
			? getOptimizedImageUrl(post.coverImageKey, {
					width: COVER_IMAGE_WIDTH,
					quality: COVER_IMAGE_QUALITY,
					format: COVER_IMAGE_FORMAT,
					fit: 'cover',
				})
			: null
		return { post, html, readingTimeMinutes, toc, coverImageUrl }
	})
