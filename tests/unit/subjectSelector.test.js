import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SubjectSelector from '../../src/components/SubjectSelector';

describe('SubjectSelector', () => {
  it('renders Chinese subject', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.getByText('语文')).toBeTruthy();
  });

  it('renders English for grade 3+', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.getByText('英语')).toBeTruthy();
  });

  it('does NOT render English for grade 1-2', () => {
    render(<SubjectSelector gradeId="g1" selectedSubject="语文" onSelectSubject={() => {}} />);
    expect(screen.queryByText('英语')).toBeNull();
  });

  it('calls onSelectSubject when clicked', () => {
    const onSelect = vi.fn();
    render(<SubjectSelector gradeId="g3" selectedSubject="语文" onSelectSubject={onSelect} />);
    fireEvent.click(screen.getByText('英语'));
    expect(onSelect).toHaveBeenCalledWith('英语');
  });

  it('highlights selected subject', () => {
    render(<SubjectSelector gradeId="g3" selectedSubject="英语" onSelectSubject={() => {}} />);
    const card = screen.getByText('英语').closest('.subject-card');
    expect(card.classList.contains('selected')).toBe(true);
  });
});
