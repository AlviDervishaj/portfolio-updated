import { describe, expect, it } from 'vitest'
import { WORDS_PER_MINUTE } from '#/constants/mdx.ts'
import { renderMdx } from './mdx.ts'

describe('post heading navigation', () => {
	it.each([
		['duplicate headings', '## Repeat\n\n## Repeat', ['Repeat', 'Repeat']],
		[
			'emphasis and links',
			'## Hello **world**\n\n### A [linked *heading*](https://example.com)',
			['Hello world', 'A linked heading'],
		],
		['inline code', '## Using `const` safely', ['Using const safely']],
		['Unicode', '## Café 中文\n\n## Përshëndetje', ['Café 中文', 'Përshëndetje']],
		[
			'all heading depths',
			'# One\n\n## Two\n\n### Three\n\n#### Four\n\n##### Five\n\n###### Six',
			['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
		],
	] as const)('matches generated headings for %s', async (_name, content, texts) => {
		const result = await renderMdx(content)
		const article = document.createElement('article')
		article.innerHTML = result.html
		const headings = Array.from(article.querySelectorAll('h1,h2,h3,h4,h5,h6'))
		expect(result.toc).toEqual(
			headings.map((heading) => ({
				id: heading.id,
				text: heading.textContent,
				depth: Number(heading.tagName.slice(1)),
			})),
		)
		expect(result.toc.map((entry) => entry.text)).toEqual(texts)
		expect(new Set(result.toc.map((entry) => entry.id)).size).toBe(headings.length)
	})

	it('keeps highlighting, GFM, and reading time', async () => {
		const content = `## Code\n\n\`\`\`js\nconst answer = 42\n\`\`\`\n\n~~old~~\n\n${'word '.repeat(WORDS_PER_MINUTE)}`
		const result = await renderMdx(content)
		const article = document.createElement('article')
		article.innerHTML = result.html
		expect(article.querySelector('code[data-language="js"] span')).not.toBeNull()
		expect(article.querySelector('del')?.textContent).toBe('old')
		expect(result.readingTimeMinutes).toBe(2)
	})

	it('keeps empty posts valid with no navigation', async () => {
		expect(await renderMdx('')).toEqual({ html: '', readingTimeMinutes: 1, toc: [] })
	})
})
