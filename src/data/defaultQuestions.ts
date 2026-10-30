import { Question } from '../types/quiz';

export const DEFAULT_PLAYER_1 = {
  name: 'Emma',
  photoUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
};

export const DEFAULT_PLAYER_2 = {
  name: 'Chloe',
  photoUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&h=400&q=80',
};

export const DEFAULT_QUESTIONS: Question[] = [
  {
    id: 1,
    prompt: 'Who is more dramatic?',
    options: ['{p1}', '{p2}', 'Both of us equally', 'Neither of us'],
  },
  {
    id: 2,
    prompt: 'Who laughs at the wrong moment?',
    options: ['{p1}', '{p2}', 'Both of us equally', 'Neither of us'],
  },
  {
    id: 3,
    prompt: 'Who gets ready more slowly?',
    options: ['{p1}', '{p2}', 'Both take forever', 'Neither, always fast'],
  },
  {
    id: 4,
    prompt: 'Who is more likely to forget something?',
    options: ['{p1}', '{p2}', 'Both of us forget things', 'Neither, both organized'],
  },
  {
    id: 5,
    prompt: 'Who starts laughing first?',
    options: ['{p1}', '{p2}', 'Both start at the same time', 'Neither, we keep poker faces'],
  },
  {
    id: 6,
    prompt: 'Who is more stubborn?',
    options: ['{p1}', '{p2}', 'Both equally stubborn', 'Neither of us'],
  },
  {
    id: 7,
    prompt: 'Who is more likely to make a random plan?',
    options: ['{p1}', '{p2}', 'Both love spontaneous plans', 'Neither, we stick to routines'],
  },
  {
    id: 8,
    prompt: 'Who takes more photos?',
    options: ['{p1}', '{p2}', 'Both camera obsessed', 'Neither, we live in the moment'],
  },
  {
    id: 9,
    prompt: 'Who is more talkative?',
    options: ['{p1}', '{p2}', 'Both talk nonstop', 'Neither, we enjoy comfortable silence'],
  },
  {
    id: 10,
    prompt: 'Who is more likely to cheer the other person up?',
    options: ['{p1}', '{p2}', 'Both always comfort each other', 'Depends on who is sad'],
  },
  {
    id: 11,
    prompt: 'Who is more competitive?',
    options: ['{p1}', '{p2}', 'Both must win everything', 'Neither, very chill'],
  },
  {
    id: 12,
    prompt: 'Who is more likely to make a silly joke?',
    options: ['{p1}', '{p2}', 'Both are comedians', 'Neither, highbrow humor only'],
  },
  {
    id: 13,
    prompt: 'Who is more likely to be late?',
    options: ['{p1}', '{p2}', 'Both run late together', 'Neither, always punctual'],
  },
  {
    id: 14,
    prompt: 'Who is more likely to suggest an adventure?',
    options: ['{p1}', '{p2}', 'Both ready to explore', 'Neither, homebodies forever'],
  },
  {
    id: 15,
    prompt: 'Who is more likely to remember a small detail?',
    options: ['{p1}', '{p2}', 'Both have elephant memories', 'Neither, we both forget'],
  },
];

export function formatQuestionOption(option: string, p1Name: string, p2Name: string): string {
  const p1 = p1Name.trim() || 'Player 1';
  const p2 = p2Name.trim() || 'Player 2';
  return option.replace(/\{p1\}/g, p1).replace(/\{p2\}/g, p2);
}

export function formatQuestionOptions(
  options: [string, string, string, string],
  p1Name: string,
  p2Name: string
): [string, string, string, string] {
  return [
    formatQuestionOption(options[0], p1Name, p2Name),
    formatQuestionOption(options[1], p1Name, p2Name),
    formatQuestionOption(options[2], p1Name, p2Name),
    formatQuestionOption(options[3], p1Name, p2Name),
  ];
}
