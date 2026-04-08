import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

export const env = createEnv({
	server: {
		DATABASE_URL: z.url(),
		BETTER_AUTH_SECRET: z.string().min(32),
		BETTER_AUTH_URL: z.url(),
		ADMIN_EMAIL: z.email(),
		RESEND_API_KEY: z.string().startsWith('re_'),
		UPSTASH_REDIS_REST_URL: z.url(),
		UPSTASH_REDIS_REST_TOKEN: z.string().min(1),
		CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().min(1),
		CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().min(1),
		CLOUDFLARE_R2_ACCOUNT_ID: z.string().min(1),
		CLOUDFLARE_R2_BUCKET_NAME: z.string().min(1),
		CLOUDFLARE_R2_PUBLIC_URL: z.url(),
	},

	clientPrefix: 'VITE_',

	client: {
		VITE_APP_URL: z.url(),
		VITE_UMAMI_URL: z.url().optional(),
		VITE_UMAMI_WEBSITE_ID: z.string().min(1).optional(),
	},

	runtimeEnv: {
		DATABASE_URL: process.env.DATABASE_URL,
		BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
		BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
		ADMIN_EMAIL: process.env.ADMIN_EMAIL,
		RESEND_API_KEY: process.env.RESEND_API_KEY,
		UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL,
		UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN,
		CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
		CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
		CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
		CLOUDFLARE_R2_BUCKET_NAME: process.env.CLOUDFLARE_R2_BUCKET_NAME,
		CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
		VITE_APP_URL: import.meta.env.VITE_APP_URL,
		VITE_UMAMI_URL: import.meta.env.VITE_UMAMI_URL,
		VITE_UMAMI_WEBSITE_ID: import.meta.env.VITE_UMAMI_WEBSITE_ID,
	},

	emptyStringAsUndefined: true,
})
