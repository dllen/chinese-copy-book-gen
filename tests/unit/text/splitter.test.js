import { describe, it, expect } from 'vitest'
import { splitInput } from '../../../src/utils/text/splitter'

describe('splitInput', () => {
  describe('多字模式', () => {
    it('应该逐字分割文本', () => {
      const result = splitInput('多字', '学习')
      expect(result).toEqual(['学', '习'])
    })

    it('应该处理单个字符', () => {
      const result = splitInput('多字', '字')
      expect(result).toEqual(['字'])
    })

    it('应该处理长文本', () => {
      const text = '静夜思床前明月光疑是地上霜举头望明月低头思故乡'
      const result = splitInput('多字', text)
      expect(result).toHaveLength(text.length)
      expect(result[0]).toBe('静')
      expect(result[result.length - 1]).toBe('乡')
    })

    it('应该拒绝包含空格的输入', () => {
      expect(() => splitInput('多字', '学 习')).toThrow('不支持空格')
    })

    it('应该拒绝包含标点的输入', () => {
      expect(() => splitInput('多字', '学习。')).toThrow('不支持标点')
    })
  })

  describe('多词模式', () => {
    it('应该按竖线分割', () => {
      expect(splitInput('多词', '你好|世界')).toEqual(['你好', '世界'])
    })

    it('应该按逗号分割', () => {
      expect(splitInput('多词', '你好,世界')).toEqual(['你好', '世界'])
    })

    it('应该按空格分割', () => {
      expect(splitInput('多词', '你好 世界')).toEqual(['你好', '世界'])
    })
  })

  describe('多句模式', () => {
    it('应该按竖线分页', () => {
      const result = splitInput('多句', '第一句|第二句|第三句')
      expect(result).toHaveLength(3)
    })

    it('应该处理单句', () => {
      const result = splitInput('多句', '只有一句话')
      expect(result).toHaveLength(1)
    })
  })

  describe('文章模式', () => {
    it('应该移除空白并逐字分割', () => {
      const text = '今天是个好日子。'
      const result = splitInput('文章', text)
      expect(result).toHaveLength(text.length)
    })
  })
})
