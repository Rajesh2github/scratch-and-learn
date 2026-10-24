import { Question, Difficulty } from './types';

/**
 * Validates whether the given option ID matches the correct option ID of the question.
 */
export function evaluateAnswer(question: Question, selectedOptionId: string): boolean {
  if (!question || !selectedOptionId) return false;
  return question.correctOptionId === selectedOptionId;
}

/**
 * Calculates earned stars (1 to 3) based on correct answers and total questions.
 * Ensures a child always gets at least 1 star for completing the activity!
 */
export function calculateStars(correctAnswers: number, totalQuestions: number): number {
  if (totalQuestions <= 0) return 1;
  const ratio = correctAnswers / totalQuestions;
  if (ratio >= 0.85) return 3;
  if (ratio >= 0.5) return 2;
  return 1;
}

/**
 * Returns the next difficulty level if available, or null if already at max.
 */
export function getNextDifficulty(difficulty: Difficulty): Difficulty | null {
  if (difficulty === 'easy') return 'medium';
  if (difficulty === 'medium') return 'hard';
  return null;
}

/**
 * Returns child-friendly display label for each difficulty level.
 */
export function getDifficultyLabel(difficulty: Difficulty): string {
  switch (difficulty) {
    case 'easy':
      return 'Level 1 ⭐';
    case 'medium':
      return 'Level 2 ⭐⭐';
    case 'hard':
      return 'Level 3 ⭐⭐⭐';
    default:
      return 'Level 1';
  }
}

/**
 * Validates question integrity to ensure no corrupt or unsolvable question gets shown.
 */
export function validateQuestion(question: Question): { isValid: boolean; reason?: string } {
  if (!question.id) return { isValid: false, reason: 'Missing question id' };
  if (!question.prompt) return { isValid: false, reason: 'Missing question prompt' };
  if (!Array.isArray(question.options) || question.options.length < 2) {
    return { isValid: false, reason: 'Must have at least 2 options' };
  }
  const optionIds = new Set(question.options.map((opt) => opt.id));
  if (optionIds.size !== question.options.length) {
    return { isValid: false, reason: 'Duplicate option IDs found' };
  }
  if (!optionIds.has(question.correctOptionId)) {
    return { isValid: false, reason: 'correctOptionId does not match any provided option' };
  }
  return { isValid: true };
}
