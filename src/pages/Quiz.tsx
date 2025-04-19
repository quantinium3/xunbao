import { SignedIn, SignedOut, SignInButton, useUser } from "@clerk/clerk-react"
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

const Quiz = () => {
    const [questions, setQuestions] = useState<any[]>([]);
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [currentQuestion, setCurrentQuestion] = useState<any>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [timeLeft, setTimeLeft] = useState<number>(30);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [isCorrect, setIsCorrect] = useState<boolean>(false);
    const [leaderboardData, setLeaderboardData] = useState<any[]>([]);
    const [leaderboardError, setLeaderboardError] = useState<any>(null);
    const [isLeaderboardLoading, setIsLeaderboardLoading] = useState<boolean>(false);

    const { user, isLoaded } = useUser();
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoaded) return;
        if (!user) {
            navigate('/sign-in');
        }
    }, [user, isLoaded]);

    const selectOption = (option: string) => {
        if (!isSubmitted) {
            setSelectedOption(option);
        }
    };

    const fetchUserQuestions = async (): Promise<any[]> => {
        try {
            const resQues = await fetch('https://xunbao.manantechnosurge.tech/api/question');
            const data = await resQues.json();
            const questions = data.data.questions;

            const userRes = await fetch(`https://xunbao.manantechnosurge.tech/api/user/${user.id}`);
            const userData = await userRes.json();
            const answeredQuestionIds = userData.data.questions || [];

            // Filter out questions that have been answered
            const unansweredQuestions = questions.filter((q: any) => 
                !answeredQuestionIds.includes(q.questionId)
            );
            
            // Sort questions by questionId
            unansweredQuestions.sort((a: any, b: any) => {
                // Extract numeric part from questionId (assuming format like Q001, Q002)
                const numA = parseInt(a.questionId.replace(/\D/g, ''));
                const numB = parseInt(b.questionId.replace(/\D/g, ''));
                return numA - numB;
            });

            return unansweredQuestions;
        } catch (error) {
            console.error('Error fetching questions:', error);
            return [];
        }
    };

    useEffect(() => {
        const loadQuestions = async () => {
            setIsLoading(true);
            const userQuestions = await fetchUserQuestions();
            setQuestions(userQuestions);
            setIsLoading(false);
        };
        
        if (isLoaded && user) {
            loadQuestions();
        }
    }, [user, isLoaded]);

    useEffect(() => {
        if (questions.length > 0) {
            setCurrentQuestion(questions[0]);
            // Reset timer when a new question is loaded
            setTimeLeft(30);
        }
    }, [questions]);

    const submitAnswer = async () => {
        if (!currentQuestion || !selectedOption || isSubmitted) return;
        setIsSubmitted(true);

        try {
            const res = await fetch(`https://xunbao.manantechnosurge.tech/api/submit/${user.id}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: currentQuestion.questionId,
                    userAnswer: selectedOption,
                    timeLeft: timeLeft,
                })
            });

            if (!res.ok) throw new Error("Failed to submit answer");
            const data = await res.json();

            setIsCorrect(data.correct);
            setShowModal(true);

            setTimeout(() => {
                setShowModal(false);
                setSelectedOption(null);
                setIsSubmitted(false);
                setIsCorrect(false);
                // Use functional update to ensure we're working with the latest state
                setQuestions(prevQuestions => prevQuestions.slice(1));
            }, 10000);
        } catch (err) {
            console.error("Error submitting answer:", err);
        }
    };

    useEffect(() => {
        let timer: NodeJS.Timeout;
        
        if (!showModal && currentQuestion && !isSubmitted) {
            timer = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setShowModal(true);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        
        return () => {
            if (timer) clearInterval(timer);
        };
    }, [showModal, currentQuestion, isSubmitted]);

    useEffect(() => {
        if (showModal) {
            setIsLeaderboardLoading(true);
            fetch('https://xunbao.manantechnosurge.tech/api/leaderboard')
                .then(res => res.json())
                .then(data => setLeaderboardData(data.data))
                .catch(err => setLeaderboardError(err))
                .finally(() => setIsLeaderboardLoading(false));
        }
    }, [showModal]);

    // Handle automatic navigation when all questions are answered
    useEffect(() => {
        if (showModal && questions.length === 0) {
            const redirectTimer = setTimeout(() => {
                navigate('/leaderboard');
            }, 10000);
            
            return () => clearTimeout(redirectTimer);
        }
    }, [showModal, questions, navigate]);

    return (
        <div className="relative z-10 min-h-screen flex justify-center items-center px-6">
            <div className="relative w-full max-w-3xl">
                <img className="absolute top-[-50px] right-[50px] w-30" src="/question_saturn.png" alt="Saturn" />
                <div className="absolute top-0 left-6 translate-y-[-50%] bg-black text-white text-xl px-3 py-1 rounded-bl-xl">
                    Question
                </div>
                <SignedOut>
                    <div className="flex flex-col border rounded-xl p-6 pt-12 w-full gap-7 text-white text-center">
                        <p>Please sign in to play the quiz.</p>
                        <SignInButton mode="modal">
                            <button className="border py-2 px-3 rounded-sm bg-blue-500 text-white shadow-[3px_4px_0_white]">Sign In</button>
                        </SignInButton>
                    </div>
                </SignedOut>
                <SignedIn>
                    <div className="flex flex-col border rounded-xl p-6 pt-12 w-full gap-7">
                        {isLoading ? (
                            <div className="text-white text-2xl">Loading questions...</div>
                        ) : currentQuestion ? (
                            <>
                                <div className="text-white text-2xl">{currentQuestion.question}</div>
                                <div className="text-white">Time left: {timeLeft}s</div>
                                <div className="my-3 h-5 w-full" style={{ background: `repeating-linear-gradient(90deg, white 0 3px, transparent 0 7px)`, backgroundSize: '100% 2px', backgroundRepeat: 'no-repeat' }}></div>
                                {isCorrect && !showModal && <div className="text-green-500 text-center font-bold">Correct answer! Waiting for timer to finish...</div>}
                                <div className="text-white flex flex-col gap-4">
                                    {currentQuestion.options.map((opt: string) => (
                                        <button
                                            key={opt}
                                            onClick={() => selectOption(opt)}
                                            className={`border py-2 px-3 rounded-sm shadow-[3px_4px_0_white] ${selectedOption === opt ? 'bg-blue-500' : ''} ${isCorrect || showModal || isSubmitted ? 'cursor-not-allowed' : ''}`}
                                            disabled={isCorrect || showModal || isSubmitted}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                    <button
                                        onClick={submitAnswer}
                                        className={`border py-2 px-3 rounded-sm shadow-[3px_4px_0_white] ${!selectedOption || isSubmitted ? 'bg-gray-500 cursor-not-allowed' : 'bg-green-500'}`}
                                        disabled={!selectedOption || isSubmitted}
                                    >
                                        Submit
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="text-white text-2xl">No questions available.</div>
                        )}
                    </div>
                </SignedIn>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-lg w-full max-h-[80vh] overflow-y-auto">
                        <h2 className="text-2xl font-bold mb-4">
                            {questions.length === 0 ? 'Quiz Complete!' : 'Time\'s Up!'}
                        </h2>
                        <p className="text-lg mb-4">
                            {questions.length === 0 ? 'You\'ve answered all questions.' : isCorrect ? 'Correct! Moving to the next question...' : 'Incorrect or time\'s up. Moving to the next question...'}
                        </p>
                        <h3 className="text-xl font-semibold mb-2">Leaderboard</h3>
                        {isLeaderboardLoading ? (
                            <p>Loading leaderboard...</p>
                        ) : leaderboardError ? (
                            <p className="text-red-500">Error loading leaderboard: {leaderboardError.message}</p>
                        ) : leaderboardData.length > 0 ? (
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-100">
                                        <th className="border p-2">Rank</th>
                                        <th className="border p-2">Username</th>
                                        <th className="border p-2">Score</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {leaderboardData.map((entry, index) => (
                                        <tr key={index} className="hover:bg-gray-50">
                                            <td className="border p-2">{index + 1}</td>
                                            <td className="border p-2">{entry.username}</td>
                                            <td className="border p-2">{entry.rank}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p>No leaderboard data available.</p>
                        )}
                        <p className="text-sm mt-4">
                            {questions.length === 0 ? 'Redirecting to leaderboard in 10 seconds...' : 'This modal will close in 10 seconds.'}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Quiz;
