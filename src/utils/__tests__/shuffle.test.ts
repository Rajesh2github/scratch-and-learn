import { shuffleArray } from '../shuffle';

describe('shuffleArray', () => {
  it('should return a new array with the same elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffleArray(original);

    // Should contain the exact same elements
    expect(shuffled).toHaveLength(original.length);
    expect(shuffled.sort()).toEqual(original.sort());

    // Should not mutate the original array
    expect(shuffled).not.toBe(original);
  });

  it('should shuffle elements (usually)', () => {
    // Note: with large enough arrays, shuffle chance of returning identical is negligible (1 in 10! for 10 elements)
    const original = Array.from({ length: 15 }, (_, i) => i);
    const shuffled = shuffleArray(original);

    // Highly likely to be shuffled
    expect(shuffled).not.toEqual(original);
  });
});
