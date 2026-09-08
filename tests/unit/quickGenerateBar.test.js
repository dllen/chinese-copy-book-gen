import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import QuickGenerateBar from '../../src/components/QuickGenerateBar';

describe('QuickGenerateBar', () => {
  it('renders generate button', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={true} />);
    expect(screen.getByText('一键生成字帖')).toBeTruthy();
  });

  it('calls onGenerate when clicked', () => {
    const onGenerate = vi.fn();
    render(<QuickGenerateBar onGenerate={onGenerate} hasContent={true} />);
    fireEvent.click(screen.getByText('一键生成字帖'));
    expect(onGenerate).toHaveBeenCalled();
  });

  it('disables button when no content selected', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={false} />);
    const btn = screen.getByText('一键生成字帖');
    expect(btn.disabled).toBe(true);
  });

  it('shows print and export buttons', () => {
    render(<QuickGenerateBar onGenerate={() => {}} hasContent={true} onPrint={() => {}} onExportPDF={() => {}} />);
    expect(screen.getByText('打印')).toBeTruthy();
    expect(screen.getByText('PDF')).toBeTruthy();
  });
});
