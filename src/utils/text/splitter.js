/**
 * 文本分割工具
 * 将用户输入分割为字符/词/句子/段落
 */

// 错误消息常量
export const ERRORS = {
  SPACE_NOT_ALLOWED: '不支持空格',
  PUNCTUATION_NOT_ALLOWED: '不支持标点',
}

/**
 * 分割输入文本
 * @param {string} mode - 模式: '多字' | '多词' | '多句' | '文章'
 * @param {string} text - 输入文本
 * @returns {string[]} 分割后的数组
 */
export function splitInput(mode, text) {
  const t = (text || '').trim()

  if (mode === '多字') {
    // 逐字分割，拒绝空格和标点
    if (/\s/.test(t)) {
      throw new Error(ERRORS.SPACE_NOT_ALLOWED)
    }
    if (/[　-〿＀-￯ -⁯!-/:-@[-^`{-~、-。！-｜]/.test(t)) {
      throw new Error(ERRORS.PUNCTUATION_NOT_ALLOWED)
    }
    return Array.from(t)
  }

  if (mode === '多词') {
    // 按 |、逗号、空格分割
    const arr = t.replace(/，/g, ',').split(/[\|\s,]+/).filter(Boolean)
    return arr
  }

  if (mode === '多句') {
    // 按 | 分页，然后按句读符号断句
    const pages = t.split('|').map(s => s.trim()).filter(Boolean)
    return pages.map(p => p.split(/(?<=[。！？!?.])/).filter(Boolean))
  }

  if (mode === '文章') {
    // 连续文本，移除空白后逐字处理
    return Array.from(t.replace(/\s+/g, ''))
  }

  return []
}

/**
 * 将文本转换为单元格数组
 * @param {string} mode - 模式
 * @param {string} text - 文本
 * @param {string} variant - 变体（如 '+1行', '+1空行'）
 * @returns {{ pages: string[][] }}
 */
export function toCells(mode, text, variant) {
  const v = variant || ''

  if (mode === '多句') {
    const pages = splitInput(mode, text)
    const flat = pages.map(pg => {
      const lineCells = []
      pg.forEach(sentence => {
        Array.from(sentence).forEach(ch => lineCells.push(ch))
        if (v.includes('+1行')) lineCells.push('\n')
        if (v.includes('+1空行')) lineCells.push('')
      })
      return lineCells
    })
    return { pages: flat }
  }

  const base = splitInput(mode, text)
  const cells = []

  if (mode === '多词') {
    base.forEach(w => {
      Array.from(w).forEach(c => cells.push(c))
      if (v.includes('+1行')) cells.push('\n')
      if (v.includes('+1空行')) cells.push('')
    })
  } else if (mode === '文章' || mode === '多字') {
    base.forEach(c => {
      cells.push(c)
      if (v.includes('+1行')) cells.push('\n')
      if (v.includes('+1空行')) cells.push('')
    })
  }

  return { pages: [cells] }
}
