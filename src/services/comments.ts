'use server'

import { and, asc, eq, gt, isNotNull, isNull, sql } from 'drizzle-orm'

import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import { db } from '#/db/index.ts'
import { comments, posts } from '#/db/schema.ts'

export type CommentReply = {
	id: string
	authorId: string
	authorName: string
	content: string
	deletedAt: Date | null
	createdAt: Date
}

export type CommentWithReplies = {
	id: string
	authorId: string
	authorName: string
	content: string
	deletedAt: Date | null
	createdAt: Date
	replies: CommentReply[]
}

export type CommentsPage = {
	items: CommentWithReplies[]
	nextCursor: string | null
}

function buildCommentCursorFilter(cursor: string) {
	const cursorDate = new Date(cursor)
	return gt(comments.createdAt, cursorDate)
}

function buildCommentNextCursor(item: CommentWithReplies): string {
	return item.createdAt.toISOString()
}

export async function getCommentsForPost(
	postId: string,
	cursor?: string,
	limit: number = DEFAULT_PAGE_SIZE,
): Promise<CommentsPage> {
	const cursorFilter = cursor ? buildCommentCursorFilter(cursor) : undefined

	const topLevelRows = await db
		.select()
		.from(comments)
		.where(and(eq(comments.postId, postId), isNull(comments.parentId), cursorFilter))
		.orderBy(asc(comments.createdAt))
		.limit(limit + 1)

	const hasNextPage = topLevelRows.length > limit
	const pageRows = hasNextPage ? topLevelRows.slice(0, limit) : topLevelRows

	const parentIds = pageRows.map((r) => r.id)

	const replyRows =
		parentIds.length > 0
			? await db
					.select()
					.from(comments)
					.where(and(eq(comments.postId, postId)))
					.orderBy(asc(comments.createdAt))
			: []

	const repliesByParentId = new Map<string, CommentReply[]>()
	for (const reply of replyRows) {
		if (!reply.parentId || !parentIds.includes(reply.parentId)) continue
		const bucket = repliesByParentId.get(reply.parentId) ?? []
		bucket.push({
			id: reply.id,
			authorId: reply.authorId,
			authorName: reply.authorName,
			content: reply.content,
			deletedAt: reply.deletedAt,
			createdAt: reply.createdAt,
		})
		repliesByParentId.set(reply.parentId, bucket)
	}

	const items: CommentWithReplies[] = pageRows.map((row) => ({
		id: row.id,
		authorId: row.authorId,
		authorName: row.authorName,
		content: row.content,
		deletedAt: row.deletedAt,
		createdAt: row.createdAt,
		replies: repliesByParentId.get(row.id) ?? [],
	}))

	const nextCursor =
		hasNextPage && items.length > 0 ? buildCommentNextCursor(items[items.length - 1]) : null

	return { items, nextCursor }
}

export async function createComment(data: {
	postId: string
	authorId: string
	authorName: string
	content: string
	parentId?: string
}): Promise<CommentWithReplies> {
	return db.transaction(async (tx) => {
		// Serialize this post's mutations before counting active comments and replies.
		await tx.select({ id: posts.id }).from(posts).where(eq(posts.id, data.postId)).for('update')
		const [row] = await tx
			.insert(comments)
			.values({ ...data, parentId: data.parentId ?? null })
			.returning()

		await syncCommentCount(tx, row.postId)
		return {
			id: row.id,
			authorId: row.authorId,
			authorName: row.authorName,
			content: row.content,
			deletedAt: row.deletedAt,
			createdAt: row.createdAt,
			replies: [],
		}
	})
}

type CommentTransaction = Parameters<Parameters<typeof db.transaction>[0]>[0]

async function syncCommentCount(tx: CommentTransaction, postId: string): Promise<void> {
	await tx
		.update(posts)
		.set({
			commentCount: sql<number>`(select count(*) from comments where post_id = ${postId} and deleted_at is null)`,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
}

async function setCommentDeletedAt(
	commentId: string,
	deletedAt: Date | null,
	authorId?: string,
): Promise<boolean> {
	return db.transaction(async (tx) => {
		const identity = and(
			eq(comments.id, commentId),
			authorId !== undefined ? eq(comments.authorId, authorId) : undefined,
		)
		const [existing] = await tx
			.select({ postId: comments.postId })
			.from(comments)
			.where(identity)
			.limit(1)
		if (!existing) return false

		await tx.select({ id: posts.id }).from(posts).where(eq(posts.id, existing.postId)).for('update')
		const [changed] = await tx
			.update(comments)
			.set({ deletedAt, updatedAt: new Date() })
			.where(
				and(
					identity,
					deletedAt === null ? isNotNull(comments.deletedAt) : isNull(comments.deletedAt),
				),
			)
			.returning({ postId: comments.postId })

		if (changed) await syncCommentCount(tx, changed.postId)
		return changed !== undefined || deletedAt === null
	})
}

export async function softDeleteComment(commentId: string, authorId: string): Promise<boolean> {
	return setCommentDeletedAt(commentId, new Date(), authorId)
}

export async function getCommentById(
	commentId: string,
): Promise<typeof comments.$inferSelect | null> {
	const [row] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
	return row ?? null
}

export async function adminSoftDeleteComment(commentId: string): Promise<boolean> {
	return setCommentDeletedAt(commentId, new Date())
}

export async function adminRestoreComment(commentId: string): Promise<boolean> {
	return setCommentDeletedAt(commentId, null)
}
