'use server'

import { and, asc, eq, gt, isNull } from 'drizzle-orm'

import { DEFAULT_PAGE_SIZE } from '#/constants/pagination.ts'
import { db } from '#/db/index.ts'
import { comments } from '#/db/schema.ts'

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
	const [row] = await db
		.insert(comments)
		.values({
			postId: data.postId,
			authorId: data.authorId,
			authorName: data.authorName,
			content: data.content,
			parentId: data.parentId ?? null,
		})
		.returning()

	return {
		id: row.id,
		authorId: row.authorId,
		authorName: row.authorName,
		content: row.content,
		deletedAt: row.deletedAt,
		createdAt: row.createdAt,
		replies: [],
	}
}

export async function softDeleteComment(commentId: string, authorId: string): Promise<boolean> {
	const [row] = await db
		.update(comments)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(
			and(eq(comments.id, commentId), eq(comments.authorId, authorId), isNull(comments.deletedAt)),
		)
		.returning({ id: comments.id })

	return row !== undefined
}

export async function getCommentById(
	commentId: string,
): Promise<typeof comments.$inferSelect | null> {
	const [row] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1)
	return row ?? null
}
