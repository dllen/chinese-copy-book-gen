# AI 提示词生成 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在现有 AIGenerationPanel 中新增「生成提示词」Tab，AI 根据用户需求生成可复制到 ChatGPT/Claude/Midjourney 等平台的高质量提示词。

**Architecture:** 扩展 AIGenerationPanel 组件，新增 Tab 状态切换。复用现有 Ollama 连接和 toast 通知，通过不同 system prompt 切换「直接生成」和「生成提示词」两种模式。新增平台选择器（对话AI/图像AI）和一键复制功能。

**Tech Stack:** React 18 + Vite, Ollama API (llama3), navigator.clipboard API, CSS custom properties

---

## File Structure

| 文件 | 职责 | 变更类型 |
|------|------|----------|
| `src/components/AIGenerationPanel.jsx` | AI 生成面板主体 | 修改 — 新增 Tab、提示词生成逻辑、平台选择、复制功能 |
| `src/styles/design-system.css` | 设计系统样式 | 修改 — 新增 Tab、平台选择器、复制按钮样式 |
| `tests/unit/AIGenerationPanel.test.jsx` | 组件单元测试 | 新建 — 测试 Tab 切换、提示词生成、复制功能 |

---

## Task 1: 添加 CSS 样式

**Files:**
- Modify: `src/styles/design-system.css`

- [ ] **Step 1: 添加 Tab 样式**

在 `design-system.css` 末尾（`@media (max-width: 768px)` 之前）追加：

```css
/* AI Panel Tabs */
.ai-panel-tabs {
  display: flex;
  gap: 0;
  margin-bottom: var(--space-4);
  border-bottom: 2px solid var(--surface-200);
}

.ai-panel-tab {
  flex: 1;
  padding: var(--space-3) var(--space-2);
  background: none;
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  cursor: pointer;
  position: relative;
  transition: color var(--transition-base);
}

.ai-panel-tab:hover {
  color: var(--text-secondary);
}

.ai-panel-tab.active {
  color: var(--brand-primary);
}

.ai-panel-tab.active::after {
  content: '';
  position: absolute;
  bottom: -2px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--gradient-brand);
  border-radius: 1px;
}

/* Platform Selector */
.platform-selector {
  display: flex;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
}

.platform-option {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: var(--space-2) var(--space-3);
  border: 1.5px solid var(--surface-200);
  border-radius: var(--radius-lg);
  background: #fff;
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: border-color var(--transition-base), background var(--transition-base), color var(--transition-base);
}

.platform-option:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.platform-option.selected {
  border-color: var(--brand-primary);
  background: rgba(37, 99, 235, 0.06);
  color: var(--brand-primary);
}

/* Advanced Mode Toggle */
.advanced-toggle {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  cursor: pointer;
  background: none;
  border: none;
  padding: var(--space-1) 0;
  margin-bottom: var(--space-3);
  transition: color var(--transition-base);
}

.advanced-toggle:hover {
  color: var(--brand-primary);
}

/* Advanced Form */
.advanced-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding: var(--space-4);
  background: var(--surface-50);
  border-radius: var(--radius-xl);
}

.advanced-form label {
  display: block;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 0.25rem;
}

.advanced-form select {
  width: 100%;
  padding: 0.375rem 0.625rem;
  border: 1px solid var(--surface-200);
  border-radius: var(--radius-md);
  font-size: 0.85rem;
  background: #fff;
  color: var(--text-primary);
}

/* Copy Button */
.copy-output-card {
  position: relative;
  margin-top: var(--space-4);
}

.copy-btn {
  position: absolute;
  top: var(--space-2);
  right: var(--space-2);
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.3rem 0.7rem;
  font-size: 0.75rem;
  font-weight: 600;
  border: 1px solid var(--surface-200);
  border-radius: var(--radius-md);
  background: #fff;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-base);
}

.copy-btn:hover {
  border-color: var(--brand-primary);
  color: var(--brand-primary);
}

.copy-btn.copied {
  background: #ecfdf5;
  border-color: #6ee7b7;
  color: #065f46;
}

/* Dark mode for new elements */
.dark-mode .platform-option { background: var(--surface-800); border-color: var(--surface-600); color: var(--surface-300); }
.dark-mode .platform-option.selected { background: rgba(37,99,235,0.15); border-color: var(--brand-primary); }
.dark-mode .advanced-form { background: var(--surface-800); }
.dark-mode .advanced-form select { background: var(--surface-700); border-color: var(--surface-600); color: #e0e0e0; }
.dark-mode .copy-btn { background: var(--surface-800); border-color: var(--surface-600); color: var(--surface-300); }
.dark-mode .copy-btn.copied { background: #064e3b; border-color: #34d399; color: #a7f3d0; }
```

