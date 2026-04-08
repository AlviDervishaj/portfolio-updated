'use server'

import rehypePrettyCode, { type Options as PrettyCodeOptions } from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'
import { visit } from 'unist-util-visit'

import { MDX_SYNTAX_THEME, WORDS_PER_MINUTE } from '#/constants/mdx.ts'

export type TocEntry = {
	id: string
	text: string
	depth: number
}

export type MdxResult = {
	html: string
	readingTimeMinutes: number
	toc: TocEntry[]
}

function slugifyHeading(text: string): string {
	return text
		.toLowerCase()
		.replace(/\s+/g, '-')
		.replace(/[^\w-]/g, '')
}

function computeReadingTime(content: string): number {
	const wordCount = content.split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

class MdxPipelineBuilder {
	private theme: PrettyCodeOptions['theme'] = MDX_SYNTAX_THEME
	private keepBackground: boolean = true

	withTheme(theme: PrettyCodeOptions['theme']): MdxPipelineBuilder {
		this.theme = theme
		return this
	}

	withoutBackground(): MdxPipelineBuilder {
		this.keepBackground = false
		return this
	}

	async render(content: string): Promise<MdxResult> {
		const toc: TocEntry[] = []

		function collectHeadings() {
			return (tree: Parameters<typeof visit>[0]) => {
				visit(
					tree,
					'heading',
					(node: {
						type: string
						depth: number
						children: Array<{ type: string; value?: string }>
					}) => {
						const text = node.children
							.filter((child) => child.type === 'text')
							.map((child) => child.value ?? '')
							.join('')

						toc.push({
							id: slugifyHeading(text),
							text,
							depth: node.depth,
						})
					},
				)
			}
		}

		const file = await unified()
			.use(remarkParse)
			.use(remarkGfm)
			.use(collectHeadings)
			.use(remarkRehype, { allowDangerousHtml: true })
			.use(rehypeSlug)
			.use(rehypePrettyCode, {
				theme: this.theme,
				keepBackground: this.keepBackground,
			})
			.use(rehypeStringify, { allowDangerousHtml: true })
			.process(content)

		return {
			html: String(file),
			readingTimeMinutes: computeReadingTime(content),
			toc,
		}
	}
}

export function createMdxPipeline(): MdxPipelineBuilder {
	return new MdxPipelineBuilder()
}

export async function renderMdx(content: string): Promise<MdxResult> {
	return createMdxPipeline().render(content)
}
