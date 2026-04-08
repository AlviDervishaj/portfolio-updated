import tailwindcss from '@tailwindcss/vite'
import { devtools } from '@tanstack/devtools-vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { defineConfig, loadEnv, type Plugin } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const SERVER_ONLY_PACKAGES = [
	'pg',
	'pg-native',
	'pg-protocol',
	'pg-connection-string',
	'@node-postgres/error-codes',
]

const SERVER_ONLY_SOURCE_PATTERNS = [
	/\/src\/db\//,
	/\/src\/services\//,
	/\/src\/lib\/auth\.ts/,
	/\/src\/lib\/mdx\.ts/,
	/\/src\/lib\/redis\.ts/,
	/\/src\/lib\/storage\.ts/,
	/\/src\/lib\/email\.ts/,
	/\/src\/lib\/rateLimit\.ts/,
	/\/src\/lib\/responseFactory\.ts/,
]

const STUB_MODULE = 'export default new Proxy({}, { get: () => () => {} })'
const stubServerPackagesPlugin: Plugin = {
	name: 'stub-server-only-packages',
	enforce: 'pre',
	resolveId(id, _importer, options) {
		if (
			!options?.ssr &&
			SERVER_ONLY_PACKAGES.some((pkg) => id === pkg || id.startsWith(`${pkg}/`))
		) {
			return '\0virtual:server-only-stub'
		}
	},
	load(id) {
		if (id === '\0virtual:server-only-stub') {
			return STUB_MODULE
		}
	},
	transform(_code, id, options) {
		if (!options?.ssr && SERVER_ONLY_SOURCE_PATTERNS.some((p) => p.test(id))) {
			return { code: STUB_MODULE, map: null }
		}
	},
}

const config = defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '')
	const rawPort = Number.parseInt(env.PORT || env.VITE_APP_PORT || '', 10)
	const devServerPort = Number.isInteger(rawPort) && rawPort > 0 ? rawPort : undefined

	return {
		server: devServerPort ? { port: devServerPort } : undefined,
		plugins: [
			stubServerPackagesPlugin,
			mode !== 'production' && devtools(),
			tsconfigPaths({ projects: ['./tsconfig.json'] }),
			tailwindcss(),
			tanstackStart(),
			viteReact({
				babel: {
					plugins: ['babel-plugin-react-compiler'],
				},
			}),
		],
		ssr: {
			external: [
				'pg',
				'pg-native',
				'drizzle-orm',
				'@node-postgres/error-codes',
				'pg-protocol',
				'pg-connection-string',
			],
		},
		optimizeDeps: {
			exclude: ['pg', 'pg-native'],
		},
	}
})

export default config