- [ ] **Step 2: Commit**

```bash
git add src/styles/design-system.css
git commit -m "style: add AI panel tabs, platform selector, copy button styles"
```

---

## Task 2: 添加 Tab 状态和 UI 骨架

**Files:**
- Modify: `src/components/AIGenerationPanel.jsx`

- [ ] **Step 1: 添加 Tab 状态和导入**

在组件函数顶部（`useState` 声明区域）添加：

```jsx
const [activeTab, setActiveTab] = React.useState('generate'); // 'generate' | 'prompt'
const [platform, setPlatform] = React.useState('chat'); // 'chat' | 'image'
const [showAdvanced, setShowAdvanced] = React.useState(false);
const [copied, setCopied] = React.useState(false);
const [promptOutput, setPromptOutput] = useState('');

// Advanced form state
const [advGrade, setAdvGrade] = React.useState('');
const [advSubject, setAdvSubject] = React.useState('');
const [advType, setAdvType] = React.useState('');
const [advCount, setAdvCount] = React.useState('');
```

- [ ] **Step 2: 添加 Tab UI 和平台选择器**

在 `return` 的 `ai-panel` div 内，在 `ai-panel-title` 之后、`ai-input-row` 之前，插入 Tab 栏和平台选择器：

```jsx
React.createElement('div', { className: 'ai-panel-tabs' },
  React.createElement('button', {
    className: `ai-panel-tab ${activeTab === 'generate' ? 'active' : ''}`,
    onClick: () => setActiveTab('generate'),
  }, '✨ 直接生成'),
  React.createElement('button', {
    className: `ai-panel-tab ${activeTab === 'prompt' ? 'active' : ''}`,
    onClick: () => setActiveTab('prompt'),
  }, '📝 生成提示词')
),
activeTab === 'prompt' && React.createElement(
  'div',
  { className: 'platform-selector' },
  React.createElement('button', {
    className: `platform-option ${platform === 'chat' ? 'selected' : ''}`,
    onClick: () => setPlatform('chat'),
  }, '💬 对话 AI'),
  React.createElement('button', {
    className: `platform-option ${platform === 'image' ? 'selected' : ''}`,
    onClick: () => setPlatform('image'),
  }, '🎨 图像 AI')
),
```

- [ ] **Step 3: 条件渲染输入区域**

将现有的 `ai-input-row`（textarea + 生成按钮）包裹为仅 `activeTab === 'generate'` 时显示。同时为 `activeTab === 'prompt'` 渲染高级模式切换和表单。

把现有 `ai-input-row` 改为：

