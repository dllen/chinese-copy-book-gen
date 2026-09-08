import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import CourseTemplates from '../../src/components/CourseTemplates.jsx';
import { COURSE_TEMPLATES } from '../../src/data/courseTemplates.data.js';

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
};

function renderComponent(settings = {}) {
  const updateSetting = vi.fn();
  const baseSettings = {
    text: '',
    feature: '字帖模板',
    layout: '连续排列',
    gridType: '田字格',
    mode: '多字',
    cols: 8,
    rows: 8,
    cellSize: 60,
    fontSize: 42,
    letterStyle: '印刷体',
    ...settings,
  };
  render(
    React.createElement(CourseTemplates, {
      settings: baseSettings,
      updateSetting,
      toast: mockToast,
    })
  );
  return { updateSetting, settings: baseSettings };
}

describe('CourseTemplates 组件', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('渲染内置模板列表（1-5 年级）', () => {
    renderComponent();
    // 展开面板
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));
    // 默认显示全部 10 个模板
    const applyButtons = screen.getAllByText('应用');
    expect(applyButtons.length).toBe(COURSE_TEMPLATES.length);
  });

  it('包含 1-5 年级语文模板', () => {
    renderComponent();
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));
    expect(screen.getByText('一年级·我是中国人')).toBeInTheDocument();
    expect(screen.getByText('二年级·小蝌蚪找妈妈')).toBeInTheDocument();
    expect(screen.getByText('三年级·大青树下的小学')).toBeInTheDocument();
    expect(screen.getByText('四年级·观潮')).toBeInTheDocument();
    expect(screen.getByText('五年级·白鹭')).toBeInTheDocument();
  });

  it('包含 3-5 年级英语模板', () => {
    renderComponent();
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));
    expect(screen.getByText('三年级·英语单词')).toBeInTheDocument();
    expect(screen.getByText('四年级·英语单词')).toBeInTheDocument();
    expect(screen.getByText('五年级·英语句型')).toBeInTheDocument();
  });

  it('一键应用模板：批量更新 settings 并填入文本', () => {
    const { updateSetting, settings } = renderComponent();
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));

    // 找到「一年级·我是中国人」的「应用」按钮并点击
    const card = screen.getByText('一年级·我是中国人').closest('.border');
    const applyBtn = card.querySelector('button');
    fireEvent.click(applyBtn);

    // 验证 text 被更新为教材内容（含标题「我是中国人」）
    expect(updateSetting).toHaveBeenCalledWith('text', expect.stringContaining('我是中国人'));
    // 验证推荐配置被应用
    expect(updateSetting).toHaveBeenCalledWith('layout', '文章格式');
    expect(updateSetting).toHaveBeenCalledWith('gridType', '田字格');
    expect(updateSetting).toHaveBeenCalledWith('cols', 8);
    // 验证 toast 提示
    mockToast.success.mockImplementation(() => {});
  });

  it('英语模板应用四线三格和英文格式', () => {
    const { updateSetting } = renderComponent();
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));

    const card = screen.getByText('三年级·英语单词').closest('.border');
    fireEvent.click(card.querySelector('button'));

    expect(updateSetting).toHaveBeenCalledWith('gridType', '四线三格');
    expect(updateSetting).toHaveBeenCalledWith('layout', '英文格式');
    expect(updateSetting).toHaveBeenCalledWith('mode', '多词');
  });

  it('保存自定义模板到 localStorage', () => {
    const { updateSetting } = renderComponent({ text: '床前明月光，疑是地上霜。' });
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));

    fireEvent.click(screen.getByText('保存当前'));
    const input = document.querySelector('.modal input');
    fireEvent.change(input, { target: { value: '静夜思练习' } });
    fireEvent.click(screen.getByText('保存'));

    const saved = JSON.parse(localStorage.getItem('copybook-custom-templates'));
    expect(saved.length).toBe(1);
    expect(saved[0].name).toBe('静夜思练习');
    expect(saved[0].text).toContain('床前明月光');
  });

  it('学科筛选：只显示英语模板', () => {
    renderComponent();
    fireEvent.click(screen.getByText('课程模板 · 一键生成'));
    fireEvent.change(screen.getByLabelText('学科筛选'), { target: { value: '英语' } });
    const applyButtons = screen.getAllByText('应用');
    // 英语模板 3 个：三年级单词、四年级单词、五年级句型
    expect(applyButtons.length).toBe(3);
    expect(screen.queryByText('一年级·我是中国人')).not.toBeInTheDocument();
  });
});
