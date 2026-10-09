import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ContactPage } from '#/components/ContactPage'
import { ProjectsPage } from '#/components/ProjectsPage'
import { PROJECTS } from '#/constants/projects'

vi.mock('#/env.ts', () => ({ env: { VITE_APP_URL: 'https://shunger.dev' } }))
const { submitContact } = vi.hoisted(() => ({ submitContact: vi.fn() }))
vi.mock('#/server/contact.ts', () => ({ submitContactFormServerFn: submitContact }))

afterEach((): void => {
	cleanup()
	vi.clearAllMocks()
})

describe('approved portfolio brief', (): void => {
	it('shows independent projects first, with evidence and no private source link', (): void => {
		render(<ProjectsPage />)
		expect(
			screen
				.getAllByRole('heading', { level: 2 })
				.map((heading): string | null => heading.textContent),
		).toEqual(['Rite Electric', 'Junior Assistant', 'Portfolio'])
		expect(
			screen.getByRole('link', { name: 'Visit website for Rite Electric' }).getAttribute('href'),
		).toBe('https://www.riteelectricllc.com')
		expect(screen.queryByRole('link', { name: 'View source for Rite Electric' })).toBeNull()
		expect(
			screen.getByRole('link', { name: 'View source for Junior Assistant' }).getAttribute('href'),
		).toBe('https://github.com/AlviDervishaj/junior-assistant')
		expect(screen.getByText(/Use the task ID returned/)).toBeTruthy()
		expect(screen.getByText(/assistant task log 42/)).toBeTruthy()
		fireEvent.click(screen.getByText('Technology'))
		fireEvent.click(screen.getByRole('button', { name: 'Go' }))
		expect(
			screen
				.getAllByRole('heading', { level: 2 })
				.map((heading): string | null => heading.textContent),
		).toEqual(['Junior Assistant'])
		fireEvent.click(screen.getByRole('button', { name: 'All' }))
		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
	})

	it('combines side-panel search with technology filters', () => {
		render(<ProjectsPage />)
		expect(screen.getByRole('complementary', { name: 'Project filters' })).toBeTruthy()
		const search = screen.getByRole('searchbox', { name: 'Search projects' })
		fireEvent.change(search, { target: { value: '  JUNIOR  ' } })
		expect(screen.getAllByRole('heading', { level: 2 }).map((h) => h.textContent)).toEqual([
			'Junior Assistant',
		])
		fireEvent.click(screen.getByText('Technology'))
		fireEvent.click(screen.getByRole('button', { name: 'React' }))
		expect(screen.getByText('No projects match this filter.')).toBeTruthy()
		fireEvent.click(screen.getByRole('button', { name: 'All' }))
		expect(screen.getByRole('heading', { name: 'Junior Assistant', level: 2 })).toBeTruthy()
		fireEvent.change(search, { target: { value: '' } })
		expect(screen.getAllByRole('heading', { level: 2 })).toHaveLength(3)
	})

	it('collapses technology choices and lets readers hide AI projects', () => {
		PROJECTS.push({ ...PROJECTS[0], id: 'ai-example', name: 'AI Example', usesAI: true })
		try {
			render(<ProjectsPage />)
			const technology = screen.getByText('Technology')
			expect(technology.closest('details')?.open).toBe(false)
			expect(technology.closest('details')?.open).toBe(false)
			fireEvent.click(technology)
			expect(screen.getByRole('button', { name: 'Go' })).toBeTruthy()
			fireEvent.click(technology)
			expect(technology.closest('details')?.open).toBe(false)
			expect(screen.getByRole('heading', { name: 'AI Example', level: 2 })).toBeTruthy()
			fireEvent.click(screen.getByRole('switch', { name: 'Show AI projects' }))
			expect(screen.queryByRole('heading', { name: 'AI Example', level: 2 })).toBeNull()
			expect(screen.getByRole('heading', { name: 'Junior Assistant', level: 2 })).toBeTruthy()
			fireEvent.click(screen.getByRole('switch', { name: 'Show AI projects' }))
			expect(screen.getByRole('heading', { name: 'AI Example', level: 2 })).toBeTruthy()
		} finally {
			PROJECTS.pop()
		}
	})

	it('keeps a project inquiry intact when sending fails, then allows retry', async (): Promise<void> => {
		submitContact
			.mockRejectedValueOnce(new Error('Network unavailable'))
			.mockResolvedValueOnce({ success: true })
		render(<ContactPage />)
		fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Client' } })
		fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'client@example.com' } })
		fireEvent.change(screen.getByLabelText('Subject'), { target: { value: 'Business website' } })
		const message = screen.getByLabelText<HTMLTextAreaElement>('Message')
		fireEvent.change(message, {
			target: { value: 'A new business website. Deadline November. Budget to discuss.' },
		})
		expect(screen.getByText(/desired deadline.*approximate budget/)).toBeTruthy()
		fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
		await screen.findByText(/Your message could not be sent/)
		expect(message.value).toContain('Deadline November')
		fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
		await screen.findByText("Message sent. I'll reply within two business days.")
		await waitFor((): void => {
			expect(submitContact).toHaveBeenCalledTimes(2)
		})
	})
})
