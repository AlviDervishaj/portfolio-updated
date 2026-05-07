'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { createElement } from 'react'
import { z } from 'zod'
import { ERROR_CODE_NOT_FOUND, ERROR_CODE_RATE_LIMITED } from '#/constants/errorCodes.ts'
import {
	NEWSLETTER_RATE_LIMIT_REQUESTS,
	NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
} from '#/constants/rateLimit.ts'
import { NewsletterConfirmEmail } from '#/emails/NewsletterConfirmEmail.tsx'
import { NewsletterWelcomeEmail } from '#/emails/NewsletterWelcomeEmail.tsx'
import { env } from '#/env.ts'
import { sendEmail } from '#/lib/email.ts'
import { buildRateLimitKey, checkRateLimit } from '#/lib/rateLimit.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import {
	confirmNewsletterSubscription,
	subscribeToNewsletter,
	unsubscribeFromNewsletter,
} from '#/services/newsletter.ts'
import type { ApiResponse } from '#/types/api.ts'

export const subscribeNewsletterServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ email: z.email() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const ip = getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-real-ip') ?? 'unknown'
		const key = buildRateLimitKey('newsletter', ip)
		const rateLimit = await checkRateLimit(
			key,
			NEWSLETTER_RATE_LIMIT_REQUESTS,
			NEWSLETTER_RATE_LIMIT_WINDOW_SECONDS,
		)

		if (!rateLimit.success) {
			return createErrorResponse('Too many requests.', ERROR_CODE_RATE_LIMITED)
		}

		const token = crypto.randomUUID()
		const result = await subscribeToNewsletter(data.email, token)

		if (result.isNew) {
			const confirmUrl = `${env.VITE_APP_URL}/api/newsletter/confirm?token=${token}`
			await sendEmail({
				to: data.email,
				subject: 'Confirm your subscription',
				react: createElement(NewsletterConfirmEmail, { confirmUrl }),
			})
		}

		return createSuccessResponse(null)
	})

export const confirmNewsletterServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ token: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const confirmed = await confirmNewsletterSubscription(data.token)
		if (!confirmed) {
			return createErrorResponse('Invalid or expired token.', ERROR_CODE_NOT_FOUND)
		}

		const unsubscribeUrl = `${env.VITE_APP_URL}/api/newsletter/unsubscribe?token=${data.token}`
		await sendEmail({
			to: confirmed.email,
			subject: "You're subscribed!",
			react: createElement(NewsletterWelcomeEmail, { unsubscribeUrl }),
		})

		return createSuccessResponse(null)
	})

export const unsubscribeNewsletterServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => z.object({ token: z.uuid() }).parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		await unsubscribeFromNewsletter(data.token)
		return createSuccessResponse(null)
	})
