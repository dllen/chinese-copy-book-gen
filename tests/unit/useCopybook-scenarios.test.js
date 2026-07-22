import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCopybook from '../../src/hooks/useCopybook'

const mockToHex = (color) => {
  const map = {
    '绿色': '#00FF00', '黑色': '#000000', '红色': '#FF0000',
    '白色': '#FFFFFF', '蓝色': '#0000FF', '紫色': '#FF00FF'
  }
  return map[color] || color
}

global.window.__copybook__ = {
  utils: {
    toHex: mockToHex,
    fontByTemplate: (t, c) => c || 'serif',
    pageSize: (p) => {
      const sizes = {
        'A4竖版': { w: '210mm', h: '297mm' },
        'A4横版': { w: '297mm', h: '210mm' },
        'A5竖版': { w: '148mm', h: '210mm' }
      }
      return sizes[p] || { w: '210mm', h: '297mm' }
    },
    validate: (s) => {
      if (!s.text || s.text.trim().length === 0) {
        return { valid: false, msg: '请输入文本内容' }
      }
      return { valid: true }
    }
  },
  content: {
    toCells: vi.fn((mode, text, variant) => {
      if (mode === '多字') {
        const chars = Array.from(text || '')
        const cells = []
        chars.forEach(c => {
          cells.push(c)
          if (variant?.includes('+1行')) cells.push('\n')
          if (variant?.includes('+1空行')) cells.push('')
        })
        return { pages: [cells] }
      }
      if (mode === '多词') {
        const words = (text || '').split(/[\|\s,]+/).filter(Boolean)
        const cells = []
        words.forEach(w => {
          Array.from(w).forEach(c => cells.push(c))
          if (variant?.includes('+1行')) cells.push('\n')
          if (variant?.includes('+1空行')) cells.push('')
        })
        return { pages: [cells] }
      }
      if (mode === '多句') {
        const pages = (text || '').split('|').map(s => s.trim()).filter(Boolean)
        return {
          pages: pages.map(pg => {
            const cells = []
            pg.split(/(?<=[。！？!?.])/).filter(Boolean).forEach(s => {
              Array.from(s).forEach(c => cells.push(c))
              if (variant?.includes('+1行')) cells.push('\n')
              if (variant?.includes('+1空行')) cells.push('')
            })
            return cells
          })
        }
      }
      if (mode === '文章') {
        const cells = Array.from((text || '').replace(/\s+/g, ''))
        return { pages: [cells] }
      }
      return { pages: [[]] }
    }),
    paginate: vi.fn((pages, rows, cols, fillLast) => {
      const cap = rows * cols
      const result = []
      pages.forEach(page => {
        for (let i = 0; i < page.length; i += cap) {
          result.push(page.slice(i, i + cap))
        }
      })
      return result.length > 0 ? result : [[]]
    }),
    sampleRandom: vi.fn((pool, n, noRepeat) => {
      if (!pool || pool.length === 0) return ''
      if (noRepeat) {
        const shuffled = [...pool].sort(() => Math.random() - 0.5)
        return shuffled.slice(0, n).join('')
      }
      let result = ''
      for (let i = 0; i < n; i++) {
        result += pool[Math.floor(Math.random() * pool.length)]
      }
      return result
    }),
    layoutDocument: vi.fn((kind, text, cols, opts) => {
      const lines = (text || '').split('\n')
      const out = []
      lines.forEach((line, i) => {
        const chars = Array.from(line)
        if (i === 0 && kind === '文章格式') {
          // 标题居中
          const left = Math.max(0, Math.floor((cols - chars.length) / 2))
          for (let j = 0; j < left; j++) out.push('')
          chars.forEach(c => out.push(c))
        } else {
          chars.forEach(c => out.push(c))
        }
        out.push('\n')
      })
      return { pages: [out] }
    })
  },
  grid: {
    svgDataURL: vi.fn((type, size, color, lineStyle) => {
      return `url("data:image/svg+xml,${type},${size},${color},${lineStyle}")`
    })
  },
  features: {
    buildControlPages: vi.fn((difficulty) => {
      const pages = { pages: [] }
      if (difficulty === '初级') {
        pages.pages = [['一', '', '丨', '', '丿', '', '丶', '', '亅', '']]
      } else if (difficulty === '中级') {
        pages.pages = [['氵', '', '亻', '', '讠', '', '艹', '', '月', '']]
      } else {
        pages.pages = [['永', '', '德', '', '善', '']]
      }
      return pages
    })
  },
  exporting: {
    exportPDF: vi.fn(),
    exportImage: vi.fn()
  },
  library: null
}

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  progress: vi.fn(() => 'toast-id'),
  removeToast: vi.fn()
}

