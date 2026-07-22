import { describe, it, expect } from 'vitest'
import { splitInput, toCells } from '../../../src/utils/text/splitter'

describe('splitInput 边界情况', () => {
  it('应该处理空字符串', () => {
    expect(splitInput('多字', '')).toEqual([])
    expect(splitInput('多词', '')).toEqual([])
    expect(splitInput('多句', '')).toEqual([])
    expect(splitInput('文章', '')).toEqual([])
  })

  it('应该处理只有空格的输入', () => {
    expect(splitInput('多字', '   ')).toEqual([])
    expect(splitInput('多词', '   ')).toEqual([])
    expect(splitInput('文章', '   ')).toEqual([])
  })

  it('应该处理特殊Unicode字符', () => {
    const text = '你好世界🌏'
    const result = splitInput('多字', text)
    expect(result).toContain('你')
    expect(result).toContain('好')
  })

  it('多字模式应该处理混合内容', () => {
    // 测试长文本
    const longText = '春眠不觉晓处处闻啼鸟夜来风雨声花落知多少'
    const result = splitInput('多字', longText)
    expect(result).toHaveLength(20)
    expect(result[0]).toBe('春')
    expect(result[19]).toBe('少')
  })

  it('多词模式应该处理连续分隔符', () => {
    expect(splitInput('多词', 'A||B')).toEqual(['A', 'B'])
    expect(splitInput('多词', 'A,,B')).toEqual(['A', 'B'])
    expect(splitInput('多词', 'A  B')).toEqual(['A', 'B'])
  })

  it('多句模式应该保留标点', () => {
    const result = splitInput('多句', '你好，世界！|明天见。')
    expect(result).toHaveLength(2)
    expect(result[0][0]).toContain('你好')
    expect(result[1][0]).toContain('明天见')
  })

  it('应该处理undefined和null输入', () => {
    expect(splitInput('多字', undefined)).toEqual([])
    expect(splitInput('多词', null)).toEqual([])
    expect(splitInput('文章', undefined)).toEqual([])
  })

  it('多字模式应该拒绝各种标点', () => {
    const punctuations = '，。！？；：、""《》「」.!?,;:'
    punctuations.split('').forEach(p => {
      expect(() => splitInput('多字', `测试${p}`)).toThrow()
    })
  })

  it('多词模式应该正确处理中英文逗号', () => {
    const result = splitInput('多词', '苹果,香蕉,橘子')
    expect(result).toEqual(['苹果', '香蕉', '橘子'])
  })

  it('应该处理极大输入', () => {
    const huge = 'A'.repeat(10000)
    const result = splitInput('多字', huge)
    expect(result).toHaveLength(10000)
  })
})

describe('toCells', () => {
  describe('多字模式', () => {
    it('应该逐字转换为单元格', () => {
      const result = toCells('多字', '测试', '')
      expect(result.pages).toHaveLength(1)
      expect(result.pages[0]).toEqual(['测', '试'])
    })

    it('应该支持+1行变体', () => {
      const result = toCells('多字', '测试', '+1行')
      expect(result.pages[0]).toContain('\n')
    })

    it('应该支持+1空行变体', () => {
      const result = toCells('多字', '测试', '+1空行')
      expect(result.pages[0]).toContain('')
    })
  })

  describe('多词模式', () => {
    it('应该逐词逐字转换', () => {
      const result = toCells('多词', '你好|世界', '')
      expect(result.pages).toHaveLength(1)
      expect(result.pages[0]).toEqual(['你', '好', '世', '界'])
    })

    it('应该支持+1行变体', () => {
      const result = toCells('多词', 'A|B', '+1行')
      expect(result.pages[0]).toContain('\n')
    })

    it('应该支持+1空行变体', () => {
      const result = toCells('多词', 'A|B', '+1空行')
      expect(result.pages[0]).toContain('')
    })
  })

  describe('多句模式', () => {
    it('应该逐句逐字转换', () => {
      const result = toCells('多句', '第一句|第二句', '')
      expect(result.pages).toHaveLength(2)
      expect(result.pages[0]).toContain('第')
      expect(result.pages[1]).toContain('第')
    })

    it('应该支持+1行变体', () => {
      const result = toCells('多句', '第一句|第二句', '+1行')
      expect(result.pages[0]).toContain('\n')
    })

    it('应该支持+1空行变体', () => {
      const result = toCells('多句', '第一句|第二句', '+1空行')
      expect(result.pages[0]).toContain('')
    })
  })

  describe('文章模式', () => {
    it('应该移除空白并转换', () => {
      const result = toCells('文章', '今天 是个 好日子', '')
      expect(result.pages).toHaveLength(1)
      expect(result.pages[0].join('')).toBe('今天是个好日子')
    })

    it('应该支持+1行变体', () => {
      const result = toCells('文章', '测试', '+1行')
      expect(result.pages[0]).toContain('\n')
    })

    it('应该支持+1空行变体', () => {
      const result = toCells('文章', '测试', '+1空行')
      expect(result.pages[0]).toContain('')
    })
  })

  describe('空输入处理', () => {
    it('应该处理空字符串', () => {
      const result = toCells('多字', '', '')
      expect(result.pages).toHaveLength(1)
      expect(result.pages[0]).toEqual([])
    })
  })

  describe('无效模式', () => {
    it('应该返回空页', () => {
      const result = toCells('无效模式', '测试', '')
      expect(result.pages).toHaveLength(1)
      expect(result.pages[0]).toEqual([])
    })
  })
})
