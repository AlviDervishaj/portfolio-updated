import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Check, RefreshCw, Upload } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { USER } from '#/constants/user'
import { authClient } from '#/lib/auth-client.ts'
import {
	adminCreatePostServerFn,
	adminGetAllPostsServerFn,
	adminGetPresignedUploadUrlServerFn,
	adminHasAccessServerFn,
	adminPublishPostServerFn,
	adminUnpublishPostServerFn,
	adminUpdatePostServerFn,
} from '#/server/admin.ts'

export const Route = createFileRoute('/admin')({
	component: AdminPage,
	head: () => ({ meta: [{ title: `Admin — ${USER.FULL_NAME}` }] }),
	loader: async () => {
		const isAuthorized = await adminHasAccessServerFn()
		return { isAuthorized }
	},
})

type EditorMode = 'new' | 'edit'

type PostForm = {
	slug: string
	title: string
	excerpt: string
	content: string
	coverImageKey: string
}

type AdminPostItem = {
	id: string
	slug: string
	title: string
	status: string
	updatedAt: string | Date
	publishedAt: string | Date | null
}

const EMPTY_FORM: PostForm = {
	slug: '',
	title: '',
	excerpt: '',
	content: '',
	coverImageKey: '',
}

const INPUT_CLASS =
	'w-full border border-line-strong bg-transparent px-4 py-3 font-sans text-[0.9rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border'

const LABEL_CLASS =
	'mb-2 block font-mono text-mono-xs uppercase tracking-mono-md text-muted-foreground'

function PostListSidebar({
	posts,
	loading,
	activePostId,
	onSelectPost,
	onRefresh,
}: {
	posts: AdminPostItem[]
	loading: boolean
	activePostId: string | null
	onSelectPost: (post: AdminPostItem) => void
	onRefresh: () => void
}) {
	return (
		<aside className="max-h-[calc(100vh-14rem)] overflow-y-auto border-b border-line-strong pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6">
			<div className="mb-4 flex items-center justify-between">
				<p className="m-0 font-mono text-mono-xs uppercase tracking-mono-lg text-muted-foreground">
					All Posts ({posts.length})
				</p>
				<button
					type="button"
					onClick={onRefresh}
					disabled={loading}
					aria-label="Refresh posts"
					className="cursor-pointer border-none bg-transparent p-1 font-mono text-[0.6rem] text-muted-foreground disabled:opacity-40"
				>
					<RefreshCw aria-hidden="true" className="size-4" />
				</button>
			</div>

			{loading && posts.length === 0 && (
				<div className="flex flex-col gap-3">
					{[1, 2, 3].map((i) => (
						<div key={i} className="skeleton h-12 rounded-sm" />
					))}
				</div>
			)}

			{!loading && posts.length === 0 && (
				<p className="py-4 font-mono text-mono-lg text-muted-foreground">No posts yet.</p>
			)}

			<div className="flex flex-col gap-1">
				{posts.map((post) => {
					const isActive = post.id === activePostId
					const isDraft = post.status === 'draft'
					const updatedDate = new Date(post.updatedAt).toLocaleDateString('en-US', {
						month: 'short',
						day: 'numeric',
					})

					return (
						<button
							type="button"
							key={post.id}
							onClick={() => onSelectPost(post)}
							className={`block w-full cursor-pointer border p-3 text-left transition-all duration-150 ${
								isActive ? 'border-acid-border bg-acid-dim' : 'border-transparent bg-transparent'
							}`}
						>
							<p className="mb-1.5 mt-0 truncate font-sans text-[0.82rem] font-semibold leading-[1.3] text-foreground">
								{post.title}
							</p>
							<div className="flex items-center gap-3 font-mono text-[0.58rem] uppercase tracking-mono text-muted-foreground">
								<span
									className={`font-medium ${isDraft ? 'text-[oklch(0.75_0.15_55)]' : 'text-acid'}`}
								>
									{isDraft ? 'draft' : 'published'}
								</span>
								<span>{updatedDate}</span>
							</div>
						</button>
					)
				})}
			</div>
		</aside>
	)
}

