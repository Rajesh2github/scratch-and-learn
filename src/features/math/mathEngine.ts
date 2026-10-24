import { Question, Difficulty, AnswerOption } from '../../domain/types';
import { shuffleArray } from '../../utils/shuffle';

export const COUNTING_OBJECTS = [
  { name: 'apples', emoji: '🍎' },
  { name: 'bananas', emoji: '🍌' },
  { name: 'stars', emoji: '⭐' },
  { name: 'cars', emoji: '🚗' },
  { name: 'puppies', emoji: '🐶' },
  { name: 'balloons', emoji: '🎈' },
  { name: 'strawberries', emoji: '🍓' },
  { name: 'ducks', emoji: '🦆' },
  { name: 'butterflies', emoji: '🦋' },
  { name: 'fish', emoji: '🐟' },
  { name: 'kittens', emoji: '🐱' },
  { name: 'pandas', emoji: '🐼' },
  { name: 'frogs', emoji: '🐸' },
  { name: 'rabbits', emoji: '🐰' },
  { name: 'ice creams', emoji: '🍦' },
  { name: 'cookies', emoji: '🍪' },
  { name: 'cupcakes', emoji: '🧁' },
  { name: 'rockets', emoji: '🚀' },
  { name: 'soccer balls', emoji: '⚽' },
  { name: 'gifts', emoji: '🎁' },
  { name: 'flowers', emoji: '🌸' },
  { name: 'unicorns', emoji: '🦄' },
  { name: 'dinosaurs', emoji: '🦖' },
  { name: 'watermelons', emoji: '🍉' },
  { name: 'oranges', emoji: '🍊' },
  { name: 'cherries', emoji: '🍒' },
  { name: 'airplanes', emoji: '✈️' },
  { name: 'boats', emoji: '⛵' },
  { name: 'candies', emoji: '🍬' },
  { name: 'lollipops', emoji: '🍭' },
];

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Creates distractors around the correct number, ensuring unique positive values.
 */
function generateNumberOptions(
  correctNumber: number,
  optionsCount: number = 3,
  minPossible: number = 1,
  maxPossible: number = 15
): AnswerOption[] {
  const optionsSet = new Set<number>([correctNumber]);

  let attempts = 0;
  while (optionsSet.size < optionsCount && attempts < 50) {
    attempts++;
    const delta = getRandomInt(-3, 3);
    const candidate = correctNumber + delta;
    if (candidate >= minPossible && candidate <= maxPossible && candidate !== correctNumber) {
      optionsSet.add(candidate);
    }
  }

  // Fallback if needed
  let fallbackVal = Math.max(minPossible, 1);
  while (optionsSet.size < optionsCount) {
    if (!optionsSet.has(fallbackVal)) {
      optionsSet.add(fallbackVal);
    }
    fallbackVal++;
  }

  const shuffledNumbers = shuffleArray(Array.from(optionsSet));
  return shuffledNumbers.map((num) => ({
    id: `opt_${num}`,
    label: num.toString(),
  }));
}

/**
 * Generates counting questions with progressive difficulty:
 * - Level 1 (easy): 1 to 5 objects, 3 options
 * - Level 2 (medium): 4 to 10 objects, 4 options
 * - Level 3 (hard): 8 to 15 objects, 4 options
 */
