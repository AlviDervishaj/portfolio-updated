'use server'

import { and, desc, eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import { posts, savedPosts } from '#/db/schema.ts'
import type { PostSummary } from '#/services/posts.ts'

export type SavedPostSummary = PostSummary & { savedAt: Date }

const SAVED_POST_COLUMNS = {
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

export async function savePost(userId: string, postId: string): Promise<void> {
	await db.insert(savedPosts).values({ userId, postId }).onConflictDoNothing()
}

export async function unsavePost(userId: string, postId: string): Promise<void> {
	await db
		.delete(savedPosts)
		.where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
}

export async function isPostSaved(userId: string, postId: string): Promise<boolean> {
	const [row] = await db
		.select({ postId: savedPosts.postId })
		.from(savedPosts)
		.where(and(eq(savedPosts.userId, userId), eq(savedPosts.postId, postId)))
		.limit(1)
	return row !== undefined
}

export async function getSavedPostsForUser(userId: string): Promise<SavedPostSummary[]> {
	const rows = await db
		.select({ ...SAVED_POST_COLUMNS, savedAt: savedPosts.createdAt })
		.from(savedPosts)
		.innerJoin(posts, eq(savedPosts.postId, posts.id))
		.where(and(eq(savedPosts.userId, userId), eq(posts.status, 'published')))
		.orderBy(desc(savedPosts.createdAt))

	return rows as SavedPostSummary[]
}
