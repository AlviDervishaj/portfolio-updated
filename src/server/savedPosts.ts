'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { ERROR_CODE_UNAUTHORIZED } from '#/constants/errorCodes.ts'
import { auth } from '#/lib/auth.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import type { SavedPostSummary } from '#/services/savedPosts.ts'
import { getSavedPostsForUser, isPostSaved, savePost, unsavePost } from '#/services/savedPosts.ts'
import type { ApiResponse } from '#/types/api.ts'

async function requireSession() {
	return auth.api.getSession({
		headers: new Headers({ cookie: getRequestHeader('cookie') ?? '' }),
	})
}

export const savePostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const session = await requireSession()
		if (!session?.user) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)
		await savePost(session.user.id, data.postId)
		return createSuccessResponse(null)
	})

export const unsavePostServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const session = await requireSession()
		if (!session?.user) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)
		await unsavePost(session.user.id, data.postId)
		return createSuccessResponse(null)
	})

export const getIsPostSavedServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => z.object({ postId: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<boolean>> => {
		const session = await requireSession()
		if (!session?.user) return createSuccessResponse(false)
		const saved = await isPostSaved(session.user.id, data.postId)
		return createSuccessResponse(saved)
	})

export const getSavedPostsServerFn = createServerFn({ method: 'GET' }).handler(
	async (): Promise<ApiResponse<SavedPostSummary[]>> => {
		const session = await requireSession()
		if (!session?.user) return createErrorResponse('Unauthorized', ERROR_CODE_UNAUTHORIZED)
		const saved = await getSavedPostsForUser(session.user.id)
		return createSuccessResponse(saved)
	},
)
