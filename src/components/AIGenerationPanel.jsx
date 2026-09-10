import React, { useState, useCallback } from 'react';

/**
 * AIGenerationPanel — AI-powered content generation using local Ollama API.
 * Generates copybook content (poems, characters, math problems) from a text prompt.
 */
export default function AIGenerationPanel({ onGenerated, toast }) {
  const [prompt, setPrompt] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = React.useState('generate'); // 'generate' | 'prompt'
  const [platform, setPlatform] = React.useState('chat'); // 'chat' | 'image'
  const [showAdvanced, setShowAdvanced] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [promptOutput, setPromptOutput] = useState('');
  const [advGrade, setAdvGrade] = React.useState('');
  const [advSubject, setAdvSubject] = React.useState('');
  const [advType, setAdvType] = React.useState('');
  const [advCount, setAdvCount] = React.useState('');

  const generate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      toast?.warn?.('请输入内容描述') || toast?.('请输入内容描述', 'warning');
      return;
    }
    setLoading(true);
    setOutput('');
    try {
      const systemPrompt = `你是一个字帖内容生成助手。根据用户描述，生成适合小学生练习的字帖内容。
要求：
1. 只输出纯文本内容，不要解释或额外文字
2. 汉字内容控制在 20-100 字之间
3. 数学题生成 10-20 道题目
4. 英文内容生成字母、单词或短句
5. 内容要适合对应年级水平`;

      const res = await fetch('http://localhost:11434/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3',
          prompt: `${systemPrompt}\n\n用户需求：${trimmed}\n\n字帖内容：`,
          stream: false,
          options: { temperature: 0.7, num_predict: 500 },
        }),
      });

      if (!res.ok) throw new Error(`API 错误: ${res.status}`);
      const data = await res.json();
      const text = data.response?.trim() || '';
      setOutput(text);
      if (text && onGenerated) onGenerated(text);
      toast?.success?.('AI 生成成功') || toast?.('AI 生成成功', 'success');
    } catch (err) {
      const msg = err.message || '生成失败';
      setOutput(`生成失败: ${msg}\n\n提示：请确保本地 Ollama 服务已启动 (http://localhost:11434)`);
      toast?.error?.('AI 生成失败') || toast?.('AI 生成失败', 'error');
    } finally {
      setLoading(false);
    }
  }, [prompt, onGenerated, toast]);

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

  const quickPrompts = [
    '一年级生字：天地人你我他',
    '唐诗：静夜思 李白',
    '数学：20以内加减法10题',
    '英语：26个字母大小写',
  ];

  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  const subjects = ['语文', '数学', '英语'];
  const contentTypes = ['汉字帖', '笔画帖', '口算题', '拼音临摹', '字母书写', '单词练习'];

  return React.createElement(
    'div',
    { className: 'ai-panel' },
    React.createElement('div', { className: 'ai-panel-title' }, '🤖 AI 智能生成'),

    // Tab UI
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

    // Platform selector (only when activeTab === 'prompt')
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

    // Generate tab: existing input row + quick prompts + output
    activeTab === 'generate' && React.createElement(
      React.Fragment,
      null,
      React.createElement(
        'div',
        { className: 'ai-input-row' },
        React.createElement('textarea', {
          placeholder: '描述你需要的字帖内容，如"一年级语文生字练习"或"乘法口诀练习题"',
          value: prompt,
          onChange: (e) => setPrompt(e.target.value),
          onKeyDown: (e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) generate(); },
          rows: 2,
          style: { flex: 1 },
        }),
        React.createElement('button', {
          className: 'btn-gradient-primary',
          onClick: generate,
          disabled: loading,
          style: { alignSelf: 'flex-end', whiteSpace: 'nowrap' },
        }, loading ? '生成中...' : '✨ 生成')
      ),
      React.createElement(
        'div',
        { style: { marginTop: '.75rem', display: 'flex', flexWrap: 'wrap', gap: '.5rem' } },
        quickPrompts.map((qp, i) =>
          React.createElement('button', {
            key: i,
            className: 'btn btn-sm btn-outline-secondary',
            onClick: () => { setPrompt(qp); },
            style: { fontSize: '.75rem', borderRadius: 'var(--radius-md)' },
          }, qp)
        )
      ),
      output && React.createElement('div', { className: 'ai-output' }, output)
    ),

    // Prompt tab: prompt-mode input area
    activeTab === 'prompt' && React.createElement(
      React.Fragment,
      null,
      React.createElement('textarea', {
        placeholder: '描述你想要的字帖内容，例如"一年级语文生字练习"',
        value: prompt,
        onChange: (e) => setPrompt(e.target.value),
        rows: 3,
        style: { width: '100%', marginBottom: '.75rem' },
      }),

      // Advanced toggle button
      React.createElement('button', {
        className: 'btn btn-sm btn-outline-secondary',
        onClick: () => setShowAdvanced(!showAdvanced),
        style: { marginBottom: '.75rem' },
      }, showAdvanced ? '▲ 收起高级选项' : '▼ 高级选项'),

      // Advanced form
      showAdvanced && React.createElement(
        'div',
        { className: 'advanced-form', style: { marginBottom: '.75rem' } },
        // Grade selector
        React.createElement('div', { style: { marginBottom: '.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '.8rem', marginBottom: '.25rem' } }, '年级'),
          React.createElement(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '.4rem' } },
            grades.map((g) =>
              React.createElement('button', {
                key: g,
                className: `btn btn-sm ${advGrade === g ? 'btn-primary' : 'btn-outline-secondary'}`,
                onClick: () => setAdvGrade(g),
              }, g)
            )
          )
        ),
        // Subject selector
        React.createElement('div', { style: { marginBottom: '.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '.8rem', marginBottom: '.25rem' } }, '学科'),
          React.createElement(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '.4rem' } },
            subjects.map((s) =>
              React.createElement('button', {
                key: s,
                className: `btn btn-sm ${advSubject === s ? 'btn-primary' : 'btn-outline-secondary'}`,
                onClick: () => setAdvSubject(s),
              }, s)
            )
          )
        ),
        // Content type selector
        React.createElement('div', { style: { marginBottom: '.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '.8rem', marginBottom: '.25rem' } }, '内容类型'),
          React.createElement(
            'div',
            { style: { display: 'flex', flexWrap: 'wrap', gap: '.4rem' } },
            contentTypes.map((t) =>
              React.createElement('button', {
                key: t,
                className: `btn btn-sm ${advType === t ? 'btn-primary' : 'btn-outline-secondary'}`,
                onClick: () => setAdvType(t),
              }, t)
            )
          )
        ),
        // Count input
        React.createElement('div', { style: { marginBottom: '.5rem' } },
          React.createElement('label', { style: { display: 'block', fontSize: '.8rem', marginBottom: '.25rem' } }, '数量'),
          React.createElement('input', {
            type: 'number',
            value: advCount,
            onChange: (e) => setAdvCount(e.target.value),
            placeholder: '例如：20',
            min: 1,
            max: 200,
            style: { width: '100%', padding: '.4rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' },
          })
        )
      ),

      // Generate prompt button
      React.createElement('button', {
        className: 'btn-gradient-primary',
        onClick: generatePrompt,
        disabled: loading,
        style: { width: '100%' },
      }, '✨ 生成提示词'),

      // Prompt output display with copy button
      activeTab === 'prompt' && promptOutput && React.createElement(
        'div',
        { className: 'copy-output-card' },
        React.createElement('button', {
          className: `copy-btn ${copied ? 'copied' : ''}`,
          onClick: () => handleCopy(promptOutput),
        }, copied ? '✓ 已复制' : '📋 复制'),
        React.createElement('div', { className: 'ai-output' }, promptOutput)
      )
    )
  );
}
