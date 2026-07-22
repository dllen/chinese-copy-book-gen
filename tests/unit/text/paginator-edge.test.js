import { describe, it, expect } from 'vitest'
import { paginate, splitRows } from '../../../src/utils/text/paginator'

describe('paginate 边界情况', () => {
  it('应该处理单页', () => {
    const cells = Array(25).fill('字')
    const pages = paginate([cells], 5, 5, false)
    expect(pages).toHaveLength(1)
  })

  it('应该处理跨页', () => {
    const cells = Array(30).fill('字')
    const pages = paginate([cells], 5, 5, false)
    expect(pages).toHaveLength(2)
    expect(pages[0]).toHaveLength(25)
    expect(pages[1]).toHaveLength(5)
  })

  it('应该填充最后一页', () => {
    const cells = Array(12).fill('字')
    const pages = paginate([cells], 5, 5, true)
    expect(pages[0]).toHaveLength(25)
  })

  it('应该处理多页输入', () => {
    const page1 = Array(25).fill('A')
    const page2 = Array(25).fill('B')
    const page3 = Array(10).fill('C')
    const pages = paginate([page1, page2, page3], 5, 5, false)
    expect(pages).toHaveLength(3)
  })

  it('应该处理空输入', () => {
    const pages = paginate([[]], 5, 5, false)
    expect(pages).toHaveLength(0)
  })

  it('应该处理单个字符', () => {
    const pages = paginate([['A']], 5, 5, false)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(1)
  })

  it('应该处理大尺寸网格', () => {
    const cells = Array(400).fill('字') // 20x20
    const pages = paginate([cells], 20, 20, false)
    expect(pages).toHaveLength(1)
    expect(pages[0]).toHaveLength(400)
  })

  it('应该填充最后一页到完整尺寸', () => {
    const cells = Array(23).fill('字')
    const pages = paginate([cells], 5, 5, true)
    expect(pages[0]).toHaveLength(25)
    expect(pages[0].slice(23)).toEqual(['', ''])
  })

  it('应该不填充最后一页当fillLast=false', () => {
    const cells = Array(12).fill('字')
    const pages = paginate([cells], 5, 5, false)
    expect(pages[0]).toHaveLength(12)
  })

  it('应该处理0行或0列', () => {
    const cells = Array(10).fill('字')
    const pages = paginate([cells], 0, 5, false)
    expect(pages).toHaveLength(0)
  })
})

describe('splitRows 边界情况', () => {
  it('应该处理空数组', () => {
    const rows = splitRows([], 5)
    expect(rows).toHaveLength(0)
  })

  it('应该处理undefined输入', () => {
    const rows = splitRows(undefined, 5)
    expect(rows).toHaveLength(0)
  })

  it('应该处理单行', () => {
    const cells = ['A', 'B', 'C']
    const rows = splitRows(cells, 10)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toEqual(['A', 'B', 'C'])
  })

  it('应该处理精确列数', () => {
    const cells = ['A', 'B', 'C', 'D', 'E']
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveLength(5)
  })

  it('应该处理多行', () => {
    const cells = Array(30).fill('字')
    const rows = splitRows(cells, 10)
    expect(rows).toHaveLength(3)
    rows.forEach(row => expect(row).toHaveLength(10))
  })

  it('应该正确处理换行符', () => {
    const cells = ['A', 'B', '\n', 'C', 'D', '\n', 'E']
    const rows = splitRows(cells, 10)
    expect(rows).toHaveLength(3)
    expect(rows[0]).toEqual(['A', 'B'])
    expect(rows[1]).toEqual(['C', 'D'])
    expect(rows[2]).toEqual(['E'])
  })

  it('应该过滤连续换行符', () => {
    const cells = ['A', '\n', '\n', '\n', 'B']
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['A'])
    expect(rows[1]).toEqual(['B'])
  })

  it('应该处理0列', () => {
    const cells = ['A', 'B', 'C']
    const rows = splitRows(cells, 0)
    // 0列时所有字符都应在一行
    expect(rows.length).toBeGreaterThan(0)
  })

  it('应该处理只有换行符的输入', () => {
    const cells = ['\n', '\n', '\n']
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(0)
  })

  it('应该保持字符顺序', () => {
    const cells = Array.from('ABCDEFGHIJ')
    const rows = splitRows(cells, 5)
    expect(rows).toHaveLength(2)
    expect(rows[0]).toEqual(['A', 'B', 'C', 'D', 'E'])
    expect(rows[1]).toEqual(['F', 'G', 'H', 'I', 'J'])
  })
})
