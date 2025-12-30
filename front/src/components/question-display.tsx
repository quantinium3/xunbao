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
		<div className="max-w-3xl w-full">
			<div className="flex justify-end mb-4">
				<span
					className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getDifficultyColor(difficulty)}`}
				>
					{difficulty}
				</span>
			</div>

			<div className="p-6 mb-6 border-2 border-gray-200">
				<h2 className="text-xl leading-relaxed">{question}</h2>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{options.map((option, index) => (
					<button
						key={index}
						onClick={() => handleOptionClick(index)}
						disabled={disabled || selectedOption !== null}
						className={`
							p-4 rounded-lg border-2 text-left transition-all
							${selectedOption === index
								? "border-orange-500 bg-orange-500/20"
								: "border-gray-400 hover:border-gray-100"
							}
							${disabled || selectedOption !== null ? "cursor-not-allowed opacity-50" : "cursor-pointer"}
						`}
					>
						<div className="flex items-center gap-3">
							<span className="text-lg font-bold text-gray-200">
								{String.fromCharCode(65 + index)}
							</span>
							<span className="flex-1">{option}</span>
						</div>
					</button>
				))}
			</div>
		</div>
	);
}