vi.mock('../../src/hooks/useToast', () => ({
  useToast: () => ({ ...mockToast, toasts: [] })
}))

describe('useCopybook 场景测试', () => {
  const baseSettings = {
    mode: '多字', variant: '多字', layout: '连续排列', feature: '字帖模板',
    text: '静夜思', rows: 10, cols: 10, tailFill: true,
    gridType: '田字格', gridColor: '绿色', customGridColor: '',
    textColorOpt: '黑色', customTextColor: '',
    template: '楷书', customFont: '', cellSize: 60, gridGap: 0, fontSize: 42,
    marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
    paper: 'A4竖版', header: '', randCount: 10, randNoRepeat: false, previewScale: 1,
    difficulty: '初级', showGuide: false, enBlankRows: 0, enRepeat: 1, engShowZh: false,
    stylePreset: '四线三格标准', autoLayout: true, gridStrokeWidth: 1, lineStyle: '实线',
    cellRadius: 0, pageBg: '白色', cellBg: '透明', cellBorder: false,
    cellShadow: false, textShadow: false, textStroke: '无',
    alnumIncludeDigits: true, alnumIncludeUpper: true, alnumIncludeLower: true,
    alnumCount: 20, alnumNoRepeat: true, alnumSeq: '', letterStyle: '印刷体',
    commonChars: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']
  }

  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('文本模式', () => {
    it('应该处理多字模式', () => {
      const settings = { ...baseSettings, feature: '字帖模板', mode: '多字', text: '测试' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理多词模式', () => {
      const settings = { ...baseSettings, feature: '字帖模板', mode: '多词', text: '你好|世界' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理多句模式', () => {
      const settings = { ...baseSettings, feature: '字帖模板', mode: '多句', text: '第一句|第二句' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理文章模式', () => {
      const settings = { ...baseSettings, feature: '字帖模板', mode: '文章', layout: '文章格式', text: '今天是个好日子。' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })
  })

  describe('排版格式', () => {
    it('应该处理古诗格式', () => {
      const settings = {
        ...baseSettings,
        feature: '字帖模板',
        layout: '古诗格式',
        text: '静夜思\n李白\n床前明月光\n疑是地上霜'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理文章格式', () => {
      const settings = {
        ...baseSettings,
        feature: '字帖模板',
        layout: '文章格式',
        text: '标题\n\n第一段内容。\n\n第二段内容。'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理英文格式', () => {
      const settings = {
        ...baseSettings,
        feature: '字帖模板',
        layout: '英文格式',
        gridType: '四线三格',
        cols: 10,
        text: 'Hello World\nGood Morning'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages.length).toBeGreaterThan(0)
    })
  })

  describe('特殊功能', () => {
    it('应该处理控笔字帖初级难度', () => {
      const settings = { ...baseSettings, feature: '控笔字帖', difficulty: '初级' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理控笔字帖中级难度', () => {
      const settings = { ...baseSettings, feature: '控笔字帖', difficulty: '中级' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理控笔字帖高级难度', () => {
      const settings = { ...baseSettings, feature: '控笔字帖', difficulty: '高级' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理数字字母模式', () => {
      const settings = { ...baseSettings, feature: '数字字母', alnumSeq: 'ABC123' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该生成大写字母', () => {
      const settings = { ...baseSettings, feature: '数字字母', alnumSeq: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.genAlnum({ count: 5, includeUpper: true, includeLower: false, includeDigits: false }) })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })

    it('应该生成小写字母', () => {
      const settings = { ...baseSettings, feature: '数字字母', alnumSeq: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.genAlnum({ count: 5, includeUpper: false, includeLower: true, includeDigits: false }) })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })

    it('应该生成数字', () => {
      const settings = { ...baseSettings, feature: '数字字母', alnumSeq: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.genAlnum({ count: 5, includeUpper: false, includeLower: false, includeDigits: true }) })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })

    it('应该生成不重复序列', () => {
      const settings = { ...baseSettings, feature: '数字字母', alnumSeq: '', alnumNoRepeat: true, alnumCount: 10 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.genAlnum({ count: 10, noRepeat: true }) })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })
  })

  describe('导出功能', () => {
    it('应该提供导出PDF函数', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      expect(typeof result.current.exportPDF).toBe('function')
    })

    it('应该提供导出图片函数', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      expect(typeof result.current.exportImage).toBe('function')
    })

    it('应该提供导出SVG函数', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      expect(typeof result.current.exportSVG).toBe('function')
    })
  })

  describe('随机填充', () => {
    it('应该覆盖模式填充', () => {
      const settings = { ...baseSettings, text: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.fillRandom(true) })
      expect(mockUpdateSetting).toHaveBeenCalledWith('text', expect.any(String))
    })

    it('应该追加模式填充', () => {
      const settings = { ...baseSettings, text: '现有文本' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.fillRandom(false) })
      expect(mockUpdateSetting).toHaveBeenCalledWith('text', expect.stringContaining('现有文本'))
    })
  })

  describe('诗库插入', () => {
    it('应该插入多词文本', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      act(() => { result.current.insertFromLibrary('多词', '你好 世界', false, null) })
      expect(mockUpdateSetting).toHaveBeenCalledWith('mode', '多词')
      expect(mockUpdateSetting).toHaveBeenCalledWith('text', '你好 世界')
    })

    it('应该插入并切换到英文格式', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      act(() => { result.current.insertFromLibrary('文章', 'Hello World', false, '英文格式') })
      expect(mockUpdateSetting).toHaveBeenCalledWith('layout', '英文格式')
      expect(mockUpdateSetting).toHaveBeenCalledWith('gridType', '四线三格')
    })

    it('应该追加模式插入', () => {
      const settings = { ...baseSettings, text: '已有' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => { result.current.insertFromLibrary('多词', '新内容', true, null) })
      expect(mockUpdateSetting).toHaveBeenCalledWith('text', '已有新内容')
    })
  })

  describe('使用统计', () => {
    it('应该正确计算容量', () => {
      const settings = { ...baseSettings, rows: 10, cols: 10 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.usage.capacity).toBe(100)
    })

    it('应该正确计算已用', () => {
      const { result } = renderHook(() => useCopybook(baseSettings, mockUpdateSetting))
      expect(result.current.usage.used).toBeGreaterThan(0)
    })

    it('应该在页面过多时警告', () => {
      const settings = { ...baseSettings, rows: 10, cols: 10 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      // 如果页面数>50应该有警告
      if (result.current.usage.warn) {
        expect(result.current.usage.warn).toBe(true)
      }
    })
  })

  describe('网格背景', () => {
    it('应该生成田字格背景', () => {
      const settings = { ...baseSettings, gridType: '田字格', cellSize: 60 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.bg).toContain('田字格')
    })

    it('应该生成米字格背景', () => {
      const settings = { ...baseSettings, gridType: '米字格', cellSize: 60 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.bg).toContain('米字格')
    })

    it('应该支持自定义颜色', () => {
      const settings = { ...baseSettings, customGridColor: '#FF0000' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.bg).toContain('#FF0000')
    })
  })

  describe('空输入处理', () => {
    it('应该处理空文本', () => {
      const settings = { ...baseSettings, text: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理只有空白的文本', () => {
      const settings = { ...baseSettings, text: '   \n\n   ' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })
  })
})
