import { createFileRoute } from '@tanstack/react-router'
import { unsubscribeNewsletterServerFn } from '#/server/newsletter.ts'

export const Route = createFileRoute('/api/newsletter/unsubscribe')({
	server: {
		handlers: {
			GET: async ({ request }) => {
				const token = new URL(request.url).searchParams.get('token') ?? ''
				await unsubscribeNewsletterServerFn({ data: { token } })
				return new Response(null, {
					status: 302,
					headers: { Location: '/?newsletter=unsubscribed' },
				})
			},
		},
	},
})
