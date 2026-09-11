import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LandingPage from '../../src/components/LandingPage';

describe('LandingPage', () => {
  it('renders truthful capability metrics', () => {
    render(<LandingPage onStartBuilder={() => {}} onNavigate={() => {}} />);

    expect(screen.getByText('4 类')).toBeInTheDocument();
    expect(screen.getByText('20+ 种')).toBeInTheDocument();
    expect(screen.getAllByText('高清 PDF').length).toBeGreaterThan(0);
    expect(screen.getAllByText('免登录').length).toBeGreaterThan(0);
    expect(screen.queryByText('100,000+')).not.toBeInTheDocument();
  });

  it('starts the correct builder from a feature card', () => {
    const onStartBuilder = vi.fn();
    render(<LandingPage onStartBuilder={onStartBuilder} onNavigate={() => {}} />);

    const cards = screen.getAllByRole('button', { name: /拼音字帖/ });
    fireEvent.click(cards[0]);
    expect(onStartBuilder).toHaveBeenCalledWith('pinyin');
  });

  it('renders real use cases instead of user testimonials', () => {
    render(<LandingPage onStartBuilder={() => {}} onNavigate={() => {}} />);

    expect(screen.getByText('家庭辅导')).toBeInTheDocument();
    expect(screen.getByText('教师备课')).toBeInTheDocument();
    expect(screen.queryByText('用户评价')).not.toBeInTheDocument();
  });

  it('links the tutorial CTA to the workflow section', () => {
    const onNavigate = vi.fn();
    render(<LandingPage onStartBuilder={() => {}} onNavigate={onNavigate} />);

    fireEvent.click(screen.getByRole('button', { name: '查看生成流程' }));
    expect(onNavigate).toHaveBeenCalledWith('tutorial');
  });
});
