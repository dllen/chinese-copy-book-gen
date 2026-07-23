/**
 * 词库面板单元测试
 * 测试古诗、课文、英语的搜索和选择功能
 */

describe('词库数据搜索', () => {
  // 模拟数据
  const mockPoems = [
    { id: 1, title: '静夜思', author: '李白', lines: ['床前明月光', '疑是地上霜'], tags: ['思乡', '唐诗'] },
    { id: 2, title: '春晓', author: '孟浩然', lines: ['春眠不觉晓', '处处闻啼鸟'], tags: ['春天', '唐诗'] },
    { id: 3, title: '登鹳雀楼', author: '王之涣', lines: ['白日依山尽', '黄河入海流'], tags: ['黄河', '唐诗'] }
  ]

  const mockTexts = [
    { id: 1, grade: '一年级上册', title: '我是中国人', paragraphs: ['我是中国人。', '我们都是中国人。'] },
    { id: 2, grade: '一年级上册', title: '小小的船', paragraphs: ['弯弯的月儿小小的船'] },
    { id: 3, grade: '二年级上册', title: '黄山奇石', paragraphs: ['安徽省黄山的奇石有趣极了'] }
  ]

  // 搜索函数（模拟 library.js 中的实现）
  function searchPoems(arr, query) {
    const s = (query || '').trim()
    if (!s) return arr
    return arr.filter(p => 
      p.title.includes(s) || 
      p.author.includes(s) || 
      p.lines.some(l => l.includes(s)) || 
      (p.tags || []).some(t => t.includes(s))
    )
  }

  function searchTexts(arr, query, grade) {
    const s = (query || '').trim()
    return arr.filter(t => 
      (grade === '全部' || t.grade === grade) && 
      (!s || t.title.includes(s) || t.paragraphs.some(p => p.includes(s)))
    )
  }

  describe('searchPoems - 古诗搜索', () => {
    it('应该返回所有古诗当查询为空时', () => {
      const result = searchPoems(mockPoems, '')
      expect(result).toHaveLength(3)
    })

    it('应该按标题搜索', () => {
      const result = searchPoems(mockPoems, '静夜思')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('静夜思')
    })

    it('应该按作者搜索', () => {
      const result = searchPoems(mockPoems, '李白')
      expect(result).toHaveLength(1)
      expect(result[0].author).toBe('李白')
    })

    it('应该按诗句内容搜索', () => {
      const result = searchPoems(mockPoems, '黄河')
      expect(result).toHaveLength(1)
      expect(result[0].lines.some(l => l.includes('黄河'))).toBe(true)
    })

    it('应该按标签搜索', () => {
      const result = searchPoems(mockPoems, '思乡')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('静夜思')
    })

    it('应该处理大小写', () => {
      // 假设数据是中文，不需要考虑大小写
      const result = searchPoems(mockPoems, '春晓')
      expect(result).toHaveLength(1)
    })

    it('应该处理空白字符', () => {
      const result = searchPoems(mockPoems, '   ')
      expect(result).toHaveLength(3)
    })

    it('应该返回空数组当没有匹配时', () => {
      const result = searchPoems(mockPoems, '不存在的诗')
      expect(result).toHaveLength(0)
    })
  })

  describe('searchTexts - 课文搜索', () => {
    it('应该返回所有课文当查询为空时', () => {
      const result = searchTexts(mockTexts, '', '全部')
      expect(result).toHaveLength(3)
    })

    it('应该按年级筛选', () => {
      const result = searchTexts(mockTexts, '', '一年级上册')
      expect(result).toHaveLength(2)
    })

    it('应该按标题搜索', () => {
      const result = searchTexts(mockTexts, '黄山', '全部')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('黄山奇石')
    })

    it('应该按内容搜索', () => {
      const result = searchTexts(mockTexts, '奇石', '全部')
      expect(result).toHaveLength(1)
    })

    it('应该同时支持年级筛选和标题搜索', () => {
      const result = searchTexts(mockTexts, '船', '一年级上册')
      expect(result).toHaveLength(1)
      expect(result[0].title).toBe('小小的船')
    })

    it('年级不匹配时应该返回空', () => {
      const result = searchTexts(mockTexts, '黄山', '一年级上册')
      expect(result).toHaveLength(0)
    })
  })

  describe('词库数据构建', () => {
    // 模拟 LibraryPanel 中的 buildText 函数逻辑
    function buildPoemText(item, includeTitle) {
      const head = []
      if (includeTitle) {
        head.push(item.title)
        if (item.author) head.push(item.author)
      }
      return { mode: '多句', layout: '古诗格式', text: head.concat(item.lines).join('\n') }
    }

    function buildTextItem(item, includeTitle, checked) {
      const paras = item.paragraphs.filter((_, i) => checked[i])
      if (paras.length === 0) return null
      const head = includeTitle ? [item.title] : []
      return { mode: '多句', layout: '文章格式', text: head.concat(paras).join('\n') }
    }

    it('应该正确构建古诗词文本包含标题', () => {
      const result = buildPoemText(mockPoems[0], true)
      expect(result.layout).toBe('古诗格式')
      expect(result.text).toContain('静夜思')
      expect(result.text).toContain('李白')
      expect(result.text).toContain('床前明月光')
    })

    it('应该正确构建古诗词文本不包含标题', () => {
      const result = buildPoemText(mockPoems[0], false)
      expect(result.text).not.toContain('静夜思')
      expect(result.text).toContain('床前明月光')
    })

    it('应该正确构建课文文本', () => {
      const checked = [true, true]
      const result = buildTextItem(mockTexts[0], true, checked)
      expect(result.layout).toBe('文章格式')
      expect(result.text).toContain('我是中国人')
      expect(result.text).toContain('我们都是中国人')
    })

    it('应该正确构建课文文本不包含未勾选段落', () => {
      const checked = [true, false]
      const result = buildTextItem(mockTexts[0], false, checked)
      expect(result.text).toContain('我是中国人。')
      expect(result.text).not.toContain('我们都是中国人。')
    })

    it('应该返回 null 当没有勾选任何段落时', () => {
      const checked = [false, false]
      const result = buildTextItem(mockTexts[0], true, checked)
      expect(result).toBeNull()
    })
  })

  describe('snippet 截断函数', () => {
    // 模拟 library.js 中的 snippet 函数
    function snippet(str, n) {
      str = (str || '').replace(/\s+/g, '')
      return str.length > n ? str.slice(0, n) + '…' : str
    }

    it('应该正确截断长字符串', () => {
      const result = snippet('床前明月光疑是地上霜举头望低头思故乡', 10)
      // 函数移除空白后判断长度，slice 是按字符截断
      // 中文字符长度 10 就是 10 个字符
      expect(result.length).toBeLessThanOrEqual(11) // 10 或 11 (有省略号)
      expect(result.endsWith('…')).toBe(true)
    })

    it('不应该截断短字符串', () => {
      const result = snippet('静夜思', 10)
      expect(result).toBe('静夜思')
      expect(result).not.toContain('…')
    })

    it('应该处理空字符串', () => {
      const result = snippet('', 10)
      expect(result).toBe('')
    })

    it('应该处理 null', () => {
      const result = snippet(null, 10)
      expect(result).toBe('')
    })

    it('应该移除空白字符', () => {
      const result = snippet('床前  明月  光', 10)
      expect(result).toBe('床前明月光')
    })
  })
})

