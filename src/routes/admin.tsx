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
		<aside
			className="border-b pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-6"
			style={{
				borderColor: 'var(--line-strong)',
				maxHeight: 'calc(100vh - 14rem)',
				overflowY: 'auto',
			}}
		>
			<div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.62rem',
						letterSpacing: '0.2em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
						margin: 0,
					}}
				>
					All Posts ({posts.length})
				</p>
				<button
					type="button"
					onClick={onRefresh}
					disabled={loading}
					style={{
						background: 'none',
						border: 'none',
						fontFamily: 'var(--font-mono)',
						fontSize: '0.6rem',
						color: 'var(--muted-foreground)',
						cursor: 'pointer',
						opacity: loading ? 0.4 : 1,
						padding: '0.25rem',
					}}
					aria-label="Refresh posts"
				>
					<RefreshCw aria-hidden="true" className="size-4" />
				</button>
			</div>

			{loading && posts.length === 0 && (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
					{[1, 2, 3].map((i) => (
						<div key={i} className="skeleton" style={{ height: '3rem', borderRadius: '2px' }} />
					))}
				</div>
			)}

			{!loading && posts.length === 0 && (
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.7rem',
						color: 'var(--muted-foreground)',
						padding: '1rem 0',
					}}
				>
					No posts yet.
				</p>
			)}

			<div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
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
							style={{
								display: 'block',
								width: '100%',
								textAlign: 'left',
								background: isActive ? 'var(--acid-dim, rgba(212, 247, 1, 0.08))' : 'transparent',
								border: '1px solid',
								borderColor: isActive ? 'var(--acid-border)' : 'transparent',
								padding: '0.75rem',
								cursor: 'pointer',
								transition: 'all 150ms ease',
							}}
						>
							<p
								style={{
									fontFamily: 'var(--font-sans)',
									fontSize: '0.82rem',
									fontWeight: 600,
									margin: '0 0 0.35rem',
									color: 'var(--foreground)',
									lineHeight: 1.3,
									overflow: 'hidden',
									textOverflow: 'ellipsis',
									whiteSpace: 'nowrap',
								}}
							>
								{post.title}
							</p>
							<div
								className="flex items-center gap-3"
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.58rem',
									letterSpacing: '0.1em',
									textTransform: 'uppercase',
									color: 'var(--muted-foreground)',
								}}
							>
								<span
									style={{
										color: isDraft ? 'oklch(0.75 0.15 55)' : 'var(--acid)',
										fontWeight: 500,
									}}
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
			<main style={{ maxWidth: '1200px', margin: '0 auto', padding: '6rem 1.5rem' }}>
				<div className="skeleton" style={{ height: '2rem', width: '30%', borderRadius: '2px' }} />
			</main>
		)
	}

	if (!isAuthorized) {
		return (
			<main
				style={{
					maxWidth: '1200px',
					margin: '0 auto',
					padding: '6rem 1.5rem',
					textAlign: 'center',
				}}
			>
				<p
					style={{
						fontFamily: 'var(--font-mono)',
						fontSize: '0.75rem',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						color: 'var(--muted-foreground)',
						marginBottom: '2rem',
					}}
				>
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

	const inputStyle: React.CSSProperties = {
		width: '100%',
		padding: '0.75rem 1rem',
		background: 'transparent',
		border: '1px solid var(--line-strong)',
		color: 'var(--foreground)',
		fontFamily: 'var(--font-sans)',
		fontSize: '0.9rem',
		outline: 'none',
		transition: 'border-color 150ms ease',
		boxSizing: 'border-box',
	}

	const labelStyle: React.CSSProperties = {
		fontFamily: 'var(--font-mono)',
		fontSize: '0.62rem',
		letterSpacing: '0.14em',
		textTransform: 'uppercase',
		color: 'var(--muted-foreground)',
		display: 'block',
		marginBottom: '0.5rem',
	}

	return (
		<main style={{ maxWidth: '1400px', margin: '0 auto', padding: '6rem 1.5rem' }}>
			<div
				className="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr] md:gap-10"
				style={{
					alignItems: 'start',
				}}
			>
				<PostListSidebar
					posts={sidebarPosts}
					loading={loadingPosts}
					activePostId={editPostId}
					onSelectPost={handleSelectPost}
					onRefresh={fetchAllPosts}
				/>

				<div>
					<div
						className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
						style={{
							marginBottom: '3rem',
							borderBottom: '1px solid var(--line-strong)',
							paddingBottom: '1.5rem',
						}}
					>
						<h1
							style={{
								fontFamily: 'var(--font-display)',
								fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
								fontWeight: 700,
								letterSpacing: '-0.02em',
								margin: 0,
							}}
						>
							{mode === 'new' ? 'New Post' : 'Edit Post'}
						</h1>

						<div className="flex flex-wrap items-center gap-2 sm:gap-3">
							{mode === 'edit' && (
								<>
									<button
										type="button"
										onClick={handlePublish}
										disabled={submitting}
										className="acid-btn"
										style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}
									>
										<Upload aria-hidden="true" className="size-4" />
										Publish
									</button>
									<button
										type="button"
										onClick={handleUnpublish}
										disabled={submitting}
										className="ghost-btn"
										style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}
									>
										Move to draft
									</button>
								</>
							)}
							{mode === 'edit' && (
								<button
									type="button"
									onClick={resetForm}
									className="ghost-btn"
									style={{ fontSize: '0.65rem', padding: '0.5rem 1rem' }}
								>
									+ New post
								</button>
							)}
						</div>
					</div>

					{error && (
						<div
							style={{
								border: '1px solid oklch(0.577 0.245 27.325)',
								padding: '0.875rem 1rem',
								marginBottom: '1.5rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.72rem',
								color: 'oklch(0.577 0.245 27.325)',
								letterSpacing: '0.04em',
							}}
						>
							{error}
						</div>
					)}

					{success && (
						<div
							style={{
								border: '1px solid var(--acid-border)',
								backgroundColor: 'var(--acid-dim)',
								padding: '0.875rem 1rem',
								marginBottom: '1.5rem',
								fontFamily: 'var(--font-mono)',
								fontSize: '0.72rem',
								color: 'var(--foreground)',
								letterSpacing: '0.04em',
							}}
						>
							{success}
						</div>
					)}

					<form onSubmit={handleSubmit}>
						<div
							className="grid grid-cols-1 gap-4 md:grid-cols-2"
							style={{
								marginBottom: '1.5rem',
							}}
						>
							<div>
								<label htmlFor="title" style={labelStyle}>
									Title
								</label>
								<input
									id="title"
									type="text"
									value={form.title}
									onChange={(e) => setField('title', e.target.value)}
									style={inputStyle}
									required
									onFocus={(e) => {
										e.currentTarget.style.borderColor = 'var(--acid-border)'
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = 'var(--line-strong)'
									}}
								/>
							</div>

							<div>
								<label htmlFor="slug" style={labelStyle}>
									Slug
								</label>
								<input
									id="slug"
									type="text"
									value={form.slug}
									onChange={(e) => setField('slug', e.target.value)}
									style={inputStyle}
									required
									placeholder="my-post-slug"
									onFocus={(e) => {
										e.currentTarget.style.borderColor = 'var(--acid-border)'
									}}
									onBlur={(e) => {
										e.currentTarget.style.borderColor = 'var(--line-strong)'
									}}
								/>
							</div>
						</div>

						<div style={{ marginBottom: '1.5rem' }}>
							<label htmlFor="excerpt" style={labelStyle}>
								Excerpt
							</label>
							<textarea
								id="excerpt"
								value={form.excerpt}
								onChange={(e) => setField('excerpt', e.target.value)}
								rows={3}
								style={{ ...inputStyle, resize: 'vertical' }}
								required
								onFocus={(e) => {
									e.currentTarget.style.borderColor = 'var(--acid-border)'
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = 'var(--line-strong)'
								}}
							/>
						</div>

						<div style={{ marginBottom: '1.5rem' }}>
							<label htmlFor="coverImage" style={labelStyle}>
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
									style={{ ...inputStyle, width: 'auto', padding: '0.5rem' }}
									disabled={uploadingImage}
								/>
								{form.coverImageKey && (
									<span
										style={{
											fontFamily: 'var(--font-mono)',
											fontSize: '0.65rem',
											color: 'var(--acid)',
											letterSpacing: '0.06em',
											wordBreak: 'break-all',
										}}
									>
										<Check aria-hidden="true" className="size-3.5 inline-block" />{' '}
										{form.coverImageKey}
									</span>
								)}
							</div>
						</div>

						<div style={{ marginBottom: '2rem' }}>
							<label htmlFor="content" style={labelStyle}>
								Content (MDX)
								<span
									style={{
										float: 'right',
										color:
											form.content.length > 180_000
												? 'oklch(0.577 0.245 27.325)'
												: 'var(--muted-foreground)',
									}}
								>
									{form.content.length.toLocaleString()} / 200,000
								</span>
							</label>
							<textarea
								id="content"
								value={form.content}
								onChange={(e) => setField('content', e.target.value)}
								rows={24}
								style={{
									...inputStyle,
									resize: 'vertical',
									fontFamily: 'var(--font-mono)',
									fontSize: '0.82rem',
									lineHeight: 1.65,
								}}
								required
								onFocus={(e) => {
									e.currentTarget.style.borderColor = 'var(--acid-border)'
								}}
								onBlur={(e) => {
									e.currentTarget.style.borderColor = 'var(--line-strong)'
								}}
							/>
						</div>

						<div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
							<button
								type="submit"
								disabled={submitting}
								className="acid-btn"
								style={{ opacity: submitting ? 0.5 : 1 }}
							>
								{submitting ? 'Saving…' : mode === 'new' ? 'Save draft' : 'Update post'}
							</button>
							<span
								style={{
									fontFamily: 'var(--font-mono)',
									fontSize: '0.62rem',
									letterSpacing: '0.1em',
									textTransform: 'uppercase',
									color: 'var(--muted-foreground)',
								}}
							>
								{mode === 'new' ? 'Saved as draft' : `Editing post ${editPostId?.slice(0, 8)}…`}
							</span>
						</div>
					</form>
				</div>
			</div>
		</main>
	)
}
