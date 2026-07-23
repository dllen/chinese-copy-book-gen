import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useSettings } from '../../src/hooks/useSettings'

// Mock localStorage
const localStorageMock = (() => {
  let store = {}
  return {
    getItem: vi.fn((key) => store[key] || null),
    setItem: vi.fn((key, value) => { store[key] = value }),
    removeItem: vi.fn((key) => { delete store[key] }),
    clear: vi.fn(() => { store = {} })
  }
})()

Object.defineProperty(global, 'localStorage', { value: localStorageMock })

describe('useSettings', () => {
  const mockToast = {
    success: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    progress: vi.fn(() => 'id'),
    removeToast: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
    localStorage.getItem.mockReturnValue(null)
  })

  afterEach(() => {
    localStorage.clear()
  })

  describe('默认值', () => {
    it('应该使用正确的默认值', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      expect(result.current.settings.mode).toBe('多字')
      expect(result.current.settings.layout).toBe('连续排列')
      expect(result.current.settings.gridType).toBe('田字格')
      expect(result.current.settings.feature).toBe('字帖模板')
      expect(result.current.settings.rows).toBe(10)
      expect(result.current.settings.cols).toBe(8)
      expect(result.current.settings.cellSize).toBe(60)
    })

    it('应该包含字帖类型默认值', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      expect(result.current.settings.copybookType).toBe('普通')
      expect(result.current.settings.copybookStyle).toBe('常规')
    })

    it('应该包含拼音和汉字文本默认值', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      expect(result.current.settings.pinyinText).toBe('')
      expect(result.current.settings.hanziText).toBe('')
    })
  })

  describe('updateSetting', () => {
    it('应该更新单个设置', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      
      act(() => {
        result.current.updateSetting('gridType', '米字格')
      })
      
      expect(result.current.settings.gridType).toBe('米字格')
    })

    it('应该更新多个设置', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      
      act(() => {
        result.current.updateSetting('copybookType', '看拼音写汉字')
        result.current.updateSetting('pinyinText', 'wo ai ni')
        result.current.updateSetting('hanziText', '我爱你')
      })
      
      expect(result.current.settings.copybookType).toBe('看拼音写汉字')
      expect(result.current.settings.pinyinText).toBe('wo ai ni')
      expect(result.current.settings.hanziText).toBe('我爱你')
    })

    it('应该保留其他设置的默认值', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      
      act(() => {
        result.current.updateSetting('copybookStyle', '半描字')
      })
      
      expect(result.current.settings.copybookStyle).toBe('半描字')
      expect(result.current.settings.copybookType).toBe('普通') // 保持默认值
    })
  })

  describe('localStorage 持久化', () => {
    it('应该在设置改变时保存到 localStorage', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      
      act(() => {
        result.current.updateSetting('gridType', '回宫格')
      })
      
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('应该从 localStorage 恢复设置', () => {
      const savedSettings = {
        mode: '多字', variant: '多字', layout: '竖排连续', gridType: '米字格',
        copybookType: '汉字字帖', copybookStyle: '隔行',
        pinyinText: 'test', hanziText: '测试'
      }
      localStorage.getItem.mockReturnValue(JSON.stringify(savedSettings))
      
      const { result } = renderHook(() => useSettings(mockToast))
      
      expect(result.current.settings.gridType).toBe('米字格')
      expect(result.current.settings.layout).toBe('竖排连续')
      expect(result.current.settings.copybookType).toBe('汉字字帖')
    })

    it('应该合并保存的设置和默认值', () => {
      const partialSettings = { gridType: '拼音格', copybookType: '拼音字帖' }
      localStorage.getItem.mockReturnValue(JSON.stringify(partialSettings))
      
      const { result } = renderHook(() => useSettings(mockToast))
      
      expect(result.current.settings.gridType).toBe('拼音格') // 使用保存的值
      expect(result.current.settings.copybookType).toBe('拼音字帖') // 使用保存的值
      expect(result.current.settings.layout).toBe('连续排列') // 使用默认值
    })

    it('应该处理无效的 JSON', () => {
      localStorage.getItem.mockReturnValue('invalid json')
      
      const { result } = renderHook(() => useSettings(mockToast))
      
      expect(result.current.settings.gridType).toBe('田字格') // 使用默认值
    })
  })

  describe('setSettings', () => {
    it('应该批量更新设置', () => {
      const { result } = renderHook(() => useSettings(mockToast))
      
      act(() => {
        result.current.setSettings({
          ...result.current.settings,
          gridType: '九宫格',
          copybookType: '数字字帖',
          copybookStyle: '全描字'
        })
      })
      
      expect(result.current.settings.gridType).toBe('九宫格')
      expect(result.current.settings.copybookType).toBe('数字字帖')
      expect(result.current.settings.copybookStyle).toBe('全描字')
    })
  })
})
