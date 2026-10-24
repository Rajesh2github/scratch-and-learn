export type GameCategory = 'math' | 'logic' | 'words' | 'classic';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AnswerOption {
  id: string;
  label: string;
  emoji?: string;
  imageAsset?: any;
}

export type VisualDataType =
  | 'counter'
  | 'addition'
  | 'subtraction'
  | 'pattern'
  | 'odd-one-out'
  | 'matching'
  | 'word';

export interface VisualData {
  type: VisualDataType;
  items?: string[];
  group1?: string[];
  group2?: string[];
  operator?: '+' | '-';
  patternSequence?: (string | null)[];
  targetWord?: string;
  audioKey?: string;
}

export interface Question {
  id: string;
  gameId: string;
  prompt: string;
  instructionAudio?: string;
  options: AnswerOption[];
  correctOptionId: string;
  hint?: string;
  emoji?: string;
  visualData?: VisualData;
}

export interface GameDefinition {
  id: string;
  category: GameCategory;
  title: string;
  description: string;
  icon: string;
  color: string;
  difficulty: Difficulty;
  estimatedAgeMin: number;
  estimatedAgeMax: number;
  route: string;
}

export interface SessionResult {
  gameId: string;
  totalQuestions: number;
  correctAnswers: number;
  starsEarned: number;
  durationMs: number;
}
