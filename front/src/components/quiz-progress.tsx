interface QuizProgressProps {
	current: number;
	total: number;
}

export function QuizProgress({ current, total }: QuizProgressProps) {
	const percentage = (current / total) * 100;

	return (
		<div className="w-full">
			<div className="flex justify-between text-sm mb-2">
				<span>
					Question {current} of {total}
				</span>
				<span>{Math.round(percentage)}%</span>
			</div>
			<div className="w-full bg-zinc-300 rounded-full h-2">
				<div
					className="bg-orange-500 h-2 rounded-full transition-all duration-300"
					style={{ width: `${percentage}%` }}
				/>
			</div>
		</div>
	);
}
