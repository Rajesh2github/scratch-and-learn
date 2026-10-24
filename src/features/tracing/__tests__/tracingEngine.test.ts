import {
  NUMBER_CHARACTERS,
  LETTER_CHARACTERS,
} from '../tracingEngine';

describe('Tracing Engine', () => {
  test('NUMBER_CHARACTERS contains numbers 1 through 10', () => {
    expect(NUMBER_CHARACTERS).toHaveLength(10);
    NUMBER_CHARACTERS.forEach((item, index) => {
      expect(item.category).toBe('number');
      expect(item.char).toBeTruthy();
      expect(item.name).toBeTruthy();
      expect(item.emoji).toBeTruthy();
      expect(item.hint).toBeTruthy();
    });
    expect(NUMBER_CHARACTERS[0].char).toBe('1');
    expect(NUMBER_CHARACTERS[9].char).toBe('10');
  });

  test('LETTER_CHARACTERS contains letters A through Z', () => {
    expect(LETTER_CHARACTERS).toHaveLength(26);
    LETTER_CHARACTERS.forEach((item) => {
      expect(item.category).toBe('letter');
      expect(item.char).toHaveLength(1);
      expect(item.name).toBeTruthy();
      expect(item.emoji).toBeTruthy();
      expect(item.hint).toBeTruthy();
    });
    expect(LETTER_CHARACTERS[0].char).toBe('A');
    expect(LETTER_CHARACTERS[25].char).toBe('Z');
  });
});
