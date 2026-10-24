import { Question, Difficulty, AnswerOption } from '../../domain/types';
import { shuffleArray } from '../../utils/shuffle';

export const ANIMAL_ITEMS = [
  { id: 'dog', name: 'Dog', emoji: '🐶' },
  { id: 'cat', name: 'Cat', emoji: '🐱' },
  { id: 'lion', name: 'Lion', emoji: '🦁' },
  { id: 'monkey', name: 'Monkey', emoji: '🐵' },
  { id: 'panda', name: 'Panda', emoji: '🐼' },
  { id: 'elephant', name: 'Elephant', emoji: '🐘' },
  { id: 'rabbit', name: 'Rabbit', emoji: '🐰' },
  { id: 'bear', name: 'Bear', emoji: '🐻' },
  { id: 'frog', name: 'Frog', emoji: '🐸' },
  { id: 'pig', name: 'Pig', emoji: '🐷' },
  { id: 'cow', name: 'Cow', emoji: '🐮' },
  { id: 'tiger', name: 'Tiger', emoji: '🐯' },
];

export const FRUIT_ITEMS = [
  { id: 'apple', name: 'Apple', emoji: '🍎' },
  { id: 'banana', name: 'Banana', emoji: '🍌' },
  { id: 'grapes', name: 'Grapes', emoji: '🍇' },
  { id: 'strawberry', name: 'Strawberry', emoji: '🍓' },
  { id: 'orange', name: 'Orange', emoji: '🍊' },
  { id: 'watermelon', name: 'Watermelon', emoji: '🍉' },
  { id: 'pineapple', name: 'Pineapple', emoji: '🍍' },
  { id: 'cherries', name: 'Cherries', emoji: '🍒' },
];

export const VEHICLE_ITEMS = [
  { id: 'car', name: 'Car', emoji: '🚗' },
  { id: 'bus', name: 'Bus', emoji: '🚌' },
  { id: 'airplane', name: 'Airplane', emoji: '✈️' },
  { id: 'train', name: 'Train', emoji: '🚂' },
  { id: 'rocket', name: 'Rocket', emoji: '🚀' },
  { id: 'boat', name: 'Boat', emoji: '⛵' },
  { id: 'helicopter', name: 'Helicopter', emoji: '🚁' },
  { id: 'fire_truck', name: 'Fire Truck', emoji: '🚒' },
];

export const SEA_CREATURES = [
  { id: 'fish', name: 'Fish', emoji: '🐟' },
  { id: 'whale', name: 'Whale', emoji: '🐳' },
  { id: 'dolphin', name: 'Dolphin', emoji: '🐬' },
  { id: 'octopus', name: 'Octopus', emoji: '🐙' },
  { id: 'crab', name: 'Crab', emoji: '🦀' },
];

export const SWEETS_ITEMS = [
  { id: 'icecream', name: 'Ice Cream', emoji: '🍦' },
  { id: 'cookie', name: 'Cookie', emoji: '🍪' },
  { id: 'donut', name: 'Donut', emoji: '🍩' },
  { id: 'cake', name: 'Cake', emoji: '🍰' },
  { id: 'lollipop', name: 'Lollipop', emoji: '🍭' },
];

/**
 * 1. Picture Matching
 */
