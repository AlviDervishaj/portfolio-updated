type NewsletterWelcomeEmailProps = {
	unsubscribeUrl: string
}

export function NewsletterWelcomeEmail({ unsubscribeUrl }: NewsletterWelcomeEmailProps) {
	return (
		<div
			style={{
				backgroundColor: '#f5f3ef',
				padding: '32px 16px',
				fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
				color: '#0c0c0c',
			}}
		>
			<div
				style={{
					maxWidth: '560px',
					margin: '0 auto',
					backgroundColor: '#ffffff',
					border: '1px solid rgba(12, 12, 12, 0.1)',
					padding: '28px',
				}}
			>
				<p
					style={{
						margin: '0 0 12px',
						fontFamily: 'JetBrains Mono, ui-monospace, monospace',
						fontSize: '12px',
						letterSpacing: '0.16em',
						textTransform: 'uppercase',
						color: '#6b6762',
					}}
				>
					Newsletter
				</p>
				<h1
					style={{
						margin: '0 0 12px',
						fontSize: '30px',
						lineHeight: 1.1,
						letterSpacing: '-0.02em',
						fontWeight: 700,
					}}
				>
					You're subscribed!
				</h1>
				<p style={{ margin: '0 0 24px', fontSize: '15px', lineHeight: 1.6, color: '#6b6762' }}>
					Welcome — you'll be the first to know when I publish new posts. Expect writing on
					TypeScript, full-stack development, and building for the web.
				</p>
				<a
					href={unsubscribeUrl}
					style={{
						fontSize: '12px',
						color: '#6b6762',
						textDecoration: 'underline',
					}}
				>
					Unsubscribe at any time
				</a>
			</div>
		</div>
	)
}
