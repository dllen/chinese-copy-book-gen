import React from 'react';

/**
 * 教材筛选数据获取
 */
function getLibraryData() {
  const data = window.__copybookData__ || {};
  return {
    poems: data.poems || [],
    texts: data.texts || [],
    englishWords: data.englishWords || [],
    englishSentences: data.englishSentences || [],
  };
}

const GRADES = ['一年级上册', '一年级下册', '二年级上册', '二年级下册', '三年级上册', '三年级下册', '四年级上册', '四年级下册', '五年级上册', '五年级下册', '六年级上册', '六年级下册'];

/**
 * 文本输入区域组件
 */
export default function TextInputSection({
  mode,
  variant,
  layout,
  text,
  feature,
  updateSetting,
  onInsert
}) {
  const [gradeFilter, setGradeFilter] = React.useState('全部');
  const [titleFilter, setTitleFilter] = React.useState('');
  const [engUnitFilter, setEngUnitFilter] = React.useState('全部');
  const [engType, setEngType] = React.useState('word');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const data = React.useMemo(() => getLibraryData(), []);
  
  // 根据当前布局判断显示哪种筛选
  const showChineseFilter = feature === '字帖模板' && (layout === '古诗格式' || layout === '文章格式');
  const showEnglishFilter = feature === '字帖模板' && layout === '英文格式';
  
  // 获取英语单元列表
  const engUnits = React.useMemo(() => {
    const arr = engType === 'word' ? data.englishWords : data.englishSentences;
    const units = [...new Set(arr.map(x => x.u))].filter(Boolean).sort();
    return units;
  }, [data, engType]);

  // 筛选课文
  const filteredTexts = React.useMemo(() => {
    let result = data.texts;
    if (gradeFilter !== '全部') {
      result = result.filter(t => t.grade === gradeFilter);
    }
    if (titleFilter.trim()) {
      const q = titleFilter.trim().toLowerCase();
      result = result.filter(t => t.title.toLowerCase().includes(q));
    }
    return result;
  }, [data.texts, gradeFilter, titleFilter]);

  // 筛选唐诗
  const filteredPoems = React.useMemo(() => {
    let result = data.poems;
    if (gradeFilter !== '全部') {
      result = result.filter(p => (p.tags || []).some(t => GRADES.includes(t)));
    }
    if (titleFilter.trim()) {
      const q = titleFilter.trim().toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(q) ||
        (p.author || '').toLowerCase().includes(q) ||
        p.lines.some(l => l.includes(q))
      );
    }
    return result;
  }, [data.poems, gradeFilter, titleFilter]);

  // 筛选英语
  const filteredEnglish = React.useMemo(() => {
    const arr = engType === 'word' ? data.englishWords : data.englishSentences;
    let result = arr;
    if (gradeFilter !== '全部') {
      result = result.filter(x => x.g === gradeFilter);
    }
    if (engUnitFilter !== '全部') {
      result = result.filter(x => x.u === engUnitFilter);
    }
    if (titleFilter.trim()) {
      const q = titleFilter.trim().toLowerCase();
      result = result.filter(x => 
        (x.w || '').toLowerCase().includes(q) ||
        (x.t || '').toLowerCase().includes(q) ||
        (x.en || '').toLowerCase().includes(q)
      );
    }
    return result;
  }, [data, engType, gradeFilter, engUnitFilter, titleFilter]);

  // 重置选中索引当筛选变化时，默认选第一个
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [gradeFilter, titleFilter, engUnitFilter, engType]);

  // 获取当前列表和选中项
  const getCurrentList = () => {
    if (layout === '古诗格式') return filteredPoems;
    if (layout === '文章格式') return filteredTexts;
    if (layout === '英文格式') return filteredEnglish;
    return [];
  };

  const getSelectedItem = () => {
    const list = getCurrentList();
    return list[selectedIndex] || null;
  };

  // 一键填入所有内容
  const fillAllContent = () => {
    const list = getCurrentList();
    if (list.length === 0) return;

    if (layout === '古诗格式') {
      const allLines = list.flatMap(p => [p.title, p.author, ...p.lines, '']);
      updateSetting('text', allLines.join('\n').trim());
    } else if (layout === '文章格式') {
      const allParagraphs = list.flatMap(t => [t.title, ...t.paragraphs, '']);
      updateSetting('text', allParagraphs.join('\n').trim());
    } else if (layout === '英文格式') {
      if (engType === 'word') {
        const words = list.map(x => x.t ? `${x.w} ${x.t}` : x.w);
        updateSetting('text', words.join('\n'));
      } else {
        const sentences = list.map(x => x.en);
        updateSetting('text', sentences.join('\n'));
      }
    }
  };

  // 填入选中项
  const fillSelected = () => {
    const item = getSelectedItem();
    if (!item) return;

    if (layout === '古诗格式') {
      const head = [item.title];
      if (item.author) head.push(item.author);
      updateSetting('text', head.concat(item.lines).join('\n'));
    } else if (layout === '文章格式') {
      updateSetting('text', [item.title, ...item.paragraphs].join('\n'));
    } else if (layout === '英文格式') {
      if (engType === 'word') {
        updateSetting('text', item.t ? `${item.w} ${item.t}` : item.w);
      } else {
        updateSetting('text', item.en);
      }
    }
  };

  // 获取筛选结果数量
  const getFilterCount = () => {
    if (layout === '古诗格式') return filteredPoems.length;
    if (layout === '文章格式') return filteredTexts.length;
    if (layout === '英文格式') return filteredEnglish.length;
    return 0;
  };

  const currentList = getCurrentList();
  const selectedItem = getSelectedItem();

  // 小型表单控件样式
  const smallSelectStyle = { height: '26px', padding: '2px 28px 2px 6px', fontSize: '12px' };
  const smallInputStyle = { height: '26px', fontSize: '12px', padding: '2px 8px' };
  const smallBtnStyle = { height: '26px', padding: '2px 8px', fontSize: '12px' };

  // 标签和控件组合
  const FilterLabel = ({ children }) => 
    React.createElement('span', { className: 'text-muted', style: { fontSize: '12px', lineHeight: '26px', marginRight: '2px', whiteSpace: 'nowrap' } }, children);

  return React.createElement('div', { className: 'mb-3' },
    React.createElement('label', { className: 'form-label', htmlFor: 'text' }, '文本内容'),
    React.createElement('div', { className: 'd-flex justify-content-between align-items-center mb-1' },
      React.createElement('small', { className: 'text-muted' }, `${(text || '').length} 字`),
      React.createElement('button', {
        className: 'btn btn-sm btn-outline-secondary',
        onClick: () => updateSetting('text', ''),
        disabled: !text
      }, '清空')
    ),
    
    // 教材筛选区域
    (showChineseFilter || showEnglishFilter) ? React.createElement('div', { className: 'border rounded p-2 mb-2 bg-light' },
      // 第一行：筛选条件
      React.createElement('div', { className: 'd-flex flex-wrap align-items-center gap-2 mb-2' },
        FilterLabel({ children: '📚 教材筛选' }),
        
        // 标题搜索
        React.createElement('input', {
          type: 'text',
          className: 'form-control',
          style: { ...smallInputStyle, width: '130px' },
          placeholder: '搜索标题',
          value: titleFilter,
          onChange: e => setTitleFilter(e.target.value)
        }),
        
        // 年级筛选
        React.createElement('select', {
          className: 'form-select',
          style: { ...smallSelectStyle, width: '110px' },
          value: gradeFilter,
          onChange: e => setGradeFilter(e.target.value)
        },
          React.createElement('option', { value: '全部' }, '全部年级'),
          GRADES.map(g => React.createElement('option', { key: g, value: g }, g))
        ),
        
        // 英语类型筛选
        showEnglishFilter ? React.createElement(React.Fragment, { key: 'eng-type' },
          React.createElement('select', {
            className: 'form-select',
            style: { ...smallSelectStyle, width: '70px' },
            value: engType,
            onChange: e => setEngType(e.target.value)
          },
            React.createElement('option', { value: 'word' }, '单词'),
            React.createElement('option', { value: 'sentence' }, '句子')
          ),
          React.createElement('select', {
            className: 'form-select',
            style: { ...smallSelectStyle, width: '90px' },
            value: engUnitFilter,
            onChange: e => setEngUnitFilter(e.target.value)
          },
            React.createElement('option', { value: '全部' }, '全部单元'),
            engUnits.map(u => React.createElement('option', { key: u, value: u }, u.replace('Unit ', 'U')))
          )
        ) : null
      ),
      
      // 第二行：结果选择和操作
      React.createElement('div', { className: 'd-flex align-items-center gap-2 flex-wrap' },
        FilterLabel({ children: 
          layout === '古诗格式' ? `唐诗 ${filteredPoems.length}首` :
          layout === '文章格式' ? `课文 ${filteredTexts.length}篇` :
          `英语 ${filteredEnglish.length}${engType === 'word' ? '词' : '句'}`
        }),
        
        // 结果下拉选择
        currentList.length > 0 ? React.createElement(React.Fragment, null,
          React.createElement('select', {
            className: 'form-select',
            style: { ...smallSelectStyle, width: '180px' },
            value: selectedIndex,
            onChange: e => setSelectedIndex(parseInt(e.target.value))
          },
            currentList.map((item, i) => React.createElement('option', { key: i, value: i },
              layout === '古诗格式' ? `${item.title} - ${item.author}` :
              layout === '文章格式' ? `${item.title} (${item.grade})` :
              engType === 'word' ? `${item.w} ${item.t || ''}` : item.en.slice(0, 25)
            ))
          ),
          
          // 填入选中项按钮
          React.createElement('button', {
            className: 'btn btn-outline-primary',
            style: smallBtnStyle,
            onClick: fillSelected,
            disabled: !selectedItem
          }, '填入'),
          
          // 一键填入所有按钮
          React.createElement('button', {
            className: 'btn btn-primary',
            style: smallBtnStyle,
            onClick: fillAllContent
          }, `全部 ${currentList.length}条`)
        ) : React.createElement('span', { className: 'text-muted', style: { fontSize: '12px' } }, '无匹配结果')
      )
    ) : null,
    
    React.createElement('textarea', {
      id: 'text',
      className: 'form-control font-monospace',
      rows: 4,
      value: text,
      onChange: e => updateSetting('text', e.target.value),
      placeholder: '输入文字，或使用上方教材筛选一键填入',
      'aria-label': '文本内容'
    }),
    feature === '字帖模板' && layout === '连续排列' ? React.createElement('div', { className: 'mt-2' },
      React.createElement('div', { className: 'form-check form-check-inline' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'radio',
          name: 'mode',
          id: 'mode-multi',
          value: '多字',
          checked: mode === '多字',
          onChange: () => updateSetting('mode', '多字')
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-multi' }, '多字')
      ),
      React.createElement('div', { className: 'form-check form-check-inline' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'radio',
          name: 'mode',
          id: 'mode-word',
          value: '多词',
          checked: mode === '多词',
          onChange: () => updateSetting('mode', '多词')
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-word' }, '多词')
      ),
      React.createElement('div', { className: 'form-check form-check-inline' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'radio',
          name: 'mode',
          id: 'mode-sentence',
          value: '多句',
          checked: mode === '多句',
          onChange: () => updateSetting('mode', '多句')
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-sentence' }, '多句')
      ),
      React.createElement('div', { className: 'form-check form-check-inline' },
        React.createElement('input', {
          className: 'form-check-input',
          type: 'radio',
          name: 'mode',
          id: 'mode-article',
          value: '文章',
          checked: mode === '文章',
          onChange: () => updateSetting('mode', '文章')
        }),
        React.createElement('label', { className: 'form-check-label', htmlFor: 'mode-article' }, '文章')
      )
    ) : null
  );
}
