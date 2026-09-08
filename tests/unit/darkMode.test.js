import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

function DarkModeToggle({ darkMode, onToggle }) {
  return (
    <div>
      <button onClick={onToggle}>
        {darkMode ? '🌞 浅色' : '🌙 深色'}
      </button>
      <span data-testid="mode">{darkMode ? 'dark' : 'light'}</span>
    </div>
  );
}

describe('darkMode', () => {
  it('shows dark mode label when light', () => {
    render(<DarkModeToggle darkMode={false} onToggle={() => {}} />);
    expect(screen.getByText(/深色/)).toBeTruthy();
  });

  it('shows light mode label when dark', () => {
    render(<DarkModeToggle darkMode={true} onToggle={() => {}} />);
    expect(screen.getByText(/浅色/)).toBeTruthy();
  });

  it('displays current mode', () => {
    render(<DarkModeToggle darkMode={true} onToggle={() => {}} />);
    expect(screen.getByTestId('mode').textContent).toBe('dark');
  });
});
