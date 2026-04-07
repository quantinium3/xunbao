import { useState } from "react";

interface QuestionDisplayProps {
	question: string;
	options: string[];
	difficulty: string;
	onAnswer: (selectedIndex: number) => void;
	disabled?: boolean;
}

export function QuestionDisplay({
	question,
	options,
	difficulty,
	onAnswer,
	disabled = false,
}: QuestionDisplayProps) {
	const [selectedOption, setSelectedOption] = useState<number | null>(null);

	const handleOptionClick = (index: number) => {
		if (disabled || selectedOption !== null) return;

		setSelectedOption(index);
		onAnswer(index);
	};

	const getDifficultyColor = (diff: string) => {
		switch (diff) {
			case "easy":
				return "bg-green-500";
			case "medium":
				return "bg-yellow-500";
			case "hard":
				return "bg-red-500";
			default:
				return "bg-gray-500";
		}
	};

	return (
		<div className="max-w-md sm:max-w-2xl w-full px-2 sm:px-0">
			<div className="flex justify-end mb-4">
				<span
					className={`px-2 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-bold uppercase text-black ${getDifficultyColor(difficulty)}`}
				>
					{difficulty}
				</span>
			</div>

			<div className="p-4 sm:p-6 mb-4 sm:mb-6 border-2 border-gray-200 rounded-md backdrop-blur-xl ">
				<h2 className="text-sm sm:text-xl leading-relaxed text-yellow-50 font-semibold">{question}</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
				{options.map((option, index) => (
					<button
						key={index}
						onClick={() => handleOptionClick(index)}
						disabled={disabled || selectedOption !== null}
						className={`
							p-3 sm:p-4 rounded-lg border-2 text-left transition-all text-xs sm:text-sm backdrop-blur-sm
							${selectedOption === index
								? "border-orange-500 bg-orange-500/20"
								: "border-gray-400 hover:border-gray-100"
							}
							${disabled || selectedOption !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
						`}
					>
						<div className="flex items-center gap-2 sm:gap-3">
							<span className="text-base sm:text-lg font-semibold text-gray-200">
								{String.fromCharCode(65 + index)}
							</span>
							<span className="flex-1 font-semibold">{option}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
