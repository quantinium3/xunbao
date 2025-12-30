import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery, useMutation } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { quizApi, type SubmitAnswerResponse } from "../lib/api-client";
import { QuizProgress } from "../components/quiz-progress";
import Navbar from "../components/navbar";
import { QuizStats } from "../components/quiz-stats";
import { Timer } from "../components/timer";
import { QuestionDisplay } from "../components/question-display";
import { useState } from "react";
import toast from "react-hot-toast";

export const Route = createFileRoute("/quiz/$sessionId")({
	beforeLoad: async () => {
		const session = await authClient.getSession();
		if (!session.data?.user) {
			throw redirect({ to: "/sign-in" });
		}
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { sessionId } = Route.useParams();
	const navigate = useNavigate();
	const [answerFeedback, setAnswerFeedback] = useState<SubmitAnswerResponse | null>(null);
	const [isShowingFeedback, setIsShowingFeedback] = useState(false);
	const [timerStoppedAt, setTimerStoppedAt] = useState<number | null>(null);

	const {
		data: quizState,
		isLoading,
		error,
		refetch,
	} = useQuery({
		queryKey: ["quiz", sessionId, "current"],
		queryFn: () => quizApi.getCurrentQuestion(sessionId),
		refetchInterval: isShowingFeedback ? false : 1000,
		staleTime: 0,
		retry: 1,
	});

	const submitAnswerMutation = useMutation({
		mutationFn: (selectedIndex: number) =>
			quizApi.submitAnswer(sessionId, { selected_answer_idx: selectedIndex }),
		onSuccess: (data) => {
			setAnswerFeedback(data);
			setIsShowingFeedback(true);

			setTimeout(() => {
				if (data.quiz_completed) {
					navigate({ to: "/results/$sessionId", params: { sessionId } });
				} else {
					setIsShowingFeedback(false);
					setAnswerFeedback(null);
					setTimerStoppedAt(null);
					refetch();
				}
			}, 3000);
		},
		onError: (error) => {
			console.error("Failed to submit answer:", error);
			toast.error("Failed to submit answer. Please try again.");
			setTimerStoppedAt(null);
		},
	});

	const handleAnswer = (selectedIndex: number) => {
		if (isShowingFeedback || submitAnswerMutation.isPending) {
			return;
		}
		setTimerStoppedAt(Date.now());
		submitAnswerMutation.mutate(selectedIndex);
	};

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4">Loading quiz...</div>
					<div className="animate-pulse">Please wait</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4 text-red-500">Error loading quiz</div>
					<div className="text-gray-400 mb-4">
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
					<button
						onClick={() => refetch()}
						className="px-6 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	if (!quizState) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-2xl">Quiz not found</div>
			</div>
		);
	}

	return (
		<div className="text-white font-press-start-2p min-h-screen flex flex-col">
			<Navbar />

			<div className="flex-1 container mx-auto px-4 py-8">
				<div className="mb-8">
					<QuizProgress
						current={quizState.question_index + 1}
						total={quizState.total_questions}
					/>
				</div>

				<div className="flex justify-center gap-8 mb-8">
					<QuizStats
						streak={quizState.current_streak}
						score={quizState.total_score}
					/>
					<Timer shownAt={quizState.question.shown_at} stoppedAt={timerStoppedAt} />
				</div>

				<div className="flex justify-center">
					<QuestionDisplay
						key={quizState.question_index}
						question={quizState.question.text}
						options={quizState.question.options}
						difficulty={quizState.question.difficulty}
						onAnswer={handleAnswer}
						disabled={isShowingFeedback || submitAnswerMutation.isPending}
					/>
				</div>

				{isShowingFeedback && answerFeedback && (
					<div className="mt-8 flex justify-center">
						<div
							className={`p-6 rounded-lg border-2 max-w-2xl w-full ${answerFeedback.is_correct
								? "bg-green-900/20 border-green-500"
								: "bg-red-900/20 border-red-500"
								}`}
						>
							<div className="text-center mb-4">
								<h2
									className={`text-2xl mb-2 ${answerFeedback.is_correct
										? "text-green-400"
										: "text-red-400"
										}`}
								>
									{answerFeedback.is_correct ? "CORRECT!" : "WRONG!"}
								</h2>
								{!answerFeedback.is_correct && (
									<p className="text-sm text-gray-300">
										Correct answer:{" "}
										{quizState.question.options[answerFeedback.correct_answer_idx]}
									</p>
								)}
							</div>

							{answerFeedback.is_correct && (
								<div className="space-y-2 text-sm">
									<div className="flex justify-between">
										<span className="text-gray-300">Base Score:</span>
										<span className="text-yellow-400">
											+{answerFeedback.breakdown.base_score}
										</span>
									</div>
									{answerFeedback.breakdown.time_bonus > 0 && (
										<div className="flex justify-between">
											<span className="text-gray-300">Time Bonus:</span>
											<span className="text-yellow-400">
												+{answerFeedback.breakdown.time_bonus}
											</span>
										</div>
									)}
									{answerFeedback.breakdown.streak_bonus > 0 && (
										<div className="flex justify-between">
											<span className="text-gray-300">Streak Bonus:</span>
											<span className="text-yellow-400">
												+{answerFeedback.breakdown.streak_bonus}
											</span>
										</div>
									)}
									<div className="border-t border-gray-600 pt-2 flex justify-between font-bold">
										<span className="text-white">Total Score:</span>
										<span className="text-yellow-300">
											+{answerFeedback.score_earned}
										</span>
									</div>
								</div>
							)}

							<div className="mt-4 text-center text-xs text-gray-200">
								{answerFeedback.quiz_completed
									? "Quiz completed! Redirecting..."
									: "Next question in 3 seconds..."}
							</div>
						</div>
					</div>
				)}

				{(quizState.answered_questions.length > 0 || isShowingFeedback) && (
					<div className="mt-8 text-center text-sm text-gray-200">
						<div>
							Answered: {quizState.answered_questions.length + (isShowingFeedback ? 1 : 0)} |
							Correct:{" "}
							{
								quizState.answered_questions.filter((a) => a.is_correct).length +
								(isShowingFeedback && answerFeedback?.is_correct ? 1 : 0)
							}
						</div>
					</div>
				)}
			</div>
		</div>
	);
}
