import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { GameShell } from '../GameShell';
import { Question, Difficulty } from '../../domain/types';

// Mock expo-router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    replace: jest.fn(),
    push: jest.fn(),
  }),
}));

// Mock react-native-confetti-cannon
jest.mock('react-native-confetti-cannon', () => 'ConfettiCannon');

// Mock ScratchCard (skia canvas)
jest.mock('../ScratchCard', () => ({
  ScratchCard: ({ children }: any) => children || null,
}));

// Mock expo-av and expo-speech through SoundManager
jest.mock('../../utils/audio', () => ({
  SoundManager: {
    init: jest.fn().mockResolvedValue(undefined),
    getMuted: jest.fn().mockReturnValue(false),
    setMuted: jest.fn().mockResolvedValue(undefined),
    playSuccess: jest.fn().mockResolvedValue(undefined),
    playWrong: jest.fn().mockResolvedValue(undefined),
    playWord: jest.fn().mockResolvedValue(undefined),
    stop: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('GameShell Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  const dummyQuestions: Question[] = [
    {
      id: 'q1',
      gameId: 'test-game',
      prompt: 'Pick the apple',
      options: [
        { id: 'opt_1', label: 'Apple' },
        { id: 'opt_2', label: 'Banana' },
      ],
      correctOptionId: 'opt_1',
      emoji: '🍎',
    },
  ];

  test('renders prompt and options correctly with static questions', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <GameShell
          title="Fruit Test"
          categoryName="Testing"
          questions={dummyQuestions}
        />
      );
    });

    const root = tree.root;
    expect(root.findByProps({ children: 'Pick the apple' })).toBeTruthy();
    expect(root.findByProps({ children: 'Apple' })).toBeTruthy();
    expect(root.findByProps({ children: 'Banana' })).toBeTruthy();
  });

  test('calls getQuestions with difficulty and renders level selector chips', async () => {
    const mockGetQuestions = jest.fn((diff: Difficulty) => [
      {
        id: `q_${diff}`,
        gameId: 'dynamic-game',
        prompt: `Dynamic prompt for ${diff}`,
        options: [
          { id: 'opt_1', label: 'Choice 1' },
          { id: 'opt_2', label: 'Choice 2' },
        ],
        correctOptionId: 'opt_1',
      },
    ]);

    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <GameShell
          title="Dynamic Game"
          categoryName="Math"
          initialDifficulty="easy"
          getQuestions={mockGetQuestions}
        />
      );
    });

    expect(mockGetQuestions).toHaveBeenCalledWith('easy');
    const root = tree.root;
    expect(root.findByProps({ children: 'Dynamic prompt for easy' })).toBeTruthy();
    // Check level chip labels
    expect(root.findAllByProps({ children: 'Level 1 ⭐' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ children: 'Level 2 ⭐⭐' }).length).toBeGreaterThan(0);
    expect(root.findAllByProps({ children: 'Level 3 ⭐⭐⭐' }).length).toBeGreaterThan(0);
  });
});
