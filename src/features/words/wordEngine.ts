import { Question, Difficulty, AnswerOption } from '../../domain/types';
import { animalsQuestions } from '../../data/animals';
import { fruitsQuestions } from '../../data/fruits';
import { vehiclesQuestions } from '../../data/vehicles';
import { vegetablesQuestions } from '../../data/vegetables';
import { shuffleArray } from '../../utils/shuffle';

export interface VocabularyItem {
  id: string;
  word: string;
  emoji: string;
  category: string;
}

export const ALL_VOCABULARY: VocabularyItem[] = [
  ...animalsQuestions.map((q) => ({
    id: `anim_${q.id}`,
    word: q.answer,
    emoji: q.emoji,
    category: 'Animals',
  })),
  ...fruitsQuestions.map((q) => ({
    id: `fruit_${q.id}`,
    word: q.answer,
    emoji: q.emoji,
    category: 'Fruits',
  })),
  ...vehiclesQuestions.map((q) => ({
    id: `veh_${q.id}`,
    word: q.answer,
    emoji: q.emoji,
    category: 'Vehicles',
  })),
  ...vegetablesQuestions.map((q) => ({
    id: `veg_${q.id}`,
    word: q.answer,
    emoji: q.emoji,
    category: 'Vegetables',
  })),
];

/**
 * 1. Listen and Choose:
 * - Level 1 (easy): 3 options, distinct categories
 * - Level 2 (medium): 4 options, mixed pool
 * - Level 3 (hard): 4 options from SAME category (e.g. hear "Tiger", choose between Lion, Tiger, Leopard, Cheetah)
 */
export function generateListenAndChooseQuestions(
  count: number = 6,
  difficulty: Difficulty = 'easy'
): Question[] {
  const shuffledVocab = shuffleArray(ALL_VOCABULARY);
  const questions: Question[] = [];
  const numOptions = difficulty === 'easy' ? 3 : 4;

  for (let i = 0; i < Math.min(count, shuffledVocab.length); i++) {
    const target = shuffledVocab[i];

    let distractors: VocabularyItem[];
    if (difficulty === 'hard') {
      // Pick distractors from same category if available
      const sameCategory = ALL_VOCABULARY.filter(
        (item) => item.category === target.category && item.id !== target.id
      );
      distractors = shuffleArray(sameCategory).slice(0, numOptions - 1);
      if (distractors.length < numOptions - 1) {
        const others = ALL_VOCABULARY.filter(
          (item) => item.id !== target.id && !distractors.some((d) => d.id === item.id)
        );
        distractors = [...distractors, ...shuffleArray(others).slice(0, numOptions - 1 - distractors.length)];
      }
    } else {
      const otherItems = ALL_VOCABULARY.filter((item) => item.id !== target.id);
      distractors = shuffleArray(otherItems).slice(0, numOptions - 1);
    }

    const options: AnswerOption[] = shuffleArray([
      { id: `opt_${target.id}`, label: `${target.emoji} ${target.word}`, emoji: target.emoji },
      ...distractors.map((d) => ({
        id: `opt_${d.id}`,
        label: `${d.emoji} ${d.word}`,
        emoji: d.emoji,
      })),
    ]);

    questions.push({
      id: `words-listen-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'words-listen-and-choose',
      prompt: `Find the ${target.word}!`,
      options,
      correctOptionId: `opt_${target.id}`,
      emoji: '🎧',
      hint: `Tap "Listen" to hear the word again!`,
      visualData: {
        type: 'word',
        targetWord: target.word,
      },
    });
  }

  return questions;
}

/**
 * 2. Tap and Hear:
 * - Level 1 (easy): 2 options
 * - Level 2 (medium): 3 options
 * - Level 3 (hard): 4 options
 */
export function generateTapAndHearQuestions(
  count: number = 6,
  difficulty: Difficulty = 'easy'
): Question[] {
  const shuffledVocab = shuffleArray(ALL_VOCABULARY);
  const questions: Question[] = [];
  const numOptions = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

  for (let i = 0; i < Math.min(count, shuffledVocab.length); i++) {
    const target = shuffledVocab[i];
    const otherItems = ALL_VOCABULARY.filter((item) => item.id !== target.id);
    const distractors = shuffleArray(otherItems).slice(0, numOptions - 1);

    const options: AnswerOption[] = shuffleArray([
      { id: `opt_${target.id}`, label: target.word, emoji: target.emoji },
      ...distractors.map((d) => ({
        id: `opt_${d.id}`,
        label: d.word,
        emoji: d.emoji,
      })),
    ]);

    questions.push({
      id: `words-tap-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'words-tap-and-hear',
      prompt: `What word is this?`,
      options,
      correctOptionId: `opt_${target.id}`,
      emoji: target.emoji,
      hint: `Look at the picture: ${target.emoji}`,
      visualData: {
        type: 'word',
        targetWord: target.word,
      },
    });
  }

  return questions;
}
