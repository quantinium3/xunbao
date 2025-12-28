import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'

export const Route = createFileRoute('/play')({
	component: RouteComponent,
})

function RouteComponent() {
	const session = authClient.useSession();
	return (
		<div className="text-white">Hello {session.data?.user.name}!</div>
	);
}
