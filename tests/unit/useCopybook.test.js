import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCopybook from '../../src/hooks/useCopybook'

const mockToHex = (color) => {
  const map = { '绿色': '#00FF00', '黑色': '#000000', '红色': '#FF0000', '白色': '#FFFFFF' }
  return map[color] || color
}

global.window.__copybook__ = {
  utils: {
    toHex: mockToHex,
    fontByTemplate: (t, c) => c || 'serif',
    pageSize: (p) => ({ w: '210mm', h: '297mm' }),
    validate: (s) => ({ valid: true })
  },
  content: {
    toCells: vi.fn((mode, text, variant) => {
      if (mode === '多字') return { pages: [Array.from(text || '')] }
      if (mode === '多词') {
        const words = (text || '').split(/[\|\s,]+/).filter(Boolean)
        return { pages: [words.flatMap(w => Array.from(w))] }
      }
      return { pages: [[]] }
    }),
    paginate: vi.fn((pages, rows, cols, fillLast) => {
      const cap = rows * cols
      return pages.map(page => {
        const result = []
        for (let i = 0; i < page.length; i += cap) {
          result.push(page.slice(i, i + cap))
        }
        return result[0] || []
      })
    }),
    sampleRandom: vi.fn(() => '测试')
  },
  grid: { svgDataURL: vi.fn(() => 'url()') },
  features: { buildControlPages: vi.fn(() => ({ pages: [['一']] })) },
  exporting: { exportPDF: vi.fn(), exportImage: vi.fn() }
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

describe('useCopybook', () => {
  const defaultSettings = {
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
    commonChars: ['一', '二', '三']
  }

  const mockUpdateSetting = vi.fn()

  beforeEach(() => { vi.clearAllMocks() })

  it('应该解析多字模式文本', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    expect(result.current.pages).toBeDefined()
    expect(Array.isArray(result.current.pages)).toBe(true)
  })

  it('应该生成网格背景', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    expect(result.current.bg).toBeDefined()
    expect(typeof result.current.bg).toBe('string')
  })

  it('应该返回文字颜色', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    expect(result.current.tColor).toBeDefined()
  })

  it('应该返回字体', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    expect(result.current.font).toBeDefined()
  })

  it('应该生成随机字符', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    act(() => { result.current.genAlnum({ count: 5 }) })
    expect(mockUpdateSetting).toHaveBeenCalled()
  })

  it('应该随机填充文本', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    act(() => { result.current.fillRandom(true) })
    expect(mockUpdateSetting).toHaveBeenCalledWith('text', '测试')
  })

  it('应该从诗库插入', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    act(() => { result.current.insertFromLibrary('多词', '你好', false, null) })
    expect(mockUpdateSetting).toHaveBeenCalledWith('text', '你好')
  })

  it('应该处理控笔字帖', () => {
    const s = { ...defaultSettings, feature: '控笔字帖', difficulty: '初级' }
    const { result } = renderHook(() => useCopybook(s, mockUpdateSetting))
    expect(result.current.pages).toBeDefined()
  })

  it('应该处理数字字母', () => {
    const s = { ...defaultSettings, feature: '数字字母', alnumSeq: 'ABC' }
    const { result } = renderHook(() => useCopybook(s, mockUpdateSetting))
    expect(result.current.pages).toBeDefined()
  })

  it('应该计算使用统计', () => {
    const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
    expect(result.current.usage).toHaveProperty('capacity')
    expect(result.current.usage).toHaveProperty('used')
    expect(result.current.usage).toHaveProperty('warn')
  })
})
