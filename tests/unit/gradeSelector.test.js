import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import GradeSelector from '../../src/components/GradeSelector';

const GRADES = [
  { id: 'g1', name: '一年级' },
  { id: 'g2', name: '二年级' },
  { id: 'g3', name: '三年级' },
  { id: 'g4', name: '四年级' },
  { id: 'g5', name: '五年级' },
];

describe('GradeSelector', () => {
  it('renders all grade cards', () => {
    render(<GradeSelector grades={GRADES} onSelect={() => {}} />);
    GRADES.forEach((g) => expect(screen.getByText(g.name)).toBeTruthy());
  });

  it('calls onSelect when a grade card is clicked', () => {
    const onSelect = vi.fn();
    render(<GradeSelector grades={GRADES} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('三年级'));
    expect(onSelect).toHaveBeenCalledWith('g3');
  });

  it('highlights selected grade', () => {
    render(<GradeSelector grades={GRADES} selectedGrade="g2" onSelect={() => {}} />);
    const card = screen.getByText('二年级').closest('.grade-card');
    expect(card.classList.contains('selected')).toBe(true);
  });
});
