import { Hono } from "hono";
import { db } from "../lib/db";
import { question, quiz_session, quiz_answer, leaderboard } from "../lib/db/schema/quiz-schema";
import { user } from "../lib/db/schema/auth-schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";
import status from "http-status";
import { z } from "zod";
import { getAuth } from "@clerk/hono";

export const quizRouter = new Hono();
const MAX_QUESTIONS = 15;
const SCORING_CONFIG = {
	DIFFICULTY_SCORE: {
		easy: 10,
		medium: 20,
		hard: 30,
	},
	TIME_BONUSES: [
		{ threshold: 7, points: 20 },
		{ threshold: 10, points: 10 },
		{ threshold: 15, points: 0 }
	],
	STREAK_BONUSES: [
		{ threshold: 5, points: 10 },
		{ threshold: 3, points: 5 }
	]
}

interface StartQuizResponse {
	session_id: string;
	total_questions: number;
	current_question_index: number;
	current_streak: number;
	total_score: number;
}


interface QuestionData {
	id: string;
	text: string;
	options: string[];
	difficulty: string;
	shown_at: string;
}

interface QuestionAnswered {
	question_index: number;
	is_correct: boolean;
	time_taken_ms: number;
	score_earned: number;
}

interface CurrentQuizResponse {
	session_id: string;
	question_index: number;
	total_questions: number;
	current_streak: number;
	total_score: number;
	question: QuestionData;
	answered_questions: QuestionAnswered[];
}

interface RecentSessionResponse {
	session_id: string;
	status: string;
}

// GET /api/v1/quiz/recent - Get user's most recent quiz session
quizRouter.get("/recent", async (c) => {
	const auth = getAuth(c);
	if (!auth?.isAuthenticated) {
		return c.json({
			error: "Unauthorized",
			success: false
		}, 401)
	}


	try {
		const recentSessionResult = await db
			.select({
				id: quiz_session.id,
				status: quiz_session.status,
			})
			.from(quiz_session)
			.where(eq(quiz_session.userId, auth.userId))
			.orderBy(desc(quiz_session.createdAt))
			.limit(1);

		if (recentSessionResult.length === 0) {
			return c.json({ session: null }, 200);
		}
		const recentSession = recentSessionResult[0];

		const response: RecentSessionResponse = {
			session_id: recentSession.id,
			status: recentSession.status,
		};

		return c.json({ session: response }, 200);
	} catch (error) {
		console.error("Error getting recent session:", error);
		return c.json({
			error: "Failed to get recent session",
			success: false,
		}, 500);
	}
});

// POST /api/v1/quiz/start - Start a new quiz session with 15 random questions
quizRouter.post("/start", async (c) => {
	const auth = getAuth(c)
	if (!auth.isAuthenticated) {
		return c.json({
			error: "Unauthorized",
			success: false
		}, 401)
	}

	try {
		const existingSessionResult = await db
			.select()
			.from(quiz_session)
			.where(eq(quiz_session.userId, auth.userId))
			.orderBy(desc(quiz_session.createdAt))
			.limit(1);
		if (existingSessionResult.length > 0) {
			const existingSession = existingSessionResult[0];
			if (existingSession.status === "completed") {
				return c.json({
					error: "You have already completed the quiz",
					success: false,
					existing_session_id: existingSession.id,
					status: "completed",
				}, status.CONFLICT);
			} else {
				return c.json({
					error: "You have an in-progress quiz session",
					success: false,
					existing_session_id: existingSession.id,
					status: "in_progress",
				}, status.CONFLICT);
			}
		}

		const countResult = await db.execute<{ count: string }>(
			sql`SELECT COUNT(*) as count FROM ${question}`
		);
		const questionCount = parseInt(countResult.rows[0]?.count || "0");
		if (questionCount < 15) {
			return c.json({
				error: `Not enough questions available. Found ${String(questionCount)}, need 15.`,
				success: false,
			}, status.BAD_REQUEST);
		}

		const allIds = await db.select({ id: question.id }).from(question);
		const shuffled = [...allIds];
		for (let i = shuffled.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
		}
		const questionIds = shuffled.slice(0, 15).map(q => q.id);


		const sessionId = createId();
		const now = new Date();

		await db.insert(quiz_session).values({
			id: sessionId,
			userId: auth.userId,
			questionIds: questionIds,
			currentQuestionIndex: 0,
			currentQuestionStartedAt: null,
			startedAt: now,
			completedAt: null,
			currentStreak: 0,
			totalScore: 0,
			questionsAnswered: 0,
			status: "in_progress",
			createdAt: now,
			updatedAt: now,
		});

		const response: StartQuizResponse = {
			session_id: sessionId,
			total_questions: 15,
			current_question_index: 0,
			current_streak: 0,
			total_score: 0,
		};

		return c.json(response);

	} catch (error) {
		console.error("Error starting quiz:", error);
		return c.json({
			error: "Failed to start quiz session",
			success: false,
		}, 500);
	}
});

