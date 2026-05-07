'use client'

import { useEffect } from 'react'
import { incrementViewServerFn } from '#/server/views.ts'

export function PostViewTracker({ postId }: Readonly<{ postId: string }>) {
	useEffect(() => {
		incrementViewServerFn({ data: { postId } })
	}, [postId])

	return null
}
