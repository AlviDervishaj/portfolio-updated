'use server'

import type { Root } from 'hast'
import rehypePrettyCode from 'rehype-pretty-code'
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

function computeReadingTime(content: string): number {
	const wordCount = content.split(/\s+/).filter(Boolean).length
	return Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE))
}

export async function renderMdx(content: string): Promise<MdxResult> {
	const toc: TocEntry[] = []

	function collectHeadings() {
		return (tree: Root) => {
			visit(tree, 'element', (node) => {
				const heading = /^h([1-6])$/.exec(node.tagName)
				if (!heading || typeof node.properties.id !== 'string') return
				let text = ''
				visit(node, 'text', (child) => {
					text += child.value
				})
				toc.push({ id: node.properties.id, text, depth: Number(heading[1]) })
			})
		}
	}

	const file = await unified()
		.use(remarkParse)
		.use(remarkGfm)
		.use(remarkRehype, { allowDangerousHtml: true })
		.use(rehypeSlug)
		.use(rehypePrettyCode, { theme: MDX_SYNTAX_THEME, keepBackground: true })
		.use(collectHeadings)
		.use(rehypeStringify, { allowDangerousHtml: true })
		.process(content)

	return { html: String(file), readingTimeMinutes: computeReadingTime(content), toc }
}