```jsx
activeTab === 'generate' && React.createElement(
  'div',
  { className: 'ai-input-row' },
  React.createElement('textarea', { /* 现有 props 不变 */ }),
  React.createElement('button', { /* 现有生成按钮 props 不变 */ })
),
activeTab === 'prompt' && React.createElement(
  React.Fragment,
  null,
  React.createElement(
    'div',
    { className: 'ai-input-row' },
    React.createElement('textarea', {
      placeholder: '描述你需要的字帖内容，如"一年级语文生字练习"或"乘法口诀练习题"',
      value: prompt,
      onChange: (e) => setPrompt(e.target.value),
      rows: 2,
      style: { flex: 1 },
    })
  ),
  React.createElement('button', {
    className: 'advanced-toggle',
    onClick: () => setShowAdvanced(!showAdvanced),
  }, showAdvanced ? '▲ 收起高级选项' : '▼ 高级选项'),
  showAdvanced && React.createElement(
    'div',
    { className: 'advanced-form' },
    React.createElement('div', null,
      React.createElement('label', null, '年级'),
      React.createElement('select', { value: advGrade, onChange: (e) => setAdvGrade(e.target.value) },
        React.createElement('option', { value: '' }, '不限'),
        React.createElement('option', { value: '一年级' }, '一年级'),
        React.createElement('option', { value: '二年级' }, '二年级'),
        React.createElement('option', { value: '三年级' }, '三年级'),
        React.createElement('option', { value: '四年级' }, '四年级'),
        React.createElement('option', { value: '五年级' }, '五年级'),
        React.createElement('option', { value: '六年级' }, '六年级')
      )
    ),
    React.createElement('div', null,
      React.createElement('label', null, '学科'),
      React.createElement('select', { value: advSubject, onChange: (e) => setAdvSubject(e.target.value) },
        React.createElement('option', { value: '' }, '不限'),
        React.createElement('option', { value: '语文' }, '语文'),
        React.createElement('option', { value: '数学' }, '数学'),
        React.createElement('option', { value: '英语' }, '英语')
      )
    ),
    React.createElement('div', null,
      React.createElement('label', null, '内容类型'),
      React.createElement('select', { value: advType, onChange: (e) => setAdvType(e.target.value) },
        React.createElement('option', { value: '' }, '不限'),
        React.createElement('option', { value: '汉字帖' }, '汉字帖'),
        React.createElement('option', { value: '笔画帖' }, '笔画帖'),
        React.createElement('option', { value: '口算题' }, '口算题'),
        React.createElement('option', { value: '拼音临摹' }, '拼音临摹'),
        React.createElement('option', { value: '字母书写' }, '字母书写'),
        React.createElement('option', { value: '单词练习' }, '单词练习')
      )
    ),
    React.createElement('div', null,
      React.createElement('label', null, '数量'),
      React.createElement('input', {
        type: 'number', value: advCount, min: 1, max: 200,
        placeholder: '如 20',
        onChange: (e) => setAdvCount(e.target.value),
        style: { width: '100%', padding: '0.375rem 0.625rem', border: '1px solid var(--surface-200)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem' }
      })
    )
  ),
  React.createElement('button', {
    className: 'btn-gradient-primary',
    onClick: generatePrompt,
    disabled: loading,
    style: { width: '100%', marginTop: 'var(--space-3)' },
  }, loading ? '生成中...' : '✨ 生成提示词')
)
```

- [ ] **Step 4: Commit**

```bash
git add src/components/AIGenerationPanel.jsx
git commit -m "feat: add prompt generation tab skeleton and platform selector"
```

---

## Task 3: 实现提示词生成逻辑

**Files:**
- Modify: `src/components/AIGenerationPanel.jsx`

- [ ] **Step 1: 添加 generatePrompt 函数**

在现有的 `generate` 函数之后，添加 `generatePrompt` 函数：

```jsx
const generatePrompt = useCallback(async () => {
  const trimmed = prompt.trim();
  if (!trimmed && !advGrade && !advSubject && !advType) {
    toast?.warn?.('请描述需求或填写高级选项') || toast?.('请描述需求或填写高级选项', 'warning');
    return;
  }
  setLoading(true);
  setPromptOutput('');

  const platformText = platform === 'chat' ? '对话式AI（如ChatGPT、Claude、Kimi）' : '图像生成AI（如Midjourney、Stable Diffusion）';
  const platformSpecific = platform === 'chat'
    ? '提示词要适合对话交互，分步骤输出，格式清晰，用户可直接粘贴到对话框使用'
    : '提示词要注重视觉风格描述、构图细节、色彩和光线，使用英文关键词以便更好的生成效果';

  const parts = [];
  if (advGrade) parts.push(`年级：${advGrade}`);
  if (advSubject) parts.push(`学科：${advSubject}`);
  if (advType) parts.push(`内容类型：${advType}`);
  if (advCount) parts.push(`数量：${advCount}`);
  const structuredParams = parts.length > 0 ? parts.join(' | ') : '无特殊要求';

  const systemPrompt = `你是一个提示词工程专家。根据用户需求，生成一段高质量的${platformText}提示词。

