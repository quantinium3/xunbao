import { pgTable, text, integer, pgEnum, check, timestamp, boolean, index, unique } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { user } from "./auth-schema";

export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const quizSessionStatusEnum = pgEnum("quiz_session_status", ["in_progress", "completed"]);

export const question = pgTable("question", {
	id: text("id").primaryKey(),
	question: text("question").notNull(),
	options: text("options").array().notNull(),
	correctIdx: integer("correct_idx").notNull(),
	difficulty: difficultyEnum("difficulty").notNull(),
	createdAt: timestamp("created_at")
		.defaultNow().notNull(),
	updatedAt: timestamp("updated_at")
		.defaultNow().$onUpdate(() => new Date()).notNull(),
}, (tb) => [
	check("check_idx", sql`${tb.correctIdx} >= 0 AND ${tb.correctIdx} <= 3`),
	check("options_length", sql`cardinality(${tb.options}) = 4`),
]);

export const quiz_session = pgTable("quiz_session", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull()
		.references(() => user.id, { onDelete: "cascade" }),
	questionIds: text("question_ids").array().notNull()
		.default(sql`ARRAY[]::text[]`),
	currentQuestionIndex: integer("current_question_index").notNull().default(0),
	currentQuestionStartedAt: timestamp("current_question_started_at"),
	startedAt: timestamp("started_at").notNull().defaultNow(),
	completedAt: timestamp("completed_at"),
	currentStreak: integer("current_streak").notNull().default(0),
	totalScore: integer("total_score").notNull().default(0),
	questionsAnswered: integer("questions_answered").notNull().default(0),
	status: quizSessionStatusEnum("status").notNull().default("in_progress"),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow()
		.$onUpdate(() => new Date()).notNull(),
});

export const quiz_answer = pgTable(
	"quiz_answer",
	{
		id: text("id").primaryKey(),
		sessionId: text("session_id").notNull()
			.references(() => quiz_session.id, { onDelete: "cascade" }),
		questionId: text("question_id").notNull().references(() => question.id),
		questionIndex: integer("question_index").notNull(),
		selectedAnswerIdx: integer("selected_answer_idx").notNull(),
		isCorrect: boolean("is_correct").notNull(),
		shownAt: timestamp("shown_at").notNull(),
		answeredAt: timestamp("answered_at").notNull().defaultNow(),
		timeTakenMs: integer("time_taken_ms").notNull(),
		baseScore: integer("base_score").notNull().default(0),
		timeBonus: integer("time_bonus").notNull().default(0),
		streakBonus: integer("streak_bonus").notNull().default(0),
		totalScore: integer("total_score").notNull().default(0),
		streakAtAnswer: integer("streak_at_answer").notNull().default(0),
	}, (tb) => [
		unique().on(tb.sessionId, tb.questionIndex),
	]);

export const leaderboard = pgTable("leaderboard", {
	id: text("id").primaryKey(),
	userId: text("user_id").notNull()
		.references(() => user.id, { onDelete: "cascade" }).unique(),
	topScore: integer("top_score").notNull(),
	bestTimeMs: integer("best_time_ms").notNull(),
	updatedAt: timestamp("updated_at").defaultNow()
		.$onUpdate(() => new Date()).notNull(),
}, (tb) => [
	index("score_idx").on(tb.topScore.desc()),
]);
