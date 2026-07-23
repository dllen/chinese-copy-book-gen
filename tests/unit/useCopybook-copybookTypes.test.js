import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCopybook from '../../src/hooks/useCopybook'

// Mock window.__copybook__
global.window.__copybook__ = {
  utils: {
    toHex: (color) => {
      const map = { '绿色': '#00FF00', '黑色': '#000000', '红色': '#FF0000', '白色': '#FFFFFF' }
      return map[color] || '#000000'
    },
    fontByTemplate: (t, c) => c || 'serif',
    pageSize: (p) => ({ w: '210mm', h: '297mm' }),
    validate: () => ({ valid: true })
  },
  content: {
    toCells: (mode, text) => ({ pages: [Array.from(text || '')] }),
    paginate: (pages, rows, cols) => {
      const cap = rows * cols
      return pages.flatMap(page => {
        const result = []
        for (let i = 0; i < page.length; i += cap) {
          result.push(page.slice(i, i + cap))
        }
        return result.length ? result : [[]]
      })
    },
    layoutDocumentVertical: vi.fn((layout, text, rows, opts) => {
      const chars = Array.from(text || '')
      const pages = []
      for (let i = 0; i < chars.length; i += rows) {
        pages.push(chars.slice(i, i + rows))
      }
      return { pages: pages.length ? pages : [[]] }
    }),
    sampleRandom: () => '测试'
  },
  grid: { svgDataURL: () => 'url(grid.svg)' },
  features: { buildControlPages: () => ({ pages: [['一']] }) },
  exporting: { exportPDF: vi.fn(), exportImage: vi.fn() }
}

// Mock useToast
vi.mock('../../src/hooks/useToast', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), progress: () => 'id' },
    removeToast: vi.fn(),
    toasts: []
  })
}))

const defaultSettings = {
  mode: '多字', variant: '多字', layout: '连续排列', feature: '字帖模板',
  text: '静夜思床前明月光', rows: 5, cols: 5, tailFill: true,
  gridType: '田字格', gridColor: '绿色', customGridColor: '',
  textColorOpt: '黑色', customTextColor: '',
  template: '楷书', customFont: '', cellSize: 60, gridGap: 0, fontSize: 42,
  marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
  paper: 'A4竖版', header: '', randCount: 10, randNoRepeat: false, previewScale: 1,
  difficulty: '初级', showGuide: false, enBlankRows: 0, enRepeat: 1, engShowZh: false,
  stylePreset: '田字格标准', autoLayout: true, gridStrokeWidth: 1, lineStyle: '实线',
  cellRadius: 0, pageBg: '白色', cellBg: '透明', cellBorder: false,
  cellShadow: false, textShadow: false, textStroke: '无',
  alnumIncludeDigits: true, alnumIncludeUpper: true, alnumIncludeLower: true,
  alnumCount: 20, alnumNoRepeat: true, alnumSeq: '',
  chineseCharCount: 30, chineseCharNoRepeat: true, chineseCharSeq: '',
  copybookType: '普通', copybookStyle: '常规', pinyinText: '', hanziText: ''
}

describe('useCopybook - 字帖类型和样式', () => {
  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('字帖类型', () => {
    it('应该处理普通字帖', () => {
      const settings = { ...defaultSettings, copybookType: '普通', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
      expect(result.current.pages.length).toBeGreaterThan(0)
    })

    it('应该处理看拼音写汉字字帖', () => {
      const settings = {
        ...defaultSettings,
        copybookType: '看拼音写汉字',
        pinyinText: 'chuang qian ming yue guang',
        hanziText: '床 前 明 月 光'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
      // 应该生成拼音和汉字交替的单元格
      const firstPage = result.current.pages[0]
      expect(firstPage).toBeDefined()
    })

    it('应该处理拼音字帖', () => {
      const settings = {
        ...defaultSettings,
        copybookType: '拼音字帖',
        text: '拼音'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理数字字帖', () => {
      const settings = {
        ...defaultSettings,
        copybookType: '数字字帖',
        text: '床前123明月光456'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理汉字字帖', () => {
      const settings = {
        ...defaultSettings,
        copybookType: '汉字字帖',
        text: '床前明月光'
      }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })
  })

  describe('字帖样式', () => {
    it('应该处理常规样式', () => {
      const settings = { ...defaultSettings, copybookStyle: '常规' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理不描字样式', () => {
      const settings = { ...defaultSettings, copybookStyle: '不描字', text: '床前' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
      const firstPage = result.current.pages[0]
      expect(firstPage.length).toBeGreaterThan(0)
    })

    it('应该处理半描字样式', () => {
      const settings = { ...defaultSettings, copybookStyle: '半描字', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理全描字样式', () => {
      const settings = { ...defaultSettings, copybookStyle: '全描字', text: '床前' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
      // 全描字应该比原文本长（每个字重复）
    })

    it('应该处理隔行样式', () => {
      const settings = { ...defaultSettings, copybookStyle: '隔行', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })
  })

  describe('功能模块', () => {
    it('应该处理字帖模板', () => {
      const settings = { ...defaultSettings, feature: '字帖模板' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理控笔字帖', () => {
      const settings = { ...defaultSettings, feature: '控笔字帖', difficulty: '初级' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理数字字母模式', () => {
      const settings = { ...defaultSettings, feature: '数字字母' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理汉字练习模式', () => {
      const settings = { ...defaultSettings, feature: '汉字练习' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })
  })

  describe('布局模式', () => {
    it('应该处理竖排连续布局', () => {
      const settings = { ...defaultSettings, layout: '竖排连续', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理竖排古诗布局', () => {
      const settings = { ...defaultSettings, layout: '竖排古诗', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })

    it('应该处理竖排文章布局', () => {
      const settings = { ...defaultSettings, layout: '竖排文章', text: '床前明月光' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.pages).toBeDefined()
    })
  })

  describe('生成功能', () => {
    it('应该生成随机汉字', () => {
      global.window.__copybookData__ = { commonChars: ['一', '二', '三', '四', '五'] }
      const settings = { ...defaultSettings, feature: '汉字练习' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => {
        result.current.genChineseChars({ count: 3 })
      })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })

    it('应该生成随机数字字母', () => {
      const settings = { ...defaultSettings }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      act(() => {
        result.current.genAlnum({ count: 5 })
      })
      expect(mockUpdateSetting).toHaveBeenCalled()
    })
  })

  describe('使用统计', () => {
    it('应该正确计算使用容量', () => {
      const settings = { ...defaultSettings, rows: 5, cols: 5 }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.usage.capacity).toBe(25) // 5 * 5 = 25
    })

    it('应该检测页面数量警告', () => {
      const settings = { ...defaultSettings, rows: 1, cols: 1, text: '床前明月光疑是地上霜举头望低头思故乡' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      // 当页面数超过50时应该警告
      expect(result.current.usage).toHaveProperty('warn')
    })
  })
})
