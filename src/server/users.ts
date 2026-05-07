'use server'

import { createServerFn } from '@tanstack/react-start'
import { getCurrentUser } from '#/services/users.ts'
import type { AppUser } from '#/types/user.ts'

export const getCurrentUserServerFn = createServerFn({ method: 'GET' }).handler(
	async (): Promise<AppUser | null> => {
		return await getCurrentUser()
	},
)
