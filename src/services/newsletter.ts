'use server'

import { and, count, eq, isNotNull, isNull } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { newsletterSubscribers } from '#/db/schema.ts'

export async function subscribeToNewsletter(
	email: string,
	token: string,
): Promise<{ isNew: boolean }> {
	const [existing] = await db
		.select()
		.from(newsletterSubscribers)
		.where(eq(newsletterSubscribers.email, email))
		.limit(1)

	if (existing) {
		if (existing.unsubscribedAt) {
			await db
				.update(newsletterSubscribers)
				.set({ unsubscribedAt: null, token, updatedAt: new Date() })
				.where(eq(newsletterSubscribers.id, existing.id))
			return { isNew: true }
		}
		return { isNew: false }
	}

	await db.insert(newsletterSubscribers).values({ email, token })
	return { isNew: true }
}

export async function confirmNewsletterSubscription(
	token: string,
): Promise<{ email: string } | null> {
	const result = await db
		.update(newsletterSubscribers)
		.set({ confirmedAt: new Date(), updatedAt: new Date() })
		.where(and(eq(newsletterSubscribers.token, token), isNull(newsletterSubscribers.confirmedAt)))
		.returning({ email: newsletterSubscribers.email })

	return result[0] ?? null
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
