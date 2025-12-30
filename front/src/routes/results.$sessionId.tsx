import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { authClient } from "../lib/auth-client";
import { quizApi } from "../lib/api-client";
import Navbar from "../components/navbar";

export const Route = createFileRoute("/results/$sessionId")({
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

	const {
		data: results,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["quiz", sessionId, "results"],
		queryFn: () => quizApi.getResults(sessionId),
		retry: 1,
	});

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4">Loading results...</div>
					<div className="animate-pulse">Please wait</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4 text-red-500">Error loading results</div>
					<div className="text-gray-400 mb-4">
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
					<button
						onClick={() => navigate({ to: "/play" })}
						className="px-6 py-3 rounded-lg transition"
					>
						Back to Home
					</button>
				</div>
			</div>
		);
	}

	if (!results) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-2xl">Results not found</div>
			</div>
		);
	}

	const accuracy = Math.round((results.correct_answers / results.questions_answered) * 100);
	const avgTimeSeconds = (results.average_time_per_question_ms / 1000).toFixed(1);

	return (
		<div className="text-white font-press-start-2p min-h-screen flex flex-col">
			<Navbar />

			<div className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
				<div className="text-center mb-8">
					<h2 className="text-4xl mb-4 text-yellow-400">QUIZ COMPLETE!</h2>
					<p className="text-sm">Here are your results</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
					<div className="rounded-lg p-6 border-2 border-yellow-500">
						<div className="text-xs text-gray-200 mb-2">TOTAL SCORE</div>
						<div className="text-3xl text-yellow-400">{results.total_score}</div>
					</div>

					<div className="rounded-lg p-6 border-2 border-blue-500">
						<div className="text-xs text-gray-200 mb-2">ACCURACY</div>
						<div className="text-3xl text-blue-400">{accuracy}%</div>
						<div className="text-xs text-gray-500 mt-1">
							{results.correct_answers}/{results.questions_answered}
						</div>
					</div>

					<div className="rounded-lg p-6 border-2 border-green-500">
						<div className="text-xs text-gray-200 mb-2">MAX STREAK</div>
						<div className="text-3xl text-green-400">{results.max_streak}</div>
					</div>

					<div className="rounded-lg p-6 border-2 border-purple-500">
						<div className="text-xs text-gray-200 mb-2">AVG TIME</div>
						<div className="text-3xl text-purple-400">{avgTimeSeconds}s</div>
					</div>
				</div>

				<div className="mb-8">
					<h3 className="text-xl mb-4">Answer Breakdown</h3>
					<div className="space-y-4">
						{results.answers.map((answer) => (
							<div
								key={answer.question_index}
								className={`p-4 rounded-lg border-2 ${answer.is_correct
									? "bg-green-900/20 border-green-500"
									: "bg-red-900/20 border-red-500"
									}`}
							>
								<div className="flex items-start justify-between mb-2">
									<div className="flex-1">
										<div className="text-xs text-gray-200 mb-2 underline">
											Question {answer.question_index + 1}
										</div>
										<div className="text-sm">{answer.question_text}</div>
									</div>
									<div
										className={`text-lg font-bold ${answer.is_correct ? "text-green-400" : "text-red-400"
											}`}
									>
										{answer.is_correct ? "✓" : "✗"}
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
									<div>
										<span className="text-gray-200">Your answer: </span>
										<span
											className={
												answer.is_correct ? "text-green-400" : "text-red-400"
											}
										>
											{answer.selected_option}
										</span>
									</div>
									{!answer.is_correct && (
										<div>
											<span className="text-gray-200">Correct answer: </span>
											<span className="text-green-400">
												{answer.correct_option}
											</span>
										</div>
									)}
									<div>
										<span className="text-gray-200">Time: </span>
										<span className="text-white">
											{(answer.time_taken_ms / 1000).toFixed(1)}s
										</span>
									</div>
									<div>
										<span className="text-gray-200">Score: </span>
										<span className="text-yellow-400">+{answer.score_earned}</span>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="flex justify-center gap-4">
					<button
						onClick={() => navigate({ to: "/leaderboard" })}
						className="px-8 py-4 rounded-lg transition text-sm border-white border-2 cursor-pointer"
					>
						View Leaderboard
					</button>
				</div>
			</div>
		</div>
	);
}