// GET /api/v1/quiz/:session_id/current - Get current question and session state
quizRouter.get("/:session_id/current", async (c) => {
	try {
		const auth = getAuth(c)
		if (!auth.isAuthenticated) {
			return c.json({
				error: "Unauthorized",
				success: false
			}, 401)
		}

		const quizSessionResult = await db
			.select()
			.from(quiz_session).where(
				and(
					eq(quiz_session.id, c.req.param("session_id")),
					eq(quiz_session.userId, auth.userId)
				)
			)
			.limit(1);
		if (quizSessionResult.length === 0) {
			return c.json({
				error: "Session not found",
				success: false,
			}, status.NOT_FOUND);
		}
		const quizSession = quizSessionResult[0];
		if (quizSession.status === "completed") {
			return c.json({
				error: "Quiz session is completed",
				success: false,
			}, status.GONE);
		}

		if (quizSession.currentQuestionIndex >= MAX_QUESTIONS) {
			await db.update(quiz_session).set({
				status: "completed",
				completedAt: new Date(),
				updatedAt: new Date(),
			}).where(eq(quiz_session.id, c.req.param("session_id")));

			return c.json({
				error: "Quiz session is completed",
				success: false,
			}, status.GONE)
		}

		const currentQuestionId = quizSession.questionIds[quizSession.currentQuestionIndex];
		if (!currentQuestionId) {
			return c.json({ error: "Invalid question index", success: false }, status.BAD_REQUEST);
		}
		const currentQuestionResult = await db
			.select()
			.from(question)
			.where(eq(question.id, currentQuestionId))
			.limit(1);
		if (currentQuestionResult.length === 0) {
			return c.json({
				error: "Question not found",
				success: false,
			}, status.NOT_FOUND);
		}
		const currentQuestion = currentQuestionResult[0];

		const [timestampResult] = await db
			.update(quiz_session)
			.set({
				currentQuestionStartedAt: sql`COALESCE(${quiz_session.currentQuestionStartedAt}, NOW())`,
				updatedAt: new Date(),
			})
			.where(eq(quiz_session.id, c.req.param("session_id")))
			.returning({ shownAt: quiz_session.currentQuestionStartedAt });

		const shownAt = timestampResult.shownAt ?? new Date();

		const questionsAnswered = await db
			.select({
				question_index: quiz_answer.questionIndex,
				is_correct: quiz_answer.isCorrect,
				time_taken_ms: quiz_answer.timeTakenMs,
				score_earned: quiz_answer.totalScore,
			})
			.from(quiz_answer)
			.where(eq(quiz_answer.sessionId, c.req.param("session_id")))
			.orderBy(quiz_answer.questionIndex);

		const response: CurrentQuizResponse = {
			session_id: c.req.param("session_id"),
			question_index: quizSession.currentQuestionIndex,
			total_questions: 15,
			current_streak: quizSession.currentStreak,
			total_score: quizSession.totalScore,
			question: {
				id: currentQuestion.id,
				text: currentQuestion.question,
				options: currentQuestion.options,
				difficulty: currentQuestion.difficulty,
				shown_at: shownAt.toISOString(),
			},
			answered_questions: questionsAnswered
		}

		return c.json(response, status.OK);
	} catch (error) {
		console.error("Error getting current quiz:", error);
		return c.json({
			error: "Failed to get current quiz",
			success: false,
		}, status.INTERNAL_SERVER_ERROR);
	}
});

const answerQuizRequestSchema = z.object({
	selected_answer_idx: z.number().int().min(0).max(3),
});

interface AnswerQuizResponse {
	is_correct: boolean,
	correct_answer_idx: number,
	score_earned: number,
	breakdown: {
		base_score: number,
		time_bonus: number,
		streak_bonus: number,
	},
	current_streak: number,
	total_score: number,
	next_question_index: number,
	quiz_completed: boolean
}

