import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
	component: Index,
})

function Index() {
	return (
		<h3 className="text-red-600 text-4xl font-bold">Welcome Home!</h3>
	)
}

export default Index
