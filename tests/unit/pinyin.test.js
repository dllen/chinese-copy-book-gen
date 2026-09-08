import { describe, it, expect } from 'vitest';
import { toPinyin, toPinyinArray, hasPinyin } from '../../src/utils/pinyin';

describe('pinyin utils', () => {
  it('converts single character to pinyin', () => {
    expect(toPinyin('天')).toBe('tiān');
  });

  it('converts multiple characters', () => {
    const result = toPinyin('天地人');
    expect(result).toContain('tiān');
    expect(result).toContain('dì');
    expect(result).toContain('rén');
  });

  it('returns array form', () => {
    const arr = toPinyinArray('天地人');
    expect(arr).toEqual(['tiān', 'dì', 'rén']);
  });

  it('handles empty string', () => {
    expect(toPinyin('')).toBe('');
    expect(toPinyinArray('')).toEqual([]);
  });

  it('hasPinyin returns true', () => {
    expect(hasPinyin()).toBe(true);
  });
});
