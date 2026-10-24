import React from 'react';
import renderer, { act } from 'react-test-renderer';
import { TracingBoard } from '../TracingBoard';

// Mock Skia
jest.mock('@shopify/react-native-skia', () => ({
  Canvas: ({ children }: any) => children || null,
  Path: () => null,
  Skia: {
    Path: {
      Make: jest.fn(() => ({
        addPath: jest.fn(),
        moveTo: jest.fn(),
        lineTo: jest.fn(),
      })),
    },
  },
}));

// Mock sound manager
jest.mock('../../utils/audio', () => ({
  SoundManager: {
    playWord: jest.fn(),
    playSuccess: jest.fn(),
    stop: jest.fn(),
  },
}));

describe('TracingBoard Component', () => {
  const dummyItem = {
    char: 'A',
    name: 'Apple',
    emoji: '🍎',
    category: 'letter' as const,
    hint: 'A is for Apple!',
  };

  test('renders character, title, and buttons without crashing', async () => {
    let tree: any;
    await act(async () => {
      tree = renderer.create(
        <TracingBoard item={dummyItem} onNext={jest.fn()} />
      );
    });

    const root = tree.root;
    expect(root.findByProps({ children: '📢 Listen' })).toBeTruthy();
    expect(root.findByProps({ children: 'A is for Apple!' })).toBeTruthy();
    expect(root.findByProps({ children: '🔄 Clear' })).toBeTruthy();
  });
});
