import React from 'react';
import { COURSE_TEMPLATES } from '../data/courseTemplates.data.js';

const CUSTOM_STORAGE_KEY = 'copybook-custom-templates';
const GRADE_ORDER = ['一年级', '二年级', '三年级', '四年级', '五年级'];

/**
 * 课程模板面板：内置 1-5 年级语文/英语模板 + 用户自定义模板
 * 一键应用：填入教材内容并自动匹配最佳排版配置
 */
export default function CourseTemplates({ settings, updateSetting, toast }) {
  const [subjectFilter, setSubjectFilter] = React.useState('全部');
  const [gradeFilter, setGradeFilter] = React.useState('全部');
  const [customTemplates, setCustomTemplates] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(CUSTOM_STORAGE_KEY)) || []; } catch { return []; }
  });
  const [saveOpen, setSaveOpen] = React.useState(false);
  const [saveName, setSaveName] = React.useState('');

  // 保存自定义模板到 localStorage
  const persistCustom = (list) => {
    setCustomTemplates(list);
    try { localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(list)); } catch { /* ignore */ }
  };

  // 一键应用模板：文本 + 推荐排版配置
  const applyTemplate = (tmpl) => {
    Object.entries(tmpl.config || {}).forEach(([k, v]) => updateSetting(k, v));
    updateSetting('text', tmpl.text);
    toast.success(`已应用「${tmpl.name}」，可直接打印或导出`);
  };

  // 保存当前内容为自定义模板
  const saveTemplate = () => {
    const name = saveName.trim() || `自定义模板 ${customTemplates.length + 1}`;
    const tmpl = {
      id: 'custom-' + Date.now(),
      name,
      grade: '自定义', subject: '自定义', type: 'custom', icon: '⭐',
      desc: `文本 ${(settings.text || '').length} 字`,
      text: settings.text || '',
      config: {
        feature: settings.feature, layout: settings.layout, gridType: settings.gridType,
        mode: settings.mode, cols: settings.cols, rows: settings.rows,
        cellSize: settings.cellSize, fontSize: settings.fontSize,
        ...(settings.layout === '英文格式' ? { letterStyle: settings.letterStyle } : {}),
      },
    };
    persistCustom([tmpl, ...customTemplates]);
    setSaveOpen(false);
    setSaveName('');
    toast.success('模板已保存');
  };

  const deleteCustom = (id) => {
    persistCustom(customTemplates.filter(t => t.id !== id));
    toast.success('已删除');
  };

  const exportCustom = () => {
    const blob = new Blob([JSON.stringify(customTemplates, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '我的字帖模板.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const importCustom = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const list = JSON.parse(ev.target?.result);
        if (Array.isArray(list)) {
          persistCustom([...list, ...customTemplates]);
          toast.success(`已导入 ${list.length} 个模板`);
        } else {
          toast.error('模板文件格式错误');
        }
      } catch {
        toast.error('模板文件解析失败');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // 筛选内置模板
  const filteredBuiltin = COURSE_TEMPLATES.filter(t => {
    if (subjectFilter !== '全部' && t.subject !== subjectFilter) return false;
    if (gradeFilter !== '全部' && t.grade !== gradeFilter) return false;
    return true;
  });

  // 按年级排序
  const sortedBuiltin = [...filteredBuiltin].sort((a, b) => {
    const ga = GRADE_ORDER.indexOf(a.grade), gb = GRADE_ORDER.indexOf(b.grade);
    if (ga !== gb) return (ga === -1 ? 99 : ga) - (gb === -1 ? 99 : gb);
    return (a.subject === '语文' ? 0 : 1) - (b.subject === '语文' ? 0 : 1);
  });

  const smallSelectStyle = { height: '28px', padding: '2px 28px 2px 8px', fontSize: '12px' };

  return React.createElement('div', { className: 'mb-3' },
    React.createElement('div', { className: 'section-card' },
      // 面板头部
      React.createElement('div', {
        className: 'section-header',
        onClick: (e) => {
          // 点击头部展开/收起（通过 toggle class 实现）
          const body = e.currentTarget.nextElementSibling;
          const chevron = e.currentTarget.querySelector('.section-chevron');
          const hidden = body.style.display === 'none';
          body.style.display = hidden ? '' : 'none';
          chevron.textContent = hidden ? '−' : '+';
        }
      },
        React.createElement('span', { className: 'section-title' },
          React.createElement('span', { className: 'me-1' }, '📚'),
          '课程模板 · 一键生成'
        ),
        React.createElement('span', { className: 'section-chevron' }, '+')
      ),
      // 面板内容（默认收起）
      React.createElement('div', { className: 'section-body', style: { display: 'none' } },
        React.createElement('p', { className: 'text-muted mb-2', style: { fontSize: '13px' } },
          '基于小学 1-5 年级语文/英语教材固化模板，点击「应用」一键填入内容并匹配最佳排版。'),

        // 筛选行
        React.createElement('div', { className: 'd-flex flex-wrap align-items-center gap-2 mb-2' },
          React.createElement('span', { className: 'text-muted', style: { fontSize: '12px' } }, '筛选：'),
          React.createElement('select', {
            className: 'form-select', style: { ...smallSelectStyle, width: '80px' },
            value: subjectFilter, onChange: e => setSubjectFilter(e.target.value),
            'aria-label': '学科筛选'
          },
            React.createElement('option', { value: '全部' }, '全部学科'),
            React.createElement('option', { value: '语文' }, '语文'),
            React.createElement('option', { value: '英语' }, '英语')
          ),
          React.createElement('select', {
            className: 'form-select', style: { ...smallSelectStyle, width: '90px' },
            value: gradeFilter, onChange: e => setGradeFilter(e.target.value),
            'aria-label': '年级筛选'
          },
            React.createElement('option', { value: '全部' }, '全部年级'),
            GRADE_ORDER.map(g => React.createElement('option', { key: g, value: g }, g))
          ),
          React.createElement('span', { className: 'text-muted', style: { fontSize: '12px' } },
            `共 ${sortedBuiltin.length} 个模板`)
        ),

        // 内置模板网格
        sortedBuiltin.length > 0 ? React.createElement('div', {
          className: 'row g-2 mb-3',
          style: { maxHeight: '300px', overflowY: 'auto' }
        },
          sortedBuiltin.map(t =>
            React.createElement('div', { key: t.id, className: 'col-6 col-md-4' },
              React.createElement('div', {
                className: 'border rounded p-2 h-100',
                style: { borderColor: t.subject === '英语' ? '#b8daff' : '#c3e6cb', background: t.subject === '英语' ? '#f0f7ff' : '#f6fff7' }
              },
                React.createElement('div', { className: 'd-flex align-items-center gap-1 mb-1' },
                  React.createElement('span', { style: { fontSize: '16px' } }, t.icon),
                  React.createElement('strong', { style: { fontSize: '13px' } }, t.name)
                ),
                React.createElement('div', { className: 'mb-1' },
                  React.createElement('span', { className: 'badge bg-light text-dark me-1' }, t.grade),
                  React.createElement('span', { className: 'badge ' + (t.subject === '语文' ? 'bg-success-subtle text-success-emphasis' : 'bg-primary-subtle text-primary-emphasis') }, t.subject)
                ),
                React.createElement('p', { className: 'text-muted mb-1', style: { fontSize: '11px' } }, t.desc),
                React.createElement('button', {
                  className: 'btn btn-sm btn-primary w-100',
                  onClick: () => applyTemplate(t)
                }, '应用')
              )
            )
          )
        ) : React.createElement('p', { className: 'text-muted', style: { fontSize: '13px' } }, '暂无匹配的模板'),

        // 用户自定义模板区
        React.createElement('hr', { className: 'my-2' }),
        React.createElement('div', { className: 'd-flex justify-content-between align-items-center mb-2' },
          React.createElement('strong', { style: { fontSize: '13px' } }, `我的模板（${customTemplates.length}）`),
          React.createElement('div', { className: 'd-flex gap-1' },
            React.createElement('button', {
              className: 'btn btn-sm btn-outline-primary',
              onClick: () => setSaveOpen(true),
              disabled: !(settings.text || '').trim()
            }, '保存当前'),
            React.createElement('button', {
              className: 'btn btn-sm btn-outline-secondary',
              onClick: exportCustom,
              disabled: customTemplates.length === 0
            }, '导出'),
            React.createElement('label', {
              className: 'btn btn-sm btn-outline-secondary mb-0',
              style: { cursor: 'pointer' }
            },
              '导入',
              React.createElement('input', {
                type: 'file', accept: '.json', style: { display: 'none' },
                onChange: importCustom
              })
            )
          )
        ),

        // 保存模板弹窗
        saveOpen ? React.createElement('div', {
          className: 'modal show d-block', tabIndex: -1,
          style: { background: 'rgba(0,0,0,0.5)', position: 'absolute', inset: 0, zIndex: 1050 }
        },
          React.createElement('div', { className: 'modal-dialog modal-sm', style: { margin: '15vh auto' } },
            React.createElement('div', { className: 'modal-content' },
              React.createElement('div', { className: 'modal-header' },
                React.createElement('h5', { className: 'modal-title', style: { fontSize: '14px' } }, '保存为模板'),
                React.createElement('button', {
                  type: 'button', className: 'btn-close',
                  onClick: () => setSaveOpen(false), 'aria-label': '关闭'
                })
              ),
              React.createElement('div', { className: 'modal-body' },
                React.createElement('p', { className: 'text-muted', style: { fontSize: '12px' } },
                  '将当前文本内容和排版配置保存为模板，方便下次一键复用。'),
                React.createElement('input', {
                  className: 'form-control form-control-sm',
                  placeholder: '模板名称（如：周末听写练习）',
                  value: saveName,
                  onChange: e => setSaveName(e.target.value),
                  onKeyDown: e => { if (e.key === 'Enter') saveTemplate(); }
                })
              ),
              React.createElement('div', { className: 'modal-footer' },
                React.createElement('button', { className: 'btn btn-sm btn-secondary', onClick: () => setSaveOpen(false) }, '取消'),
                React.createElement('button', { className: 'btn btn-sm btn-primary', onClick: saveTemplate }, '保存')
              )
            )
          )
        ) : null,

        // 自定义模板列表
        customTemplates.length > 0 ? React.createElement('div', { className: 'd-flex flex-column gap-1' },
          customTemplates.map(t =>
            React.createElement('div', {
              key: t.id,
              className: 'd-flex align-items-center justify-content-between border rounded px-2 py-1',
              style: { fontSize: '12px', background: '#fafafa' }
            },
              React.createElement('span', { className: 'text-truncate', style: { maxWidth: '60%' } },
                React.createElement('span', { className: 'me-1' }, t.icon || '⭐'),
                t.name,
                React.createElement('span', { className: 'text-muted ms-1' }, `(${(t.text || '').length}字)`)
              ),
              React.createElement('div', { className: 'd-flex gap-1' },
                React.createElement('button', {
                  className: 'btn btn-sm btn-outline-primary',
                  style: { height: '24px', padding: '0 6px', fontSize: '11px' },
                  onClick: () => applyTemplate(t)
                }, '应用'),
                React.createElement('button', {
                  className: 'btn btn-sm btn-outline-danger',
                  style: { height: '24px', padding: '0 6px', fontSize: '11px' },
                  onClick: () => deleteCustom(t.id)
                }, '删除')
              )
            )
          )
        ) : React.createElement('p', { className: 'text-muted mb-0', style: { fontSize: '12px' } },
          '还没有自定义模板，点击「保存当前」将正在编辑的内容固化为模板。')
      )
    )
  );
}
