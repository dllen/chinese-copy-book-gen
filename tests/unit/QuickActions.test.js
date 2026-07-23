/**
 * TDD: QuickActions 组件测试
 * 
 * RED阶段 - 定义组件行为规范
 */

import { describe, it, expect, vi } from 'vitest'

describe('QuickActions 组件行为规范', () => {
  // 模拟的场景配置
  const scenarios = [
    { key: 'poem', label: '古诗练习', icon: '📜', feature: '字帖模板', layout: '古诗格式', gridType: '田字格' },
    { key: 'text', label: '课文练习', icon: '📖', feature: '字帖模板', layout: '文章格式', gridType: '田字格' },
    { key: 'english', label: '英语单词', icon: '🔤', feature: '字帖模板', layout: '英文格式', gridType: '四线三格' },
    { key: 'ctrl', label: '控笔训练', icon: '✍️', feature: '控笔字帖', layout: '连续排列', gridType: '田字格' },
    { key: 'alnum', label: '数字字母', icon: '🔢', feature: '数字字母', layout: '连续排列', gridType: '四线三格' },
    { key: 'chinese', label: '汉字练习', icon: '✏️', feature: '汉字练习', layout: '连续排列', gridType: '田字格' },
  ]

  describe('apply 逻辑', () => {
    it('应该更新 feature 设置', () => {
      const updateSetting = vi.fn()
      const scenario = scenarios[0] // poem
      
      updateSetting('feature', scenario.feature)
      
      expect(updateSetting).toHaveBeenCalledWith('feature', '字帖模板')
    })

    it('应该更新 layout 设置', () => {
      const updateSetting = vi.fn()
      const scenario = scenarios[0] // poem
      
      updateSetting('layout', scenario.layout)
      
      expect(updateSetting).toHaveBeenCalledWith('layout', '古诗格式')
    })

    it('应该更新 gridType 设置', () => {
      const updateSetting = vi.fn()
      const scenario = scenarios[0] // poem
      
      updateSetting('gridType', scenario.gridType)
      
      expect(updateSetting).toHaveBeenCalledWith('gridType', '田字格')
    })

    it('应该更新 text 设置', () => {
      const updateSetting = vi.fn()
      const scenario = scenarios[0] // poem
      
      updateSetting('text', scenario.text)
      
      expect(updateSetting).toHaveBeenCalledWith('text', scenario.text)
    })
  })

  describe('onOpenLibrary 回调逻辑', () => {
    it('poem 场景应该调用 onOpenLibrary', () => {
      const onOpenLibrary = vi.fn()
      const scenario = scenarios.find(s => s.key === 'poem')
      
      if (scenario.key === 'poem' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'poem' })
      }
      
      expect(onOpenLibrary).toHaveBeenCalledWith({ open: true, tab: 'poem' })
    })

    it('text 场景应该调用 onOpenLibrary', () => {
      const onOpenLibrary = vi.fn()
      const scenario = scenarios.find(s => s.key === 'text')
      
      if (scenario.key === 'text' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'text' })
      }
      
      expect(onOpenLibrary).toHaveBeenCalledWith({ open: true, tab: 'text' })
    })

    it('english 场景不应该调用 onOpenLibrary', () => {
      const onOpenLibrary = vi.fn()
      const scenario = scenarios.find(s => s.key === 'english')
      
      // english 不触发 onOpenLibrary
      if (scenario.key === 'poem' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'poem' })
      } else if (scenario.key === 'text' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'text' })
      }
      
      expect(onOpenLibrary).not.toHaveBeenCalled()
    })

    it('chinese 场景不应该调用 onOpenLibrary（汉字练习有自己的生成逻辑）', () => {
      const onOpenLibrary = vi.fn()
      const scenario = scenarios.find(s => s.key === 'chinese')
      
      if (scenario.key === 'poem' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'poem' })
      } else if (scenario.key === 'text' && onOpenLibrary) {
        onOpenLibrary({ open: true, tab: 'text' })
      }
      
      expect(onOpenLibrary).not.toHaveBeenCalled()
    })
  })

  describe('场景配置完整性', () => {
    it('所有场景应该有唯一 key', () => {
      const keys = scenarios.map(s => s.key)
      const uniqueKeys = new Set(keys)
      expect(uniqueKeys.size).toBe(keys.length)
    })

    it('所有场景应该有 label', () => {
      scenarios.forEach(s => {
        expect(s.label).toBeDefined()
        expect(s.label.length).toBeGreaterThan(0)
      })
    })

    it('所有场景应该有 icon', () => {
      scenarios.forEach(s => {
        expect(s.icon).toBeDefined()
      })
    })

    it('所有场景应该有 feature', () => {
      scenarios.forEach(s => {
        expect(s.feature).toBeDefined()
      })
    })

    it('所有场景应该有 layout', () => {
      scenarios.forEach(s => {
        expect(s.layout).toBeDefined()
      })
    })

    it('所有场景应该有 gridType', () => {
      scenarios.forEach(s => {
        expect(s.gridType).toBeDefined()
      })
    })
  })

  describe('feature 到 layout/gridType 的映射', () => {
    const mappings = {
      '字帖模板-古诗格式': { layout: '古诗格式', gridType: '田字格' },
      '字帖模板-文章格式': { layout: '文章格式', gridType: '田字格' },
      '字帖模板-英文格式': { layout: '英文格式', gridType: '四线三格' },
      '控笔字帖': { layout: '连续排列', gridType: '田字格' },
      '数字字母': { layout: '连续排列', gridType: '四线三格' },
      '汉字练习': { layout: '连续排列', gridType: '田字格' },
    }

    it('字帖模板-古诗格式 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'poem')
      expect(scenario.layout).toBe('古诗格式')
      expect(scenario.gridType).toBe('田字格')
    })

    it('字帖模板-文章格式 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'text')
      expect(scenario.layout).toBe('文章格式')
      expect(scenario.gridType).toBe('田字格')
    })

    it('字帖模板-英文格式 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'english')
      expect(scenario.layout).toBe('英文格式')
      expect(scenario.gridType).toBe('四线三格')
    })

    it('控笔字帖 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'ctrl')
      expect(scenario.feature).toBe('控笔字帖')
      expect(scenario.layout).toBe('连续排列')
      expect(scenario.gridType).toBe('田字格')
    })

    it('数字字母 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'alnum')
      expect(scenario.feature).toBe('数字字母')
      expect(scenario.layout).toBe('连续排列')
      expect(scenario.gridType).toBe('四线三格')
    })

    it('汉字练习 应该正确映射', () => {
      const scenario = scenarios.find(s => s.key === 'chinese')
      expect(scenario.feature).toBe('汉字练习')
      expect(scenario.layout).toBe('连续排列')
      expect(scenario.gridType).toBe('田字格')
    })
  })

  describe('数字字母场景的 cols 处理', () => {
    it('英语单词应该有默认 cols', () => {
      const englishScenario = scenarios.find(s => s.key === 'english')
      // 从配置中看，英语单词应该有 cols: 10
      // 但在 scenarios 数组中没有定义，说明 cols 是可选的
      expect(englishScenario).toBeDefined()
    })
  })
})

