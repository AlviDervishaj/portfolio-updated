'use server'

import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import { renderMdx } from '#/lib/mdx.ts'
import { getPublicUrl } from '#/lib/storage.ts'
import type { PostSortStrategy } from '#/services/posts.ts'
import {
	getAllPublishedSlugs,
	getPublishedPostBySlug,
	getPublishedPostsPage,
} from '#/services/posts.ts'

const GetPostsInputSchema = z.object({
	strategy: z.enum(['date', 'likes', 'comments']).optional().default('date'),
	cursor: z.string().optional(),
	limit: z.number().int().min(1).max(50).optional().default(DEFAULT_PAGE_SIZE),
})

const GetPostBySlugInputSchema = z.object({
	slug: z.string().min(1),
})

export const getPostsServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => GetPostsInputSchema.parse(input))
	.handler(async ({ data }) => {
		return getPublishedPostsPage(data.strategy as PostSortStrategy, data.cursor, data.limit)
	})

export const getPostBySlugServerFn = createServerFn({ method: 'GET' })
	.inputValidator((input: unknown) => GetPostBySlugInputSchema.parse(input))
	.handler(async ({ data }) => {
		const post = await getPublishedPostBySlug(data.slug)
		if (!post) return null
		const { html, readingTimeMinutes, toc } = await renderMdx(post.content)
		const coverImageUrl = post.coverImageKey ? getPublicUrl(post.coverImageKey) : null
		return { post, html, readingTimeMinutes, toc, coverImageUrl }
	})

export const getAllPublishedSlugsServerFn = createServerFn({
	method: 'GET',
}).handler(async () => {
	return getAllPublishedSlugs()
})
