import { Question } from '../types/quiz';
import { DEFAULT_QUESTIONS } from '../data/defaultQuestions';

export interface ThemeOption {
  id: string;
  label: string;
  icon: string;
  description: string;
}

export const QUIZ_THEMES: ThemeOption[] = [
  {
    id: 'random',
    label: 'Fresh & Surprising',
    icon: '✨',
    description: 'Unique mix of quirky, unexpected, and fun questions',
  },
  {
    id: 'hilarious',
    label: 'Chaos & Laughs',
    icon: '😂',
    description: 'Unhinged moments, gossip faces, and funny fails',
  },
  {
    id: 'wholesome',
    label: 'Heartwarming & Deep',
    icon: '💖',
    description: 'Loyalty, tight hugs, comfort food, and true connection',
  },
  {
    id: 'adventures',
    label: 'Travel & Adventures',
    icon: '✈️',
    description: 'Spontaneous trips, panic packing, and navigating together',
  },
];

export async function fetchAiGeneratedQuestions(params: {
  p1Name?: string;
  p2Name?: string;
  theme?: string;
  count?: number;
  previousPrompts?: string[];
}): Promise<{ questions: Question[]; source: string }> {
  try {
    const res = await fetch('/api/generate-questions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        p1Name: params.p1Name || 'Player 1',
        p2Name: params.p2Name || 'Player 2',
        theme: params.theme || 'random',
        count: params.count || 15,
        previousPrompts: params.previousPrompts || [],
      }),
    });

    if (!res.ok) {
      throw new Error(`Server returned ${res.status}`);
    }

    const data = await res.json();
    if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
      return {
        questions: data.questions,
        source: data.source || 'gemini-ai',
      };
    }
  } catch (err) {
    console.warn('AI question generation call failed, using default questions:', err);
  }

  // Graceful fallback to default questions
  return {
    questions: DEFAULT_QUESTIONS,
    source: 'default-fallback',
  };
}
