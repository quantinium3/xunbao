import { createFileRoute } from '@tanstack/react-router'
import { authClient } from '../lib/auth-client'
import UserProfileDropdown from '../components/user-profile-dropdown'
import { QuizQuestion } from '../components/question'

export const Route = createFileRoute('/play')({
	beforeLoad: async () => {
		const session = authClient.getSession();
		if (!session) {
			return { redirect: '/sign-in' };
		}
	},
	component: RouteComponent,
})

function RouteComponent() {
	const handleAnswer = (isCorrect: boolean, selectedAnswer: string) => {
		console.log('Answer selected:', selectedAnswer);
		console.log('Is correct:', isCorrect);
		// You can add logic here to track score, move to next question, etc.
	};
	return (
		<div className="text-white font-press-start-2p min-h-screen flex flex-col">
			<div className="flex justify-between items-center p-3">
				<h1 className="text-3xl">XUNBAO</h1>
				<UserProfileDropdown />
			</div>

			<div className="flex justify-center items-center flex-1">
				<QuizQuestion
					question="What is the capital of France?"
					number={1}
					options={["London", "Berlin", "Paris", "Madrid"]}
					correctAnswer="Paris"
					onAnswerSelected={handleAnswer}
				/>
			</div>
		</div>
	);
}
