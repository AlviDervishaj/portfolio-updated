'use server'

import { Resend } from 'resend'

import { env } from '#/env.ts'

const resend = new Resend(env.RESEND_API_KEY)

const FROM_ADDRESS = 'portfolio@shunger.dev'

export type EmailPayload = {
	to: string
	subject: string
	react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: EmailPayload): Promise<void> {
	const { error } = await resend.emails.send({
		from: FROM_ADDRESS,
		to,
		subject,
		react,
	})
	if (error) throw new Error(error.message)
}
