'use client'

import { Bookmark, BookmarkCheck } from 'lucide-react'
import { useState } from 'react'
import { savePostServerFn, unsavePostServerFn } from '#/server/savedPosts.ts'

type BookmarkButtonProps = {
	postId: string
	initialIsSaved: boolean
	isAuthenticated: boolean
}

export function BookmarkButton({
	postId,
	initialIsSaved,
	isAuthenticated,
}: Readonly<BookmarkButtonProps>) {
	const [isSaved, setIsSaved] = useState(initialIsSaved)
	const [pending, setPending] = useState(false)

	async function handleToggle() {
		if (!isAuthenticated || pending) return
		setPending(true)
		const optimisticState = !isSaved
		setIsSaved(optimisticState)
		try {
			if (optimisticState) {
				await savePostServerFn({ data: { postId } })
			} else {
				await unsavePostServerFn({ data: { postId } })
			}
		} catch {
			setIsSaved(!optimisticState)
		} finally {
			setPending(false)
		}
	}

	if (!isAuthenticated) {
		return (
			<button
				type="button"
				title="Sign in to bookmark"
				className="cursor-not-allowed text-muted-foreground opacity-40"
				disabled
				aria-label="Sign in to bookmark this post"
			>
				<Bookmark aria-hidden="true" className="size-4" />
			</button>
		)
	}

	return (
		<button
			type="button"
			onClick={handleToggle}
			disabled={pending}
			aria-label={isSaved ? 'Remove bookmark' : 'Bookmark this post'}
			className={`cursor-pointer border-none bg-transparent transition-colors duration-150 disabled:opacity-40 ${
				isSaved ? 'text-acid' : 'text-muted-foreground hover:text-acid'
			}`}
		>
			{isSaved ? (
				<BookmarkCheck aria-hidden="true" className="size-4" />
			) : (
				<Bookmark aria-hidden="true" className="size-4" />
			)}
		</button>
	)
}
