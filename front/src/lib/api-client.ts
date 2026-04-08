import axios from "axios";

const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api/v1`;

const apiClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
	headers: {
		"Content-Type": "application/json",
	},
});

export interface StartQuizResponse {
	session_id: string;
	total_questions: number;
	current_question_index: number;
	current_streak: number;
	total_score: number;
}

export interface QuestionAnswered {
	question_index: number;
	is_correct: boolean;
	time_taken_ms: number;
	score_earned: number;
}

export interface QuestionData {
	id: string;
	text: string;
	options: string[];
	difficulty: string;
	shown_at: string;
}

export interface CurrentQuizResponse {
	session_id: string;
	question_index: number;
	total_questions: number;
	current_streak: number;
	total_score: number;
	question: QuestionData;
	answered_questions: QuestionAnswered[];
}

export interface SubmitAnswerRequest {
	selected_answer_idx: number;
}

export interface SubmitAnswerResponse {
	is_correct: boolean;
	correct_answer_idx: number;
	score_earned: number;
	breakdown: {
		base_score: number;
		time_bonus: number;
		streak_bonus: number;
	};
	current_streak: number;
	total_score: number;
	next_question_index: number;
	quiz_completed: boolean;
}

export interface QuizResultsResponse {
	session_id: string;
	total_score: number;
	questions_answered: number;
	correct_answers: number;
	max_streak: number;
	total_time_ms: number;
	average_time_per_question_ms: number;
	started_at: string;
	completed_at: string;
	answers: Array<{
		question_index: number;
		question_text: string;
		selected_option: string;
		correct_option: string;
		is_correct: boolean;
		time_taken_ms: number;
		score_earned: number;
		streak_at_answer: number;
	}>;
}

export interface RecentSessionResponse {
	session: {
		session_id: string;
		status: string;
	} | null;
}

export interface LeaderboardEntry {
	rank: number;
	user_id: string;
	user_name: string;
	score: number;
	time_ms: number;
}

export interface LeaderboardResponse {
	top_entries: LeaderboardEntry[];
	user_rank: {
		rank: number;
		score: number;
		time_ms: number;
	} | null;
	total_participants: number;
}

export const quizApi = {
	startQuiz: async (token: string | null): Promise<StartQuizResponse> => {
		const response = await apiClient.post<StartQuizResponse>(
			"/quiz/start",
			{},
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},

	getCurrentQuestion: async (
		token: string | null,
		sessionId: string
	): Promise<CurrentQuizResponse> => {
		const response = await apiClient.get<CurrentQuizResponse>(
			`/quiz/${sessionId}/current`,
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},

	submitAnswer: async (
		token: string | null,
		sessionId: string,
		request: SubmitAnswerRequest
	): Promise<SubmitAnswerResponse> => {
		const response = await apiClient.post<SubmitAnswerResponse>(
			`/quiz/${sessionId}/answer`,
			request,
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},

	getResults: async (
		token: string | null,
		sessionId: string
	): Promise<QuizResultsResponse> => {
		const response = await apiClient.get<QuizResultsResponse>(
			`/quiz/${sessionId}/results`,
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},

	getRecentSession: async (
		token: string | null
	): Promise<RecentSessionResponse> => {
		const response = await apiClient.get<RecentSessionResponse>(
			"/quiz/recent",
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},

	getLeaderboard: async (token: string | null): Promise<LeaderboardResponse> => {
		const response = await apiClient.get<LeaderboardResponse>(
			"/quiz/leaderboard",
			{
				headers: token ? { Authorization: `Bearer ${token}` } : {},
			}
		);
		return response.data;
	},
};
