import {
  generateCountingQuestions,
  generateAdditionQuestions,
  generateSubtractionQuestions,
} from '../mathEngine';
import { validateQuestion, evaluateAnswer } from '../../../domain/evaluator';

describe('Math Engine', () => {
  describe('generateCountingQuestions across all levels', () => {
    test('Level 1 (easy) generates 1-5 objects', () => {
      const questions = generateCountingQuestions(5, 'easy');
      expect(questions).toHaveLength(5);
      questions.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        expect(evaluateAnswer(q, q.correctOptionId)).toBe(true);
        const count = q.visualData?.items?.length || 0;
        expect(count).toBeGreaterThanOrEqual(1);
        expect(count).toBeLessThanOrEqual(5);
        expect(q.options).toHaveLength(3);
      });
    });

    test('Level 2 (medium) generates 4-10 objects', () => {
      const questions = generateCountingQuestions(5, 'medium');
      expect(questions).toHaveLength(5);
      questions.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        const count = q.visualData?.items?.length || 0;
        expect(count).toBeGreaterThanOrEqual(4);
        expect(count).toBeLessThanOrEqual(10);
        expect(q.options).toHaveLength(4);
      });
    });

    test('Level 3 (hard) generates 8-15 objects', () => {
      const questions = generateCountingQuestions(5, 'hard');
      expect(questions).toHaveLength(5);
      questions.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        const count = q.visualData?.items?.length || 0;
        expect(count).toBeGreaterThanOrEqual(8);
        expect(count).toBeLessThanOrEqual(15);
        expect(q.options).toHaveLength(4);
      });
    });

    test('replaying generates fresh varied questions rather than exact repeats', () => {
      const run1 = generateCountingQuestions(5, 'easy');
      const run2 = generateCountingQuestions(5, 'easy');
      const items1 = run1.map((q) => q.prompt);
      const items2 = run2.map((q) => q.prompt);
      // Because we have 30 objects and shuffle them, prompts won't be identical in order
      expect(items1).not.toEqual(items2);
    });
  });

  describe('generateAdditionQuestions across levels', () => {
    test('Level 1 sums small numbers, Level 3 sums larger numbers', () => {
      const easyQ = generateAdditionQuestions(5, 'easy');
      const hardQ = generateAdditionQuestions(5, 'hard');

      easyQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        const sum = (q.visualData?.group1?.length || 0) + (q.visualData?.group2?.length || 0);
        expect(sum).toBeLessThanOrEqual(7);
      });

      hardQ.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        const sum = (q.visualData?.group1?.length || 0) + (q.visualData?.group2?.length || 0);
        expect(sum).toBeGreaterThanOrEqual(7);
      });
    });
  });

  describe('generateSubtractionQuestions across levels', () => {
    test('always produces positive remaining answers', () => {
      const questions = generateSubtractionQuestions(5, 'easy');
      questions.forEach((q) => {
        expect(validateQuestion(q).isValid).toBe(true);
        const total = q.visualData?.group1?.length || 0;
        const sub = q.visualData?.group2?.length || 0;
        expect(total - sub).toBeGreaterThan(0);
        expect(q.correctOptionId).toBe(`opt_${total - sub}`);
      });
    });
  });
});
