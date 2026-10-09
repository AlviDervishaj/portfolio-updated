'use server'

import { and, count, eq, isNotNull, isNull } from 'drizzle-orm'
import { createElement } from 'react'
import { db } from '#/db/index.ts'
import { newsletterSubscribers } from '#/db/schema.ts'
import { NewsletterConfirmEmail } from '#/emails/NewsletterConfirmEmail.tsx'
import { NewsletterWelcomeEmail } from '#/emails/NewsletterWelcomeEmail.tsx'
import { env } from '#/env.ts'
import { sendEmail } from '#/lib/email.ts'

export async function subscribeToNewsletter(email: string): Promise<void> {
	const subscriber = await db.transaction(async (tx) => {
		const token = crypto.randomUUID()
		await tx
			.insert(newsletterSubscribers)
			.values({ email, token })
			.onConflictDoNothing({ target: newsletterSubscribers.email })
		const [existing] = await tx
			.select()
			.from(newsletterSubscribers)
			.where(eq(newsletterSubscribers.email, email))
			.for('update')

		if (existing.unsubscribedAt) {
			const [pending] = await tx
				.update(newsletterSubscribers)
				.set({ confirmedAt: null, unsubscribedAt: null, token, updatedAt: new Date() })
				.where(eq(newsletterSubscribers.id, existing.id))
				.returning()
			return pending
		}
		return existing.confirmedAt ? null : existing
	})

	if (!subscriber) return
	const confirmUrl = `${env.VITE_APP_URL}/api/newsletter/confirm?token=${subscriber.token}`
	await sendEmail({
		to: subscriber.email,
		subject: 'Confirm your subscription',
		react: createElement(NewsletterConfirmEmail, { confirmUrl }),
	})
}

export async function confirmNewsletterSubscription(token: string): Promise<boolean> {
	const [confirmed] = await db
		.update(newsletterSubscribers)
		.set({ confirmedAt: new Date(), updatedAt: new Date() })
		.where(
			and(
				eq(newsletterSubscribers.token, token),
				isNull(newsletterSubscribers.confirmedAt),
				isNull(newsletterSubscribers.unsubscribedAt),
			),
		)
		.returning({ email: newsletterSubscribers.email })

	if (!confirmed) {
		const [existing] = await db
			.select({ id: newsletterSubscribers.id })
			.from(newsletterSubscribers)
			.where(
				and(
					eq(newsletterSubscribers.token, token),
					isNotNull(newsletterSubscribers.confirmedAt),
					isNull(newsletterSubscribers.unsubscribedAt),
				),
			)
			.limit(1)
		return existing !== undefined
	}

	try {
		await sendEmail({
			to: confirmed.email,
			subject: "You're subscribed!",
			react: createElement(NewsletterWelcomeEmail, {
				unsubscribeUrl: `${env.VITE_APP_URL}/api/newsletter/unsubscribe?token=${token}`,
			}),
		})
	} catch {
		// Welcome delivery is best effort; confirmation stays valid and repeats send nothing.
		return true
	}
	return true
}

export async function unsubscribeFromNewsletter(token: string): Promise<boolean> {
	const result = await db
		.update(newsletterSubscribers)
		.set({ unsubscribedAt: new Date(), updatedAt: new Date() })
		.where(eq(newsletterSubscribers.token, token))
		.returning({ id: newsletterSubscribers.id })

	return result.length > 0
}

export async function getConfirmedSubscriberCount(): Promise<number> {
	const [row] = await db
		.select({ total: count() })
		.from(newsletterSubscribers)
		.where(
			and(
				isNotNull(newsletterSubscribers.confirmedAt),
				isNull(newsletterSubscribers.unsubscribedAt),
			),
		)
	return row?.total ?? 0
}
