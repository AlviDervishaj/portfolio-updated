import { relations } from 'drizzle-orm'
import {
	boolean,
	integer,
	pgEnum,
	pgTable,
	text,
	timestamp,
	unique,
	uuid,
} from 'drizzle-orm/pg-core'

export const postStatusEnum = pgEnum('post_status', ['draft', 'published'])
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'dislike'])

export const user = pgTable('user', {
	id: text('id').primaryKey(),
	name: text('name').notNull(),
	email: text('email').notNull().unique(),
	emailVerified: boolean('email_verified').notNull().default(false),
	image: text('image'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const session = pgTable('session', {
	id: text('id').primaryKey(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	token: text('token').notNull().unique(),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
	ipAddress: text('ip_address'),
	userAgent: text('user_agent'),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
})

export const account = pgTable('account', {
	id: text('id').primaryKey(),
	accountId: text('account_id').notNull(),
	providerId: text('provider_id').notNull(),
	userId: text('user_id')
		.notNull()
		.references(() => user.id, { onDelete: 'cascade' }),
	accessToken: text('access_token'),
	refreshToken: text('refresh_token'),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: text('password'),
	createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
})

export const verification = pgTable('verification', {
	id: text('id').primaryKey(),
	identifier: text('identifier').notNull(),
	value: text('value').notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }),
	updatedAt: timestamp('updated_at', { withTimezone: true }),
})

export const posts = pgTable('posts', {
	id: uuid().defaultRandom().primaryKey(),
	slug: text().notNull().unique(),
	title: text().notNull(),
	excerpt: text().notNull(),
	content: text().notNull(),
	coverImageKey: text('cover_image_key'),
	status: postStatusEnum().notNull().default('draft'),
	likeCount: integer('like_count').notNull().default(0),
	dislikeCount: integer('dislike_count').notNull().default(0),
	commentCount: integer('comment_count').notNull().default(0),
	publishedAt: timestamp('published_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const comments = pgTable('comments', {
	id: uuid().defaultRandom().primaryKey(),
	postId: uuid('post_id')
		.notNull()
		.references(() => posts.id),
	authorId: text('author_id')
		.notNull()
		.references(() => user.id),
	authorName: text('author_name').notNull(),
	parentId: uuid('parent_id'),
	content: text().notNull(),
	deletedAt: timestamp('deleted_at', { withTimezone: true }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const reactions = pgTable(
	'reactions',
	{
		id: uuid().defaultRandom().primaryKey(),
		postId: uuid('post_id')
			.notNull()
			.references(() => posts.id),
		userIdentifier: text('user_identifier').notNull(),
		type: reactionTypeEnum().notNull(),
		deletedAt: timestamp('deleted_at', { withTimezone: true }),
		createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
		updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	},
	(table) => [unique('reactions_user_post_unique').on(table.postId, table.userIdentifier)],
)

export const userRelations = relations(user, ({ many }) => ({
	sessions: many(session),
	accounts: many(account),
	comments: many(comments),
}))

export const sessionRelations = relations(session, ({ one }) => ({
	user: one(user, { fields: [session.userId], references: [user.id] }),
}))

export const accountRelations = relations(account, ({ one }) => ({
	user: one(user, { fields: [account.userId], references: [user.id] }),
}))

export const postsRelations = relations(posts, ({ many }) => ({
	comments: many(comments),
	reactions: many(reactions),
}))

export const commentsRelations = relations(comments, ({ one, many }) => ({
	post: one(posts, { fields: [comments.postId], references: [posts.id] }),
	author: one(user, { fields: [comments.authorId], references: [user.id] }),
	replies: many(comments, { relationName: 'replies' }),
	parent: one(comments, {
		fields: [comments.parentId],
		references: [comments.id],
		relationName: 'replies',
	}),
}))

export const reactionsRelations = relations(reactions, ({ one }) => ({
	post: one(posts, { fields: [reactions.postId], references: [posts.id] }),
}))

export type User = typeof user.$inferSelect
export type Post = typeof posts.$inferSelect
export type NewPost = typeof posts.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Reaction = typeof reactions.$inferSelect
export type NewReaction = typeof reactions.$inferInsert
