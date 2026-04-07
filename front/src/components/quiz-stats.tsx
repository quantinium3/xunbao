interface QuizStatsProps {
	streak: number;
	score: number;
}

export function QuizStats({ streak, score }: QuizStatsProps) {
	return (
		<div className="flex gap-3 sm:gap-6 justify-center">
			<div className="text-center">
				<div className="text-[10px] sm:text-sm text-gray-200 mb-1">Streak</div>
				<div className={`text-xl sm:text-2xl font-bold ${streak > 0 ? "text-orange-500" : ""}`}>
					{streak}
				</div>
			</div>
			<div className="text-center">
				<div className="text-[10px] sm:text-sm text-gray-200 mb-1">Score</div>
				<div className="text-xl sm:text-2xl font-bold text-green-500">{score}</div>
			</div>
		</div>
	);
}
