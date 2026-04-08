'use server'

import { dash } from '@better-auth/infra'
import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { tanstackStartCookies } from 'better-auth/tanstack-start'
import { createElement } from 'react'
import { db } from '#/db/index.ts'
import * as schema from '#/db/schema.ts'
import PasswordResetEmail from '#/emails/PasswordResetEmail.tsx'
import { env } from '#/env.ts'
import { sendEmail } from '#/lib/email.ts'

export const auth = betterAuth({
	baseURL: env.BETTER_AUTH_URL,
	trustedOrigins: [env.BETTER_AUTH_URL, env.VITE_APP_URL],
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg', schema }),
	emailAndPassword: {
		enabled: true,
		sendResetPassword: async ({ user, url }) => {
			if (!user.email) {
				return
			}

			await sendEmail({
				to: user.email,
				subject: 'Reset your password',
				react: createElement(PasswordResetEmail, { resetUrl: url }),
			})
		},
	},
	plugins: [tanstackStartCookies(), dash()],
})
