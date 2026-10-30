export interface Question {
  id: number;
  prompt: string;
  // Templates can use {p1} and {p2} which are substituted by player names
  options: [string, string, string, string];
}

export interface PlayerConfig {
  name: string;
  photoUrl: string;
}

export interface QuizSession {
  sessionId: string;
  quizTitle: string;
  welcomeMessage?: string;
  player1: PlayerConfig;
  player2: PlayerConfig;
  player1Submitted: boolean;
  player2Submitted: boolean;
  bothSubmitted: boolean;
  player2Joined?: boolean;
  quizTheme?: string;
  questions?: Question[];
  mode: 'single_phone' | 'two_device';
  createdAt: string;
  updatedAt: string;
}

export type AnswersMap = Record<number, string>; // questionId -> selectedOptionText

export interface RevealData {
  sessionId: string;
  matchingScore: number;
  totalQuestions: number;
  matchingPercentage: number;
  player1Answers: AnswersMap;
  player2Answers: AnswersMap;
  revealedAt: string;
}

export interface ComparisonItem {
  questionId: number;
  prompt: string;
  player1Answer: string;
  player2Answer: string;
  isMatch: boolean;
}
