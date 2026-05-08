type PasswordResetEmailProps = {
	resetUrl: string
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
		margin: '0 0 28px',
		fontSize: '15px',
		lineHeight: 1.7,
		color: '#8b8780',
	},
	button: {
		display: 'inline-block',
		padding: '12px 22px',
		backgroundColor: '#f08e34',
		color: '#1d1b1b',
		textDecoration: 'none',
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '12px',
		letterSpacing: '0.12em',
		textTransform: 'uppercase' as const,
		fontWeight: 700,
	},
	fallbackLabel: {
		margin: '28px 0 6px',
		fontFamily: 'JetBrains Mono, ui-monospace, monospace',
		fontSize: '10px',
		letterSpacing: '0.14em',
		textTransform: 'uppercase' as const,
		color: '#8b8780',
	},
	fallbackUrl: {
		margin: '0',
		fontSize: '12px',
		lineHeight: 1.6,
		color: '#8b8780',
		wordBreak: 'break-all' as const,
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

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
	return (
		<div style={STYLES.outer}>
			<div style={STYLES.card}>
				<div style={STYLES.cardBody}>
					<p style={STYLES.eyebrow}>Password reset</p>
					<h1 style={STYLES.heading}>Reset your password</h1>
					<p style={STYLES.body}>
						Use the button below to choose a new password. This link expires in 1 hour. If you did
						not request this, you can safely ignore this email.
					</p>
					<a href={resetUrl} style={STYLES.button}>
						Reset password
					</a>
					<p style={STYLES.fallbackLabel}>Or paste this link in your browser</p>
					<p style={STYLES.fallbackUrl}>{resetUrl}</p>
				</div>

				<div style={STYLES.footer}>
					<p style={STYLES.footerText}>shunger.dev</p>
				</div>
			</div>
		</div>
	)
}
