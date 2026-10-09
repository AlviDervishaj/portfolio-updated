// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { pool, testSchema, sendEmail } = await vi.hoisted(async () => {
	const { Pool } = await import('pg')
	const { randomUUID } = await import('node:crypto')
	const testSchema = `newsletter_test_${randomUUID().replaceAll('-', '')}`
	return {
		testSchema,
		sendEmail: vi.fn(),
		pool: new Pool({
			connectionString: process.env.NEWSLETTER_TEST_DATABASE_URL,
			options: `-c search_path=${testSchema}`,
		}),
	}
})

vi.mock('#/db/index.ts', async () => {
	const { drizzle } = await import('drizzle-orm/node-postgres')
	return { db: drizzle(pool) }
})

vi.mock('#/env.ts', () => ({ env: { VITE_APP_URL: 'https://portfolio.test' } }))
vi.mock('#/lib/email.ts', () => ({ sendEmail }))

import {
	confirmNewsletterSubscription,
	getConfirmedSubscriberCount,
	subscribeToNewsletter,
	unsubscribeFromNewsletter,
} from './newsletter.ts'

const email = 'reader@example.com'
const databaseUrl = process.env.NEWSLETTER_TEST_DATABASE_URL
let schemaCreated = false

async function subscriber() {
	const result = await pool.query('select * from newsletter_subscribers where email = $1', [email])
	return result.rows[0]
}

describe.skipIf(!databaseUrl)('newsletter lifecycle with PostgreSQL', () => {
	beforeAll(async () => {
		const url = new URL(databaseUrl ?? '')
		if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/portfolio_test') {
			throw new Error('Use a disposable local portfolio_test database')
		}
		await pool.query(`create schema ${testSchema}`)
		schemaCreated = true
		const migration = await readFile('drizzle/0000_odd_vin_gonzales.sql', 'utf8')
		await pool.query(migration.replaceAll('"public".', `"${testSchema}".`))
	})

	beforeEach(async () => {
		await pool.query('truncate newsletter_subscribers')
		sendEmail.mockReset()
		sendEmail.mockResolvedValue(undefined)
	})

	afterAll(async () => {
		if (schemaCreated) await pool.query(`drop schema ${testSchema} cascade`)
		await pool.end()
	})

	it('sends confirmation and keeps new signups pending', async () => {
		await subscribeToNewsletter(email)
		const row = await subscriber()
		expect(row.confirmed_at).toBeNull()
		expect(await getConfirmedSubscriberCount()).toBe(0)
		expect(sendEmail).toHaveBeenCalledWith(
			expect.objectContaining({
				to: email,
				subject: 'Confirm your subscription',
				react: expect.objectContaining({
					props: {
						confirmUrl: `https://portfolio.test/api/newsletter/confirm?token=${row.token}`,
					},
				}),
			}),
		)
	})

	it('retries failed confirmation delivery and retains the pending token', async () => {
		sendEmail.mockRejectedValueOnce(new Error('Delivery failed'))
		await expect(subscribeToNewsletter(email)).rejects.toThrow('Delivery failed')
		const pending = await subscriber()
		await subscribeToNewsletter(email)
		await subscribeToNewsletter(email)
		expect((await subscriber()).token).toBe(pending.token)
		expect(sendEmail).toHaveBeenCalledTimes(3)
		expect(await confirmNewsletterSubscription(pending.token)).toBe(true)
	})

	it('confirms once and makes repeated signup and confirmation successful without new mail', async () => {
		await subscribeToNewsletter(email)
		const { token } = await subscriber()
		expect(await confirmNewsletterSubscription(token)).toBe(true)
		expect(await getConfirmedSubscriberCount()).toBe(1)
		expect(sendEmail).toHaveBeenLastCalledWith(
			expect.objectContaining({
				subject: "You're subscribed!",
				react: expect.objectContaining({
					props: {
						unsubscribeUrl: `https://portfolio.test/api/newsletter/unsubscribe?token=${token}`,
					},
				}),
			}),
		)
		const confirmedAt = (await subscriber()).confirmed_at
		await subscribeToNewsletter(email)
		expect(await confirmNewsletterSubscription(token)).toBe(true)
		expect((await subscriber()).confirmed_at).toEqual(confirmedAt)
		expect(sendEmail).toHaveBeenCalledTimes(2)
	})

	it('retains confirmation when welcome delivery fails and does not retry that email', async () => {
		await subscribeToNewsletter(email)
		const { token } = await subscriber()
		sendEmail.mockRejectedValueOnce(new Error('Welcome failed'))
		expect(await confirmNewsletterSubscription(token)).toBe(true)
		expect(await getConfirmedSubscriberCount()).toBe(1)
		expect(await confirmNewsletterSubscription(token)).toBe(true)
		expect(sendEmail).toHaveBeenCalledTimes(2)
	})

	it('requires fresh confirmation after unsubscribe and invalidates the old token', async () => {
		await subscribeToNewsletter(email)
		const { token: oldToken } = await subscriber()
		await confirmNewsletterSubscription(oldToken)
		expect(await unsubscribeFromNewsletter(oldToken)).toBe(true)
		expect(await confirmNewsletterSubscription(oldToken)).toBe(false)
		expect(await getConfirmedSubscriberCount()).toBe(0)
		await subscribeToNewsletter(email)
		const row = await subscriber()
		expect(row.token).not.toBe(oldToken)
		expect(row.confirmed_at).toBeNull()
		expect(row.unsubscribed_at).toBeNull()
		expect(await confirmNewsletterSubscription(oldToken)).toBe(false)
		expect(await unsubscribeFromNewsletter(oldToken)).toBe(false)
		expect(await getConfirmedSubscriberCount()).toBe(0)
		expect(await confirmNewsletterSubscription(row.token)).toBe(true)
		expect(await getConfirmedSubscriberCount()).toBe(1)
	})

	it('does not reactivate an unsubscribed pending signup through its old confirmation link', async () => {
		await subscribeToNewsletter(email)
		const { token } = await subscriber()
		await unsubscribeFromNewsletter(token)
		expect(await confirmNewsletterSubscription(token)).toBe(false)
		expect(await getConfirmedSubscriberCount()).toBe(0)
		expect(sendEmail).toHaveBeenCalledTimes(1)
	})

	it('rejects unknown confirmation tokens without sending mail', async () => {
		expect(await confirmNewsletterSubscription(crypto.randomUUID())).toBe(false)
		expect(sendEmail).not.toHaveBeenCalled()
	})

	it('handles concurrent signups and sends just one welcome for concurrent confirmations', async () => {
		await Promise.all(Array.from({ length: 5 }, () => subscribeToNewsletter(email)))
		expect((await pool.query('select * from newsletter_subscribers')).rows).toHaveLength(1)
		const { token } = await subscriber()
		expect(
			sendEmail.mock.calls.every(([message]) => message.react.props.confirmUrl.endsWith(token)),
		).toBe(true)
		sendEmail.mockClear()
		const results = await Promise.all(
			Array.from({ length: 5 }, () => confirmNewsletterSubscription(token)),
		)
		expect(results).toEqual([true, true, true, true, true])
		expect(sendEmail).toHaveBeenCalledTimes(1)
	})
})
