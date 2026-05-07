import { createFileRoute, redirect } from '@tanstack/react-router'
import { SETTINGS_DEFAULT_SECTION_PATH } from '#/constants/auth.ts'

export const Route = createFileRoute('/settings/')({
	beforeLoad: () => {
		throw redirect({ to: SETTINGS_DEFAULT_SECTION_PATH })
	},
})
