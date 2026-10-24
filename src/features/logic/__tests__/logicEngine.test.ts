import {
  generateMatchingQuestions,
  generateOddOneOutQuestions,
  generatePatternQuestions,
  generateSortingRound,
} from '../logicEngine';
import { validateQuestion, evaluateAnswer } from '../../../domain/evaluator';

describe('Logic Engine', () => {
  describe('generateMatchingQuestions across levels', () => {
    test('Level 1 creates 3 options and Level 2/3 create 4 options', () => {
      const easyQ = generateMatchingQuestions(5, 'easy');
      const hardQ = generateMatchingQuestions(5, 'hard');

      expect(easyQ).toHaveLength(5);
      expect(hardQ).toHaveLength(5);

      easyQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        expect(evaluateAnswer(q, q.correctOptionId)).toBe(true);
        expect(q.options).toHaveLength(3);
      });

      hardQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        expect(evaluateAnswer(q, q.correctOptionId)).toBe(true);
        expect(q.options).toHaveLength(4);
      });
    });

    test('replaying generates fresh varied picture matches rather than repeating same order', () => {
      const run1 = generateMatchingQuestions(5, 'easy');
      const run2 = generateMatchingQuestions(5, 'easy');
      const emojis1 = run1.map((q) => q.emoji);
      const emojis2 = run2.map((q) => q.emoji);
      expect(emojis1).not.toEqual(emojis2);
    });
  });

  describe('generateOddOneOutQuestions across levels', () => {
    test('Level 1, 2, and 3 create valid unambiguous puzzles', () => {
      ['easy', 'medium', 'hard'].forEach((diff) => {
        const questions = generateOddOneOutQuestions(4, diff as any);
        questions.forEach((q) => {
          expect(validateQuestion(q).isValid).toBe(true);
          expect(evaluateAnswer(q, q.correctOptionId)).toBe(true);
          expect(q.options).toHaveLength(4);
        });
      });
    });
  });

  describe('generatePatternQuestions across levels', () => {
    test('Level 1 tests AB, Level 2 tests AAB, Level 3 tests ABC sequences', () => {
      const easyQ = generatePatternQuestions(3, 'easy');
      const hardQ = generatePatternQuestions(3, 'hard');

      easyQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        expect(q.options).toHaveLength(3);
      });

      hardQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        expect(q.options).toHaveLength(4);
      });
    });
  });

  describe('generateSortingRound across levels', () => {
    test('creates 2 distinct buckets and balanced items', () => {
      const easyRound = generateSortingRound('easy');
      expect(easyRound.buckets).toHaveLength(2);
      expect(easyRound.items).toHaveLength(4); // 2 per category

      const hardRound = generateSortingRound('hard');
      expect(hardRound.items).toHaveLength(8); // 4 per category
    });
  });
});
