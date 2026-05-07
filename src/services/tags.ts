'use server'

import { and, asc, desc, eq, inArray } from 'drizzle-orm'
import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import { db } from '#/db/index.ts'
import type { Tag } from '#/db/schema.ts'
import { posts, postTags, tags } from '#/db/schema.ts'
import type { PostSortStrategy, PostSummary, PostsPage } from '#/services/posts.ts'

export type { Tag }

const POST_SUMMARY_WITH_TAG_COLUMNS = {
	id: posts.id,
	slug: posts.slug,
	title: posts.title,
	excerpt: posts.excerpt,
	coverImageKey: posts.coverImageKey,
	likeCount: posts.likeCount,
	dislikeCount: posts.dislikeCount,
	commentCount: posts.commentCount,
	viewCount: posts.viewCount,
	publishedAt: posts.publishedAt,
} as const

export async function getAllTags(): Promise<Tag[]> {
	return db.select().from(tags).orderBy(asc(tags.name))
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
	const [row] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1)
	return row ?? null
}

export async function createTag(name: string, slug: string): Promise<Tag> {
	const [row] = await db
		.insert(tags)
		.values({ name, slug })
		.onConflictDoUpdate({ target: tags.slug, set: { name, updatedAt: new Date() } })
		.returning()
	return row
}

export async function deleteTag(tagId: string): Promise<void> {
	await db.delete(tags).where(eq(tags.id, tagId))
}

export async function getTagsForPost(postId: string): Promise<Tag[]> {
	const rows = await db
		.select({ tag: tags })
		.from(postTags)
		.innerJoin(tags, eq(postTags.tagId, tags.id))
		.where(eq(postTags.postId, postId))
		.orderBy(asc(tags.name))
	return rows.map((r) => r.tag)
}

export async function setTagsForPost(postId: string, tagIds: string[]): Promise<void> {
	await db.delete(postTags).where(eq(postTags.postId, postId))
	if (tagIds.length === 0) return
	await db
		.insert(postTags)
		.values(tagIds.map((tagId) => ({ postId, tagId })))
		.onConflictDoNothing()
}

export async function getPublishedPostsPageByTag(
	tagSlug: string,
	strategy: PostSortStrategy = 'date',
	_cursor?: string,
	limit: number = DEFAULT_PAGE_SIZE,
): Promise<PostsPage> {
	const tag = await getTagBySlug(tagSlug)
	if (!tag) return { items: [], nextCursor: null, totalCount: 0 }

	const postIdsResult = await db
		.select({ postId: postTags.postId })
		.from(postTags)
		.where(eq(postTags.tagId, tag.id))

	const postIds = postIdsResult.map((r) => r.postId)
	if (postIds.length === 0) return { items: [], nextCursor: null, totalCount: 0 }

	let orderBy: ReturnType<typeof desc>
	if (strategy === 'likes') orderBy = desc(posts.likeCount)
	else if (strategy === 'comments') orderBy = desc(posts.commentCount)
	else orderBy = desc(posts.publishedAt)

	const rows = await db
		.select(POST_SUMMARY_WITH_TAG_COLUMNS)
		.from(posts)
		.where(and(eq(posts.status, 'published'), inArray(posts.id, postIds)))
		.orderBy(orderBy, desc(posts.id))
		.limit(limit + 1)

	const hasNextPage = rows.length > limit
	const items = hasNextPage ? rows.slice(0, limit) : rows
	const nextCursor =
		hasNextPage && items.length > 0
			? `${items[items.length - 1].id}:${buildCursorValue(items[items.length - 1] as PostSummary, strategy)}`
			: null

	return { items: items as PostSummary[], nextCursor, totalCount: postIds.length }
}

function buildCursorValue(item: PostSummary, strategy: PostSortStrategy): string {
	if (strategy === 'likes') return String(item.likeCount)
	if (strategy === 'comments') return String(item.commentCount)
	return item.publishedAt?.toISOString() ?? ''
}
