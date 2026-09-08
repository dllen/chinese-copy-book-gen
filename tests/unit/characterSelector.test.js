import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import CharacterSelector from '../../src/components/CharacterSelector';

const CHARS = ['天', '地', '人', '你', '我'];

describe('CharacterSelector', () => {
  it('renders all characters', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(CHARS)} onToggleCharacter={() => {}} />);
    CHARS.forEach(ch => expect(screen.getByText(ch)).toBeTruthy());
  });

  it('shows selected count', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(['天', '地'])} onToggleCharacter={() => {}} />);
    expect(screen.getByText(/已选 2 \/ 5/)).toBeTruthy();
  });

  it('calls onToggleCharacter when clicked', () => {
    const onToggle = vi.fn();
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(CHARS)} onToggleCharacter={onToggle} />);
    fireEvent.click(screen.getByText('天'));
    expect(onToggle).toHaveBeenCalledWith('天');
  });

  it('highlights selected characters', () => {
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set(['天'])} onToggleCharacter={() => {}} />);
    const card = screen.getByText('天').closest('.char-card');
    expect(card.classList.contains('selected')).toBe(true);
  });

  it('select all button works', () => {
    const onSelectAll = vi.fn();
    render(<CharacterSelector characters={CHARS} selectedCharacters={new Set()} onToggleCharacter={() => {}} onSelectAll={onSelectAll} />);
    fireEvent.click(screen.getByText('全选'));
    expect(onSelectAll).toHaveBeenCalled();
  });

  it('shows empty state when no characters', () => {
    render(<CharacterSelector characters={[]} selectedCharacters={new Set()} onToggleCharacter={() => {}} />);
    expect(screen.getByText(/暂无生字/)).toBeTruthy();
  });
});