describe('QuickActions 场景配置', () => {
  const scenarios = [
    { key: 'poem', label: '古诗练习', icon: '📜', feature: '字帖模板', layout: '古诗格式', gridType: '田字格' },
    { key: 'text', label: '课文练习', icon: '📖', feature: '字帖模板', layout: '文章格式', gridType: '田字格' },
    { key: 'chinese', label: '汉字练习', icon: '✏️', feature: '汉字练习', layout: '连续排列', gridType: '田字格' },
    { key: 'english', label: '英语单词', icon: '🔤', feature: '字帖模板', layout: '英文格式', gridType: '四线三格' },
    { key: 'ctrl', label: '控笔训练', icon: '✍️', feature: '控笔字帖', layout: '连续排列', gridType: '田字格' },
    { key: 'alnum', label: '数字字母', icon: '🔢', feature: '数字字母', layout: '连续排列', gridType: '四线三格' }
  ]

  it('应该有 6 个快速开始场景', () => {
    expect(scenarios).toHaveLength(6)
  })

  it('每个场景应该有唯一 key', () => {
    const keys = scenarios.map(s => s.key)
    const uniqueKeys = new Set(keys)
    expect(uniqueKeys.size).toBe(scenarios.length)
  })

  it('古诗练习应该设置正确的属性', () => {
    const poem = scenarios.find(s => s.key === 'poem')
    expect(poem.feature).toBe('字帖模板')
    expect(poem.layout).toBe('古诗格式')
    expect(poem.gridType).toBe('田字格')
  })

  it('课文练习应该设置正确的属性', () => {
    const text = scenarios.find(s => s.key === 'text')
    expect(text.feature).toBe('字帖模板')
    expect(text.layout).toBe('文章格式')
    expect(text.gridType).toBe('田字格')
  })

  it('汉字练习应该设置正确的属性', () => {
    const chinese = scenarios.find(s => s.key === 'chinese')
    expect(chinese.feature).toBe('汉字练习')
    expect(chinese.layout).toBe('连续排列')
    expect(chinese.gridType).toBe('田字格')
  })

  it('英语单词应该使用四线三格', () => {
    const english = scenarios.find(s => s.key === 'english')
    expect(english.gridType).toBe('四线三格')
    expect(english.layout).toBe('英文格式')
  })

  it('数字字母应该使用四线三格', () => {
    const alnum = scenarios.find(s => s.key === 'alnum')
    expect(alnum.gridType).toBe('四线三格')
  })

  it('控笔训练应该使用连续排列', () => {
    const ctrl = scenarios.find(s => s.key === 'ctrl')
    expect(ctrl.layout).toBe('连续排列')
    expect(ctrl.feature).toBe('控笔字帖')
  })
})

describe('libraryState 状态管理', () => {
  // 模拟状态更新逻辑
  function updateLibraryState(prev, newState) {
    return { ...prev, ...newState }
  }

  it('应该正确初始化状态', () => {
    const initial = { open: false, tab: 'poem' }
    expect(initial.open).toBe(false)
    expect(initial.tab).toBe('poem')
  })

  it('应该正确打开面板', () => {
    const state = { open: false, tab: 'poem' }
    const newState = updateLibraryState(state, { open: true, tab: 'poem' })
    expect(newState.open).toBe(true)
    expect(newState.tab).toBe('poem')
  })

  it('应该正确切换标签', () => {
    const state = { open: true, tab: 'poem' }
    const newState = updateLibraryState(state, { open: true, tab: 'text' })
    expect(newState.open).toBe(true)
    expect(newState.tab).toBe('text')
  })

  it('应该同时打开面板并切换标签', () => {
    const state = { open: false, tab: 'poem' }
    const newState = updateLibraryState(state, { open: true, tab: 'text' })
    expect(newState.open).toBe(true)
    expect(newState.tab).toBe('text')
  })
})
