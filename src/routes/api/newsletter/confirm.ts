import { createFileRoute } from '@tanstack/react-router'
import { confirmNewsletterServerFn } from '#/server/newsletter.ts'

export const Route = createFileRoute('/api/newsletter/confirm')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const token = new URL(request.url).searchParams.get('token') ?? ''
				const result = await confirmNewsletterServerFn({ data: { token } })
				const status = result.success ? 'confirmed' : 'invalid'
				return new Response(null, {
					status: 302,
					headers: { Location: `/?newsletter=${status}` },
				})
			},
		},
	},
})
