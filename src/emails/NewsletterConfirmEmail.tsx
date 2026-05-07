type NewsletterConfirmEmailProps = {
	confirmUrl: string
}

export function NewsletterConfirmEmail({ confirmUrl }: NewsletterConfirmEmailProps) {
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
					Confirm your subscription
				</h1>
				<p style={{ margin: '0 0 20px', fontSize: '15px', lineHeight: 1.6, color: '#6b6762' }}>
					Click the button below to confirm your email and start receiving updates.
				</p>
				<a
					href={confirmUrl}
					style={{
						display: 'inline-block',
						padding: '12px 20px',
						backgroundColor: '#d4f701',
						color: '#0c0c0c',
						textDecoration: 'none',
						fontFamily: 'JetBrains Mono, ui-monospace, monospace',
						fontSize: '12px',
						letterSpacing: '0.1em',
						textTransform: 'uppercase',
						fontWeight: 600,
					}}
				>
					Confirm subscription
				</a>
				<p
					style={{
						margin: '24px 0 0',
						fontSize: '12px',
						lineHeight: 1.6,
						color: '#6b6762',
					}}
				>
					If you did not request this, you can safely ignore this email.
				</p>
			</div>
		</div>
	)
}
