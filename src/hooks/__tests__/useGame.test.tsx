import { renderHook, act } from '@testing-library/react-hooks';
import { useGame } from '../useGame';

describe('useGame Hook', () => {
  it('should initialize game state correctly', () => {
    const { result } = renderHook(() => useGame('fruits', 10));

    expect(result.current.questions).toHaveLength(10);
    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.currentQuestion).not.toBeNull();
    expect(result.current.selectedAnswer).toBeNull();
    expect(result.current.wrongAttempts).toEqual([]);
    expect(result.current.isCorrectSelected).toBe(false);
    expect(result.current.hasScratchedEnough).toBe(false);
  });

  it('should handle correct answer selection on first try', () => {
    const { result } = renderHook(() => useGame('fruits', 5));

    // Force scratch completion
    act(() => {
      result.current.setHasScratchedEnough(true);
    });
    expect(result.current.hasScratchedEnough).toBe(true);

    const question = result.current.currentQuestion!;
    const correctAnswer = question.answer;

    act(() => {
      result.current.selectAnswer(correctAnswer);
    });

    expect(result.current.isCorrectSelected).toBe(true);
    expect(result.current.selectedAnswer).toBe(correctAnswer);
    expect(result.current.score).toBe(1);
    expect(result.current.wrongAttempts).toEqual([]);
  });

  it('should handle wrong answer selection and then correct answer selection', () => {
    const { result } = renderHook(() => useGame('fruits', 5));

    const question = result.current.currentQuestion!;
    const correctAnswer = question.answer;
    const wrongAnswer = question.options.find((opt) => opt !== correctAnswer)!;

    // Scratch completed
    act(() => {
      result.current.setHasScratchedEnough(true);
    });

    // Select wrong answer
    act(() => {
      result.current.selectAnswer(wrongAnswer);
    });

    expect(result.current.isCorrectSelected).toBe(false);
    expect(result.current.selectedAnswer).toBe(wrongAnswer);
    expect(result.current.wrongAttempts).toContain(wrongAnswer);
    expect(result.current.score).toBe(0);

    // Select correct answer
    act(() => {
      result.current.selectAnswer(correctAnswer);
    });

    expect(result.current.isCorrectSelected).toBe(true);
    expect(result.current.selectedAnswer).toBe(correctAnswer);
    // Score should still be 0 because it was not correct on the FIRST try!
    expect(result.current.score).toBe(0);
  });

  it('should progress to the next question', () => {
    const { result } = renderHook(() => useGame('fruits', 5));

    act(() => {
      result.current.nextQuestion();
    });

    expect(result.current.currentIndex).toBe(1);
    expect(result.current.selectedAnswer).toBeNull();
    expect(result.current.wrongAttempts).toEqual([]);
    expect(result.current.isCorrectSelected).toBe(false);
    expect(result.current.hasScratchedEnough).toBe(false);
  });

  it('should complete the game after finishing all questions', () => {
    const { result } = renderHook(() => useGame('fruits', 2));

    // Question 1 -> 2
    act(() => {
      result.current.nextQuestion();
    });
    expect(result.current.isComplete).toBe(false);

    // Question 2 -> End
    act(() => {
      result.current.nextQuestion();
    });
    expect(result.current.isComplete).toBe(true);
  });

  it('should reset the game completely on resetGame', () => {
    const { result } = renderHook(() => useGame('fruits', 5));

    // Change state
    act(() => {
      result.current.setHasScratchedEnough(true);
      result.current.selectAnswer(result.current.currentQuestion!.answer);
      result.current.nextQuestion();
    });

    expect(result.current.currentIndex).toBe(1);

    // Reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.currentIndex).toBe(0);
    expect(result.current.score).toBe(0);
    expect(result.current.isComplete).toBe(false);
    expect(result.current.isCorrectSelected).toBe(false);
    expect(result.current.hasScratchedEnough).toBe(false);
  });
});
