import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { quizApi } from "../lib/api-client";
import Navbar from "../components/navbar";

export const Route = createFileRoute("/leaderboard")({
	component: RouteComponent,
});

function RouteComponent() {
	const {
		data: leaderboard,
		isLoading,
		error,
	} = useQuery({
		queryKey: ["leaderboard"],
		queryFn: () => quizApi.getLeaderboard(),
		refetchInterval: 5000,
		staleTime: 0,
	});

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4">Loading leaderboard...</div>
					<div className="animate-pulse">Please wait</div>
				</div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-center">
					<div className="text-2xl mb-4 text-red-500">Error loading leaderboard</div>
					<div className="text-gray-200">
						{error instanceof Error ? error.message : "Unknown error"}
					</div>
				</div>
			</div>
		);
	}

	if (!leaderboard) {
		return (
			<div className="min-h-screen flex items-center justify-center text-white">
				<div className="text-2xl">No data available</div>
			</div>
		);
	}

	return (
		<div className="text-white font-press-start-2p min-h-screen flex flex-col">
			<Navbar />

			<div className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
				<div className="text-center mb-4 sm:mb-8">
					<h2 className="text-lg sm:text-2xl md:text-4xl mb-2">LEADERBOARD</h2>
					<p className="text-[8px] sm:text-xs text-gray-200">
						{leaderboard.total_participants} Total Participants
					</p>
				</div>

				{leaderboard.user_rank && (
					<div className="mb-4 sm:mb-8 rounded-lg p-2 sm:p-4">
						<div className="text-center">
							<div className="text-[8px] sm:text-xs text-gray-200 mb-2">YOUR RANK</div>
							<div className="flex justify-between items-center flex-col">
								<div>
									<span className={`text-xl sm:text-2xl ${leaderboard.user_rank.rank === 1
										? "text-yellow-500"
										: leaderboard.user_rank.rank === 2
											? "bg-gray-600"
											: leaderboard.user_rank.rank === 3
												? "bg-amber-800"
												: ""
										}`}
									>
										#{leaderboard.user_rank.rank}
									</span>
								</div>
								<div className="text-right">
									<div className="text-xs sm:text-sm text-yellow-400">
										{leaderboard.user_rank.score} points
									</div>
									<div className="text-[8px] sm:text-xs text-gray-200">
										{(leaderboard.user_rank.time_ms / 1000).toFixed(1)}s total
									</div>
								</div>
							</div>
						</div>
					</div>
				)}

				<div className="overflow-hidden">
					<div className="rounded-t-lg border-2 p-2 sm:p-4 grid grid-cols-12 gap-1 sm:gap-4 text-[8px] sm:text-xs border-white">
						<div className="col-span-2 text-center">RANK</div>
						<div className="col-span-4 sm:col-span-5">PLAYER</div>
						<div className="col-span-3 text-right">SCORE</div>
						<div className="col-span-3 sm:col-span-2 text-right">TIME</div>
					</div>

					{leaderboard.top_entries.length === 0 ? (
						<div className="p-4 sm:p-8 text-center text-gray-500 text-[8px] sm:text-sm">
							No participants yet. Be the first!
						</div>
					) : (
						<div className="divide-y divide-gray-700 border-b border-x-2">
							{leaderboard.top_entries.map((entry) => (
								<div
									key={entry.user_id}
									className={`p-2 sm:p-4 grid grid-cols-12 gap-1 sm:gap-4 items-center bg-gray-700/50 transition ${entry.rank === 1
										? "bg-yellow-700/20"
										: entry.rank === 2
											? "bg-gray-600/20"
											: entry.rank === 3
												? "bg-orange-800/20"
												: ""
										}`}
								>
									<div className="col-span-2 text-center">
										<span
											className={`text-base sm:text-2xl ${entry.rank === 1
												? "text-yellow-400"
												: entry.rank === 2
													? "text-gray-300"
													: entry.rank === 3
														? "text-orange-400"
														: "text-gray-500"
												}`}
										>
											{entry.rank === 1
												? "🥇"
												: entry.rank === 2
													? "🥈"
													: entry.rank === 3
														? "🥉"
														: `#${entry.rank}`}
										</span>
									</div>

									<div className="col-span-4 sm:col-span-5 truncate text-[8px] sm:text-sm">
										{entry.user_name}
									</div>

									<div className="col-span-3 text-right">
										<span className="text-yellow-400 text-[8px] sm:text-sm">
											{entry.score}
										</span>
										<span className="text-[6px] sm:text-xs text-gray-200 ml-0.5 sm:ml-1">pts</span>
									</div>

									<div className="col-span-3 sm:col-span-2 text-right text-[8px] sm:text-xs text-gray-200">
										{(entry.time_ms / 1000).toFixed(1)}s
									</div>
								</div>
							))}
						</div>
					)}
				</div>
			</div>
		</div >
	);
}
