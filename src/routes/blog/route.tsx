import { createFileRoute, Outlet } from '@tanstack/react-router'

export const Route = createFileRoute('/blog')({
	component: BlogLayout,
})

function BlogLayout(): React.ReactElement {
	return <Outlet />
}
