import LeaderBoard from "@/components/LeaderBoard";
import XButton from "@/components/XButton";
import { useQuizSession } from "@/components/QuizSession";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import { useEffect } from "react";

const Quiz = () => {
    const { user } = useUser();
    const userId = user?.id;
    const navigate = useNavigate();
    const {
        session,
        currentIndex,
        timeLeft,
        answerQuestion,
        loading,
        error,
        leaderboard,
        showingLeaderboard,
        leaderboardTimeLeft,
        setError,
        userRank
    } = useQuizSession(userId);

    useEffect(() => {
        toast(error)
        setError("")
    }, [error, setError])

    const handleSignIn = () => {
        navigate('/signin')
    }

    if (!userId) {
        return (
            <div className="absolute w-full h-screen z-10 flex items-center justify-center px-4 text-white">
                <div className="relative border p-5 rounded-md w-3xl text-center backdrop-blur flex flex-col items-center">
                    <h2 className="font-bold text-2xl mb-3">Sign in to take the quiz</h2>
                    <XButton onClick={handleSignIn} className="text-white rounded-md border px-3 py-2 w-full text-lg sm:text-xl font-semibold transition-colors duration-300 shadow-[3px_4px_0_white] active:shadow-[1px_2px_0_white]">Sign In</XButton>
                </div>
            </div>
        )
    }
    if (loading) {
        return (
            <div className="absolute w-full h-screen z-10 flex items-center justify-center px-4 text-white">
                <div className="relative border p-5 rounded-md w-3xl text-center  backdrop-blur">
                    Loading Quiz. Please Wait
                </div>
            </div>
        )
    }

    if (!session || !session.questions || session.questions.length === 0) {
        return (
            <div className="absolute w-full h-screen z-10 flex items-center justify-center px-4 text-white">
                <div className="relative border p-5 rounded-md w-3xl text-center  backdrop-blur">
                    NO QUESTIONS AVAILABLE.
                </div>
            </div>
        )
    }

    const hasPlayed = (userId: string) => {
        console.log(userId)
        return false
    }

    if (hasPlayed(userId) || currentIndex >= session?.questions.length) {
        navigate('/leaderboard')
    }

    const currentQuestion = session?.questions[currentIndex]

    if (showingLeaderboard) {
        return <LeaderBoard
            LeaderBoard={leaderboard}
            timeLeft={leaderboardTimeLeft}
            clerkUserId={userId}
            userRank={userRank}
        />
    }

    return (
        <div className="absolute w-full h-screen z-10 flex items-center justify-center px-4 text-white">
            <div className="relative border p-5 rounded-md w-3xl text-center  backdrop-blur">
                <h2 className="absolute -top-3 left-1/3 lg:left-1/5 transform -translate-x-1/2 px-4 text-sm font-bold bg-black">
                    Question: {currentIndex + 1}
                </h2>

                <p className="text-lg mb-6 mt-4 border-b pb-2">{currentQuestion?.question}</p>
                <div className="w-full flex justify-center">
                    <div className="w-1/2 my-3">
                        <div className="flex justify-center rounded-full h-2 mb-2">
                            <div
                                className="bg-white h-2 rounded-full transition-all duration-300 mt-[-10px]"
                                style={{ width: `${timeLeft / 20 * 100}%` }}
                            ></div>
                        </div>
                        <div className="text-center text-xs">
                            <span>Time Left: {timeLeft}s (waiting for others to finish)</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3">
                    {currentQuestion?.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => answerQuestion(opt)}
                            disabled={currentQuestion.answered}
                            className="w-full text-left px-5 py-2 border rounded-md shadow shadow-[3px_4px_0_white] font-bold transition-colors duration-200 active:shadow-[1px_2px_0_white] active:top-[3px] cursor-pointer transition-all relative hover:bg-zinc-300/20"
                        >
                            {opt}
                        </button>
                    ))}
                </div>
                {currentQuestion?.answered && timeLeft > 0 && (
                    <div className="mt-3 p-4 border border-white rounded-md text-center text-white">
                        <p>Your answer has been submitted!</p>
                        <p>Leaderboard will appear when the timer reaches 0</p>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Quiz;
