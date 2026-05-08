'use client'

import { Check, Copy, Linkedin, Twitter } from 'lucide-react'
import { useState } from 'react'

const COPIED_TIMEOUT_MS = 2000

type ShareBarProps = {
	url: string
	title: string
}

export function ShareBar({ url, title }: Readonly<ShareBarProps>) {
	const [copied, setCopied] = useState(false)

	async function handleCopy() {
		await navigator.clipboard.writeText(url)
		setCopied(true)
		setTimeout(() => setCopied(false), COPIED_TIMEOUT_MS)
	}

	const twitterUrl = `https://x.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
	const linkedInUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`

	return (
		<div className="flex flex-wrap items-center gap-3">
			<p className="m-0 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
				Share
			</p>
			<button
				type="button"
				onClick={handleCopy}
				className="ghost-btn px-3 py-1.5 text-mono-sm"
				aria-label="Copy link"
			>
				{copied ? (
					<>
						<Check aria-hidden="true" className="size-3.5" />
						Copied!
					</>
				) : (
					<>
						<Copy aria-hidden="true" className="size-3.5" />
						Copy link
					</>
				)}
			</button>
			<a
				href={twitterUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="ghost-btn px-3 py-1.5 text-mono-sm no-underline"
				aria-label="Share on X"
			>
				<Twitter aria-hidden="true" className="size-3.5" />
				Share on X
			</a>
			<a
				href={linkedInUrl}
				target="_blank"
				rel="noopener noreferrer"
				className="ghost-btn px-3 py-1.5 text-mono-sm no-underline"
				aria-label="Share on LinkedIn"
			>
				<Linkedin aria-hidden="true" className="size-3.5" />
				Share on LinkedIn
			</a>
		</div>
	)
}
