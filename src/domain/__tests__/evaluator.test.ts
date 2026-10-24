import {
  evaluateAnswer,
  calculateStars,
  validateQuestion,
  getNextDifficulty,
  getDifficultyLabel,
} from '../evaluator';
import { Question } from '../types';

describe('Domain Evaluator', () => {
  const validQuestion: Question = {
    id: 'q1',
    gameId: 'math-counting',
    prompt: 'How many apples do you see?',
    options: [
      { id: 'opt_1', label: '1', emoji: '🍎' },
      { id: 'opt_2', label: '2', emoji: '🍎🍎' },
      { id: 'opt_3', label: '3', emoji: '🍎🍎🍎' },
    ],
    correctOptionId: 'opt_3',
  };

  test('evaluateAnswer returns true for correct answer and false for wrong', () => {
    expect(evaluateAnswer(validQuestion, 'opt_3')).toBe(true);
    expect(evaluateAnswer(validQuestion, 'opt_1')).toBe(false);
    expect(evaluateAnswer(validQuestion, 'invalid_id')).toBe(false);
  });

  test('calculateStars awards 3 stars for >= 85%, 2 stars for >= 50%, and at least 1 star', () => {
    expect(calculateStars(10, 10)).toBe(3);
    expect(calculateStars(9, 10)).toBe(3);
    expect(calculateStars(5, 10)).toBe(2);
    expect(calculateStars(2, 10)).toBe(1);
    expect(calculateStars(0, 10)).toBe(1);
  });

  test('validateQuestion detects valid and invalid configurations', () => {
    expect(validateQuestion(validQuestion).isValid).toBe(true);

    const missingPrompt = { ...validQuestion, prompt: '' };
    expect(validateQuestion(missingPrompt).isValid).toBe(false);

    const duplicateOptions: Question = {
      ...validQuestion,
      options: [
        { id: 'dup', label: '1' },
        { id: 'dup', label: '2' },
      ],
    };
    expect(validateQuestion(duplicateOptions).isValid).toBe(false);

    const nonMatchingCorrect: Question = {
      ...validQuestion,
      correctOptionId: 'non_existent',
    };
    expect(validateQuestion(nonMatchingCorrect).isValid).toBe(false);
  });

  test('getNextDifficulty progresses easy -> medium -> hard -> null', () => {
    expect(getNextDifficulty('easy')).toBe('medium');
    expect(getNextDifficulty('medium')).toBe('hard');
    expect(getNextDifficulty('hard')).toBeNull();
  });

  test('getDifficultyLabel returns friendly level names', () => {
    expect(getDifficultyLabel('easy')).toContain('Level 1');
    expect(getDifficultyLabel('medium')).toContain('Level 2');
    expect(getDifficultyLabel('hard')).toContain('Level 3');
  });
});
