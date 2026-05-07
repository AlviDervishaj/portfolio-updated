import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import {
	MAX_CONTACT_MESSAGE_LENGTH,
	MAX_CONTACT_NAME_LENGTH,
	MAX_CONTACT_SUBJECT_LENGTH,
} from '#/constants/content.ts'
import { USER } from '#/constants/user'
import { env } from '#/env.ts'
import { submitContactFormServerFn } from '#/server/contact.ts'

export const Route = createFileRoute('/contact')({
	component: ContactPage,
	head: () => ({
		meta: [
			{ title: `Contact — ${USER.FULL_NAME}` },
			{ name: 'description', content: 'Get in touch.' },
			{ property: 'og:title', content: `Contact — ${USER.FULL_NAME}` },
			{ property: 'og:description', content: 'Get in touch.' },
			{ property: 'og:url', content: `${env.VITE_APP_URL}/contact` },
			{ property: 'og:image', content: `${env.VITE_APP_URL}/api/og?title=Contact&type=page` },
			{ name: 'twitter:card', content: 'summary_large_image' },
		],
		links: [{ rel: 'canonical', href: `${env.VITE_APP_URL}/contact` }],
	}),
})

const INPUT_CLASS =
	'w-full border border-line-strong bg-transparent px-4 py-3 font-sans text-[0.9rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border'

const LABEL_CLASS =
	'mb-2 block font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground'

type FormState = {
	name: string
	email: string
	subject: string
	message: string
}

const EMPTY_FORM: FormState = { name: '', email: '', subject: '', message: '' }

function ContactPage() {
	const [form, setForm] = useState<FormState>(EMPTY_FORM)
	const [submitting, setSubmitting] = useState(false)
	const [success, setSuccess] = useState(false)
	const [error, setError] = useState<string | null>(null)

	function setField<K extends keyof FormState>(key: K, value: FormState[K]) {
		setForm((prev) => ({ ...prev, [key]: value }))
		setError(null)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSubmitting(true)
		setError(null)
		try {
			const result = await submitContactFormServerFn({ data: form })
			if (!result.success) {
				setError(result.error)
			} else {
				setSuccess(true)
				setForm(EMPTY_FORM)
			}
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<main className="mx-auto max-w-[680px] px-6 py-24">
			<div className="mb-16">
				<h1 className="animate-fade-up mb-4 mt-0 font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.95] tracking-display-tighter">
					Get in touch
				</h1>
				<p className="m-0 font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
					I typically respond within a day or two.
				</p>
			</div>

			{success ? (
				<div className="border border-acid-border bg-acid-dim px-6 py-8">
					<p className="m-0 font-mono text-mono-sm uppercase tracking-mono-md text-foreground">
						Message sent. I'll get back to you soon.
					</p>
				</div>
			) : (
				<>
					{error && (
						<div className="mb-6 border border-[oklch(0.577_0.245_27.325)] px-4 py-3.5 font-mono text-[0.72rem] tracking-[0.04em] text-[oklch(0.577_0.245_27.325)]">
							{error}
						</div>
					)}

					<form onSubmit={handleSubmit} className="flex flex-col gap-6">
						<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label htmlFor="name" className={LABEL_CLASS}>
									Name
								</label>
								<input
									id="name"
									type="text"
									value={form.name}
									onChange={(e) => setField('name', e.target.value)}
									className={INPUT_CLASS}
									required
									maxLength={MAX_CONTACT_NAME_LENGTH}
								/>
							</div>
							<div>
								<label htmlFor="email" className={LABEL_CLASS}>
									Email
								</label>
								<input
									id="email"
									type="email"
									value={form.email}
									onChange={(e) => setField('email', e.target.value)}
									className={INPUT_CLASS}
									required
								/>
							</div>
						</div>

						<div>
							<label htmlFor="subject" className={LABEL_CLASS}>
								Subject
							</label>
							<input
								id="subject"
								type="text"
								value={form.subject}
								onChange={(e) => setField('subject', e.target.value)}
								className={INPUT_CLASS}
								required
								maxLength={MAX_CONTACT_SUBJECT_LENGTH}
							/>
						</div>

						<div>
							<label htmlFor="message" className={LABEL_CLASS}>
								Message
							</label>
							<textarea
								id="message"
								value={form.message}
								onChange={(e) => setField('message', e.target.value)}
								rows={8}
								className={`${INPUT_CLASS} resize-y`}
								required
								minLength={10}
								maxLength={MAX_CONTACT_MESSAGE_LENGTH}
							/>
						</div>

						<div>
							<button type="submit" disabled={submitting} className="acid-btn disabled:opacity-50">
								{submitting ? 'Sending…' : 'Send message'}
							</button>
						</div>
					</form>
				</>
			)}
		</main>
	)
}
