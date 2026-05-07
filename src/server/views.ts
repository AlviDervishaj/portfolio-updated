'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { z } from 'zod'
import { VIEW_RATE_LIMIT_REQUESTS, VIEW_RATE_LIMIT_WINDOW_SECONDS } from '#/constants/rateLimit.ts'
import { auth } from '#/lib/auth.ts'
import { buildRateLimitKey, checkRateLimit } from '#/lib/rateLimit.ts'
import { createSuccessResponse } from '#/lib/responseFactory.ts'
import { incrementPostViewCount } from '#/services/posts.ts'
import type { ApiResponse } from '#/types/api.ts'

const IncrementViewInputSchema = z.object({
	postId: z.uuid(),
})

async function resolveViewIdentifier(): Promise<string> {
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

export const incrementViewServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => IncrementViewInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const identifier = await resolveViewIdentifier()
		const key = buildRateLimitKey('view', `${data.postId}:${identifier}`)
		const rateLimit = await checkRateLimit(
			key,
			VIEW_RATE_LIMIT_REQUESTS,
			VIEW_RATE_LIMIT_WINDOW_SECONDS,
		)

		if (!rateLimit.success) {
			return createSuccessResponse(null)
		}

		await incrementPostViewCount(data.postId)
		return createSuccessResponse(null)
	})
