type NewsletterWelcomeEmailProps = {
	unsubscribeUrl: string
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
		margin: '0 0 12px',
		fontFamily: 'Space Grotesk, ui-sans-serif, sans-serif',
		fontSize: '30px',
		lineHeight: 1.1,
		letterSpacing: '-0.02em',
		fontWeight: 700,
		color: '#f0ede8',
	},
	body: {
		margin: '0 0 24px',
		fontSize: '15px',
		lineHeight: 1.7,
		color: '#8b8780',
	},
	divider: {
		margin: '0 0 24px',
		border: 'none',
		borderTop: '1px solid rgba(240, 237, 232, 0.08)',
	},
	unsubscribeLink: {
		fontSize: '12px',
		color: '#8b8780',
		textDecoration: 'underline',
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

export function NewsletterWelcomeEmail({ unsubscribeUrl }: NewsletterWelcomeEmailProps) {
	return (
		<div style={STYLES.outer}>
			<div style={STYLES.card}>
				<div style={STYLES.cardBody}>
					<p style={STYLES.eyebrow}>Newsletter</p>
					<h1 style={STYLES.heading}>You're in.</h1>
					<p style={STYLES.body}>
						Welcome — you'll be the first to know when I publish new posts. Expect writing on
						TypeScript, full-stack development, and building for the web.
					</p>
					<hr style={STYLES.divider} />
					<a href={unsubscribeUrl} style={STYLES.unsubscribeLink}>
						Unsubscribe at any time
					</a>
				</div>

				<div style={STYLES.footer}>
					<p style={STYLES.footerText}>shunger.dev</p>
				</div>
			</div>
		</div>
	)
}
