import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LessonList from '../../src/components/LessonList';

const LESSONS = [
  { id: 'cn-1', title: '天地人', characterCount: 3, unit: '第一单元' },
  { id: 'cn-2', title: '口耳目', characterCount: 3, unit: '第一单元' },
  { id: 'cn-3', title: '日月山川', characterCount: 4, unit: '第一单元' },
];

describe('LessonList', () => {
  it('renders lesson items', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getByText('天地人')).toBeTruthy();
    expect(screen.getByText('口耳目')).toBeTruthy();
  });

  it('shows character count badge', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getAllByText(/3字/).length).toBeGreaterThan(0);
  });

  it('calls onSelectLesson when clicked', () => {
    const onSelect = vi.fn();
    render(<LessonList lessons={LESSONS} selectedLesson={null} onSelectLesson={onSelect} />);
    fireEvent.click(screen.getByText('天地人'));
    expect(onSelect).toHaveBeenCalledWith(LESSONS[0]);
  });

  it('highlights selected lesson', () => {
    render(<LessonList lessons={LESSONS} selectedLesson={LESSONS[0]} onSelectLesson={() => {}} />);
    const card = screen.getByText('天地人').closest('.lesson-item');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('shows empty state when no lessons', () => {
    render(<LessonList lessons={[]} selectedLesson={null} onSelectLesson={() => {}} />);
    expect(screen.getByText(/暂无课文/)).toBeTruthy();
  });
});
