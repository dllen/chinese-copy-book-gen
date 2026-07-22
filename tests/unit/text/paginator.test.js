import { describe, it, expect } from 'vitest'
import { paginate, splitRows } from '../../../src/utils/text/paginator'

describe('paginate', () => {
  it('应该正确分页', () => {
    const cells = Array(25).fill('字')
    const pages = paginate([cells], 5, 5, false)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(25)
  })

  it('应该跨页分割', () => {
    const cells = Array(30).fill('字')
    const pages = paginate([cells], 5, 5, false)
    expect(pages).toHaveLength(2)
    expect(pages[0]).toHaveLength(25)
    expect(pages[1]).toHaveLength(5)
  })

  it('应该填充最后一页', () => {
    const cells = Array(12).fill('字')
    const pages = paginate([cells], 5, 5, true)
    // 12个字不满一页(25格)，fillLast会填充到25
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(25)
  })

  it('应该处理多个输入页', () => {
    const page1 = Array(10).fill('A')
    const page2 = Array(10).fill('B')
    const pages = paginate([page1, page2], 5, 5, false)
    expect(pages).toHaveLength(2)
    expect(pages[0]).toHaveLength(10)
    expect(pages[1]).toHaveLength(10)
  })

  it('应该处理空数组', () => {
    const pages = paginate([[]], 5, 5, false)
    expect(pages).toHaveLength(0)
  })
})

describe('splitRows', () => {
  it('应该按列数分割', () => {
    const cells = ['A', 'B', 'C', 'D', 'E', 'F']
    const rows = splitRows(cells, 3)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['A', 'B', 'C'])
    expect(rows[1]).toEqual(['D', 'E', 'F'])
  })

  it('应该处理换行符', () => {
    const cells = ['A', 'B', '\n', 'C', 'D']
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['A', 'B'])
    expect(rows[1]).toEqual(['C', 'D'])
  })

  it('应该过滤空行', () => {
    const cells = ['A', '\n', '\n', 'B']
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['A'])
    expect(rows[1]).toEqual(['B'])
  })

  it('应该处理空数组', () => {
    const rows = splitRows([], 5)
    expect(rows).toHaveLength(0)
  })

  it('应该处理未定义输入', () => {
    const rows = splitRows(undefined, 5)
    expect(rows).toHaveLength(0)
  })
})
