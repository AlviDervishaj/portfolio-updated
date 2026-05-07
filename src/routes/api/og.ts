import { Resvg } from '@resvg/resvg-js'
import { createFileRoute } from '@tanstack/react-router'
import satori from 'satori'
import { OG_IMAGE_HEIGHT, OG_IMAGE_WIDTH, SITE_NAME } from '#/constants/seo'
import { USER } from '#/constants/user'

const SPACE_GROTESK_BOLD_URL =
	'https://cdn.jsdelivr.net/npm/@fontsource/space-grotesk@5/files/space-grotesk-latin-700-normal.woff'
const MANROPE_REGULAR_URL =
	'https://cdn.jsdelivr.net/npm/@fontsource/manrope@5/files/manrope-latin-400-normal.woff'

const fontCache = new Map<string, ArrayBuffer>()

async function loadFont(url: string): Promise<ArrayBuffer> {
	const cached = fontCache.get(url)
	if (cached) return cached
	const res = await fetch(url)
	const buf = await res.arrayBuffer()
	fontCache.set(url, buf)
	return buf
}

type OgType = 'article' | 'page'

function buildOgTemplate(title: string, type: OgType) {
	const label = type === 'article' ? 'Blog Post' : 'Portfolio'
	return {
		type: 'div',
		props: {
			style: {
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				width: OG_IMAGE_WIDTH,
				height: OG_IMAGE_HEIGHT,
				backgroundColor: '#0c0c0c',
				padding: '64px 72px',
				fontFamily: 'Manrope',
			},
			children: [
				{
					type: 'div',
					props: {
						style: {
							display: 'flex',
							alignItems: 'center',
							gap: '12px',
						},
						children: [
							{
								type: 'div',
								props: {
									style: {
										width: '10px',
										height: '10px',
										backgroundColor: '#f08e34',
										borderRadius: '50%',
									},
									children: [],
								},
							},
							{
								type: 'span',
								props: {
									style: {
										fontFamily: 'Manrope',
										fontSize: '14px',
										fontWeight: 400,
										letterSpacing: '0.12em',
										textTransform: 'uppercase',
										color: '#a09a94',
									},
									children: USER.SITE_NAME,
								},
							},
						],
					},
				},
				{
					type: 'div',
					props: {
						style: { display: 'flex', flexDirection: 'column', gap: '24px' },
						children: [
							{
								type: 'h1',
								props: {
									style: {
										fontFamily: 'SpaceGrotesk',
										fontSize: title.length > 50 ? '52px' : '68px',
										fontWeight: 700,
										color: '#f0ede8',
										margin: 0,
										lineHeight: 1.05,
										letterSpacing: '-0.03em',
										maxWidth: '900px',
									},
									children: title,
								},
							},
							{
								type: 'div',
								props: {
									style: {
										display: 'flex',
										alignItems: 'center',
										gap: '16px',
									},
									children: [
										{
											type: 'span',
											props: {
												style: {
													fontFamily: 'Manrope',
													fontSize: '13px',
													fontWeight: 400,
													letterSpacing: '0.1em',
													textTransform: 'uppercase',
													color: '#f08e34',
												},
												children: label,
											},
										},
										{
											type: 'span',
											props: {
												style: {
													width: '4px',
													height: '4px',
													backgroundColor: '#a09a94',
													borderRadius: '50%',
												},
												children: [],
											},
										},
										{
											type: 'span',
											props: {
												style: {
													fontFamily: 'Manrope',
													fontSize: '13px',
													fontWeight: 400,
													letterSpacing: '0.1em',
													textTransform: 'uppercase',
													color: '#a09a94',
												},
												children: USER.FULL_NAME,
											},
										},
									],
								},
							},
						],
					},
				},
			],
		},
	}
}

async function handleOgRequest(request: Request): Promise<Response> {
	const url = new URL(request.url)
	const title = url.searchParams.get('title') ?? SITE_NAME
	const typeParam = url.searchParams.get('type') ?? 'page'
	const type: OgType = typeParam === 'article' ? 'article' : 'page'

	const [displayFontData, bodyFontData] = await Promise.all([
		loadFont(SPACE_GROTESK_BOLD_URL),
		loadFont(MANROPE_REGULAR_URL),
	])

	const svg = await satori(buildOgTemplate(title, type) as Parameters<typeof satori>[0], {
		width: OG_IMAGE_WIDTH,
		height: OG_IMAGE_HEIGHT,
		fonts: [
			{ name: 'SpaceGrotesk', data: displayFontData, weight: 700, style: 'normal' },
			{ name: 'Manrope', data: bodyFontData, weight: 400, style: 'normal' },
		],
	})

	const resvg = new Resvg(svg, { fitTo: { mode: 'width', value: OG_IMAGE_WIDTH } })
	const png = new Uint8Array(resvg.render().asPng())

	return new Response(png, {
		headers: {
			'Content-Type': 'image/png',
			'Cache-Control': 'public, max-age=86400, s-maxage=86400, immutable',
		},
	})
}

export const Route = createFileRoute('/api/og')({
	server: {
		handlers: {
			GET: ({ request }) => handleOgRequest(request),
		},
	},
})