// POST /api/v1/quiz/:session_id/answer - Answer a question
quizRouter.post("/:session_id/answer", async (c) => {
	try {
		const auth = getAuth(c)
		if (!auth.isAuthenticated) {
			return c.json({
				error: "Unauthorized",
				success: false
			}, 401)
		}

		const quizSessionResult = await db
			.select()
			.from(quiz_session).where(
				and(
					eq(quiz_session.id, c.req.param("session_id")),
					eq(quiz_session.userId, auth.userId)
				)
			)
			.limit(1);
		if (quizSessionResult.length === 0) {
			return c.json({
				error: "Session not found",
				success: false,
			}, status.NOT_FOUND);
		}
		const quizSession = quizSessionResult[0];
		if (quizSession.status === "completed") {
			return c.json({
				error: "Quiz session is completed",
				success: false,
			}, status.GONE);
		}
		if (quizSession.currentQuestionStartedAt === null) {
			return c.json({
				error: "Question not started",
				success: false,
			}, status.BAD_REQUEST);
		}
		const questionStartedAt = quizSession.currentQuestionStartedAt;

		const existingAnswerResult = await db.select()
			.from(quiz_answer)
			.where(and(
				eq(quiz_answer.sessionId, c.req.param("session_id")),
				eq(quiz_answer.questionIndex, quizSession.currentQuestionIndex)
			));
		if (existingAnswerResult.length > 0) {
			return c.json({ error: "Question already answered" }, 409);
		}

		const body = await c.req.json<z.infer<typeof answerQuizRequestSchema>>();
		const parseResult = answerQuizRequestSchema.safeParse(body);
		if (!parseResult.success) {
			return c.json({
				error: "Invalid request body",
				details: parseResult.error
			}, status.BAD_REQUEST);
		}
		const answerQuizRequest = parseResult.data;

		const currentQuestionId = quizSession.questionIds[quizSession.currentQuestionIndex];
		if (!currentQuestionId) {
			return c.json({ error: "Invalid question index", success: false }, status.BAD_REQUEST);
		}

		const currentQuestionResult = await db
			.select()
			.from(question)
			.where(eq(question.id, currentQuestionId))
			.limit(1);
		if (currentQuestionResult.length === 0) {
			return c.json({
				error: "Question not found",
				success: false,
			}, status.NOT_FOUND);
		}
		const currentQuestion = currentQuestionResult[0];

		const isCorrect = answerQuizRequest.selected_answer_idx === currentQuestion.correctIdx;
		let scoreEarned = 0;
		let baseScore = 0;
		let timeBonus = 0;
		let streakBonus = 0;
		if (isCorrect) {
			baseScore = SCORING_CONFIG.DIFFICULTY_SCORE[currentQuestion.difficulty];
			const timeTakenSecs = (Date.now() - questionStartedAt.getTime()) / 1000;
			timeBonus = SCORING_CONFIG.TIME_BONUSES.find(b => timeTakenSecs <= b.threshold)?.points ?? 0;
			const newStreak = quizSession.currentStreak + 1;
			streakBonus = SCORING_CONFIG.STREAK_BONUSES.find(s => newStreak >= s.threshold)?.points ?? 0;
			scoreEarned = baseScore + timeBonus + streakBonus;
		}
		const newStreak = isCorrect ? quizSession.currentStreak + 1 : 0;
		const timeTakenMs = Date.now() - questionStartedAt.getTime();
		const nextIndex = quizSession.currentQuestionIndex + 1;
		const isQuizComplete = nextIndex >= 15;

		await db.transaction(async (tx) => {
			await tx.insert(quiz_answer).values({
				id: createId(),
				sessionId: c.req.param("session_id"),
				questionId: currentQuestion.id,
				questionIndex: quizSession.currentQuestionIndex,
				selectedAnswerIdx: answerQuizRequest.selected_answer_idx,
				isCorrect: isCorrect,
				shownAt: questionStartedAt,
				answeredAt: new Date(),
				timeTakenMs: timeTakenMs,
				baseScore: baseScore,
				timeBonus: timeBonus,
				streakBonus: streakBonus,
				totalScore: scoreEarned,
				streakAtAnswer: newStreak,
			});

			await tx.update(quiz_session).set({
				currentQuestionIndex: nextIndex,
				currentQuestionStartedAt: null,
				currentStreak: newStreak,
				totalScore: quizSession.totalScore + scoreEarned,
				questionsAnswered: quizSession.questionsAnswered + 1,
				status: isQuizComplete ? "completed" : "in_progress",
				completedAt: isQuizComplete ? new Date() : null,
				updatedAt: new Date(),
			}).where(eq(quiz_session.id, c.req.param("session_id")));

			if (isQuizComplete) {
				const finalScore = quizSession.totalScore + scoreEarned;
				const totalTimeMs = Date.now() - quizSession.startedAt.getTime();

				const existingEntryResult = await tx
					.select()
					.from(leaderboard)
					.where(eq(leaderboard.userId, auth.userId))
					.limit(1);

				if (existingEntryResult.length > 0) {
					const existingEntry = existingEntryResult[0];
					const isBetterScore = finalScore > existingEntry.topScore;
					const isSameScoreFasterTime =
						finalScore === existingEntry.topScore &&
						totalTimeMs < existingEntry.bestTimeMs;

					if (isBetterScore || isSameScoreFasterTime) {
						await tx
							.update(leaderboard)
							.set({
								topScore: finalScore,
								bestTimeMs: totalTimeMs,
								updatedAt: new Date(),
							})
							.where(eq(leaderboard.userId, auth.userId));
					}
				} else {
					await tx.insert(leaderboard).values({
						id: createId(),
						userId: auth.userId,
						topScore: finalScore,
						bestTimeMs: totalTimeMs,
						updatedAt: new Date(),
					});
				}
			}
		});

		return c.json<AnswerQuizResponse>({
			is_correct: isCorrect,
			correct_answer_idx: currentQuestion.correctIdx,
			score_earned: scoreEarned,
			breakdown: {
				base_score: baseScore,
				time_bonus: timeBonus,
				streak_bonus: streakBonus,
			},
			current_streak: newStreak,
			total_score: quizSession.totalScore + scoreEarned,
			next_question_index: nextIndex,
			quiz_completed: isQuizComplete,
		}, 200);
	} catch (error) {
		console.error("Error answering quiz:", error);
		return c.json({
			error: "Failed to answer quiz",
			success: false,
		}, status.INTERNAL_SERVER_ERROR);
	}
});

