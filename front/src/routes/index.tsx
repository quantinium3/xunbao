import { createFileRoute } from '@tanstack/react-router'
import { useNavigate } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	const nav = useNavigate();
	return (
		<div className="flex justify-center items-center h-screen flex-col font-press-start-2p space-y-5">
			<h1 className="bg-gradient-to-r from-orange-500 via-white to-blue-500 bg-clip-text text-transparent text-5xl font-press-start-2p text-center">Welcome to Xunbao</h1>
			<button className="btn" onClick={() => nav({ to: "/play" })}>Play</button>
		</div>
	)
}

export default Index
