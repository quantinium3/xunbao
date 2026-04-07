interface QuizProgressProps {
	current: number;
	total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
	const percentage = (current / total) * 100;

	return (
		<div className="w-full px-2 sm:px-0">
			<div className="flex justify-between text-[10px] sm:text-sm mb-1 sm:mb-2">
				<span>
					Question {current} of {total}
				</span>
				<span>{Math.round(percentage)}%</span>
			</div>
			<div className="bg-[#6e5516] bg-linear-to-b from-[#6e5516] via-[#ffbc12] via-50% to-[#ffbc12] h-1 rounded-t-xl">
			</div>
			<div className="w-full bg-zinc-300 h-1.5 sm:h-2 border-yellow-400 border-x-3">
				<div
					className="bg-linear-to-br from-[#1a1a1a] via-45% via-[#2b2b2b] to-[#808080] h-1.5 sm:h-2 transition-all duration-300 "
					style={{ width: `${percentage}%` }}
				/>
			</div>
			<div className="bg-[#6e5516] bg-linear-to-t from-[#6e5516] via-[#ffbc12] via-50% to-[#ffbc12] h-1 rounded-b-xl">
			</div>
		</div>
	);
}
