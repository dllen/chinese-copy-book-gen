import { describe, it, expect } from 'vitest';
import { splitIntoChars, splitIntoWords, detectLanguage } from '../../src/utils/textProcessor';

describe('textProcessor', () => {
  it('splits Chinese text into unique characters', () => {
    const chars = splitIntoChars('天地人天地');
    expect(chars).toEqual(['天', '地', '人']);
  });

  it('splits English text into words (case-insensitive dedup)', () => {
    const words = splitIntoWords('Hello world hello');
    expect(words).toEqual(['Hello', 'world']);
  });

  it('detects Chinese language', () => {
    expect(detectLanguage('天地人')).toBe('chinese');
  });

  it('detects English language', () => {
    expect(detectLanguage('Hello world')).toBe('english');
  });

  it('handles mixed text — majority character count wins', () => {
    expect(detectLanguage('Hello 世界')).toBe('english');
    expect(detectLanguage('你好世界啊 Wo')).toBe('chinese');
  });
});
