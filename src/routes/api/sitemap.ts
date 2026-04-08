import { createFileRoute } from '@tanstack/react-router'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { getAllPublishedSlugsServerFn } from '#/server/posts.ts'

const SITE_URL = env.VITE_APP_URL ?? USER.FULL_SITE_URL

const STATIC_ROUTES = [
	{ path: '/', changefreq: 'monthly', priority: '1.0' },
	{ path: '/about', changefreq: 'monthly', priority: '0.8' },
	{ path: '/blog', changefreq: 'weekly', priority: '0.9' },
	{ path: '/now', changefreq: 'weekly', priority: '0.7' },
]

async function buildSitemap(): Promise<Response> {
	const slugs = await getAllPublishedSlugsServerFn()

	const staticUrls = STATIC_ROUTES.map(
		({ path, changefreq, priority }) => `
  <url>
    <loc>${SITE_URL}${path}</loc>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`,
	).join('')

	const postUrls = slugs
		.map(
			(slug) => `
  <url>
    <loc>${SITE_URL}/blog/${slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`,
		)
		.join('')

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${staticUrls}${postUrls}
</urlset>`

	return new Response(sitemap, {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=3600, s-maxage=3600',
		},
	})
}

export const Route = createFileRoute('/api/sitemap')({
	server: {
		handlers: {
			GET: () => buildSitemap(),
		},
	},
})
