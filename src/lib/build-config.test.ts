// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'
import config from '../../vite.config.ts'

describe('build warning handling', () => {
	it('filters dependency-only SSR notices and forwards actionable warnings', async () => {
		if (typeof config !== 'function') throw new Error('Expected the Vite config factory')
		const resolved = await config({ command: 'build', mode: 'production' })
		const onwarn = resolved.build?.rollupOptions?.onwarn
		if (!onwarn) throw new Error('Expected the build warning handler')
		const warn = vi.fn()
		onwarn(
			{
				code: 'MODULE_LEVEL_DIRECTIVE',
				message: '"use client" ignored',
				id: '/node_modules/example/index.js',
			},
			warn,
		)
		onwarn(
			{ code: 'UNUSED_EXTERNAL_IMPORT', message: 'Unused in node_modules/example/index.js' },
			warn,
		)
		expect(warn).not.toHaveBeenCalled()
		for (const warning of [
			{ code: 'MODULE_LEVEL_DIRECTIVE', message: '"use client" ignored', id: '/src/example.ts' },
			{ code: 'UNUSED_EXTERNAL_IMPORT', message: 'Unused in src/example.ts' },
			{ code: 'CIRCULAR_DEPENDENCY', message: 'Unexpected cycle' },
			{
				code: 'UNRESOLVED_IMPORT',
				message: 'Missing dependency',
				id: '/node_modules/example/index.js',
			},
		]) {
			onwarn(warning, warn)
			expect(warn).toHaveBeenLastCalledWith(warning)
		}
	})
})
