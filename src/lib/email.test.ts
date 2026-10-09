import { createElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendEmail } from './email'

const { send } = vi.hoisted(() => ({ send: vi.fn() }))
vi.mock('#/env.ts', () => ({ env: { RESEND_API_KEY: 're_test' } }))
vi.mock('resend', () => ({
	Resend: class {
		emails = { send }
	},
}))

beforeEach((): void => {
	send.mockReset()
})

describe('email delivery response', (): void => {
	const payload = {
		to: 'test@example.com',
		subject: 'Test',
		react: createElement('p', null, 'Test'),
	}
	it('rejects when Resend returns a provider error', async (): Promise<void> => {
		send.mockResolvedValue({ data: null, error: { message: 'Sender not verified' } })
		await expect(sendEmail(payload)).rejects.toThrow('Sender not verified')
	})
	it('accepts successful delivery submission', async (): Promise<void> => {
		send.mockResolvedValue({ data: { id: 'test-message' }, error: null })
		await expect(sendEmail(payload)).resolves.toBeUndefined()
		expect(send).toHaveBeenCalledWith({ from: 'portfolio@shunger.dev', ...payload })
	})
})
