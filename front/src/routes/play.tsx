import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { quizApi } from '../lib/api-client'
import toast from 'react-hot-toast'
import Navbar from '../components/navbar'
import { AxiosError } from 'axios'
import { useAuth } from '@clerk/react'

interface QuizConflictResponse {
	status: 'in_progress' | 'completed';
	existing_session_id: string;
}

export const Route = createFileRoute('/play')({
	component: RouteComponent,
})

function RouteComponent() {
	const navigate = useNavigate()
	const [isStarting, setIsStarting] = useState(false)
	const [isCheckingSession, setIsCheckingSession] = useState(true)
	const { isSignedIn, getToken } = useAuth()
	const nav = useNavigate();
	if (!isSignedIn) {
		nav({ to: "/sign-in" })
	}

	useEffect(() => {
		const checkRecentSession = async () => {
			try {
				const token = await getToken()
				const response = await quizApi.getRecentSession(token)
				if (response.session) {
					if (response.session.status === 'completed') {
						navigate({
							to: '/results/$sessionId',
							params: { sessionId: response.session.session_id },
						})
					} else if (response.session.status === 'in_progress') {
						navigate({
							to: '/quiz/$sessionId',
							params: { sessionId: response.session.session_id },
						})
					}
				}
			} catch (error) {
				console.error('Failed to check recent session:', error)
			} finally {
				setIsCheckingSession(false)
			}
		}

		checkRecentSession()
	}, [navigate])

	const handleStartQuiz = async () => {
		setIsStarting(true)
		try {
			const token = await getToken()
			const response = await quizApi.startQuiz(token)

			navigate({
				to: '/quiz/$sessionId',
				params: { sessionId: response.session_id },
			})
		} catch (error) {
			console.error('Failed to start quiz:', error)

			if (error instanceof AxiosError && error.response?.status === 409) {
				const data = error.response.data as QuizConflictResponse

				if (data.status === 'in_progress' && data.existing_session_id) {
					toast.error('Resuming your in-progress quiz...')
					navigate({
						to: '/quiz/$sessionId',
						params: { sessionId: data.existing_session_id },
					})
					return
				}

				if (data.status === 'completed' && data.existing_session_id) {
					toast.error('You have already completed the quiz!')
					navigate({
						to: '/results/$sessionId',
						params: { sessionId: data.existing_session_id },
					})
					return
				}
			}

			toast.error('Failed to start quiz. Please try again.')
			setIsStarting(false)
		}
	}

	if (isCheckingSession) {
		return (
			<div className="text-white min-h-screen flex items-center justify-center font-serif">
				<div className="text-center">
					<div className="text-2xl mb-4">Loading...</div>
					<div className="animate-pulse">Please wait</div>
				</div>
			</div>
		)
	}

	return (
		<div className="text-white min-h-screen flex flex-col font-serif">
			<Navbar />
			<div className="flex justify-center items-center flex-1 px-4">
				<div className="max-w-2xl w-full p-4 sm:p-8">
					<div className="flex justify-center">
						<button
							onClick={handleStartQuiz}
							disabled={isStarting}
							className="disabled:opacity-50 disabled:cursor-not-allowed border py-3 px-2 rounded-xl duration-300 font-bold text-3xl"
						>
							{isStarting ? "Starting..." : "Start Quiz"}
						</button>
					</div>

					<ul className="mt-6 text-xs sm:text-lg font-semibold text-gray-200 list-disc list-inside space-y-1 flex flex-col items-center justify-center text-center mx-auto">
						<li>Answer 15 random questions</li>
						<li>Build your streak for bonus points</li>
						<li>Faster answers = higher scores</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
