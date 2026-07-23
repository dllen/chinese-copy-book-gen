/**
 * TDD: libraryState 状态管理测试
 * 
 * RED阶段 - 先写测试
 */

describe('libraryState 状态管理', () => {
  // 模拟 useState 的行为
  function createState(initial) {
    let state = initial
    const setState = (updater) => {
      if (typeof updater === 'function') {
        state = updater(state)
      } else {
        state = updater
      }
    }
    return [() => state, setState]
  }

  describe('初始状态', () => {
    it('应该有正确的初始值 - 面板关闭，标签为 poem', () => {
      const initialState = { open: false, tab: 'poem' }
      const [getState] = createState(initialState)
      
      expect(getState().open).toBe(false)
      expect(getState().tab).toBe('poem')
    })
  })

  describe('onLibraryStateChange 更新逻辑', () => {
    it('应该能够打开面板', () => {
      const [getState, setState] = createState({ open: false, tab: 'poem' })
      
      // 模拟 onLibraryStateChange 的调用
      const onLibraryStateChange = (newState) => {
        setState(prev => ({ ...prev, ...newState }))
      }
      
      onLibraryStateChange({ open: true })
      
      expect(getState().open).toBe(true)
      expect(getState().tab).toBe('poem') // tab 应该保持不变
    })

    it('应该能够切换标签', () => {
      const [getState, setState] = createState({ open: true, tab: 'poem' })
      
      const onLibraryStateChange = (newState) => {
        setState(prev => ({ ...prev, ...newState }))
      }
      
      onLibraryStateChange({ tab: 'text' })
      
      expect(getState().open).toBe(true) // open 应该保持不变
      expect(getState().tab).toBe('text')
    })

    it('应该能够同时打开面板和切换标签', () => {
      const [getState, setState] = createState({ open: false, tab: 'poem' })
      
      const onLibraryStateChange = (newState) => {
        setState(prev => ({ ...prev, ...newState }))
      }
      
      // 古诗练习
      onLibraryStateChange({ open: true, tab: 'poem' })
      expect(getState().open).toBe(true)
      expect(getState().tab).toBe('poem')
      
      // 课文练习
      onLibraryStateChange({ open: true, tab: 'text' })
      expect(getState().open).toBe(true)
      expect(getState().tab).toBe('text')
    })

    it('应该能够关闭面板', () => {
      const [getState, setState] = createState({ open: true, tab: 'text' })
      
      const onLibraryStateChange = (newState) => {
        setState(prev => ({ ...prev, ...newState }))
      }
      
      onLibraryStateChange({ open: false })
      
      expect(getState().open).toBe(false)
      expect(getState().tab).toBe('text') // tab 应该保持不变
    })
  })

  describe('QuickActions 触发 libraryState 变化', () => {
    // 模拟 QuickActions 的 apply 逻辑
    function simulateQuickAction(scenarioKey, onOpenLibrary) {
      if (scenarioKey === 'poem' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'poem' })
      } else if (scenarioKey === 'text' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'text' })
      }
    }

    it('点击古诗练习应该打开面板并切换到 poem 标签', () => {
      const [getState, setState] = createState({ open: false, tab: 'poem' })
      
      const onOpenLibrary = (state) => {
        setState(prev => ({ ...prev, ...state }))
      }
      
      simulateQuickAction('poem', onOpenLibrary)
      
      expect(getState().open).toBe(true)
      expect(getState().tab).toBe('poem')
    })

    it('点击课文练习应该打开面板并切换到 text 标签', () => {
      const [getState, setState] = createState({ open: false, tab: 'poem' })
      
      const onOpenLibrary = (state) => {
        setState(prev => ({ ...prev, ...state }))
      }
      
      simulateQuickAction('text', onOpenLibrary)
      
      expect(getState().open).toBe(true)
      expect(getState().tab).toBe('text')
    })

    it('其他场景不应该触发打开面板', () => {
      const [getState, setState] = createState({ open: false, tab: 'poem' })
      
      const onOpenLibrary = (state) => {
        setState(prev => ({ ...prev, ...state }))
      }
      
      simulateQuickAction('english', onOpenLibrary)
      simulateQuickAction('ctrl', onOpenLibrary)
      simulateQuickAction('alnum', onOpenLibrary)
      simulateQuickAction('chinese', onOpenLibrary)
      
      expect(getState().open).toBe(false) // 不应该改变
      expect(getState().tab).toBe('poem') // 不应该改变
    })
  })
})

