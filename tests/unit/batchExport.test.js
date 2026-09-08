import { describe, it, expect } from 'vitest';
import { generateUnitPages, estimatePageCount } from '../../src/utils/batchExport';

describe('batchExport', () => {
  it('generates pages from content list', () => {
    const contents = [
      { id: 'c1', title: '天地人', characters: ['天', '地', '人'] },
      { id: 'c2', title: '口耳目', characters: ['口', '耳', '目'] },
    ];
    const pages = generateUnitPages(contents, { cols: 8, rows: 10 });
    expect(pages.length).toBeGreaterThan(0);
    expect(pages[0].length).toBeGreaterThan(0);
  });

  it('estimates page count correctly', () => {
    const contents = [
      { characters: new Array(80).fill('一') },
    ];
    expect(estimatePageCount(contents, { cols: 8, rows: 10 })).toBe(1);
  });

  it('handles empty content', () => {
    const pages = generateUnitPages([], { cols: 8, rows: 10 });
    expect(pages).toEqual([]);
  });

  it('handles vocabulary', () => {
    const contents = [
      { characters: ['天', '地'], vocabulary: ['天地', '人间'] },
    ];
    const pages = generateUnitPages(contents, { cols: 8, rows: 10 });
    expect(pages[0]).toContain('天');
  });
});
