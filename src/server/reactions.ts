'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'

import { ERROR_CODE_RATE_LIMITED } from '#/constants/errorCodes.ts'
import {
	REACTION_RATE_LIMIT_REQUESTS,
	REACTION_RATE_LIMIT_WINDOW_SECONDS,
} from '#/constants/rateLimit.ts'
import { auth } from '#/lib/auth.ts'
import { buildRateLimitKey, checkRateLimit } from '#/lib/rateLimit.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import type { ReactionState } from '#/services/reactions.ts'
import { getReactionState, removeReaction, upsertReaction } from '#/services/reactions.ts'
import type { ApiResponse } from '#/types/api.ts'

const GetReactionInputSchema = z.object({
	postId: z.uuid(),
})

const UpsertReactionInputSchema = z.object({
	postId: z.uuid(),
	type: z.enum(['like', 'dislike']),
})

const RemoveReactionInputSchema = z.object({
	postId: z.uuid(),
})

async function resolveUserIdentifier(): Promise<string> {
	const sessionResult = await auth.api.getSession({
		headers: new Headers({
			cookie: getRequestHeader('cookie') ?? '',
		}),
	})

	if (sessionResult?.user) {
		return `user:${sessionResult.user.id}`
	}

	const ip = getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-real-ip') ?? 'unknown'
	const ua = getRequestHeader('user-agent') ?? ''
	const raw = `${ip}:${ua}`

	const encoder = new TextEncoder()
	const data = encoder.encode(raw)
	const hashBuffer = await crypto.subtle.digest('SHA-256', data)
	const hashArray = Array.from(new Uint8Array(hashBuffer))
	return `anon:${hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')}`
}

export const getReactionStateServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => GetReactionInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<ReactionState>> => {
		const userIdentifier = await resolveUserIdentifier()
		const state = await getReactionState(data.postId, userIdentifier)
		return createSuccessResponse(state)
	})

export const upsertReactionServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => UpsertReactionInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<ReactionState>> => {
		const userIdentifier = await resolveUserIdentifier()

		const rateLimitKey = buildRateLimitKey('reaction', userIdentifier)
		const rateLimit = await checkRateLimit(
			rateLimitKey,
			REACTION_RATE_LIMIT_REQUESTS,
			REACTION_RATE_LIMIT_WINDOW_SECONDS,
		)

		if (!rateLimit.success) {
			return createErrorResponse('Too many reactions. Please slow down.', ERROR_CODE_RATE_LIMITED)
		}

		await upsertReaction(data.postId, userIdentifier, data.type)
		const state = await getReactionState(data.postId, userIdentifier)
		return createSuccessResponse(state)
	})

export const removeReactionServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => RemoveReactionInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<ReactionState>> => {
		const userIdentifier = await resolveUserIdentifier()

		await removeReaction(data.postId, userIdentifier)
		const state = await getReactionState(data.postId, userIdentifier)
		return createSuccessResponse(state)
	})
