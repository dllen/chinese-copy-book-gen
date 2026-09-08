import { describe, it, expect } from 'vitest';
import { getGrades, getUnits, getContents, searchContents } from '../../src/data/courseData';

describe('courseData', () => {
  it('getGrades returns 5 grades', () => {
    const grades = getGrades();
    expect(grades).toHaveLength(5);
    expect(grades[0]).toMatchObject({ id: 'g1', name: '一年级' });
  });

  it('getUnits returns units for a grade filtered by subject', () => {
    const chineseUnits = getUnits('g1', '语文');
    expect(chineseUnits.length).toBeGreaterThan(0);
    expect(chineseUnits[0]).toMatchObject({ id: expect.any(String), name: expect.any(String) });
  });

  it('getContents returns contents for a unit', () => {
    const contents = getContents('shengzi');
    expect(contents.length).toBeGreaterThan(0);
    expect(contents[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      characters: expect.any(Array),
    });
  });

  it('searchContents finds by keyword', () => {
    const results = searchContents('天地人');
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].title).toContain('天地人');
  });
});
