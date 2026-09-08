import { describe, it, expect } from 'vitest';
import { getGrades, getUnits, getLessons, getLessonCharacters } from '../../src/data/courseData';

describe('courseData grade filtering', () => {
  it('getGrades includes grade 6', () => {
    const grades = getGrades();
    expect(grades).toHaveLength(6);
    expect(grades[5]).toMatchObject({ id: 'g6', name: '六年级' });
  });

  it('getUnits returns English for grade 3+', () => {
    const units = getUnits('g3', '英语');
    expect(units.length).toBeGreaterThan(0);
    expect(units[0]).toHaveProperty('id');
  });

  it('getUnits returns Chinese units with pinyin for grade 1-2', () => {
    const units = getUnits('g1', '语文');
    expect(units.length).toBeGreaterThan(0);
    expect(units.some(u => u.id === 'pinyin')).toBe(true);
  });

  it('getUnits returns Chinese units without pinyin for grade 3+', () => {
    const units = getUnits('g3', '语文');
    expect(units.length).toBeGreaterThan(0);
    expect(units.some(u => u.id === 'pinyin')).toBe(false);
  });

  it('getLessons filters by grade', () => {
    const lessons = getLessons('g1', 'shengzi');
    expect(lessons.length).toBeGreaterThan(0);
    expect(lessons[0].grade).toContain('一年级');
  });

  it('getLessonCharacters returns characters for a lesson', () => {
    const lessons = getLessons('g1', 'shengzi');
    if (lessons.length > 0) {
      const chars = getLessonCharacters(lessons[0].id);
      expect(chars.length).toBeGreaterThan(0);
    }
  });
});
