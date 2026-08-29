export type CategoryId =
  | 'fruits'
  | 'alphabets'
  | 'numbers'
  | 'animals'
  | 'vegetables'
  | 'vehicles'
  | 'colors'
  | 'shapes'
  | 'everyday-objects';

export interface CategoryInfo {
  id: CategoryId;
  name: string;
  icon: string; // Emoji or local asset
  color: string; // Background/theme color
  isComingSoon?: boolean;
}

export interface Question {
  id: string;
  category: CategoryId;
  answer: string;
  emoji: string; // Playful fallback emoji (highly robust & offline)
  image?: any; // Optional local image asset require reference
  options: string[];
}

export interface GameState {
  questions: Question[];
  currentIndex: number;
  score: number;
  isComplete: boolean;
  selectedAnswers: { [questionId: string]: string }; // Tracks what the user selected (if any) for each question
  hasScratchedEnough: boolean; // True if the current scratch card has been revealed
}
