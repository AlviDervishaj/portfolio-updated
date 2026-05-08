import { TagBadge } from '#/components/TagBadge.tsx'
import type { Tag } from '#/db/schema.ts'

type TagFilterProps = {
	tags: Tag[]
	activeTag: string | null
	onChange: (slug: string | null) => void
}

export function TagFilter({ tags, activeTag, onChange }: Readonly<TagFilterProps>) {
	if (tags.length === 0) return null

	return (
		<div className="flex flex-wrap items-center gap-2">
			<button
				type="button"
				onClick={() => onChange(null)}
				className={`cursor-pointer border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-mono-md transition-colors duration-150 ${
					activeTag === null
						? 'border-acid bg-acid text-on-acid'
						: 'border-line-strong bg-transparent text-muted-foreground hover:border-acid hover:text-acid'
				}`}
			>
				All
			</button>
			{tags.map((tag) => (
				<TagBadge
					key={tag.id}
					tag={tag}
					active={activeTag === tag.slug}
					onClick={() => onChange(activeTag === tag.slug ? null : tag.slug)}
				/>
			))}
		</div>
	)
}
