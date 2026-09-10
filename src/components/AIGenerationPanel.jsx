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

  const quickPrompts = [
    '一年级生字：天地人你我他',
    '唐诗：静夜思 李白',
    '数学：20以内加减法10题',
    '英语：26个字母大小写',
  ];

  const grades = ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'];
  const subjects = ['语文', '数学', '英语'];
  const contentTypes = ['汉字帖', '笔画帖', '口算题', '拼音临摹', '字母书写', '单词练习'];

  const handleGeneratePrompt = () => {
    console.log('TODO: generatePrompt');
  };

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
        onClick: handleGeneratePrompt,
        disabled: loading,
        style: { width: '100%' },
      }, '✨ 生成提示词')
    )
  );
}
