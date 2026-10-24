import {
  generateListenAndChooseQuestions,
  generateTapAndHearQuestions,
  ALL_VOCABULARY,
} from '../wordEngine';
import { validateQuestion, evaluateAnswer } from '../../../domain/evaluator';

describe('Word Engine', () => {
  test('ALL_VOCABULARY contains rich words with emojis and categories', () => {
    expect(ALL_VOCABULARY.length).toBeGreaterThanOrEqual(30);
    ALL_VOCABULARY.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.word).toBeTruthy();
      expect(item.emoji).toBeTruthy();
    });
  });

  describe('generateListenAndChooseQuestions across levels', () => {
    test('Level 1 generates 3 options and Level 2/3 generate 4 options', () => {
      const easyQ = generateListenAndChooseQuestions(5, 'easy');
      const hardQ = generateListenAndChooseQuestions(5, 'hard');

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

    test('replaying generates fresh vocabulary words rather than identical repeat', () => {
      const run1 = generateListenAndChooseQuestions(5, 'easy');
      const run2 = generateListenAndChooseQuestions(5, 'easy');
      const words1 = run1.map((q) => q.prompt);
      const words2 = run2.map((q) => q.prompt);
      expect(words1).not.toEqual(words2);
    });
  });

  describe('generateTapAndHearQuestions across levels', () => {
    test('scales option count from 2 to 4 as level increases', () => {
      const easyQ = generateTapAndHearQuestions(3, 'easy');
      const medQ = generateTapAndHearQuestions(3, 'medium');
      const hardQ = generateTapAndHearQuestions(3, 'hard');

      expect(easyQ[0].options).toHaveLength(2);
      expect(medQ[0].options).toHaveLength(3);
      expect(hardQ[0].options).toHaveLength(4);
    });
  });
});
