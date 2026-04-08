import { useEffect, useState } from 'react'

export default function ScrollProgress() {
	const [progress, setProgress] = useState(0)

	useEffect(() => {
		function updateProgress() {
			const scrollTop = window.scrollY
			const docHeight = document.documentElement.scrollHeight - window.innerHeight
			const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
			setProgress(Math.min(100, Math.max(0, pct)))
		}

		window.addEventListener('scroll', updateProgress, { passive: true })
		updateProgress()

		return () => window.removeEventListener('scroll', updateProgress)
	}, [])

	if (progress === 0) return null

	return (
		<div
			aria-hidden="true"
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				width: `${progress}%`,
				height: '2px',
				backgroundColor: 'var(--acid)',
				zIndex: 100,
				transition: 'width 80ms linear',
				transformOrigin: 'left',
				boxShadow: '0 0 8px var(--acid)',
			}}
		/>
	)
}
