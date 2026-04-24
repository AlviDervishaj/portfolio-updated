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
			style={{ width: `${progress}%` }}
			className="fixed top-0 left-0 z-[100] h-0.5 origin-left bg-acid shadow-[0_0_8px_var(--acid)] transition-[width] duration-[80ms] ease-linear"
		/>
	)
}
