'use server'

import { eq } from 'drizzle-orm'
import { db } from '#/db/index.ts'
import type { DraftToken } from '#/db/schema.ts'
import { draftTokens, posts } from '#/db/schema.ts'
import type { PostDetail } from '#/services/posts.ts'

export async function upsertDraftToken(postId: string, token: string): Promise<DraftToken> {
	const [row] = await db
		.insert(draftTokens)
		.values({ postId, token })
		.onConflictDoUpdate({
			target: draftTokens.postId,
			set: { token },
		})
		.returning()
	return row
}

export async function revokeDraftToken(postId: string): Promise<void> {
	await db.delete(draftTokens).where(eq(draftTokens.postId, postId))
}

export async function getDraftTokenForPost(postId: string): Promise<DraftToken | null> {
	const [row] = await db.select().from(draftTokens).where(eq(draftTokens.postId, postId)).limit(1)
	return row ?? null
}

export async function getPostByDraftToken(token: string): Promise<PostDetail | null> {
	const [row] = await db
		.select({ post: posts })
		.from(draftTokens)
		.innerJoin(posts, eq(draftTokens.postId, posts.id))
		.where(eq(draftTokens.token, token))
		.limit(1)
	return row?.post ?? null
}
