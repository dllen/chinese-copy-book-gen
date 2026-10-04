import { describe, it, expect } from 'vitest'
import { GRID_TYPES, svgDataURL } from '../../src/utils/grid'

// data URL 解码：取出内联 SVG 原文
function decode(url) {
  const m = /^url\("data:image\/svg\+xml;utf8,(.*)"\)$/.exec(url)
  return m ? decodeURIComponent(m[1]) : null
}

describe('canonical grid module (src/utils/grid.js)', () => {
  describe('GRID_TYPES', () => {
    it('应该有23种格子类型', () => {
      expect(GRID_TYPES).toHaveLength(23)
    })

    it('应该包含所有关键格子类型', () => {
      ;['田字格', '米字格', '回宫格', '回宫格黄金', '四线三格', '拼音格', '数字格', '田格', '无格'].forEach((t) => {
        expect(GRID_TYPES).toContain(t)
      })
    })
  })

  describe('svgDataURL 基本行为', () => {
    it('无格应返回空字符串', () => {
      expect(svgDataURL('无格', 60, '#000', '实线')).toBe('')
    })

    it('未知类型应返回空字符串', () => {
      expect(svgDataURL('不存在的格', 60, '#000', '实线')).toBe('')
    })

    it('应返回 url("data:image/svg+xml;utf8,...") 形式的字符串', () => {
      const url = svgDataURL('田字格', 60, '#000', '实线')
      expect(url.startsWith('url("data:image/svg+xml;utf8,')).toBe(true)
      expect(url.endsWith('")')).toBe(true)
      const svg = decode(url)
      expect(svg.startsWith('<svg')).toBe(true)
      expect(svg.endsWith('</svg>')).toBe(true)
    })

    it('田字格应生成与旧实现逐字节一致的 SVG', () => {
      const expected =
        `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' shape-rendering='crispEdges'>` +
        `<rect x='0.5' y='0.5' width='59' height='59' fill='none' stroke='#000' stroke-width='1'/>` +
        `<line x1='30' y1='1' x2='30' y2='59' stroke='#000' stroke-width='1'/>` +
        `<line x1='1' y1='30' x2='59' y2='30' stroke='#000' stroke-width='1'/>` +
        `</svg>`
      expect(decode(svgDataURL('田字格', 60, '#000', '实线'))).toBe(expected)
    })
  })

  describe('格子结构', () => {
    it('米字格应有4条线（对角线）', () => {
      const svg = decode(svgDataURL('米字格', 60, '#000', '实线'))
      expect((svg.match(/<line/g) || [])).toHaveLength(4)
    })

    it('数字格应含 2,2 虚线', () => {
      const svg = decode(svgDataURL('数字格', 60, '#000', '实线'))
      expect((svg.match(/stroke-dasharray='2,2'/g) || [])).toHaveLength(2)
    })

    it('田格应含 2,2 虚线', () => {
      const svg = decode(svgDataURL('田格', 60, '#000', '实线'))
      expect((svg.match(/stroke-dasharray='2,2'/g) || [])).toHaveLength(2)
    })

    it('口字格只有外框矩形', () => {
      const svg = decode(svgDataURL('口字格', 60, '#000', '实线'))
      expect((svg.match(/<rect/g) || [])).toHaveLength(1)
      expect((svg.match(/<line/g) || [])).toHaveLength(0)
    })

    it('回宫格黄金应使用 0.618 比例', () => {
      const svg = decode(svgDataURL('回宫格黄金', 100, '#000', '实线'))
      expect(svg).toContain(`width='62' height='62'`) // Math.round(100*0.618)
      expect(svg).toContain(`x='19' y='19'`) // Math.round((100-62)/2)
    })

    it('九宫格应将格子分成3x3', () => {
      const svg = decode(svgDataURL('九宫格', 90, '#000', '实线'))
      expect(svg).toContain(`x1='30'`) // 90/3
      expect(svg).toContain(`x1='60'`) // 90/3*2
    })

    it('十六宫格应将格子分成4x4', () => {
      const svg = decode(svgDataURL('十六宫格', 80, '#000', '实线'))
      expect(svg).toContain(`x1='20'`) // 80/4
      expect(svg).toContain(`x1='60'`) // 80/4*3
    })
  })

  describe('线条样式', () => {
    it('实线不应有 stroke-dasharray', () => {
      const svg = decode(svgDataURL('田字格', 60, '#000', '实线'))
      expect(svg).not.toContain('stroke-dasharray')
    })

    it('虚线应使用 5,2', () => {
      const svg = decode(svgDataURL('田字格', 60, '#000', '虚线'))
      expect(svg).toContain(`stroke-dasharray='5,2'`)
    })

    it('点线应使用 1,4', () => {
      const svg = decode(svgDataURL('田字格', 60, '#000', '点线'))
      expect(svg).toContain(`stroke-dasharray='1,4'`)
    })

    it('点划线应使用 5,2,1,2', () => {
      const svg = decode(svgDataURL('田字格', 60, '#000', '点划线'))
      expect(svg).toContain(`stroke-dasharray='5,2,1,2'`)
    })
  })

  describe('四线三格坐标（来自 CSS 变量 mock）', () => {
    it('应使用 --fourline-y* 计算 y 坐标', () => {
      const svg = decode(svgDataURL('四线三格', 60, '#000', '实线'))
      // setup mock: y1=.20 y2=.47 y3=.74 y4=.94, size=60
      expect(svg).toContain(`y1='12'`) // Math.round(60*0.20)
      expect(svg).toContain(`y1='28'`) // Math.round(60*0.47)
      expect(svg).toContain(`y1='44'`) // Math.round(60*0.74)
      expect(svg).toContain(`y1='56'`) // Math.round(60*0.94)
      // 默认虚线样式（--fourline-dash-on/off mock 为空 → 5,2）
      expect(svg).toContain(`stroke-dasharray='5,2'`)
    })
  })

  describe('所有格子类型都可生成', () => {
    it('除「无格」外都应返回合法 SVG', () => {
      GRID_TYPES.filter((t) => t !== '无格').forEach((t) => {
        const url = svgDataURL(t, 60, '#000', '实线')
        const svg = decode(url)
        expect(svg, t).not.toBeNull()
        expect(svg.startsWith('<svg'), t).toBe(true)
        expect(svg.endsWith('</svg>'), t).toBe(true)
      })
    })
  })
})
