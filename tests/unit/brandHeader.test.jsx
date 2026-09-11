import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import BrandHeader from '../../src/components/BrandHeader';

describe('BrandHeader', () => {
  it('navigates to a builder type from desktop navigation', () => {
    const onNavigate = vi.fn();
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={() => {}}
        currentView="home"
        onNavigate={onNavigate}
      />
    );

    fireEvent.click(screen.getByRole('link', { name: '汉字字帖' }));
    expect(onNavigate).toHaveBeenCalledWith('hanzi');
  });

  it('opens and closes the mobile navigation', () => {
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={() => {}}
        currentView="home"
        onNavigate={() => {}}
      />
    );

    const toggle = screen.getByRole('button', { name: '打开导航菜单' });
    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: '关闭导航菜单' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('toggles dark mode', () => {
    const onToggleDarkMode = vi.fn();
    render(
      <BrandHeader
        darkMode={false}
        onToggleDarkMode={onToggleDarkMode}
        currentView="home"
        onNavigate={() => {}}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '切换到深色模式' }));
    expect(onToggleDarkMode).toHaveBeenCalledOnce();
  });
});
