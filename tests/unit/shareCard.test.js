import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShareCard from '../../src/components/ShareCard';

describe('ShareCard', () => {
  it('renders share card when open', () => {
    render(<ShareCard open={true} onClose={() => {}} title="一年级·天地人" />);
    expect(screen.getByText(/分享字帖/)).toBeTruthy();
  });

  it('does not render when closed', () => {
    render(<ShareCard open={false} onClose={() => {}} title="" />);
    expect(screen.queryByText(/分享字帖/)).toBeNull();
  });

  it('shows title', () => {
    render(<ShareCard open={true} onClose={() => {}} title="一年级·天地人" />);
    expect(screen.getByText(/一年级·天地人/)).toBeTruthy();
  });

  it('calls onClose when close clicked', () => {
    const onClose = vi.fn();
    render(<ShareCard open={true} onClose={onClose} title="" />);
    fireEvent.click(screen.getByText(/关闭/));
    expect(onClose).toHaveBeenCalled();
  });
});