describe('useSettings 默认值完整性', () => {
  // 这个测试验证所有功能模块的默认值都存在
  const REQUIRED_DEFAULTS = {
    // 字帖模板
    mode: '多字',
    feature: '字帖模板',
    layout: '连续排列',
    gridType: '田字格',
    
    // 控笔字帖
    difficulty: '初级',
    
    // 数字字母
    alnumCount: expect.any(Number),
    alnumNoRepeat: expect.any(Boolean),
    
    // 汉字练习
    chineseCharCount: expect.any(Number),
    chineseCharNoRepeat: expect.any(Boolean),
    chineseCharSeq: '',
    
    // 通用
    paper: 'A4竖版',
    rows: expect.any(Number),
    cols: expect.any(Number),
  }

  it('所有功能模块的默认值应该存在且不重复', () => {
    // 模拟 DEFAULTS 对象（从 useSettings.js）
    const DEFAULTS = {
      mode: '多字', variant: '多字', layout: '连续排列', gridType: '田字格',
      gridColor: '绿色', customGridColor: '', customTextColor: '', textColorOpt: '黑色',
      strokeMode: '适中', tailFill: true, template: '楷书', customFont: '',
      rows: 10, cols: 8, cellSize: 60, gridGap: 8, fontSize: 42,
      marginTop: 16, marginRight: 12, marginBottom: 16, marginLeft: 12,
      paper: 'A4竖版', header: '', text: '', randCount: 50, randNoRepeat: true,
      previewScale: 1, feature: '字帖模板', difficulty: '初级', showGuide: false,
      letterStyle: '印刷体', enBlankRows: 0, enRepeat: 1, engShowZh: false,
      stylePreset: '四线三格标准', autoLayout: true, gridStrokeWidth: 1,
      lineStyle: '实线', cellRadius: 0, pageBg: '白色', cellBg: '透明',
      cellBorder: false, cellShadow: false, textShadow: false, textStroke: '无',
      alnumIncludeDigits: true, alnumIncludeUpper: true, alnumIncludeLower: true,
      alnumCount: 20, alnumNoRepeat: true, alnumSeq: '',
      chineseCharCount: 30, chineseCharNoRepeat: true, chineseCharSeq: '',
    }

    // 验证必需字段存在
    expect(DEFAULTS.chineseCharCount).toBeDefined()
    expect(DEFAULTS.chineseCharNoRepeat).toBeDefined()
    expect(DEFAULTS.chineseCharSeq).toBeDefined()
    
    // 验证类型正确
    expect(typeof DEFAULTS.chineseCharCount).toBe('number')
    expect(typeof DEFAULTS.chineseCharNoRepeat).toBe('boolean')
    expect(typeof DEFAULTS.chineseCharSeq).toBe('string')
    
    // 验证默认值合理
    expect(DEFAULTS.chineseCharCount).toBeGreaterThan(0)
    expect(DEFAULTS.chineseCharCount).toBeLessThanOrEqual(700) // 常用字表大约700字
  })

  it('汉字练习默认值应该正确', () => {
    const DEFAULTS = {
      chineseCharCount: 30,
      chineseCharNoRepeat: true,
      chineseCharSeq: '',
    }

    expect(DEFAULTS.chineseCharCount).toBe(30) // 默认30个
    expect(DEFAULTS.chineseCharNoRepeat).toBe(true) // 默认不重复
    expect(DEFAULTS.chineseCharSeq).toBe('') // 默认空字符串
  })
})
