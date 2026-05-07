'use server'

import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader } from '@tanstack/react-start/server'
import { createElement } from 'react'
import { z } from 'zod'
import {
	MAX_CONTACT_MESSAGE_LENGTH,
	MAX_CONTACT_NAME_LENGTH,
	MAX_CONTACT_SUBJECT_LENGTH,
} from '#/constants/content.ts'
import { ERROR_CODE_RATE_LIMITED } from '#/constants/errorCodes.ts'
import {
	CONTACT_RATE_LIMIT_REQUESTS,
	CONTACT_RATE_LIMIT_WINDOW_SECONDS,
} from '#/constants/rateLimit.ts'
import { ContactEmail } from '#/emails/ContactEmail.tsx'
import { env } from '#/env.ts'
import { sendEmail } from '#/lib/email.ts'
import { buildRateLimitKey, checkRateLimit } from '#/lib/rateLimit.ts'
import { createErrorResponse, createSuccessResponse } from '#/lib/responseFactory.ts'
import type { ApiResponse } from '#/types/api.ts'

const ContactInputSchema = z.object({
	name: z.string().min(1).max(MAX_CONTACT_NAME_LENGTH),
	email: z.email(),
	subject: z.string().min(1).max(MAX_CONTACT_SUBJECT_LENGTH),
	message: z.string().min(10).max(MAX_CONTACT_MESSAGE_LENGTH),
})

export const submitContactFormServerFn = createServerFn({ method: 'POST' })
	.inputValidator((input: unknown) => ContactInputSchema.parse(input))
	.handler(async ({ data }): Promise<ApiResponse<null>> => {
		const ip = getRequestHeader('x-forwarded-for') ?? getRequestHeader('x-real-ip') ?? 'unknown'
		const key = buildRateLimitKey('contact', ip)
		const rateLimit = await checkRateLimit(
			key,
			CONTACT_RATE_LIMIT_REQUESTS,
			CONTACT_RATE_LIMIT_WINDOW_SECONDS,
		)

		if (!rateLimit.success) {
			return createErrorResponse(
				'Too many requests. Please wait before sending another message.',
				ERROR_CODE_RATE_LIMITED,
			)
		}

		await sendEmail({
			to: env.ADMIN_EMAIL,
			subject: `[Contact] ${data.subject}`,
			react: createElement(ContactEmail, {
				senderName: data.name,
				senderEmail: data.email,
				subject: data.subject,
				message: data.message,
			}),
		})

		return createSuccessResponse(null)
	})