export function generateMatchingQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];
  const allCategoryPools = [ANIMAL_ITEMS, FRUIT_ITEMS, VEHICLE_ITEMS, SEA_CREATURES, SWEETS_ITEMS];
  const allItems = allCategoryPools.flat();
  const numOptions = difficulty === 'easy' ? 3 : 4;

  const shuffledAll = shuffleArray(allItems);

  for (let i = 0; i < count; i++) {
    const target = shuffledAll[i % shuffledAll.length];

    let distractors: typeof allItems;
    if (difficulty === 'hard') {
      const sameCategory = allCategoryPools.find((pool) => pool.some((it) => it.id === target.id)) || allItems;
      const filtered = sameCategory.filter((it) => it.id !== target.id);
      distractors = shuffleArray(filtered).slice(0, numOptions - 1);
      if (distractors.length < numOptions - 1) {
        const others = allItems.filter((it) => it.id !== target.id && !distractors.some((d) => d.id === it.id));
        distractors = [...distractors, ...shuffleArray(others).slice(0, numOptions - 1 - distractors.length)];
      }
    } else {
      const otherItems = allItems.filter((item) => item.id !== target.id);
      distractors = shuffleArray(otherItems).slice(0, numOptions - 1);
    }

    const options: AnswerOption[] = shuffleArray([
      { id: `opt_${target.id}`, label: `${target.emoji} ${target.name}`, emoji: target.emoji },
      ...distractors.map((d) => ({
        id: `opt_${d.id}`,
        label: `${d.emoji} ${d.name}`,
        emoji: d.emoji,
      })),
    ]);

    questions.push({
      id: `logic-matching-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'logic-matching',
      prompt: `Find the matching ${target.name.toLowerCase()}!`,
      emoji: target.emoji,
      options,
      correctOptionId: `opt_${target.id}`,
      hint: `Look for the card that looks just like the ${target.name}!`,
      visualData: {
        type: 'matching',
        items: [target.emoji],
      },
    });
  }

  return questions;
}

/**
 * 2. Odd One Out
 */
export function generateOddOneOutQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];

  const easyCategoryPairs = [
    { name: 'Fruits', items: FRUIT_ITEMS, intruderPool: VEHICLE_ITEMS },
    { name: 'Animals', items: ANIMAL_ITEMS, intruderPool: FRUIT_ITEMS },
    { name: 'Vehicles', items: VEHICLE_ITEMS, intruderPool: ANIMAL_ITEMS },
    { name: 'Sweets', items: SWEETS_ITEMS, intruderPool: VEHICLE_ITEMS },
  ];

  const mediumCategoryPairs = [
    { name: 'Fruits', items: FRUIT_ITEMS, intruderPool: SWEETS_ITEMS },
    { name: 'Vehicles', items: VEHICLE_ITEMS, intruderPool: SEA_CREATURES },
    { name: 'Animals', items: ANIMAL_ITEMS, intruderPool: SEA_CREATURES },
  ];

  const hardCategoryPairs = [
    { name: 'Sea Animals', items: SEA_CREATURES, intruderPool: ANIMAL_ITEMS },
    { name: 'Desserts', items: SWEETS_ITEMS, intruderPool: FRUIT_ITEMS },
    { name: 'Land Animals', items: ANIMAL_ITEMS, intruderPool: SEA_CREATURES },
  ];

  const pool =
    difficulty === 'easy'
      ? easyCategoryPairs
      : difficulty === 'medium'
      ? mediumCategoryPairs
      : hardCategoryPairs;

  const shuffledPairs = shuffleArray(pool);

  for (let i = 0; i < count; i++) {
    const pair = shuffledPairs[i % shuffledPairs.length];
    const selectedGroup = shuffleArray(pair.items).slice(0, 3);
    const intruder = shuffleArray(pair.intruderPool)[0];

    const allPicks = shuffleArray([...selectedGroup, intruder]);

    const options: AnswerOption[] = allPicks.map((pick) => ({
      id: `opt_${pick.id}`,
      label: `${pick.emoji} ${pick.name}`,
      emoji: pick.emoji,
    }));

    questions.push({
      id: `logic-odd-one-out-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'logic-odd-one-out',
      prompt: `Which one does not belong?`,
      options,
      correctOptionId: `opt_${intruder.id}`,
      hint: `Three of these belong to the same family! Which one is different?`,
      visualData: {
        type: 'odd-one-out',
        items: allPicks.map((p) => p.emoji),
      },
    });
  }

  return questions;
}

/**
 * 3. Patterns
 */
