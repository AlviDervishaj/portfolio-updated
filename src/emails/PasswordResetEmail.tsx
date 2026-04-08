type PasswordResetEmailProps = {
	resetUrl: string
}

export default function PasswordResetEmail({ resetUrl }: PasswordResetEmailProps) {
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
					Password reset
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
					Reset your password
				</h1>
				<p style={{ margin: '0 0 20px', fontSize: '15px', lineHeight: 1.6, color: '#6b6762' }}>
					Use the button below to choose a new password. If you did not request this, you can safely
					ignore this email.
				</p>
				<a
					href={resetUrl}
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
					Reset password
				</a>
				<p
					style={{
						margin: '24px 0 8px',
						fontFamily: 'JetBrains Mono, ui-monospace, monospace',
						fontSize: '11px',
						letterSpacing: '0.08em',
						textTransform: 'uppercase',
						color: '#6b6762',
					}}
				>
					Or paste this link in your browser
				</p>
				<p style={{ margin: '0', fontSize: '13px', lineHeight: 1.6, wordBreak: 'break-all' }}>
					{resetUrl}
				</p>
			</div>
		</div>
	)
}
