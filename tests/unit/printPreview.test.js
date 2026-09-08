import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PrintPreview from '../../src/components/PrintPreview';

describe('PrintPreview', () => {
  it('renders when open is true', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={2} />);
    expect(screen.getByText(/打印预览/)).toBeTruthy();
  });

  it('does not render when open is false', () => {
    render(<PrintPreview open={false} onClose={() => {}} pages={2} />);
    expect(screen.queryByText(/打印预览/)).toBeNull();
  });

  it('shows page count', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={5} />);
    expect(screen.getByText(/共 5 页/)).toBeTruthy();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(<PrintPreview open={true} onClose={onClose} pages={1} />);
    fireEvent.click(screen.getByText(/关闭/));
    expect(onClose).toHaveBeenCalled();
  });

  it('shows A4 paper dimensions', () => {
    render(<PrintPreview open={true} onClose={() => {}} pages={1} />);
    expect(screen.getByText(/A4/)).toBeTruthy();
  });
});
