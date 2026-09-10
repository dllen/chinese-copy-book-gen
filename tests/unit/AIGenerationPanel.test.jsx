import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';

// Toast is an object with methods. Return truthy so the component's
// `toast.success(...) || toast(...)` fallback short-circuits and never
// tries to call `toast` as a function. Configured in beforeEach because
// vi.restoreAllMocks() in afterEach clears mock implementations.
let mockToast;

let AIGenerationPanel;

beforeEach(async () => {
  vi.resetModules();
  global.fetch = vi.fn();
  mockToast = {
    success: vi.fn().mockReturnValue(true),
    error: vi.fn().mockReturnValue(true),
    warn: vi.fn().mockReturnValue(true),
    info: vi.fn().mockReturnValue(true),
  };
  Object.assign(navigator, {
    clipboard: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
  AIGenerationPanel = (await import('../../src/components/AIGenerationPanel.jsx')).default;
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe('AIGenerationPanel — prompt generation features', () => {
  it('默认显示「直接生成」Tab', () => {
    render(<AIGenerationPanel toast={mockToast} />);
    const genTab = screen.getByText('✨ 直接生成');
    const promptTab = screen.getByText('📝 生成提示词');
    expect(genTab).toBeTruthy();
    expect(promptTab).toBeTruthy();
    expect(genTab.classList.contains('active')).toBe(true);
    expect(promptTab.classList.contains('active')).toBe(false);
  });

  it('点击「生成提示词」Tab 切换模式', () => {
    render(<AIGenerationPanel toast={mockToast} />);
    fireEvent.click(screen.getByText('📝 生成提示词'));
    expect(screen.getByText('📝 生成提示词').classList.contains('active')).toBe(true);
    // Platform selector appears only in prompt tab
    expect(screen.getByText('💬 对话 AI')).toBeTruthy();
    expect(screen.getByText('🎨 图像 AI')).toBeTruthy();
  });

  it('高级选项默认为折叠', () => {
    render(<AIGenerationPanel toast={mockToast} />);
    fireEvent.click(screen.getByText('📝 生成提示词'));
    // Advanced form hidden: grade options not rendered yet
    expect(screen.queryByText('一年级')).toBeNull();
    // Toggle to expand
    fireEvent.click(screen.getByText('▼ 高级选项'));
    expect(screen.getByText('一年级')).toBeTruthy();
    expect(screen.getByText('语文')).toBeTruthy();
  });

  it('生成提示词时显示 loading', () => {
    // Fetch never resolves; setLoading(true) runs synchronously before the await.
    global.fetch = vi.fn(() => new Promise(() => {}));
    render(<AIGenerationPanel toast={mockToast} />);
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '一年级生字' } });
    const genBtn = screen.getByText('✨ 生成提示词');
    fireEvent.click(genBtn);
    // Loading state applied synchronously (before the await fetch)
    expect(genBtn.disabled).toBe(true);
  });

  it('生成成功后显示输出和复制按钮', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '测试提示词输出内容' }),
    });
    render(<AIGenerationPanel toast={mockToast} />);
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '一年级生字' } });
    fireEvent.click(screen.getByText('✨ 生成提示词'));
    await waitFor(() => {
      expect(screen.getByText('测试提示词输出内容')).toBeTruthy();
    });
    expect(screen.getByText('📋 复制')).toBeTruthy();
  });

  it('复制按钮点击后显示已复制状态', async () => {
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '测试提示词输出内容' }),
    });
    render(<AIGenerationPanel toast={mockToast} />);
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByRole('textbox'), { target: { value: '一年级生字' } });
    fireEvent.click(screen.getByText('✨ 生成提示词'));
    await waitFor(() => screen.getByText('📋 复制'));
    fireEvent.click(screen.getByText('📋 复制'));
    await waitFor(() => {
      expect(screen.getByText('✓ 已复制')).toBeTruthy();
    });
  });
});