interface QuizResultsResponse {
	session_id: string;
	total_score: number;
	questions_answered: number;
	correct_answers: number;
	max_streak: number;
	total_time_ms: number;
	average_time_per_question_ms: number;
	started_at: string;
	completed_at: string;
	answers: {
		question_index: number;
		question_text: string;
		selected_option: string;
		correct_option: string;
		is_correct: boolean;
		time_taken_ms: number;
		score_earned: number;
		streak_at_answer: number;
	}[];
}

// GET /api/v1/quiz/:session_id/results - Get quiz results
quizRouter.get("/:session_id/results", async (c) => {
	try {
		const auth = getAuth(c)
		if (!auth.isAuthenticated) {
			return c.json({
				error: "Unauthorized",
				success: false
			}, 401)
		}

		const quizSessionResult = await db
			.select()
			.from(quiz_session)
			.where(
				and(
					eq(quiz_session.id, c.req.param("session_id")),
					eq(quiz_session.userId, auth.userId)
				)
			)
			.limit(1);

		if (quizSessionResult.length === 0) {
			return c.json({
				error: "Session not found",
				success: false,
			}, status.NOT_FOUND);
		}
		const quizSession = quizSessionResult[0];

		if (quizSession.status !== "completed") {
			return c.json({
				error: "Quiz session not completed",
				success: false,
			}, status.BAD_REQUEST);
		}

		const answers = await db
			.select({
				questionIndex: quiz_answer.questionIndex,
				questionId: quiz_answer.questionId,
				selectedAnswerIdx: quiz_answer.selectedAnswerIdx,
				isCorrect: quiz_answer.isCorrect,
				timeTakenMs: quiz_answer.timeTakenMs,
				totalScore: quiz_answer.totalScore,
				streakAtAnswer: quiz_answer.streakAtAnswer,
			})
			.from(quiz_answer)
			.where(eq(quiz_answer.sessionId, c.req.param("session_id")))
			.orderBy(quiz_answer.questionIndex);

		const allQuestions = await db
			.select()
			.from(question);

		const questionMap = new Map(allQuestions.map((q) => [q.id, q]));

		const correctAnswers = answers.filter((a) => a.isCorrect).length;
		const totalTimeMs = answers.reduce((sum, a) => sum + a.timeTakenMs, 0);
		const maxStreak = Math.max(...answers.map((a) => a.streakAtAnswer), 0);

		const detailedAnswers = answers.map((answer) => {
			const q = questionMap.get(answer.questionId);
			if (!q) {
				throw new Error(`Question ${answer.questionId} not found`);
			}

			const selectedOption = answer.selectedAnswerIdx >= 0 && answer.selectedAnswerIdx < q.options.length
				? q.options[answer.selectedAnswerIdx]
				: "Invalid option";
			const correctOption = q.correctIdx >= 0 && q.correctIdx < q.options.length
				? q.options[q.correctIdx]
				: "Invalid option";

			return {
				question_index: answer.questionIndex,
				question_text: q.question,
				selected_option: selectedOption,
				correct_option: correctOption,
				is_correct: answer.isCorrect,
				time_taken_ms: answer.timeTakenMs,
				score_earned: answer.totalScore,
				streak_at_answer: answer.streakAtAnswer,
			};
		});

		const response: QuizResultsResponse = {
			session_id: quizSession.id,
			total_score: quizSession.totalScore,
			questions_answered: quizSession.questionsAnswered,
			correct_answers: correctAnswers,
			max_streak: maxStreak,
			total_time_ms: totalTimeMs,
			average_time_per_question_ms: quizSession.questionsAnswered > 0
				? Math.floor(totalTimeMs / quizSession.questionsAnswered)
				: 0,
			started_at: quizSession.startedAt.toISOString(),
			completed_at: quizSession.completedAt?.toISOString() ?? "",
			answers: detailedAnswers,
		};

		return c.json(response, status.OK);
	} catch (error) {
		console.error("Error getting quiz results:", error);
		return c.json({
			error: "Failed to get quiz results",
			success: false,
		}, status.INTERNAL_SERVER_ERROR);
	}
});

