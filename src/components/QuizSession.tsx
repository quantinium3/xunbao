import { useEffect, useState } from "react";
import { useNavigate } from "react-router";

interface Question {
    questionId: string;
    question: string;
    options: string[]
    answered: boolean;
    selectedOption: string | null;
    displayedAt: number | null;
    answeredAt: number | null;
    timeLeft: number;
}

interface QuizSession {
    userId: string;
    questions: Question[]
    lastFetchedAt?: number;
}

interface Leaderboard {
    rank: number;
    userId: string;
    username: string;
    score: number;
}

const backendUri = import.meta.env.VITE_BACKEND_URI;

export const useQuizSession = (userId: string | undefined) => {
    const [session, setSession] = useState<QuizSession | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("")
    const [completed, setCompleted] = useState(false);
    const [showingLeaderboard, setShowingLeaderboard] = useState(false)
    const [timeLeft, setTimeLeft] = useState(20);
    const [leaderboardTimeLeft, setLeaderboardTimeLeft] = useState(10);
    const [leaderboard, setLeaderboard] = useState<Leaderboard[]>([]);
    const [userRank, setUserRank] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            setLoading(false)
            return;
        }

        const loadOrCreateSession = async () => {
            setLoading(true)
            setError("")

            try {
                const res = await fetch(`${backendUri}/api/question/user/${userId}`)
                if (!res.ok) {
                    console.error(`Failed to fetch questions: ${res.status}`)
                    setError("Failed to fetch questions")
                    setLoading(false)
                    return;
                }


                const data = await res.json();

                if (!data.data || !data.data.unansweredQuestions || data.data.unansweredQuestions.length === 0) {
                    console.log("redirecting to /leaderboard")
                    setCompleted(true)
                    setLoading(false)
                    navigate('/leaderboard')
                    return;
                }

                const backendQuestions = data.data.unansweredQuestions;

                let firstUnansweredIndex = 0;
                for (let i = 0; i < backendQuestions.length; i++) {
                    if (!backendQuestions[i].answered) {
                        firstUnansweredIndex = i;
                        break;
                    }
                    if (i === backendQuestions.length - 1) {
                        console.log("redirecting to /leaderboard")
                        setCompleted(true)
                        setLoading(false)
                        navigate('/leaderboard')
                        return;
                    }
                }

                const newSession: QuizSession = {
                    userId: userId,
                    questions: backendQuestions.map((q: any) => ({
                        ...q,
                        answered: q.answered || false,
                        selectedOption: q.selectedOption || null,
                        displayedAt: q.displayedAt || null,
                        answeredAt: q.answeredAt || null,
                        timeLeft: q.timeLeft || 20,
                    })),
                    lastFetchedAt: Date.now()
                }

                localStorage.setItem('quiz-session', JSON.stringify(newSession))
                console.log("Saving into the current session")
                setSession(newSession)
                setCurrentIndex(firstUnansweredIndex)
            } catch (err) {
                console.error("Error loading quiz session: ", err)
                setError("Failed to load quiz session")
            } finally {
                setLoading(false)
            }
        }

        loadOrCreateSession();
    }, [userId, navigate, completed])

    useEffect(() => {
        if (!session || showingLeaderboard || currentIndex >= session.questions.length) return;

        const currentQuestion = session.questions[currentIndex];
        if (!currentQuestion.displayedAt) {
            const updatedSession = { ...session };
            updatedSession.questions[currentIndex] = {
                ...currentQuestion,
                displayedAt: Date.now(),
            }
            setSession(updatedSession)
            localStorage.setItem('quiz-session', JSON.stringify(updatedSession))
            setTimeLeft(20);
        }

        const timer = setInterval(() => {
            const now = Date.now();
            const startTime = currentQuestion.displayedAt || now;
            const elapsedSeconds = Math.floor((now - startTime) / 1000)
            const remaining = Math.max(0, 20 - elapsedSeconds);

            setTimeLeft(remaining);

            if (remaining === 0) {
                clearInterval(timer)
                if (!currentQuestion.answered) {
                    handleTimeout();
                }

                fetchLeaderboard();
                setShowingLeaderboard(true);
                setLeaderboardTimeLeft(10);
            }
        }, 1000)
        return () => clearInterval(timer)
    }, [currentIndex, session, showingLeaderboard])

    const incrementQuestion = () => {
        if (!session) return;

        const nextIndex = currentIndex + 1;
        console.log("Incrementing Questiong index")

        if (nextIndex >= session.questions.length) {
            navigate('/leaderboard');
            return;
        }

        setCurrentIndex(nextIndex);
        setTimeLeft(20);
    }

    useEffect(() => {
        if (!showingLeaderboard) {
            return;
        }

        const leaderboardTimer = setInterval(() => {
            setLeaderboardTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(leaderboardTimer)
                    setShowingLeaderboard(false)
                    incrementQuestion();
                    return 0;
                }
                return prev - 1
            })
        }, 1000)
        return () => clearInterval(leaderboardTimer)
    }, [showingLeaderboard]);


    const handleTimeout = () => {
        if (!session) return;

        const updatedSession = { ...session }
        updatedSession.questions[currentIndex] = {
            ...updatedSession.questions[currentIndex],
            answered: true,
            selectedOption: "Timeout",
            answeredAt: Date.now(),
            timeLeft: 0,
        }

        localStorage.setItem('quiz-session', JSON.stringify(updatedSession))
        setSession(updatedSession)
        submitAnswer(updatedSession.questions[currentIndex])
        return;
    }

    const fetchLeaderboard = async () => {
        try {
            const res = await fetch(`${backendUri}/api/leaderboard/${userId}`);
            if (!res.ok) {
                console.error(`Failed to fetch leaderboard: ${res.status}`)
                throw new Error(`Failed to fetch leaderboard: ${res.status}`)
            }

            const data = await res.json();
            setLeaderboard(data.data.leaderboard || []);
            setUserRank(String(data.data.user?.rank || "N/A"));
        } catch (err) {
            console.error("Error fetching leaderboard: ", err)
            setError("Failed to fetch leaderboards")
        }
    }

    const submitAnswer = async (question: Question) => {
        try {
            const res = await fetch(`${backendUri}/api/submit/${userId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: question.questionId,
                    selectedOption: question.selectedOption,
                    timeLeft: question.timeLeft,
                })
            })

            if (!res.ok) {
                throw new Error(`Failed to submit answer: ${res.status}`)
            }
        } catch (err) {
            console.error("Error submitting answer: ", err)
            setError("Failed to submit answer")
        }
    }

    const answerQuestion = (selectedOption: string) => {
        if (!session || session.questions[currentIndex].answered) return;

        const updatedSession = { ...session }
        updatedSession.questions[currentIndex] = {
            ...updatedSession.questions[currentIndex],
            answered: true,
            selectedOption: selectedOption,
            answeredAt: Date.now(),
            timeLeft: timeLeft
        }

        localStorage.setItem('quiz-session', JSON.stringify(updatedSession))
        setSession(updatedSession)
        submitAnswer(updatedSession.questions[currentIndex])
    }

    return {
        session, currentIndex, timeLeft, answerQuestion, loading, error, leaderboard, showingLeaderboard, leaderboardTimeLeft, setError, userRank
    }
}
// 27 January, 3 February, 10 Feb, 3 March, 17 March, 7 April, 21 April 
//
