import type { Tag } from '#/db/schema.ts'

type TagBadgeProps = {
	tag: Tag
	asLink?: boolean
	active?: boolean
	onClick?: () => void
}

export function TagBadge({
	tag,
	asLink = false,
	active = false,
	onClick,
}: Readonly<TagBadgeProps>) {
	const className = `inline-block cursor-pointer border px-2 py-0.5 font-mono text-[0.6rem] uppercase tracking-mono-md transition-colors duration-150 no-underline ${
		active
			? 'border-acid bg-acid text-on-acid'
			: 'border-line-strong bg-transparent text-muted-foreground hover:border-acid hover:text-acid'
	}`

	if (asLink) {
		return (
			<a href={`/blog?tag=${tag.slug}`} className={className} onClick={onClick}>
				{tag.name}
			</a>
		)
	}

	return (
		<button type="button" className={className} onClick={onClick}>
			{tag.name}
		</button>
	)
}
