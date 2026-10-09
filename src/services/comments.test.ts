// @vitest-environment node
import { readFile } from 'node:fs/promises'
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const { pool, testSchema } = await vi.hoisted(async () => {
	const { Pool } = await import('pg')
	const { randomUUID } = await import('node:crypto')
	const testSchema = `comment_test_${randomUUID().replaceAll('-', '')}`
	return {
		testSchema,
		pool: new Pool({
			connectionString: process.env.COMMENTS_TEST_DATABASE_URL,
			options: `-c search_path=${testSchema}`,
		}),
	}
})

vi.mock('#/db/index.ts', async () => {
	const { drizzle } = await import('drizzle-orm/node-postgres')
	return { db: drizzle(pool) }
})

import {
	adminRestoreComment,
	adminSoftDeleteComment,
	createComment,
	getCommentsForPost,
	softDeleteComment,
} from './comments.ts'

let schemaCreated = false
const databaseUrl = process.env.COMMENTS_TEST_DATABASE_URL
const postId = '00000000-0000-4000-8000-000000000001'
const otherPostId = '00000000-0000-4000-8000-000000000002'
const input = { postId, authorId: 'author', authorName: 'Author', content: 'Comment' }

async function countFor(id = postId): Promise<number> {
	const result = await pool.query('select comment_count from posts where id = $1', [id])
	return result.rows[0].comment_count
}

async function failCountUpdates(): Promise<void> {
	await pool.query(`
		create or replace function reject_comment_count() returns trigger language plpgsql as $$
		begin raise exception 'count update failed'; end $$;
		create trigger reject_comment_count before update on posts
		for each row execute function reject_comment_count();
	`)
}

describe.skipIf(!databaseUrl)('comment mutations with PostgreSQL', () => {
	beforeAll(async () => {
		const url = new URL(databaseUrl ?? '')
		if (!['localhost', '127.0.0.1'].includes(url.hostname) || url.pathname !== '/portfolio_test') {
			throw new Error('Use a disposable local portfolio_test database')
		}
		await pool.query(`create schema ${testSchema}`)
		schemaCreated = true
		const migration = await readFile('drizzle/0000_odd_vin_gonzales.sql', 'utf8')
		await pool.query(migration.replaceAll('"public".', `"${testSchema}".`))
	})

	beforeEach(async () => {
		await pool.query('drop trigger if exists reject_comment_count on posts')
		await pool.query('truncate comments, posts, "user" cascade')
		await pool.query(`insert into "user" (id, name, email, created_at, updated_at)
			values ('author', 'Author', 'author@example.com', now(), now()),
			('other', 'Other', 'other@example.com', now(), now())`)
		await pool.query(
			`insert into posts (id, slug, title, excerpt, content)
			values ($1, 'first', 'First', 'Excerpt', 'Content'),
			($2, 'second', 'Second', 'Excerpt', 'Content')`,
			[postId, otherPostId],
		)
	})

	afterAll(async () => {
		if (schemaCreated) await pool.query(`drop schema ${testSchema} cascade`)
		await pool.end()
	})

	it('counts replies and retains them beneath a deleted parent', async () => {
		const parent = await createComment(input)
		await createComment({ ...input, parentId: parent.id })
		expect(await countFor()).toBe(2)
		expect(await softDeleteComment(parent.id, 'other')).toBe(false)
		expect(await countFor()).toBe(2)
		expect(await softDeleteComment(parent.id, 'author')).toBe(true)
		expect(await softDeleteComment(parent.id, 'author')).toBe(false)
		expect(await countFor()).toBe(1)
		const page = await getCommentsForPost(postId)
		expect(page.items[0].deletedAt).not.toBeNull()
		expect(page.items[0].replies).toHaveLength(1)
	})

	it('repairs the stored post on admin delete and restore; repeats do not change counts', async () => {
		const comment = await createComment(input)
		await createComment({ ...input, postId: otherPostId })
		expect(await adminSoftDeleteComment(comment.id)).toBe(true)
		expect(await adminSoftDeleteComment(comment.id)).toBe(false)
		expect(await countFor()).toBe(0)
		expect(await countFor(otherPostId)).toBe(1)
		expect(await adminRestoreComment(comment.id)).toBe(true)
		expect(await adminRestoreComment(comment.id)).toBe(true)
		expect(await countFor()).toBe(1)
		expect(await adminRestoreComment('00000000-0000-4000-8000-000000000099')).toBe(false)
	})

	it.each([
		'create',
		'author delete',
		'admin delete',
		'restore',
	] as const)('rolls back %s when the count update fails', async (mutation) => {
		const comment = await createComment(input)
		if (mutation === 'restore') await adminSoftDeleteComment(comment.id)
		const before = await pool.query('select id, deleted_at from comments order by id')
		const countBefore = await countFor()
		await failCountUpdates()
		const result =
			mutation === 'create'
				? createComment(input)
				: mutation === 'author delete'
					? softDeleteComment(comment.id, 'author')
					: mutation === 'admin delete'
						? adminSoftDeleteComment(comment.id)
						: adminRestoreComment(comment.id)
		await expect(result).rejects.toThrow('Failed query')
		expect((await pool.query('select id, deleted_at from comments order by id')).rows).toEqual(
			before.rows,
		)
		expect(await countFor()).toBe(countBefore)
	})

	it('keeps counts consistent during concurrent mutations of one post', async () => {
		const created = await Promise.all(Array.from({ length: 12 }, () => createComment(input)))
		expect(await countFor()).toBe(12)
		await Promise.all(created.map((comment) => adminSoftDeleteComment(comment.id)))
		expect(await countFor()).toBe(0)
		await Promise.all(created.map((comment) => adminRestoreComment(comment.id)))
		expect(await countFor()).toBe(12)
	})
})
