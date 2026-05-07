import { createFileRoute } from '@tanstack/react-router'
import { Trash2 } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import type { Tag } from '#/db/schema.ts'
import { adminCreateTagServerFn, adminDeleteTagServerFn, getTagsServerFn } from '#/server/tags.ts'

export const Route = createFileRoute('/admin/tags')({
	component: AdminTagsPage,
})

const INPUT_CLASS =
	'w-full border border-line-strong bg-transparent px-4 py-3 font-sans text-[0.9rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border'

const LABEL_CLASS =
	'mb-2 block font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground'

function AdminTagsPage() {
	const [tags, setTags] = useState<Tag[]>([])
	const [loading, setLoading] = useState(true)
	const [name, setName] = useState('')
	const [slug, setSlug] = useState('')
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)

	const fetchTags = useCallback(async () => {
		setLoading(true)
		try {
			const result = await getTagsServerFn()
			if (result.success) setTags(result.data)
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		fetchTags()
	}, [fetchTags])

	function handleNameChange(value: string) {
		setName(value)
		setSlug(
			value
				.toLowerCase()
				.replace(/\s+/g, '-')
				.replace(/[^a-z0-9-]/g, ''),
		)
		setError(null)
		setSuccess(null)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!name.trim() || !slug.trim()) return
		setSubmitting(true)
		setError(null)
		setSuccess(null)
		try {
			const result = await adminCreateTagServerFn({
				data: { name: name.trim(), slug: slug.trim() },
			})
			if (!result.success) {
				setError(result.error)
			} else {
				setSuccess(`Tag "${result.data.name}" created.`)
				setName('')
				setSlug('')
				fetchTags()
			}
		} finally {
			setSubmitting(false)
		}
	}

	async function handleDelete(tagId: string, tagName: string) {
		const result = await adminDeleteTagServerFn({ data: { tagId } })
		if (!result.success) {
			setError(result.error)
		} else {
			setSuccess(`Tag "${tagName}" deleted.`)
			setTags((prev) => prev.filter((t) => t.id !== tagId))
		}
	}

	return (
		<div className="grid grid-cols-1 items-start gap-10 md:grid-cols-[320px_1fr]">
			<div>
				<h2 className="mb-6 mt-0 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-display-tight">
					New Tag
				</h2>

				{error && (
					<div className="mb-6 border border-[oklch(0.577_0.245_27.325)] px-4 py-3.5 font-mono text-[0.72rem] tracking-[0.04em] text-[oklch(0.577_0.245_27.325)]">
						{error}
					</div>
				)}

				{success && (
					<div className="mb-6 border border-acid-border bg-acid-dim px-4 py-3.5 font-mono text-[0.72rem] tracking-[0.04em] text-foreground">
						{success}
					</div>
				)}

				<form onSubmit={handleSubmit} className="flex flex-col gap-4">
					<div>
						<label htmlFor="tagName" className={LABEL_CLASS}>
							Name
						</label>
						<input
							id="tagName"
							type="text"
							value={name}
							onChange={(e) => handleNameChange(e.target.value)}
							className={INPUT_CLASS}
							required
							placeholder="TypeScript"
						/>
					</div>

					<div>
						<label htmlFor="tagSlug" className={LABEL_CLASS}>
							Slug
						</label>
						<input
							id="tagSlug"
							type="text"
							value={slug}
							onChange={(e) => {
								setSlug(e.target.value)
								setError(null)
							}}
							className={INPUT_CLASS}
							required
							placeholder="typescript"
						/>
					</div>

					<button type="submit" disabled={submitting} className="acid-btn disabled:opacity-50">
						{submitting ? 'Creating…' : 'Create tag'}
					</button>
				</form>
			</div>

			<div>
				<p className="mb-4 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					All Tags ({tags.length})
				</p>

				{loading && tags.length === 0 && (
					<div className="flex flex-col gap-2">
						{[1, 2, 3].map((i) => (
							<div key={i} className="skeleton h-10 rounded-sm" />
						))}
					</div>
				)}

				{!loading && tags.length === 0 && (
					<p className="font-mono text-mono-lg text-muted-foreground">No tags yet.</p>
				)}

				<div className="flex flex-col gap-1">
					{tags.map((tag) => (
						<div
							key={tag.id}
							className="flex items-center justify-between border-b border-line-strong py-3 last:border-b-0"
						>
							<div className="flex flex-col gap-0.5">
								<span className="font-sans text-[0.9rem] font-medium text-foreground">
									{tag.name}
								</span>
								<span className="font-mono text-mono-xs text-muted-foreground">{tag.slug}</span>
							</div>
							<button
								type="button"
								onClick={() => handleDelete(tag.id, tag.name)}
								aria-label={`Delete tag ${tag.name}`}
								className="cursor-pointer border-none bg-transparent p-1 text-muted-foreground transition-colors duration-150 hover:text-[oklch(0.577_0.245_27.325)]"
							>
								<Trash2 aria-hidden="true" className="size-4" />
							</button>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
