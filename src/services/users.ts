'use server'

import { getRequestHeader } from '@tanstack/react-start/server'
import { auth } from '#/lib/auth.ts'
import type { AppUser } from '#/types/user.ts'

type BetterAuthSessionUser = {
	id: string
	name: string
	email: string
	image?: string | null
	createdAt: Date | string
}

function toAppUser(sessionUser: BetterAuthSessionUser): AppUser {
	return {
		id: sessionUser.id,
		name: sessionUser.name,
		email: sessionUser.email,
		image: sessionUser.image ?? null,
		createdAt:
			sessionUser.createdAt instanceof Date
				? sessionUser.createdAt
				: new Date(sessionUser.createdAt),
	}
}

export async function getCurrentUser(): Promise<AppUser | null> {
	const sessionResult = await auth.api.getSession({
		headers: new Headers({
			cookie: getRequestHeader('cookie') ?? '',
		}),
	})

	if (!sessionResult?.user) {
		return null
	}

	return toAppUser(sessionResult.user as BetterAuthSessionUser)
}
