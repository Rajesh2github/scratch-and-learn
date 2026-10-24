import { safeStorage } from '../safeStorage';

describe('safeStorage', () => {
  beforeEach(async () => {
    await safeStorage.clear();
  });

  test('setItem and getItem store and retrieve data', async () => {
    await safeStorage.setItem('test_key', 'hello_world');
    const val = await safeStorage.getItem('test_key');
    expect(val).toBe('hello_world');
  });

  test('removeItem deletes data correctly', async () => {
    await safeStorage.setItem('remove_me', '123');
    await safeStorage.removeItem('remove_me');
    const val = await safeStorage.getItem('remove_me');
    expect(val).toBeNull();
  });

  test('clear wipes all stored values', async () => {
    await safeStorage.setItem('k1', 'v1');
    await safeStorage.setItem('k2', 'v2');
    await safeStorage.clear();
    expect(await safeStorage.getItem('k1')).toBeNull();
    expect(await safeStorage.getItem('k2')).toBeNull();
  });
});