要求：
1. 提示词要完整、可直接使用，用户无需修改
2. 包含角色设定、具体任务、输出格式要求
3. 字帖内容控制在合理范围（汉字20-100字，数学题10-20道）
4. 语言：中文为主，英文内容用英文
5. ${platformSpecific}

只输出提示词本身，不要解释或额外文字。`;

  try {
    const res = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama3',
        prompt: `${systemPrompt}\n\n用户需求：${trimmed || '无'}\n结构化参数：${structuredParams}\n\n提示词：`,
        stream: false,
        options: { temperature: 0.8, num_predict: 1000 },
      }),
    });
    if (!res.ok) throw new Error(`API 错误: ${res.status}`);
    const data = await res.json();
    const text = data.response?.trim() || '';
    setPromptOutput(text);
    toast?.success?.('提示词生成成功') || toast?.('提示词生成成功', 'success');
  } catch (err) {
    const msg = err.message || '生成失败';
    setPromptOutput(`生成失败: ${msg}\n\n提示：请确保本地 Ollama 服务已启动 (http://localhost:11434)`);
    toast?.error?.('提示词生成失败') || toast?.('提示词生成失败', 'error');
  } finally {
    setLoading(false);
  }
}, [prompt, platform, advGrade, advSubject, advType, advCount, toast]);
```

- [ ] **Step 2: 添加复制函数**

在 `generatePrompt` 之后添加：

```jsx
const handleCopy = useCallback(async (text) => {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
    } else {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  } catch {
    toast?.error?.('复制失败，请手动选中复制') || toast?.('复制失败，请手动选中复制', 'error');
  }
}, [toast]);
```

- [ ] **Step 3: 添加提示词输出区域**

在 `output && ...` 渲染之后，添加提示词输出区域（仅在 prompt tab 且有输出时显示）：

```jsx
activeTab === 'prompt' && promptOutput && React.createElement(
  'div',
  { className: 'copy-output-card' },
  React.createElement('button', {
    className: `copy-btn ${copied ? 'copied' : ''}`,
    onClick: () => handleCopy(promptOutput),
  }, copied ? '✓ 已复制' : '📋 复制'),
  React.createElement('div', { className: 'ai-output' }, promptOutput)
)
```

- [ ] **Step 4: Commit**

```bash
git add src/components/AIGenerationPanel.jsx
git commit -m "feat: implement prompt generation logic with Ollama"
```

---

## Task 4: 添加快捷提示词（提示词模式专用）

**Files:**
- Modify: `src/components/AIGenerationPanel.jsx`

- [ ] **Step 1: 替换快捷提示词为 Tab 自适应**

将现有快捷提示词区域改为根据 activeTab 显示不同的快捷选项：

```jsx
React.createElement(
  'div',
  { style: { marginTop: '.75rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' } },
  (activeTab === 'generate'
    ? ['一年级生字：天地人你我他', '唐诗：静夜思 李白', '数学：20以内加减法10题', '英语：26个字母大小写']
    : ['一年级生字练习', '乘法口诀练习题', '唐诗五言绝句练习', '英语字母书写练习']
  ).map((qp, i) =>
    React.createElement('button', {
      key: i,
      className: 'btn btn-sm btn-outline-secondary',
      onClick: () => setPrompt(qp),
      style: { fontSize: '.75rem', borderRadius: 'var(--radius-md)' },
    }, qp)
  )
)
```

- [ ] **Step 2: Commit**

```bash
git add src/components/AIGenerationPanel.jsx
git commit -m "feat: add tab-aware quick prompts"
```

---

## Task 5: 编写单元测试

**Files:**
- Create: `tests/unit/AIGenerationPanel.test.jsx`

- [ ] **Step 1: 编写测试文件**

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mock
const AIGenerationPanel = (await import('../../src/components/AIGenerationPanel.jsx')).default;

const mockToast = vi.fn();

describe('AIGenerationPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFetch.mockReset();
  });

  it('默认显示「直接生成」Tab', () => {
    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    expect(screen.getByText('✨ 直接生成')).toBeTruthy();
    expect(screen.getByText('📝 生成提示词')).toBeTruthy();
    // 默认选中直接生成
    expect(screen.getByText('✨ 直接生成').classList.contains('active')).toBe(true);
  });

  it('点击「生成提示词」Tab 切换模式', () => {
    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    fireEvent.click(screen.getByText('📝 生成提示词'));
    expect(screen.getByText('📝 生成提示词').classList.contains('active')).toBe(true);
    // 显示平台选择器
    expect(screen.getByText('💬 对话 AI')).toBeTruthy();
    expect(screen.getByText('🎨 图像 AI')).toBeTruthy();
  });

  it('高级选项默认为折叠，点击展开', () => {
    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    fireEvent.click(screen.getByText('📝 生成提示词'));
    // 默认不显示高级表单
    expect(screen.queryByText('年级')).toBeNull();
    // 点击展开
    fireEvent.click(screen.getByText('▼ 高级选项'));
    expect(screen.getByText('年级')).toBeTruthy();
    expect(screen.getByText('学科')).toBeTruthy();
  });

  it('生成提示词时显示 loading 状态', async () => {
    mockFetch.mockReturnValue(new Promise(() => {})); // never resolves
    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByPlaceholderText(/描述你需要的字帖内容/), {
      target: { value: '一年级生字' }
    });
    fireEvent.click(screen.getByText('✨ 生成提示词'));
    await waitFor(() => {
      expect(screen.getByText('生成中...')).toBeTruthy();
    });
  });

  it('生成成功后显示输出和复制按钮', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '测试提示词输出内容' }),
    });
    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByPlaceholderText(/描述你需要的字帖内容/), {
      target: { value: '一年级生字' }
    });
    fireEvent.click(screen.getByText('✨ 生成提示词'));
    await waitFor(() => {
      expect(screen.getByText('📋 复制')).toBeTruthy();
      expect(screen.getByText('测试提示词输出内容')).toBeTruthy();
    });
  });

  it('复制按钮点击后显示已复制状态', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ response: '测试提示词' }),
    });
    // Mock clipboard
    Object.assign(navigator, { clipboard: { writeText: vi.fn().mockResolvedValue(undefined) } });

    render(React.createElement(AIGenerationPanel, { toast: mockToast }));
    fireEvent.click(screen.getByText('📝 生成提示词'));
    fireEvent.change(screen.getByPlaceholderText(/描述你需要的字帖内容/), {
      target: { value: '一年级生字' }
    });
    fireEvent.click(screen.getByText('✨ 生成提示词'));
    await waitFor(() => {
      expect(screen.getByText('📋 复制')).toBeTruthy();
    });
    fireEvent.click(screen.getByText('📋 复制'));
    await waitFor(() => {
      expect(screen.getByText('✓ 已复制')).toBeTruthy();
    });
  });
});
```

- [ ] **Step 2: 运行测试**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/chinese-copy-book-gen && npx vitest run tests/unit/AIGenerationPanel.test.jsx
```

- [ ] **Step 3: 修复任何失败的测试，然后 commit**

```bash
git add tests/unit/AIGenerationPanel.test.jsx
git commit -m "test: add AIGenerationPanel unit tests for prompt generation"
```

---

## Task 6: 构建验证

- [ ] **Step 1: 运行全量构建**

```bash
cd /Users/shichaopeng/Work/self-dir/projects/chinese-copy-book-gen && npx vite build 2>&1 | tail -10
```

Expected: `✓ built` with no errors.

- [ ] **Step 2: 运行全量单元测试**

```bash
npx vitest run 2>&1 | tail -15
```

Expected: All tests pass.

- [ ] **Step 3: 最终 commit（如有修复）**

```bash
git add -A && git commit -m "fix: address build/test issues from prompt generation" --allow-empty
```
