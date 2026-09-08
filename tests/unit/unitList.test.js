import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UnitList from '../../src/components/UnitList';

const UNITS = [
  { id: 'pinyin', name: '拼音', icon: '🔤' },
  { id: 'shengzi', name: '生字', icon: '✍️' },
  { id: 'cihui', name: '词语', icon: '📝' },
];

describe('UnitList', () => {
  it('renders all units', () => {
    render(<UnitList units={UNITS} onSelect={() => {}} />);
    UNITS.forEach((u) => expect(screen.getByText(u.name)).toBeTruthy());
  });

  it('calls onSelect when unit clicked', () => {
    const onSelect = vi.fn();
    render(<UnitList units={UNITS} onSelect={onSelect} />);
    fireEvent.click(screen.getByText('生字'));
    expect(onSelect).toHaveBeenCalledWith('shengzi');
  });

  it('highlights selected unit', () => {
    render(<UnitList units={UNITS} selectedUnit="shengzi" onSelect={() => {}} />);
    const el = screen.getByText('生字').closest('.unit-item');
    expect(el.classList.contains('selected')).toBe(true);
  });
});