interface LeaderboardEntry {
	rank: number;
	user_id: string;
	user_name: string;
	score: number;
	time_ms: number;
}

interface LeaderboardResponse {
	top_entries: LeaderboardEntry[];
	user_rank: {
		rank: number;
		score: number;
		time_ms: number;
	} | null;
	total_participants: number;
}

// GET /api/v1/leaderboard - Get leaderboard with top 10 and user's rank
quizRouter.get("/leaderboard", async (c) => {
	try {
		const auth = getAuth(c)
		if (!auth.isAuthenticated) {
			return c.json({
				error: "Unauthorized",
				success: false
			}, 401)
		}

		const topEntries = await db
			.select({
				userId: leaderboard.userId,
				userName: user.name,
				topScore: leaderboard.topScore,
				bestTimeMs: leaderboard.bestTimeMs,
			})
			.from(leaderboard)
			.innerJoin(user, eq(leaderboard.userId, user.id))
			.orderBy(desc(leaderboard.topScore), asc(leaderboard.bestTimeMs))
			.limit(10);

		const topEntriesWithRank: LeaderboardEntry[] = topEntries.map((entry, index) => ({
			rank: index + 1,
			user_id: entry.userId,
			user_name: entry.userName,
			score: entry.topScore,
			time_ms: entry.bestTimeMs,
		}));

		let userRank: LeaderboardResponse["user_rank"] = null;
		const userEntryResult = await db
			.select()
			.from(leaderboard)
			.where(eq(leaderboard.userId, auth.userId))
			.limit(1);

		if (userEntryResult.length > 0) {
			const userEntry = userEntryResult[0];
			const rankResult = await db.execute<{ rank: string }>(sql`
					SELECT COUNT(*) + 1 as rank
					FROM ${leaderboard}
					WHERE ${leaderboard.topScore} > ${userEntry.topScore}
					   OR (${leaderboard.topScore} = ${userEntry.topScore}
					       AND ${leaderboard.bestTimeMs} < ${userEntry.bestTimeMs})
				`);

			const rank = parseInt(rankResult.rows[0]?.rank || "0");

			userRank = {
				rank: rank,
				score: userEntry.topScore,
				time_ms: userEntry.bestTimeMs,
			};
		}

		const totalResult = await db.execute<{ count: string }>(
			sql`SELECT COUNT(*) as count FROM ${leaderboard}`
		);
		const totalParticipants = parseInt(totalResult.rows[0]?.count || "0");

		const response: LeaderboardResponse = {
			top_entries: topEntriesWithRank,
			user_rank: userRank,
			total_participants: totalParticipants,
		};

		return c.json(response, status.OK);
	} catch (error) {
		console.error("Error getting leaderboard:", error);
		return c.json({
			error: "Failed to get leaderboard",
			success: false,
		}, status.INTERNAL_SERVER_ERROR);
	}
});
