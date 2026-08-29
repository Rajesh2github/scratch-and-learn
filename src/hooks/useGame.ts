import { useState, useEffect, useCallback } from 'react';
import { Question, CategoryId } from '../types/game';
import { fruitsQuestions } from '../data/fruits';
import { alphabetsQuestions } from '../data/alphabets';
import { numbersQuestions } from '../data/numbers';
import { animalsQuestions } from '../data/animals';
import { colorsQuestions } from '../data/colors';
import { vegetablesQuestions } from '../data/vegetables';
import { vehiclesQuestions } from '../data/vehicles';
import { shapesQuestions } from '../data/shapes';
import { shuffleArray } from '../utils/shuffle';

export interface UseGameReturn {
  questions: Question[];
  currentQuestion: Question | null;
  currentIndex: number;
  totalQuestions: number;
  score: number;
  isComplete: boolean;
  selectedAnswer: string | null;
  wrongAttempts: string[];
  isCorrectSelected: boolean;
  hasScratchedEnough: boolean;
  setHasScratchedEnough: (val: boolean) => void;
  selectAnswer: (answer: string) => void;
  nextQuestion: () => void;
  resetGame: () => void;
}

export function useGame(category: CategoryId, maxQuestions = 10): UseGameReturn {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState<string[]>([]);
  const [isCorrectSelected, setIsCorrectSelected] = useState(false);
  const [hasScratchedEnough, setHasScratchedEnough] = useState(false);
  const [firstTryStatus, setFirstTryStatus] = useState<boolean>(true);

  // Initialize and shuffle questions
  const initGame = useCallback(() => {
    let sourceQuestions: Question[] = [];
    if (category === 'fruits') {
      sourceQuestions = [...fruitsQuestions];
    } else if (category === 'alphabets') {
      sourceQuestions = [...alphabetsQuestions];
    } else if (category === 'numbers') {
      sourceQuestions = [...numbersQuestions];
    } else if (category === 'animals') {
      sourceQuestions = [...animalsQuestions];
    } else if (category === 'colors') {
      sourceQuestions = [...colorsQuestions];
    } else if (category === 'vegetables') {
      sourceQuestions = [...vegetablesQuestions];
    } else if (category === 'vehicles') {
      sourceQuestions = [...vehiclesQuestions];
    } else if (category === 'shapes') {
      sourceQuestions = [...shapesQuestions];
    }

    // Gather all unique answers in this category pool to use as dynamic distractors
    const allCategoryAnswers = Array.from(
      new Set(sourceQuestions.map((q) => q.answer))
    );

    // Shuffle and pick up to maxQuestions
    const shuffledQuestions = shuffleArray(sourceQuestions)
      .slice(0, maxQuestions)
      .map((q) => {
        // Get candidates that are NOT the correct answer
        const candidates = allCategoryAnswers.filter((ans) => ans !== q.answer);
        // Randomly select 3 distractors from the candidates pool
        const distractors = shuffleArray(candidates).slice(0, 3);
        // Combine correct answer + distractors and shuffle them
        const dynamicOptions = shuffleArray([q.answer, ...distractors]);

        return {
          ...q,
          options: dynamicOptions,
        };
      });

    setQuestions(shuffledQuestions);
    setCurrentIndex(0);
    setScore(0);
    setIsComplete(false);
    setSelectedAnswer(null);
    setWrongAttempts([]);
    setIsCorrectSelected(false);
    setHasScratchedEnough(false);
    setFirstTryStatus(true);
  }, [category, maxQuestions]);

  useEffect(() => {
    initGame();
  }, [initGame]);

  const currentQuestion = questions[currentIndex] || null;

  const selectAnswer = useCallback(
    (answer: string) => {
      if (!currentQuestion || isCorrectSelected) return;

      setSelectedAnswer(answer);

      if (answer === currentQuestion.answer) {
        setIsCorrectSelected(true);
        if (firstTryStatus) {
          setScore((prev) => prev + 1);
        }
      } else {
        setWrongAttempts((prev) => [...prev, answer]);
        setFirstTryStatus(false);
      }
    },
    [currentQuestion, isCorrectSelected, firstTryStatus]
  );

  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedAnswer(null);
      setWrongAttempts([]);
      setIsCorrectSelected(false);
      setHasScratchedEnough(false);
      setFirstTryStatus(true);
    } else {
      setIsComplete(true);
    }
  }, [currentIndex, questions.length]);

  return {
    questions,
    currentQuestion,
    currentIndex,
    totalQuestions: questions.length,
    score,
    isComplete,
    selectedAnswer,
    wrongAttempts,
    isCorrectSelected,
    hasScratchedEnough,
    setHasScratchedEnough,
    selectAnswer,
    nextQuestion,
    resetGame: initGame,
  };
}
