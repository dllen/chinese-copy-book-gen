import React from 'react';

/**
 * 控笔/数字字母设置组件
 */
export default function SpecialFeatureSettings({
  feature,
  difficulty,
  showGuide,
  alnumIncludeDigits,
  alnumIncludeUpper,
  alnumIncludeLower,
  alnumCount,
  alnumNoRepeat,
  alnumSeqLocal,
  alnumStats,
  updateSetting,
  handleSetAlnumCount,
  onGenAlnum,
  chineseCharCount,
  chineseCharNoRepeat,
  chineseCharSeqLocal,
  onGenChineseChars
}) {
  if (feature === '控笔字帖') {
    return React.createElement('div', { className: 'mb-2' },
      React.createElement('label', { className: 'form-label', htmlFor: 'difficulty' }, '难度'),
      React.createElement('select', {
        id: 'difficulty',
        className: 'form-select',
        value: difficulty,
        onChange: e => updateSetting('difficulty', e.target.value)
      },
        ['初级', '中级', '高级'].map(v => React.createElement('option', { key: v, value: v }, v))
      ),
      React.createElement('div', { className: 'form-check mt-2' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'checkbox',
          id: 'showGuide',
          checked: showGuide,
          onChange: e => updateSetting('showGuide', e.target.checked)
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'showGuide' }, '显示笔顺引导')
      )
    );
  }

  if (feature === '数字字母') {
    return React.createElement('div', { className: 'mb-2' },
      React.createElement('div', { className: 'row g-2 mb-2' },
        React.createElement('div', { className: 'col-4' },
          React.createElement('div', { className: 'form-check' },
            React.createElement('input', {
              className: 'form-check-input',
              type: 'checkbox',
              id: 'alnumUpper',
              checked: alnumIncludeUpper,
              onChange: e => updateSetting('alnumIncludeUpper', e.target.checked)
            }),
            React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumUpper' }, '大写 A-Z')
          )
        ),
        React.createElement('div', { className: 'col-4' },
          React.createElement('div', { className: 'form-check' },
            React.createElement('input', {
              className: 'form-check-input',
              type: 'checkbox',
              id: 'alnumLower',
              checked: alnumIncludeLower,
              onChange: e => updateSetting('alnumIncludeLower', e.target.checked)
            }),
            React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumLower' }, '小写 a-z')
          )
        ),
        React.createElement('div', { className: 'col-4' },
          React.createElement('div', { className: 'form-check' },
            React.createElement('input', {
              className: 'form-check-input',
              type: 'checkbox',
              id: 'alnumDigits',
              checked: alnumIncludeDigits,
              onChange: e => updateSetting('alnumIncludeDigits', e.target.checked)
            }),
            React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumDigits' }, '数字 0-9')
          )
        )
      ),
      React.createElement('div', { className: 'row g-2 mb-2' },
        React.createElement('div', { className: 'col-6' },
          React.createElement('label', { className: 'form-label', htmlFor: 'alnumCount' }, '数量'),
          React.createElement('input', {
            id: 'alnumCount',
            className: 'form-control',
            type: 'number',
            min: 1,
            value: alnumCount,
            onChange: e => handleSetAlnumCount(e.target.value)
          })
        ),
        React.createElement('div', { className: 'col-6 d-flex align-items-end' },
          React.createElement('div', { className: 'form-check' },
            React.createElement('input', {
              className: 'form-check-input',
              type: 'checkbox',
              id: 'alnumNoRepeat',
              checked: alnumNoRepeat,
              onChange: e => updateSetting('alnumNoRepeat', e.target.checked)
            }),
            React.createElement('label', { className: 'form-check-label', htmlFor: 'alnumNoRepeat' }, '不重复')
          )
        )
      ),
      React.createElement('div', { className: 'mb-2' },
        React.createElement('button', {
          className: 'btn btn-outline-primary btn-sm',
          onClick: onGenAlnum
        }, '随机生成'),
        React.createElement('span', { className: 'ms-2 text-muted small' },
          `当前: ${alnumStats?.total || 0} 个 (大写 ${alnumStats?.upPct || 0}% / 小写 ${alnumStats?.lowPct || 0}% / 数字 ${alnumStats?.digPct || 0}%)`
        )
      ),
      React.createElement('div', { className: 'form-text' },
        '可手动输入序列，或点击"随机生成"'
      )
    );
  }

  if (feature === '汉字练习') {
    const chars = chineseCharSeqLocal || '';
    const count = chars.length;
    return React.createElement('div', { className: 'mb-2' },
      React.createElement('div', { className: 'row g-2 mb-2' },
        React.createElement('div', { className: 'col-6' },
          React.createElement('label', { className: 'form-label', htmlFor: 'chineseCharCount' }, '数量'),
          React.createElement('input', {
            id: 'chineseCharCount',
            className: 'form-control',
            type: 'number',
            min: 1,
            max: 500,
            value: chineseCharCount,
            onChange: e => updateSetting('chineseCharCount', Math.max(1, Math.min(500, parseInt(e.target.value) || 30)))
          })
        ),
        React.createElement('div', { className: 'col-6 d-flex align-items-end' },
          React.createElement('div', { className: 'form-check' },
            React.createElement('input', {
              className: 'form-check-input',
              type: 'checkbox',
              id: 'chineseCharNoRepeat',
              checked: chineseCharNoRepeat,
              onChange: e => updateSetting('chineseCharNoRepeat', e.target.checked)
            }),
            React.createElement('label', { className: 'form-check-label', htmlFor: 'chineseCharNoRepeat' }, '不重复')
          )
        )
      ),
      React.createElement('button', {
        className: 'btn btn-outline-primary btn-sm',
        onClick: () => onGenChineseChars?.({ count: chineseCharCount })
      }, '随机生成汉字'),
      React.createElement('span', { className: 'ms-2 text-muted small' },
        count > 0 ? `已生成 ${count} 个汉字` : '从常用字表中随机选取'
      ),
      count > 0 ? React.createElement('div', { className: 'mt-2 small text-muted' },
        '预览：' + chars.slice(0, 50) + (chars.length > 50 ? '…' : chars.length === 50 ? '' : '')
      ) : null,
      React.createElement('div', { className: 'form-text' },
        '从常用汉字表（约 700 字）中随机抽取，支持设置数量和不重复'
      )
    );
  }

  return null;
}
