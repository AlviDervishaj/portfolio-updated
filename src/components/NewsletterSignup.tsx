'use client'

import { useState } from 'react'
import { subscribeNewsletterServerFn } from '#/server/newsletter.ts'

type SubscribeState = 'idle' | 'pending' | 'success' | 'error'

export function NewsletterSignup({ compact = false }: Readonly<{ compact?: boolean }>) {
	const [email, setEmail] = useState('')
	const [state, setState] = useState<SubscribeState>('idle')
	const [errorMessage, setErrorMessage] = useState('')

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (state === 'pending') return
		setState('pending')
		setErrorMessage('')
		try {
			const result = await subscribeNewsletterServerFn({ data: { email } })
			if (result.success) {
				setState('success')
				setEmail('')
			} else {
				setState('error')
				setErrorMessage(result.error)
			}
		} catch {
			setState('error')
			setErrorMessage('Something went wrong. Please try again.')
		}
	}

	if (state === 'success') {
		return (
			<div className={compact ? '' : 'border border-acid-border bg-acid-dim px-6 py-5'}>
				<p className="m-0 font-mono text-mono-sm uppercase tracking-mono-md text-foreground">
					Check your inbox to confirm your subscription.
				</p>
			</div>
		)
	}

	return (
		<div>
			{!compact && (
				<div className="mb-4">
					<p className="m-0 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
						Newsletter
					</p>
					<p className="mt-1 font-sans text-[0.875rem] text-muted-foreground">
						Get notified when I publish new posts.
					</p>
				</div>
			)}

			{state === 'error' && (
				<p className="mb-3 font-mono text-[0.7rem] text-[oklch(0.577_0.245_27.325)]">
					{errorMessage || 'Something went wrong. Please try again.'}
				</p>
			)}

			<form onSubmit={handleSubmit} className="flex gap-2">
				<input
					type="email"
					value={email}
					onChange={(e) => {
						setEmail(e.target.value)
						if (state === 'error') setState('idle')
					}}
					placeholder="your@email.com"
					required
					className="min-w-0 flex-1 border border-line-strong bg-transparent px-4 py-2.5 font-sans text-[0.875rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border"
				/>
				<button
					type="submit"
					disabled={state === 'pending'}
					className="acid-btn shrink-0 disabled:opacity-50"
				>
					{state === 'pending' ? 'Subscribing…' : 'Subscribe'}
				</button>
			</form>
		</div>
	)
}