export function generateCountingQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];
  const minNum = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 4 : 8;
  const maxNum = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 10 : 15;
  const numOptions = difficulty === 'easy' ? 3 : 4;

  // Shuffle pool so every replay has completely new objects
  const shuffledPool = shuffleArray(COUNTING_OBJECTS);

  // Generate unique target counts to avoid consecutive repeats
  const possibleNumbers = [];
  for (let n = minNum; n <= maxNum; n++) {
    possibleNumbers.push(n);
  }
  const shuffledNumbers = shuffleArray(possibleNumbers);

  for (let i = 0; i < count; i++) {
    const obj = shuffledPool[i % shuffledPool.length];
    // Pick unique target count where available
    const targetCount = i < shuffledNumbers.length ? shuffledNumbers[i] : getRandomInt(minNum, maxNum);
    const items = Array(targetCount).fill(obj.emoji);

    const options = generateNumberOptions(targetCount, numOptions, Math.max(1, minNum - 2), maxNum + 3);

    questions.push({
      id: `math-counting-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'math-counting',
      prompt: `How many ${obj.name} do you see?`,
      options,
      correctOptionId: `opt_${targetCount}`,
      emoji: obj.emoji,
      hint: `Try counting one by one: 1, 2, 3...`,
      visualData: {
        type: 'counter',
        items,
      },
    });
  }

  return questions;
}

/**
 * Generates addition questions with progressive difficulty:
 * - Level 1 (easy): 1-3 + 1-3 (sums 2-6), 3 options
 * - Level 2 (medium): 2-5 + 2-5 (sums 4-10), 4 options
 * - Level 3 (hard): 4-8 + 3-7 (sums 7-15), 4 options
 */
export function generateAdditionQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];
  const minAddend = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 4;
  const maxAddend = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 5 : 8;
  const numOptions = difficulty === 'easy' ? 3 : 4;

  const shuffledPool = shuffleArray(COUNTING_OBJECTS);
  const usedSums = new Set<number>();

  for (let i = 0; i < count; i++) {
    const obj = shuffledPool[i % shuffledPool.length];
    let n1 = getRandomInt(minAddend, maxAddend);
    let n2 = getRandomInt(minAddend, maxAddend);
    let sum = n1 + n2;

    // Try to find a distinct sum
    let attempts = 0;
    while (usedSums.has(sum) && attempts < 10) {
      n1 = getRandomInt(minAddend, maxAddend);
      n2 = getRandomInt(minAddend, maxAddend);
      sum = n1 + n2;
      attempts++;
    }
    usedSums.add(sum);

    const group1 = Array(n1).fill(obj.emoji);
    const group2 = Array(n2).fill(obj.emoji);
    const options = generateNumberOptions(sum, numOptions, minAddend * 2, maxAddend * 2 + 2);

    questions.push({
      id: `math-addition-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'math-addition',
      prompt: `Add them together! How many in total?`,
      options,
      correctOptionId: `opt_${sum}`,
      emoji: obj.emoji,
      hint: `Count the first group (${n1}), then count the next group (${n2})!`,
      visualData: {
        type: 'addition',
        group1,
        group2,
        operator: '+',
      },
    });
  }

  return questions;
}

/**
 * Generates subtraction questions with progressive difficulty:
 * - Level 1 (easy): total 3-6, takeAway 1-3 (remainders 1-5), 3 options
 * - Level 2 (medium): total 6-10, takeAway 2-5 (remainders 2-8), 4 options
 * - Level 3 (hard): total 9-15, takeAway 3-7 (remainders 3-12), 4 options
 */
export function generateSubtractionQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];
  const minTotal = difficulty === 'easy' ? 3 : difficulty === 'medium' ? 6 : 9;
  const maxTotal = difficulty === 'easy' ? 6 : difficulty === 'medium' ? 10 : 15;
  const numOptions = difficulty === 'easy' ? 3 : 4;

  const shuffledPool = shuffleArray(COUNTING_OBJECTS);
  const usedRemainders = new Set<number>();

  for (let i = 0; i < count; i++) {
    const obj = shuffledPool[i % shuffledPool.length];
    let total = getRandomInt(minTotal, maxTotal);
    let takeAway = getRandomInt(1, total - 1);
    let remaining = total - takeAway;

    let attempts = 0;
    while (usedRemainders.has(remaining) && attempts < 10) {
      total = getRandomInt(minTotal, maxTotal);
      takeAway = getRandomInt(1, total - 1);
      remaining = total - takeAway;
      attempts++;
    }
    usedRemainders.add(remaining);

    const group1 = Array(total).fill(obj.emoji);
    const group2 = Array(takeAway).fill(obj.emoji);
    const options = generateNumberOptions(remaining, numOptions, 1, maxTotal);

    questions.push({
      id: `math-subtraction-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'math-subtraction',
      prompt: `Take some away! How many are left?`,
      options,
      correctOptionId: `opt_${remaining}`,
      emoji: obj.emoji,
      hint: `We started with ${total} and took away ${takeAway}!`,
      visualData: {
        type: 'subtraction',
        group1,
        group2,
        operator: '-',
      },
    });
  }

  return questions;
}
