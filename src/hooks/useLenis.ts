import Lenis from 'lenis'
import { createContext, useContext, useEffect, useState } from 'react'

export const LenisContext = createContext<Lenis | null>(null)

export function useLenisInstance() {
	return useContext(LenisContext)
}

export function useLenisSetup(): Lenis | null {
	const [lenis, setLenis] = useState<Lenis | null>(null)

	useEffect(() => {
		const instance = new Lenis({
			duration: 1.2,
			easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
			smoothWheel: true,
		})

		setLenis(instance)

		function raf(time: number) {
			instance.raf(time)
			requestAnimationFrame(raf)
		}

		const rafId = requestAnimationFrame(raf)

		return () => {
			cancelAnimationFrame(rafId)
			instance.destroy()
			setLenis(null)
		}
	}, [])

	return lenis
}
