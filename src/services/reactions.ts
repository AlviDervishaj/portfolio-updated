'use server'

import { and, eq, isNull, sql } from 'drizzle-orm'

import { db } from '#/db/index.ts'
import { posts, reactions } from '#/db/schema.ts'

export type ReactionState = {
	liked: boolean
	disliked: boolean
	likeCount: number
	dislikeCount: number
}

export async function getReactionState(
	postId: string,
	userIdentifier: string,
): Promise<ReactionState> {
	const postRow = await db
		.select({ likeCount: posts.likeCount, dislikeCount: posts.dislikeCount })
		.from(posts)
		.where(eq(posts.id, postId))
		.limit(1)

	const likeCount = postRow[0]?.likeCount ?? 0
	const dislikeCount = postRow[0]?.dislikeCount ?? 0

	const [existing] = await db
		.select({ type: reactions.type })
		.from(reactions)
		.where(
			and(
				eq(reactions.postId, postId),
				eq(reactions.userIdentifier, userIdentifier),
				isNull(reactions.deletedAt),
			),
		)
		.limit(1)

	return {
		liked: existing?.type === 'like',
		disliked: existing?.type === 'dislike',
		likeCount,
		dislikeCount,
	}
}

export async function upsertReaction(
	postId: string,
	userIdentifier: string,
	type: 'like' | 'dislike',
): Promise<void> {
	await db
		.insert(reactions)
		.values({ postId, userIdentifier, type })
		.onConflictDoUpdate({
			target: [reactions.postId, reactions.userIdentifier],
			set: { type, deletedAt: null, updatedAt: new Date() },
		})

	await syncReactionCounts(postId)
}

export async function removeReaction(postId: string, userIdentifier: string): Promise<void> {
	await db
		.update(reactions)
		.set({ deletedAt: new Date(), updatedAt: new Date() })
		.where(
			and(
				eq(reactions.postId, postId),
				eq(reactions.userIdentifier, userIdentifier),
				isNull(reactions.deletedAt),
			),
		)

	await syncReactionCounts(postId)
}

async function syncReactionCounts(postId: string): Promise<void> {
	await db
		.update(posts)
		.set({
			likeCount: sql<number>`(select count(*) from reactions where post_id = ${postId} and type = 'like' and deleted_at is null)`,
			dislikeCount: sql<number>`(select count(*) from reactions where post_id = ${postId} and type = 'dislike' and deleted_at is null)`,
			updatedAt: new Date(),
		})
		.where(eq(posts.id, postId))
}
