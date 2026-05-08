type ContactEmailProps = {
	senderName: string
	senderEmail: string
	subject: string
	message: string
}

const STYLES = {
	outer: {
		backgroundColor: '#0c0c0c',
		padding: '40px 16px',
		fontFamily: 'Manrope, ui-sans-serif, system-ui, sans-serif',
	},
	card: {
		maxWidth: '560px',
		margin: '0 auto',
		backgroundColor: '#161616',
		border: '1px solid rgba(240, 237, 232, 0.08)',
		borderTop: '2px solid #f08e34',
	},
	cardBody: {
		padding: '32px',
	},
	eyebrow: {
		margin: '0 0 14px',
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '11px',
		letterSpacing: '0.18em',
		textTransform: 'uppercase' as const,
		color: '#f08e34',
	},
	heading: {
		margin: '0 0 24px',
		fontFamily: 'Space Grotesk, ui-sans-serif, sans-serif',
		fontSize: '26px',
		lineHeight: 1.1,
		letterSpacing: '-0.02em',
		fontWeight: 700,
		color: '#f0ede8',
	},
	senderBlock: {
		margin: '0 0 24px',
		padding: '16px',
		backgroundColor: '#1c1c1c',
		borderLeft: '3px solid #f08e34',
	},
	senderLabel: {
		margin: '0 0 6px',
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '10px',
		letterSpacing: '0.14em',
		textTransform: 'uppercase' as const,
		color: '#8b8780',
	},
	senderName: {
		margin: '0 0 2px',
		fontSize: '14px',
		fontWeight: 600,
		color: '#f0ede8',
	},
	senderEmail: {
		fontSize: '13px',
		color: '#f08e34',
		textDecoration: 'none',
	},
	messageLabel: {
		margin: '0 0 10px',
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '10px',
		letterSpacing: '0.14em',
		textTransform: 'uppercase' as const,
		color: '#8b8780',
	},
	messageText: {
		margin: '0',
		fontSize: '15px',
		lineHeight: 1.75,
		color: '#f0ede8',
		whiteSpace: 'pre-wrap' as const,
	},
	footer: {
		padding: '16px 32px',
		borderTop: '1px solid rgba(240, 237, 232, 0.08)',
	},
	footerText: {
		margin: 0,
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '11px',
		color: '#8b8780',
	},
} as const

export function ContactEmail({ senderName, senderEmail, subject, message }: ContactEmailProps) {
	return (
		<div style={STYLES.outer}>
			<div style={STYLES.card}>
				<div style={STYLES.cardBody}>
					<p style={STYLES.eyebrow}>Contact form</p>
					<h1 style={STYLES.heading}>{subject}</h1>

					<div style={STYLES.senderBlock}>
						<p style={STYLES.senderLabel}>From</p>
						<p style={STYLES.senderName}>{senderName}</p>
						<a href={`mailto:${senderEmail}`} style={STYLES.senderEmail}>
							{senderEmail}
						</a>
					</div>

					<p style={STYLES.messageLabel}>Message</p>
					<p style={STYLES.messageText}>{message}</p>
				</div>

				<div style={STYLES.footer}>
					<p style={STYLES.footerText}>shunger.dev</p>
				</div>
			</div>
		</div>
	)
}