export function generatePatternQuestions(
  count: number = 5,
  difficulty: Difficulty = 'easy'
): Question[] {
  const questions: Question[] = [];
  const palettes = [
    ['🍎', '🍌', '🍇'],
    ['⭐', '🌙', '☀️'],
    ['🐶', '🐱', '🐰'],
    ['🔴', '🔵', '🟢'],
    ['🚗', '✈️', '⛵'],
    ['🌸', '🌻', '🌷'],
    ['🍦', '🍩', '🍪'],
    ['⚽', '🏀', '🎾'],
    ['🎈', '🎁', '🎉'],
    ['🦁', '🐵', '🐼'],
  ];

  const shuffledPalettes = shuffleArray(palettes);

  for (let i = 0; i < count; i++) {
    const palette = shuffledPalettes[i % shuffledPalettes.length];
    const [A, B, C] = palette;

    let sequence: string[];
    let missingItem: string;
    let distractorOptions: string[];

    if (difficulty === 'easy') {
      sequence = [A, B, A, B, A];
      missingItem = B;
      distractorOptions = [A, C];
    } else if (difficulty === 'medium') {
      const isAAB = i % 2 === 0;
      if (isAAB) {
        sequence = [A, A, B, A, A];
        missingItem = B;
      } else {
        sequence = [A, B, B, A, B];
        missingItem = B;
      }
      distractorOptions = [A, C];
    } else {
      sequence = [A, B, C, A, B];
      missingItem = C;
      const extraDistractor = ['💎', '🍓', '🚀', '🦄'][i % 4];
      distractorOptions = [A, B, extraDistractor];
    }

    const options: AnswerOption[] = shuffleArray([
      { id: `opt_correct_${i}`, label: missingItem, emoji: missingItem },
      ...distractorOptions.map((item, idx) => ({
        id: `opt_dist_${i}_${idx}`,
        label: item,
        emoji: item,
      })),
    ]);

    questions.push({
      id: `logic-patterns-${difficulty}-${i}-${Date.now()}-${Math.random()}`,
      gameId: 'logic-patterns',
      prompt: `What comes next in the pattern?`,
      options,
      correctOptionId: `opt_correct_${i}`,
      hint: `Say the pattern out loud to hear the rhythm!`,
      visualData: {
        type: 'pattern',
        patternSequence: [...sequence, null],
      },
    });
  }

  return questions;
}

/**
 * 4. Sorting Game Engine:
 * Generates rounds where items must be sorted into 2 distinct buckets.
 */
export interface SortingBucket {
  id: string;
  name: string;
  emoji: string;
  color: string;
}

export interface SortableItem {
  id: string;
  name: string;
  emoji: string;
  bucketId: string;
}

export interface SortingRound {
  id: string;
  title: string;
  buckets: [SortingBucket, SortingBucket];
  items: SortableItem[];
}

export function generateSortingRound(difficulty: Difficulty = 'easy'): SortingRound {
  const themes = [
    {
      title: 'Animals vs Food',
      bucketA: { id: 'animals', name: 'Animals', emoji: '🐶', color: '#6BCB77' },
      itemsA: ANIMAL_ITEMS,
      bucketB: { id: 'food', name: 'Yummy Food', emoji: '🍎', color: '#FF6B6B' },
      itemsB: [...FRUIT_ITEMS, ...SWEETS_ITEMS],
    },
    {
      title: 'Land vs Sky/Water',
      bucketA: { id: 'vehicles', name: 'Vehicles', emoji: '🚗', color: '#4D96FF' },
      itemsA: VEHICLE_ITEMS,
      bucketB: { id: 'sea', name: 'Sea Animals', emoji: '🐬', color: '#00D2D3' },
      itemsB: SEA_CREATURES,
    },
    {
      title: 'Healthy Fruits vs Sweet Treats',
      bucketA: { id: 'fruits', name: 'Fruits', emoji: '🍓', color: '#FF9F43' },
      itemsA: FRUIT_ITEMS,
      bucketB: { id: 'sweets', name: 'Sweet Treats', emoji: '🍦', color: '#A855F7' },
      itemsB: SWEETS_ITEMS,
    },
  ];

  const pickedTheme = shuffleArray(themes)[0];
  const itemsPerCategory = difficulty === 'easy' ? 2 : difficulty === 'medium' ? 3 : 4;

  const sampleA = shuffleArray(pickedTheme.itemsA).slice(0, itemsPerCategory);
  const sampleB = shuffleArray(pickedTheme.itemsB).slice(0, itemsPerCategory);

  const items: SortableItem[] = shuffleArray([
    ...sampleA.map((it) => ({
      id: `sort_${it.id}`,
      name: it.name,
      emoji: it.emoji,
      bucketId: pickedTheme.bucketA.id,
    })),
    ...sampleB.map((it) => ({
      id: `sort_${it.id}`,
      name: it.name,
      emoji: it.emoji,
      bucketId: pickedTheme.bucketB.id,
    })),
  ]);

  return {
    id: `sort_round_${Date.now()}`,
    title: pickedTheme.title,
    buckets: [pickedTheme.bucketA, pickedTheme.bucketB],
    items,
  };
}
