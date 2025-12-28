import { useState } from 'react';

interface QuizQuestionProps {
	question: string;
	number: number;
	options: string[];
	correctAnswer: string;
	onAnswerSelected?: (isCorrect: boolean, selectedAnswer: string) => void;
}

export function QuizQuestion({ question, number, options, correctAnswer, onAnswerSelected }: QuizQuestionProps) {
	const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
	const [isAnswered, setIsAnswered] = useState(false);

	const handleAnswerClick = (option: string) => {
		if (isAnswered) return;

		setSelectedAnswer(option);
		setIsAnswered(true);

		const isCorrect = option === correctAnswer;

		if (onAnswerSelected) {
			onAnswerSelected(isCorrect, option);
		}
	};

	const getButtonStyle = (option: string) => {
		if (!isAnswered) {
			return "bg-white text-black border-2 border-black hover:bg-gray-200 transition-colors";
		}

		if (option === correctAnswer) {
			return "bg-green-500 text-white border-2 border-green-700";
		}

		if (option === selectedAnswer && option !== correctAnswer) {
			return "bg-red-500 text-white border-2 border-red-700";
		}

		return "bg-gray-300 text-gray-600 border-2 border-gray-400";
	};

	return (
		<div className="border-2 max-w-2xl mx-auto p-6">
			<div className="mb-6">
				<div className="flex justify-between items-center">
					<h2 className="text-xl font-bold text-center mb-2 underline">Question {number}</h2>
					<p>score: 0</p>
				</div>
				<p className="text-lg text-center my-3">{question}</p>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				{options.map((option, index) => (
					<button
						key={index}
						onClick={() => handleAnswerClick(option)}
						disabled={isAnswered}
						className={`
							p-4 rounded-lg font-semibold text-left
							transition-all duration-200
							disabled:cursor-not-allowed
							${getButtonStyle(option)}
						`}
					>
						<span className="font-bold mr-2">{String.fromCharCode(65 + index)}.</span>
						{option}
					</button>
				))}
			</div>
		</div>
	);
}

