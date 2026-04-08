import { createFileRoute } from '@tanstack/react-router'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { getPostsServerFn } from '#/server/posts.ts'

const SITE_URL = env.VITE_APP_URL ?? USER.FULL_SITE_URL
const SITE_TITLE = `Writing - ${USER.FULL_NAME}`
const SITE_DESCRIPTION =
	'Writing about TypeScript, full-stack development, and building for the web.'

function escapeXml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&apos;')
}

async function buildRssFeed(): Promise<Response> {
	const { items } = await getPostsServerFn({ data: { strategy: 'date', limit: 50 } })

	const itemsXml = items
		.map((post) => {
			const url = `${SITE_URL}/blog/${post.slug}`
			const pubDate = post.publishedAt
				? new Date(post.publishedAt).toUTCString()
				: new Date().toUTCString()

			return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${pubDate}</pubDate>
    </item>`
		})
		.join('')

	const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/api/rss" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${itemsXml}
  </channel>
</rss>`

	return new Response(rss, {
		headers: {
			'Content-Type': 'application/rss+xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	})
}

export const Route = createFileRoute('/api/rss')({
	server: {
		handlers: {
			GET: () => buildRssFeed(),
		},
	},
})
