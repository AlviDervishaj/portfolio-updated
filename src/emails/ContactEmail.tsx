type ContactEmailProps = {
	senderName: string
	senderEmail: string
	subject: string
	message: string
}

export function ContactEmail({ senderName, senderEmail, subject, message }: ContactEmailProps) {
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
					Contact form
				</p>
				<h1
					style={{
						margin: '0 0 20px',
						fontSize: '24px',
						lineHeight: 1.1,
						letterSpacing: '-0.02em',
						fontWeight: 700,
					}}
				>
					{subject}
				</h1>

				<div
					style={{
						margin: '0 0 20px',
						padding: '16px',
						backgroundColor: '#f5f3ef',
						borderLeft: '3px solid #d4f701',
					}}
				>
					<p
						style={{
							margin: '0 0 4px',
							fontFamily: 'JetBrains Mono, ui-monospace, monospace',
							fontSize: '11px',
							letterSpacing: '0.08em',
							textTransform: 'uppercase',
							color: '#6b6762',
						}}
					>
						From
					</p>
					<p style={{ margin: '0', fontSize: '14px', fontWeight: 600 }}>{senderName}</p>
					<a
						href={`mailto:${senderEmail}`}
						style={{ color: '#0c0c0c', fontSize: '13px', textDecoration: 'none' }}
					>
						{senderEmail}
					</a>
				</div>

				<p
					style={{
						margin: '0 0 8px',
						fontFamily: 'JetBrains Mono, ui-monospace, monospace',
						fontSize: '11px',
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
						color: '#6b6762',
					}}
				>
					Message
				</p>
				<p
					style={{
						margin: '0',
						fontSize: '15px',
						lineHeight: 1.7,
						color: '#0c0c0c',
						whiteSpace: 'pre-wrap',
					}}
				>
					{message}
				</p>
			</div>
		</div>
	)
}