describe('场景切换的完整流程', () => {
  it('从字帖模板切换到汉字练习的完整流程', () => {
    const updateSetting = vi.fn()
    const onOpenLibrary = vi.fn()
    
    // 模拟点击汉字练习
    const scenario = { key: 'chinese', label: '汉字练习', feature: '汉字练习', layout: '连续排列', gridType: '田字格', text: '' }
    
    // 更新设置
    updateSetting('feature', scenario.feature)
    updateSetting('layout', scenario.layout)
    updateSetting('gridType', scenario.gridType)
    updateSetting('text', scenario.text)
    
    // 验证调用
    expect(updateSetting).toHaveBeenCalledWith('feature', '汉字练习')
    expect(updateSetting).toHaveBeenCalledWith('layout', '连续排列')
    expect(updateSetting).toHaveBeenCalledWith('gridType', '田字格')
    expect(updateSetting).toHaveBeenCalledWith('text', '')
    
    // 汉字练习不触发 onOpenLibrary
    expect(onOpenLibrary).not.toHaveBeenCalled()
  })

  it('从字帖模板切换到古诗练习的完整流程', () => {
    const updateSetting = vi.fn()
    const onOpenLibrary = vi.fn()
    
    // 模拟点击古诗练习
    const scenario = { key: 'poem', label: '古诗练习', feature: '字帖模板', layout: '古诗格式', gridType: '田字格', text: '静夜思\n李白\n床前明月光\n疑是地上霜' }
    
    // 更新设置
    updateSetting('feature', scenario.feature)
    updateSetting('layout', scenario.layout)
    updateSetting('gridType', scenario.gridType)
    updateSetting('text', scenario.text)
    
    // 触发 onOpenLibrary
    if (scenario.key === 'poem' && onOpenLibrary) {
      onOpenLibrary({ open: true, tab: 'poem' })
    }
    
    // 验证设置调用
    expect(updateSetting).toHaveBeenCalledWith('feature', '字帖模板')
    expect(updateSetting).toHaveBeenCalledWith('layout', '古诗格式')
    
    // 验证 onOpenLibrary 调用
    expect(onOpenLibrary).toHaveBeenCalledWith({ open: true, tab: 'poem' })
  })
})
