/* import { useEffect, useState } from "react";

type Question = {
    id: string;
    question: string;
    options: string[];
    answered: boolean;
    selectedOption: string | null;
    category: string;
    displayedAt: number | null;
    answeredAt: number | null;
    timeLeft: number;
    userId?: string;
}

type QuizSession = {
    userId: string;
    questions: Question[];
    completed: boolean;
}

type LeaderboardEntry = {
    rank: number;
    userId: string;
    username: string;
    score: number;
} */

/* export const useQuizSession = (userId: string | undefined) => {
    const [session, setSession] = useState<QuizSession | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(20);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
    const [showingLeaderboard, setShowingLeaderboard] = useState(false);
    const [leaderboardTimeLeft, setLeaderboardTimeLeft] = useState(10);
    const [shouldShowLeaderboardAfterTimer, setShouldShowLeaderboardAfterTimer] = useState(false);

    useEffect(() => {
        if (!userId) {
            setLoading(false);
            return;
        }

        const loadOrCreateSession = async () => {
            setLoading(true);
            setError(null);

            const saved = localStorage.getItem('quiz-session');
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);
                    if (parsed.userId === userId) {
                        setSession(parsed);
                        const currentIdx = parsed.questions.findIndex((q: Question) => !q.answered);
                        setCurrentIndex(currentIdx !== -1 ? currentIdx : 0);
                        setLoading(false);
                        return;
                    }
                } catch (error) {
                    console.error("Error parsing saved session:", error);
                }
            }

            try {
                const response = await fetch(`http://localhost:8000/api/question`);
                if (!response.ok) {
                    throw new Error(`Failed to fetch questions: ${response.status}`);
                }
                
                const data = await response.json();
                
                const newSession: QuizSession = {
                    userId: userId,
                    questions: data.data.question.map((q: any) => ({
                        ...q,
                        answered: false,
                        selectedOption: null,
                        displayedAt: null,
                        answeredAt: null,
                        timeLeft: 20,
                        userId: userId
                    })),
                    completed: false
                };
                
                localStorage.setItem('quiz-session', JSON.stringify(newSession));
                setSession(newSession);
            } catch (err) {
                console.error("Error fetching questions:", err);
                setError(err instanceof Error ? err.message : "Failed to fetch questions");
            } finally {
                setLoading(false);
            }
        };
        
        loadOrCreateSession();
    }, [userId]);

    // Timer effect for question countdown
    useEffect(() => {
        if (!session || showingLeaderboard || currentIndex >= session.questions.length) return;
        
        const currentQuestion = session.questions[currentIndex];
        
        if (!currentQuestion.displayedAt) {
            const updatedSession = { ...session };
            updatedSession.questions[currentIndex] = {
                ...currentQuestion,
                displayedAt: Date.now()
            };
            setSession(updatedSession);
            localStorage.setItem('quiz-session', JSON.stringify(updatedSession));
            setTimeLeft(20);
            // Reset this flag when a new question is displayed
            setShouldShowLeaderboardAfterTimer(false);
        }
        
        const timer = setInterval(() => {
            const now = Date.now();
            const startTime = currentQuestion.displayedAt || now;
            const elapsedSeconds = Math.floor((now - startTime) / 1000);
            const remaining = Math.max(0, 20 - elapsedSeconds);
            
            setTimeLeft(remaining);
            
            if (remaining === 0) {
                clearInterval(timer);
                if (!currentQuestion.answered) {
                    handleTimeout();
                }
                
                // Only now show the leaderboard after the full time has expired
                fetchLeaderboard();
                setShowingLeaderboard(true);
                setLeaderboardTimeLeft(10);
                setShouldShowLeaderboardAfterTimer(false);
            }
        }, 1000);
        
        return () => clearInterval(timer);
    }, [session, currentIndex, showingLeaderboard]);

    // Timer effect for leaderboard countdown
    useEffect(() => {
        if (!showingLeaderboard) return;
        
        const leaderboardTimer = setInterval(() => {
            setLeaderboardTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(leaderboardTimer);
                    setShowingLeaderboard(false);
                    advanceToNextQuestion();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        
        return () => clearInterval(leaderboardTimer);
    }, [showingLeaderboard]);

    const advanceToNextQuestion = () => {
        if (!session) return;
        
        if (currentIndex < session.questions.length - 1) {
            setCurrentIndex((prev) => prev + 1);
            setTimeLeft(20);
        } else {
            const completedSession = { ...session, completed: true };
            setSession(completedSession);
            localStorage.setItem('quiz-session', JSON.stringify(completedSession));
        }
    };

    const handleTimeout = () => {
        if (!session) return;
        
        const updatedSession = { ...session };
        updatedSession.questions[currentIndex] = {
            ...updatedSession.questions[currentIndex],
            answered: true,
            selectedOption: "Timeout",
            answeredAt: Date.now(),
            timeLeft: 0
        };
        
        localStorage.setItem('quiz-session', JSON.stringify(updatedSession));
        setSession(updatedSession);
        
        submitAnswer(updatedSession.questions[currentIndex]);
    };

    const fetchLeaderboard = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/leaderboard`);
            if (!response.ok) {
                throw new Error(`Failed to fetch leaderboard: ${response.status}`);
            }
            
            const data = await response.json();
            setLeaderboard(data.data || []);
        } catch (err) {
            console.error("Error fetching leaderboard:", err);
        }
    };

    const submitAnswer = async (question: Question) => {
        const actualUserId = userId || "USR123456";
        
        try {
            console.log("timeleft: ", timeLeft)
            const response = await fetch(`http://localhost:8000/api/submit/${actualUserId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    questionId: question.id,
                    questionIndex: currentIndex,
                    selectedOption: question.selectedOption,
                    timeLeft: question.timeLeft,
                }),
            });
            
            if (!response.ok) {
                throw new Error(`Failed to submit answer: ${response.status}`);
            }
        } catch (err) {
            console.error("Error submitting answer: ", err);
            setError("Failed to submit answer");
        }
    };

    const answerQuestion = (selectedOption: string) => {
        if (!session || session.questions[currentIndex].answered) return;
        
        const updatedSession = { ...session };
        updatedSession.questions[currentIndex] = {
            ...updatedSession.questions[currentIndex],
            answered: true,
            selectedOption: selectedOption,
            answeredAt: Date.now(),
            timeLeft: timeLeft
        };
        
        localStorage.setItem('quiz-session', JSON.stringify(updatedSession));
        setSession(updatedSession);
        
        submitAnswer(updatedSession.questions[currentIndex]);
        
        setShouldShowLeaderboardAfterTimer(true);
    };

    return {
        session,
        currentIndex,
        timeLeft,
        answerQuestion,
        loading,
        error,
        leaderboard,
        showingLeaderboard,
        leaderboardTimeLeft
    };
};
*/
