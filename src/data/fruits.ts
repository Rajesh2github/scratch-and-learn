import { Question } from '../types/game';

export const fruitsQuestions: Question[] = [
  {
    id: 'apple',
    category: 'fruits',
    answer: 'Apple',
    emoji: '🍎',
    // To use local image in the future:
    // image: require('@/assets/images/fruits/apple.png'),
    options: ['Apple', 'Banana', 'Mango', 'Orange'],
  },
  {
    id: 'banana',
    category: 'fruits',
    answer: 'Banana',
    emoji: '🍌',
    options: ['Banana', 'Watermelon', 'Strawberry', 'Kiwi'],
  },
  {
    id: 'mango',
    category: 'fruits',
    answer: 'Mango',
    emoji: '🥭',
    options: ['Mango', 'Pineapple', 'Grapes', 'Blueberry'],
  },
  {
    id: 'orange',
    category: 'fruits',
    answer: 'Orange',
    emoji: '🍊',
    options: ['Orange', 'Apple', 'Kiwi', 'Banana'],
  },
  {
    id: 'watermelon',
    category: 'fruits',
    answer: 'Watermelon',
    emoji: '🍉',
    options: ['Watermelon', 'Strawberry', 'Mango', 'Blueberry'],
  },
  {
    id: 'strawberry',
    category: 'fruits',
    answer: 'Strawberry',
    emoji: '🍓',
    options: ['Strawberry', 'Grapes', 'Apple', 'Pineapple'],
  },
  {
    id: 'pineapple',
    category: 'fruits',
    answer: 'Pineapple',
    emoji: '🍍',
    options: ['Pineapple', 'Kiwi', 'Orange', 'Watermelon'],
  },
  {
    id: 'grapes',
    category: 'fruits',
    answer: 'Grapes',
    emoji: '🍇',
    options: ['Grapes', 'Banana', 'Blueberry', 'Mango'],
  },
  {
    id: 'blueberry',
    category: 'fruits',
    answer: 'Blueberry',
    emoji: '🫐',
    options: ['Blueberry', 'Kiwi', 'Orange', 'Strawberry'],
  },
  {
    id: 'kiwi',
    category: 'fruits',
    answer: 'Kiwi',
    emoji: '🥝',
    options: ['Kiwi', 'Grapes', 'Banana', 'Apple'],
  },
];
