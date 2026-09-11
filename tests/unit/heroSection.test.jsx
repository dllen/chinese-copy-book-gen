import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HeroSection from '../../src/components/HeroSection';

describe('HeroSection', () => {
  it('starts the hanzi builder from the primary CTA', () => {
    const onStartBuilder = vi.fn();
    render(<HeroSection onStartBuilder={onStartBuilder} />);

    fireEvent.click(screen.getByRole('button', { name: '制作汉字字帖' }));
    expect(onStartBuilder).toHaveBeenCalledWith('hanzi');
  });

  it('shows only claims supported by the product', () => {
    render(<HeroSection onStartBuilder={() => {}} />);

    expect(screen.getByText('免登录')).toBeInTheDocument();
    expect(screen.getByText('高清 PDF')).toBeInTheDocument();
    expect(screen.queryByText('100,000+ 用户')).not.toBeInTheDocument();
  });
});
