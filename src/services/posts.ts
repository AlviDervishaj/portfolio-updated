'use server'

import { and, count, desc, eq, lt, or, sql } from 'drizzle-orm'

import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import { db } from '#/db/index.ts'
import { posts } from '#/db/schema.ts'

export type PostSummary = {
	id: string
	slug: string
	title: string
	excerpt: string
	coverImageKey: string | null
	likeCount: number
	dislikeCount: number
	commentCount: number
	publishedAt: Date | null
}

export type PostDetail = typeof posts.$inferSelect

export type PostSortStrategy = 'date' | 'likes' | 'comments'

export type PostsPage = {
	items: PostSummary[]
	nextCursor: string | null
	totalCount: number
}

const POST_SUMMARY_COLUMNS = {
	id: posts.id,
	slug: posts.slug,
	title: posts.title,
	excerpt: posts.excerpt,
	coverImageKey: posts.coverImageKey,
	likeCount: posts.likeCount,
	dislikeCount: posts.dislikeCount,
	commentCount: posts.commentCount,
	publishedAt: posts.publishedAt,
} as const

function applySortStrategy(strategy: PostSortStrategy) {
	if (strategy === 'likes') return desc(posts.likeCount)
	if (strategy === 'comments') return desc(posts.commentCount)
	return desc(posts.publishedAt)
}

function buildCursorFilter(cursor: string, strategy: PostSortStrategy) {
	const [cursorId, cursorValue] = cursor.split(':')

	if (strategy === 'likes') {
		const likeCount = Number.parseInt(cursorValue, 10)
		return or(
			lt(posts.likeCount, likeCount),
			and(eq(posts.likeCount, likeCount), lt(posts.id, cursorId)),
		)
	}

	if (strategy === 'comments') {
		const commentCount = Number.parseInt(cursorValue, 10)
		return or(
			lt(posts.commentCount, commentCount),
			and(eq(posts.commentCount, commentCount), lt(posts.id, cursorId)),
		)
	}

	const publishedAt = new Date(cursorValue)
	return or(
		lt(posts.publishedAt, publishedAt),
		and(eq(posts.publishedAt, publishedAt), lt(posts.id, cursorId)),
	)
}

function buildNextCursor(item: PostSummary, strategy: PostSortStrategy): string {
	if (strategy === 'likes') return `${item.id}:${item.likeCount}`
	if (strategy === 'comments') return `${item.id}:${item.commentCount}`
	return `${item.id}:${item.publishedAt?.toISOString() ?? ''}`
}

export async function getPublishedPostsPage(
	strategy: PostSortStrategy = 'date',
	cursor?: string,
	limit: number = DEFAULT_PAGE_SIZE,
): Promise<PostsPage> {
	const cursorFilter = cursor ? buildCursorFilter(cursor, strategy) : undefined

	const [rows, [countRow]] = await Promise.all([
		db
			.select(POST_SUMMARY_COLUMNS)
			.from(posts)
			.where(and(eq(posts.status, 'published'), cursorFilter))
			.orderBy(applySortStrategy(strategy), desc(posts.id))
			.limit(limit + 1),
		db.select({ total: count() }).from(posts).where(eq(posts.status, 'published')),
	])

	const hasNextPage = rows.length > limit
	const items = hasNextPage ? rows.slice(0, limit) : rows
	const nextCursor =
		hasNextPage && items.length > 0 ? buildNextCursor(items[items.length - 1], strategy) : null
	const totalCount = countRow?.total ?? 0

	return { items, nextCursor, totalCount }
}

export async function getAllPosts(): Promise<PostDetail[]> {
	return db.select().from(posts).orderBy(desc(posts.updatedAt), desc(posts.id))
}

export async function getPostBySlug(slug: string): Promise<PostDetail | null> {
	const [row] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
	return row ?? null
}

export async function getPublishedPostBySlug(slug: string): Promise<PostDetail | null> {
	const [row] = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)
	if (!row || row.status !== 'published') return null
	return row
}

export async function getAllPublishedSlugs(): Promise<string[]> {
	const rows = await db
		.select({ slug: posts.slug })
		.from(posts)
		.where(eq(posts.status, 'published'))
	return rows.map((r) => r.slug)
}

export async function incrementPostViewCount(postId: string): Promise<void> {
	await db.update(posts).set({ updatedAt: new Date() }).where(eq(posts.id, postId))
}

export async function createPost(data: typeof posts.$inferInsert): Promise<PostDetail> {
	const [row] = await db.insert(posts).values(data).returning()
	return row
}

export async function updatePost(
	postId: string,
	data: Partial<typeof posts.$inferInsert>,
): Promise<PostDetail | null> {
	const [row] = await db
		.update(posts)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(posts.id, postId))
		.returning()
	return row ?? null
}

export async function publishPost(postId: string): Promise<PostDetail | null> {
	const [row] = await db
		.update(posts)
		.set({
			status: 'published',
			publishedAt: new Date(),
			updatedAt: new Date(),
		})
		.where(and(eq(posts.id, postId), eq(posts.status, 'draft')))
		.returning()
	return row ?? null
}

export async function unpublishPost(postId: string): Promise<PostDetail | null> {
	const [row] = await db
		.update(posts)
		.set({ status: 'draft', updatedAt: new Date() })
		.where(and(eq(posts.id, postId), eq(posts.status, 'published')))
		.returning()
	return row ?? null
}

export async function getPostStats(postId: string): Promise<{
	likeCount: number
	dislikeCount: number
	commentCount: number
} | null> {
	const [row] = await db
		.select({
			likeCount: posts.likeCount,
			dislikeCount: posts.dislikeCount,
			commentCount: posts.commentCount,
		})
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1)
	return row ?? null
}

export async function syncPostReactionCounts(postId: string): Promise<void> {
	await db
		.update(posts)
		.set({
			likeCount: sql<number>`(select count(*) from reactions where post_id = ${postId} and type = 'like' and deleted_at is null)`,
			dislikeCount: sql<number>`(select count(*) from reactions where post_id = ${postId} and type = 'dislike' and deleted_at is null)`,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
}

export async function syncPostCommentCount(postId: string): Promise<void> {
	await db
		.update(posts)
		.set({
			commentCount: sql<number>`(select count(*) from comments where post_id = ${postId} and deleted_at is null)`,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
}