function AdminPage() {
	const { isAuthorized } = Route.useLoaderData()
	const { isPending } = authClient.useSession()
	const [mode, setMode] = useState<EditorMode>('new')
	const [editPostId, setEditPostId] = useState<string | null>(null)
	const [form, setForm] = useState<PostForm>(EMPTY_FORM)
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [success, setSuccess] = useState<string | null>(null)
	const [_previewHtml, setPreviewHtml] = useState<string | null>(null)
	const [uploadingImage, setUploadingImage] = useState(false)
	const [allPostsRaw, setAllPostsRaw] = useState<Record<string, unknown>[]>([])
	const [loadingPosts, setLoadingPosts] = useState(true)

	const sidebarPosts: AdminPostItem[] = allPostsRaw.map((p) => ({
		id: String(p.id),
		slug: String(p.slug),
		title: String(p.title),
		status: String(p.status),
		updatedAt: String(p.updatedAt),
		publishedAt: p.publishedAt ? String(p.publishedAt) : null,
	}))

	const fetchAllPosts = useCallback(async () => {
		setLoadingPosts(true)
		try {
			const result = await adminGetAllPostsServerFn()
			if (result.success) {
				setAllPostsRaw(result.data as unknown as Record<string, unknown>[])
			}
		} finally {
			setLoadingPosts(false)
		}
	}, [])

	useEffect(() => {
		if (isAuthorized) {
			fetchAllPosts()
		}
	}, [isAuthorized, fetchAllPosts])

	function handleSelectPost(post: AdminPostItem) {
		setMode('edit')
		setEditPostId(post.id)
		setError(null)
		setSuccess(null)
		setPreviewHtml(null)

		const matched = allPostsRaw.find((p) => p.id === post.id)
		if (!matched) return

		setForm({
			slug: String(matched.slug ?? ''),
			title: String(matched.title ?? ''),
			excerpt: String(matched.excerpt ?? ''),
			content: String(matched.content ?? ''),
			coverImageKey: String(matched.coverImageKey ?? ''),
		})
	}

	if (isPending) {
		return (
			<main className="mx-auto max-w-[1200px] px-6 py-24">
				<div className="skeleton h-8 w-[30%] rounded-sm" />
			</main>
		)
	}

	if (!isAuthorized) {
		return (
			<main className="mx-auto max-w-[1200px] px-6 py-24 text-center">
				<p className="mb-8 font-mono text-[0.75rem] uppercase tracking-mono text-muted-foreground">
					Access denied
				</p>
				<Link to="/sign-in" className="acid-btn">
					Sign in
					<ArrowRight aria-hidden="true" className="size-4" />
				</Link>
			</main>
		)
	}

	function setField<K extends keyof PostForm>(key: K, value: PostForm[K]) {
		setForm((prev) => ({ ...prev, [key]: value }))
		setError(null)
		setSuccess(null)
	}

	function resetForm() {
		setForm(EMPTY_FORM)
		setMode('new')
		setEditPostId(null)
		setPreviewHtml(null)
		setError(null)
		setSuccess(null)
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		setSubmitting(true)
		setError(null)
		setSuccess(null)

		try {
			if (mode === 'new') {
				const result = await adminCreatePostServerFn({
					data: {
						slug: form.slug,
						title: form.title,
						excerpt: form.excerpt,
						content: form.content,
						coverImageKey: form.coverImageKey || undefined,
					},
				})

				if (!result.success) {
					setError(result.error)
				} else {
					setSuccess(`Post created: "${result.data.title}" (draft)`)
					setEditPostId(result.data.id)
					setMode('edit')
					fetchAllPosts()
				}
			} else if (editPostId) {
				const result = await adminUpdatePostServerFn({
					data: {
						postId: editPostId,
						slug: form.slug,
						title: form.title,
						excerpt: form.excerpt,
						content: form.content,
						coverImageKey: form.coverImageKey || null,
					},
				})

				if (!result.success) {
					setError(result.error)
				} else {
					setSuccess('Post updated.')
					fetchAllPosts()
				}
			}
		} finally {
			setSubmitting(false)
		}
	}

	async function handlePublish() {
		if (!editPostId) return
		setSubmitting(true)
		try {
			const result = await adminPublishPostServerFn({ data: { postId: editPostId } })
			if (!result.success) setError(result.error)
			else {
				setSuccess('Post published!')
				fetchAllPosts()
			}
		} finally {
			setSubmitting(false)
		}
	}

	async function handleUnpublish() {
		if (!editPostId) return
		setSubmitting(true)
		try {
			const result = await adminUnpublishPostServerFn({ data: { postId: editPostId } })
			if (!result.success) setError(result.error)
			else {
				setSuccess('Post moved to draft.')
				fetchAllPosts()
			}
		} finally {
			setSubmitting(false)
		}
	}

	async function handleImageUpload(file: File) {
		setUploadingImage(true)
		try {
			const result = await adminGetPresignedUploadUrlServerFn({
				data: { filename: file.name, contentType: file.type },
			})

			if (!result.success) {
				setError(result.error)
				return
			}

			const { url, key } = result.data

			await fetch(url, {
				method: 'PUT',
				body: file,
				headers: { 'Content-Type': file.type },
			})

			setField('coverImageKey', key)
			setSuccess('Cover image uploaded.')
		} catch {
			setError('Failed to upload image.')
		} finally {
			setUploadingImage(false)
		}
	}

	return (
		<main className="mx-auto max-w-[1400px] px-6 py-24">
			<div className="grid grid-cols-1 items-start gap-8 md:grid-cols-[280px_1fr] md:gap-10">
				<PostListSidebar
					posts={sidebarPosts}
					loading={loadingPosts}
					activePostId={editPostId}
					onSelectPost={handleSelectPost}
					onRefresh={fetchAllPosts}
				/>

				<div>
					<div className="mb-12 flex flex-col gap-4 border-b border-line-strong pb-6 sm:flex-row sm:items-center sm:justify-between">
						<h1 className="m-0 font-display text-[clamp(1.5rem,4vw,2.5rem)] font-bold tracking-display-tight">
							{mode === 'new' ? 'New Post' : 'Edit Post'}
						</h1>

						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							{mode === 'edit' && (
								<>
									<button
										type="button"
										onClick={handlePublish}
										disabled={submitting}
										className="acid-btn px-4 py-2 text-mono-sm"
									>
										<Upload aria-hidden="true" className="size-4" />
										Publish
									</button>
									<button
										type="button"
										onClick={handleUnpublish}
										disabled={submitting}
										className="ghost-btn px-4 py-2 text-mono-sm"
									>
										Move to draft
									</button>
								</>
							)}
							{mode === 'edit' && (
								<button
									type="button"
									onClick={resetForm}
									className="ghost-btn px-4 py-2 text-mono-sm"
								>
									+ New post
								</button>
							)}
						</div>
					</div>

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

					<form onSubmit={handleSubmit}>
						<div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
							<div>
								<label htmlFor="title" className={LABEL_CLASS}>
									Title
								</label>
								<input
									id="title"
									type="text"
									value={form.title}
									onChange={(e) => setField('title', e.target.value)}
									className={INPUT_CLASS}
									required
								/>
							</div>

							<div>
								<label htmlFor="slug" className={LABEL_CLASS}>
									Slug
								</label>
								<input
									id="slug"
									type="text"
									value={form.slug}
									onChange={(e) => setField('slug', e.target.value)}
									className={INPUT_CLASS}
									required
									placeholder="my-post-slug"
								/>
							</div>
						</div>

						<div className="mb-6">
							<label htmlFor="excerpt" className={LABEL_CLASS}>
								Excerpt
							</label>
							<textarea
								id="excerpt"
								value={form.excerpt}
								onChange={(e) => setField('excerpt', e.target.value)}
								rows={3}
								className={`${INPUT_CLASS} resize-y`}
								required
							/>
						</div>

						<div className="mb-6">
							<label htmlFor="coverImage" className={LABEL_CLASS}>
								Cover Image {uploadingImage && '(uploading…)'}
							</label>
							<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
								<input
									id="coverImage"
									type="file"
									accept="image/*"
									onChange={(e) => {
										const file = e.target.files?.[0]
										if (file) handleImageUpload(file)
									}}
									className="w-auto border border-line-strong bg-transparent p-2 font-sans text-[0.9rem] text-foreground outline-none transition-colors duration-150 focus:border-acid-border"
									disabled={uploadingImage}
								/>
								{form.coverImageKey && (
									<span className="break-all font-mono text-mono-sm tracking-[0.06em] text-acid">
										<Check aria-hidden="true" className="inline-block size-3.5" />{' '}
										{form.coverImageKey}
									</span>
								)}
							</div>
						</div>

						<div className="mb-8">
							<label htmlFor="content" className={LABEL_CLASS}>
								Content (MDX)
								<span
									className={`float-right ${
										form.content.length > 180_000
											? 'text-[oklch(0.577_0.245_27.325)]'
											: 'text-muted-foreground'
									}`}
								>
									{form.content.length.toLocaleString()} / 200,000
								</span>
							</label>
							<textarea
								id="content"
								value={form.content}
								onChange={(e) => setField('content', e.target.value)}
								rows={24}
								className={`${INPUT_CLASS} resize-y font-mono text-[0.82rem] leading-[1.65]`}
								required
							/>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							<button type="submit" disabled={submitting} className="acid-btn disabled:opacity-50">
								{submitting ? 'Saving…' : mode === 'new' ? 'Save draft' : 'Update post'}
							</button>
							<span className="font-mono text-mono-xs uppercase tracking-mono text-muted-foreground">
								{mode === 'new' ? 'Saved as draft' : `Editing post ${editPostId?.slice(0, 8)}…`}
							</span>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}
