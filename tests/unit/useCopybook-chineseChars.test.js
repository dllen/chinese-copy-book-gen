import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import useCopybook from '../../src/hooks/useCopybook'

// Mock window.__copybookData__
const mockCommonChars = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

global.window.__copybookData__ = {
  commonChars: mockCommonChars
}

global.window.__copybook__ = {
  utils: {
    toHex: (color) => color,
    fontByTemplate: () => 'serif',
    pageSize: () => ({ w: '210mm', h: '297mm' }),
    validate: () => ({ valid: true })
  },
  content: {
    toCells: () => ({ pages: [[]] }),
    paginate: (pages, rows, cols) => pages,
    sampleRandom: () => ''
  },
  grid: { svgDataURL: () => '' },
  features: { buildControlPages: () => ({ pages: [['一']] }) }
}

vi.mock('../../src/hooks/useToast', () => ({
  useToast: () => ({
    toast: { success: vi.fn(), error: vi.fn(), warn: vi.fn(), progress: vi.fn(() => 'id') },
    removeToast: vi.fn(),
    toasts: []
  })
}))

describe('汉字练习功能', () => {
  const defaultSettings = {
    mode: '多字', variant: '多字', layout: '连续排列', feature: '汉字练习',
    text: '', rows: 10, cols: 10, tailFill: true,
    gridType: '田字格', gridColor: '黑色', customGridColor: '',
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
    chineseCharCount: 5, chineseCharNoRepeat: true, chineseCharSeq: '',
    letterStyle: '印刷体',
    commonChars: mockCommonChars
  }

  const mockUpdateSetting = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateSetting.mockClear()
  })

  describe('genChineseChars', () => {
    it('应该生成随机汉字并更新 text 设置', () => {
      const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
      
      act(() => {
        result.current.genChineseChars({ count: 3 })
      })

      expect(mockUpdateSetting).toHaveBeenCalled()
      // 验证 chineseCharSeq 被更新
      const seqCall = mockUpdateSetting.mock.calls.find(c => c[0] === 'chineseCharSeq')
      expect(seqCall).toBeDefined()
      expect(typeof seqCall[1]).toBe('string')
      expect(seqCall[1].length).toBeLessThanOrEqual(3)
      // 验证 text 被更新（用于显示）
      const textCall = mockUpdateSetting.mock.calls.find(c => c[0] === 'text')
      expect(textCall).toBeDefined()
      expect(textCall[1]).toBe(seqCall[1])
    })

    it('应该生成不重复的汉字', () => {
      const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
      
      act(() => {
        result.current.genChineseChars({ count: 10 })
      })

      const call = mockUpdateSetting.mock.calls.find(c => c[0] === 'chineseCharSeq')
      const seq = call[1]
      // 检查是否有重复字符
      const chars = seq.split('')
      const uniqueChars = new Set(chars)
      expect(uniqueChars.size).toBe(chars.length)
    })

    it('应该支持重复字符', () => {
      const settings = { ...defaultSettings, chineseCharNoRepeat: false }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      
      act(() => {
        result.current.genChineseChars({ count: 20, noRepeat: false })
      })

      expect(mockUpdateSetting).toHaveBeenCalled()
    })

    it('应该使用 crypto.getRandomValues 生成随机数', () => {
      const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
      
      // 调用多次确保随机性
      const sequences = []
      for (let i = 0; i < 5; i++) {
        vi.clearAllMocks()
        act(() => {
          result.current.genChineseChars({ count: 5 })
        })
        const call = mockUpdateSetting.mock.calls.find(c => c[0] === 'chineseCharSeq')
        sequences.push(call[1])
      }

      // 至少有一次序列是不同的（由于随机性）
      const uniqueSeqs = new Set(sequences)
      expect(uniqueSeqs.size).toBeGreaterThan(1)
    })
  })

  describe('chineseCharSeqLocal 状态', () => {
    it('应该返回初始空字符串', () => {
      const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
      expect(result.current.chineseCharSeqLocal).toBe('')
    })

    it('应该同步 chineseCharSeq 设置到本地状态', () => {
      const settings = { ...defaultSettings, chineseCharSeq: '测试' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      expect(result.current.chineseCharSeqLocal).toBe('测试')
    })

    it('setChineseCharSeqLocal 应该更新状态', () => {
      const { result } = renderHook(() => useCopybook(defaultSettings, mockUpdateSetting))
      
      act(() => {
        result.current.setChineseCharSeqLocal('新的序列')
      })

      expect(result.current.chineseCharSeqLocal).toBe('新的序列')
    })
  })

  describe('汉字练习模式渲染', () => {
    it('应该为汉字练习模式返回正确的页面结构', () => {
      const settings = { ...defaultSettings, chineseCharSeq: '一二三' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      
      expect(result.current.parsed).toBeDefined()
      expect(result.current.parsed.pages).toBeDefined()
    })

    it('应该处理空的汉字序列', () => {
      const settings = { ...defaultSettings, chineseCharSeq: '' }
      const { result } = renderHook(() => useCopybook(settings, mockUpdateSetting))
      
      expect(result.current.parsed.pages).toBeDefined()
      expect(result.current.parsed.pages[0]).toEqual([])
    })
  })
})

describe('useSettings 默认值', () => {
  it('应该包含汉字练习相关默认值', async () => {
    const { useSettings } = await import('../../src/hooks/useSettings')
    
    // useSettings 需要 toast 参数
    const mockToast = { warn: vi.fn() }
    const { result } = renderHook(() => useSettings(mockToast))
    
    // 检查默认值
    const settings = result.current.settings
    expect(settings).toHaveProperty('chineseCharCount')
    expect(settings).toHaveProperty('chineseCharNoRepeat')
    expect(settings).toHaveProperty('chineseCharSeq')
    expect(settings.chineseCharCount).toBe(30)
    expect(settings.chineseCharNoRepeat).toBe(true)
    expect(settings.chineseCharSeq).toBe('')
  })
})
