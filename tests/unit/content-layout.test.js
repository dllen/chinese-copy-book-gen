import { describe, it, expect } from 'vitest'

describe('Content Layout', () => {
  describe('竖排布局', () => {
    const layoutDocumentVertical = (layout, text, rows) => {
      const chars = Array.from(text || '')
      const pages = []
      if (layout === '竖排连续' || layout === '竖排古诗' || layout === '竖排文章') {
        for (let i = 0; i < chars.length; i += rows) {
          pages.push(chars.slice(i, i + rows))
        }
      }
      return { pages: pages.length ? pages : [[]] }
    }

    it('应该处理空文本', () => {
      expect(layoutDocumentVertical('竖排连续', '', 5).pages).toEqual([[]])
    })

    it('应该处理单页情况', () => {
      const result = layoutDocumentVertical('竖排连续', '床前', 5)
      expect(result.pages[0]).toEqual(['床', '前'])
    })

    it('应该正确分页多字符文本', () => {
      // '床前明月光' = 5字符, 5字符/页 = 1页
      const result = layoutDocumentVertical('竖排连续', '床前明月光', 5)
      expect(result.pages.length).toBe(1)
      expect(result.pages[0].length).toBe(5)
    })

    it('应该正确分页多页情况', () => {
      // '床前明月光疑是地上霜' = 10字符, 5字符/页 = 2页
      const result = layoutDocumentVertical('竖排连续', '床前明月光疑是地上霜', 5)
      expect(result.pages.length).toBe(2)
    })
  })

  describe('汉字解析', () => {
    const parseChineseChars = (text) => {
      return Array.from(text || '').filter(c => /[\u4e00-\u9fa5]/.test(c))
    }

    it('应该正确提取汉字', () => {
      expect(parseChineseChars('床前明月光')).toEqual(['床', '前', '明', '月', '光'])
    })

    it('应该过滤非汉字字符', () => {
      expect(parseChineseChars('床前123明月光')).toEqual(['床', '前', '明', '月', '光'])
    })
  })

  describe('看拼音写汉字解析', () => {
    const parsePinyinHanzi = (pinyinText, hanziText) => {
      const pinyins = pinyinText.trim().split(/[\s,]+/).filter(Boolean)
      const hanzis = (hanziText || '').trim().split(/[\s,]+/).filter(Boolean)
      const cells = []
      pinyins.forEach((py, i) => {
        cells.push('[' + py + ']')
        cells.push(hanzis[i] || '')
      })
      return cells
    }

    it('应该正确解析拼音和汉字', () => {
      expect(parsePinyinHanzi('wo ai ni', '我 爱 你')).toEqual(['[wo]', '我', '[ai]', '爱', '[ni]', '你'])
    })

    it('应该处理没有汉字答案的情况', () => {
      expect(parsePinyinHanzi('wo ai ni', '')).toEqual(['[wo]', '', '[ai]', '', '[ni]', ''])
    })
  })

  describe('字帖样式处理', () => {
    const handleCopybookStyle = (cells, style) => {
      if (!cells || cells.length === 0) return cells
      switch (style) {
        case '不描字':
          return cells.flatMap(c => c ? [c, ''] : [c])
        case '半描字':
          return cells.map((c, i) => i % 2 === 0 ? c : (c || ''))
        case '全描字':
          return cells.flatMap(c => c ? [c, c] : [c, ''])
        default:
          return cells
      }
    }

    it('应该处理常规样式', () => {
      expect(handleCopybookStyle(['床', '前', '明'], '常规')).toEqual(['床', '前', '明'])
    })

    it('应该处理不描字样式', () => {
      expect(handleCopybookStyle(['床', '前', '明'], '不描字')).toEqual(['床', '', '前', '', '明', ''])
    })

    it('应该处理半描字样式', () => {
      const result = handleCopybookStyle(['床', '前', '明', '月'], '半描字')
      expect(result).toEqual(['床', '前', '明', '月'])
    })

    it('应该处理全描字样式', () => {
      expect(handleCopybookStyle(['床', '前'], '全描字')).toEqual(['床', '床', '前', '前'])
    })
  })

  describe('分页逻辑', () => {
    const paginate = (pages, rows, cols, fillLast = true) => {
      const cap = rows * cols
      const result = []
      pages.forEach(page => {
        for (let i = 0; i < page.length; i += cap) {
          const chunk = page.slice(i, i + cap)
          if (fillLast && chunk.length < cap && chunk.length > 0) {
            while (chunk.length < cap) chunk.push('')
          }
          result.push(chunk)
        }
      })
      return result.length ? result : [[]]
    }

    it('应该正确分页', () => {
      const pages = [['床', '前', '明', '月', '光', '疑', '是', '地', '上', '霜']]
      const result = paginate(pages, 2, 5)
      expect(result.length).toBe(1)
      expect(result[0].length).toBe(10)
    })

    it('应该填充最后一行', () => {
      const result = paginate([['床', '前', '明']], 2, 5, true)
      expect(result[0].length).toBe(10)
    })

    it('不应该填充最后一行当 fillLast 为 false', () => {
      const result = paginate([['床', '前', '明']], 2, 5, false)
      expect(result[0].length).toBe(3)
    })

    it('应该处理多页内容', () => {
      const chars = Array.from('床前明月光疑是地上霜举头望低头思故乡')
      const result = paginate([chars], 3, 5)
      expect(result.length).toBeGreaterThan(1)
    })
  })
})
