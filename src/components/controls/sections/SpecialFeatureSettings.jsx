import React from 'react';
import { HelpTooltip } from '../../HelpTooltip';

/**
 * 字帖类型和样式设置组件
 * 支持：普通、看拼音写汉字、拼音字帖、数字字帖、汉字字帖
 * 样式：常规、不描字、半描字、全描字、隔行
 */
export default function SpecialFeatureSettings({
  feature,
  copybookType,
  copybookStyle,
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
  onGenChineseChars,
  pinyinText,
  hanziText
}) {
  // 字帖类型选项（对应 Copybook 的功能）
  const copybookTypeOptions = [
    { value: '普通', label: '普通', desc: '基础字帖，适合一般练习' },
    { value: '看拼音写汉字', label: '看拼音写汉字', desc: '显示拼音，底部留空书写汉字，适合语文练习' },
    { value: '拼音字帖', label: '拼音字帖', desc: '四线三格格式，练习拼音书写' },
    { value: '数字字帖', label: '数字字帖', desc: '数字专用格子，练习数字书写' },
    { value: '汉字字帖', label: '汉字字帖', desc: '田字格/米字格，练习汉字书写' },
  ];

  // 字帖样式选项
  const copybookStyleOptions = [
    { value: '常规', label: '常规', desc: '每个字占一格' },
    { value: '不描字', label: '不描字', desc: '每个字占一格，空白用于练习' },
    { value: '半描字', label: '半描字', desc: '一半格子有字，一半空白' },
    { value: '全描字', label: '全描字', desc: '每个格子都显示字' },
    { value: '隔行', label: '隔行', desc: '有字行和空白行交替' },
  ];

  // 控笔字帖
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

  // 数字字母
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

  // 汉字练习 - 使用字帖类型和样式
  if (feature === '汉字练习') {
    const chars = chineseCharSeqLocal || '';
    const count = chars.length;
    const currentType = copybookTypeOptions.find(o => o.value === copybookType) || copybookTypeOptions[0];
    const currentStyle = copybookStyleOptions.find(o => o.value === copybookStyle) || copybookStyleOptions[0];

    return React.createElement('div', { className: 'mb-2' },
      // 字帖类型选择
      React.createElement('div', { className: 'mb-2' },
        React.createElement(HelpTooltip, {
          content: '选择不同类型的字帖模板：普通适合基础练习，看拼音写汉字适合语文听写训练，拼音字帖适合拼音学习，数字字帖适合数学练习。',
          icon: 'info',
          placement: 'right'
        },
          React.createElement('label', { className: 'form-label', htmlFor: 'copybookType' }, '字帖类型')
        ),
        React.createElement('select', {
          id: 'copybookType',
          className: 'form-select',
          value: copybookType,
          onChange: e => {
            updateSetting('copybookType', e.target.value);
            // 自动切换到合适的格子类型
            const type = e.target.value;
            if (type === '拼音字帖') {
              updateSetting('gridType', '拼音格');
            } else if (type === '数字字帖') {
              updateSetting('gridType', '数字格');
            } else if (type === '汉字字帖') {
              updateSetting('gridType', '田字格');
            } else if (type === '看拼音写汉字') {
              updateSetting('gridType', '四线三格');
            }
          }
        },
          copybookTypeOptions.map(v => React.createElement('option', { key: v.value, value: v.value }, v.label))
        ),
        React.createElement('div', { className: 'form-text' }, currentType.desc)
      ),

      // 字帖样式选择
      React.createElement('div', { className: 'mb-2' },
        React.createElement(HelpTooltip, {
          content: '常规：每个字占一格 | 不描字：字和空白交替 | 半描字：奇数格显示偶数格空白 | 全描字：每个字重复 | 隔行：显示行和空白行交替',
          icon: 'info',
          placement: 'right'
        },
          React.createElement('label', { className: 'form-label', htmlFor: 'copybookStyle' }, '字帖样式')
        ),
        React.createElement('select', {
          id: 'copybookStyle',
          className: 'form-select',
          value: copybookStyle,
          onChange: e => updateSetting('copybookStyle', e.target.value)
        },
          copybookStyleOptions.map(v => React.createElement('option', { key: v.value, value: v.value }, v.label))
        ),
        React.createElement('div', { className: 'form-text' }, currentStyle.desc)
      ),

      // 看拼音写汉字时，显示拼音输入
      copybookType === '看拼音写汉字' ? React.createElement('div', { className: 'mb-2' },
        React.createElement(HelpTooltip, {
          content: '输入带声调的拼音（如 wo3 ai3），系统会在格子上方显示拼音，下方留空供书写汉字。用空格或逗号分隔每个拼音。',
          icon: 'info',
          placement: 'top'
        },
          React.createElement('label', { className: 'form-label', htmlFor: 'pinyinText' }, '拼音（空格分隔）')
        ),
        React.createElement('input', {
          id: 'pinyinText',
          className: 'form-control',
          type: 'text',
          placeholder: '例如: wo3 ai3 bei3 jing1',
          value: pinyinText || '',
          onChange: e => updateSetting('pinyinText', e.target.value)
        })
      ) : null,

      // 看拼音写汉字时，显示汉字输入
      copybookType === '看拼音写汉字' ? React.createElement('div', { className: 'mb-2' },
        React.createElement(HelpTooltip, {
          content: '填写正确答案，用空格或逗号分隔。打印后可作为答案对照，也可留空让练习者填写。',
          icon: 'info',
          placement: 'top'
        },
          React.createElement('label', { className: 'form-label', htmlFor: 'hanziText' }, '汉字答案（空格分隔）')
        ),
        React.createElement('input', {
          id: 'hanziText',
          className: 'form-control',
          type: 'text',
          placeholder: '例如: 我 爱 北 京',
          value: hanziText || '',
          onChange: e => updateSetting('hanziText', e.target.value)
        })
      ) : null,

      // 数量和不重复设置
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

      // 随机生成按钮
      React.createElement('button', {
        className: 'btn btn-outline-primary btn-sm',
        onClick: () => onGenChineseChars?.({ count: chineseCharCount })
      }, '随机生成汉字'),
      React.createElement('span', { className: 'ms-2 text-muted small' },
        count > 0 ? `已生成 ${count} 个汉字` : '从常用字表中随机选取'
      ),
      count > 0 ? React.createElement('div', { className: 'mt-2 small text-muted' },
        '预览：' + chars.slice(0, 50) + (chars.length > 50 ? '…' : '')
      ) : null
    );
  }

  return null;
}
