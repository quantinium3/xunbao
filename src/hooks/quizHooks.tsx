import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useUser } from '@clerk/clerk-react';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: string;
}

export interface AnswerResponse {
  correct: boolean;
}

export interface LeaderboardEntry {
  username: string;
  score: number;
}

export const useQuestions = () => {
  return useQuery({
    queryKey: ['questions'],
    queryFn: async () => {
      const response = await fetch('http://localhost:8000/questions');
      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      return data
    },
  });
};

export const useSubmitAnswer = () => {
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      questionId, 
      selectedOption 
    }: { 
      questionId: string; 
      selectedOption: string; 
    }) => {
      if (!user) throw new Error('User must be logged in');
      
      const username = user.id;
      
      const response = await fetch('http://localhost:3000/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          selectedOption,
          username,
          userId: user.id
        }),
      });
      
      if (!response.ok) throw new Error('Failed to submit answer');
      return response.json() as Promise<AnswerResponse>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
};

export const useLeaderboard = () => {
  return useQuery({
    queryKey: ['leaderboard'],
    queryFn: async () => {
      const response = await fetch('http://localhost:3000/leaderboard');
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json() as Promise<LeaderboardEntry[]>;
    },
  });
};
