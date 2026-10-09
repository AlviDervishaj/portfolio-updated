import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import CommentsSection from './CommentsSection'

const { mutate } = vi.hoisted(() => ({ mutate: vi.fn() }))
vi.mock('@tanstack/react-query', () => ({
	useQuery: vi.fn(),
	useMutation: () => ({ mutate, isPending: false }),
}))
vi.mock('#/server/comments.ts', () => ({
	createCommentServerFn: vi.fn(),
	deleteCommentServerFn: vi.fn(),
	getCommentsServerFn: vi.fn(),
}))

afterEach(() => {
	cleanup()
	vi.clearAllMocks()
})

it('disables commenting when signed out and enables it when signed in', () => {
	const { rerender } = render(<CommentsSection postId="post" />)
	expect(screen.getByRole('link', { name: 'Sign in to comment' }).getAttribute('href')).toBe(
		'/sign-in',
	)
	expect(screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Comment' }).disabled).toBe(true)
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Post' }).disabled).toBe(true)
	fireEvent.submit(screen.getByRole('textbox', { name: 'Comment' }))
	expect(mutate).not.toHaveBeenCalled()

	rerender(<CommentsSection postId="post" currentUserId="user" />)
	expect(screen.queryByText('Sign in to comment')).toBeNull()
	expect(screen.queryByText(/Respectful disagreement|moderated as needed/)).toBeNull()
	const input = screen.getByRole<HTMLTextAreaElement>('textbox', { name: 'Comment' })
	expect(input.disabled).toBe(false)
	fireEvent.change(input, { target: { value: 'Hello' } })
	expect(screen.getByRole<HTMLButtonElement>('button', { name: 'Post' }).disabled).toBe(false)
	fireEvent.click(screen.getByRole('button', { name: 'Post' }))
	expect(mutate).toHaveBeenCalledWith({ content: 'Hello' })
})
