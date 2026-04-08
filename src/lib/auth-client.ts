import { sentinelClient } from '@better-auth/infra/client'
import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_APP_URL,
	plugins: [
		// ... other plugins
		sentinelClient(),
	],
})
