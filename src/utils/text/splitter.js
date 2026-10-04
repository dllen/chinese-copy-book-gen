/**
 * 文本分割与排版工具（canonical 实现）
 * 将用户输入分割为字符/词/句子/段落，并提供行/版面排版。
 *
 * 这是内容处理的唯一真实来源；`js/content.js` 仅作为其「旧全局
 * (`window.__copybook__.content`) 访问」的适配层，不再重复实现。
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
    if (/[\u3000-\u303f\uff00-\uffef\u2000-\u206f!-/:-@[-^`{-~、-。！-｜]/.test(t)) {
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
 * @param {string} text - 输入文本
 * @param {string} variant - 变体（如 '+1行', '+1空行'）
 * @returns {{ pages: string[][] }} 单元格数组
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

// ---------- 排版格式（考试标准） ----------
// 不可出现于行首的标点（避头），不可落于行尾的标点（避尾）
const HEAD_PUNCT = '，。！？；：、》」』）】…—·,.!?;:)]}%'
const TAIL_PUNCT = '"' + "'" + '（【《「『([{'

// 流式换行：indent 为首行缩进格数；自动避让行首/行尾标点
export function wrapFlow(chars, cols, indent) {
  const lines = []
  let cur = []
  for (let i = 0; i < indent && i < cols; i++) cur.push('')
  Array.from(chars).forEach(ch => {
    if (cur.length >= cols) {
      if (HEAD_PUNCT.indexOf(ch) >= 0) {
        const last = cur.pop()
        lines.push(cur.concat(['']))
        cur = [last]
      } else if (TAIL_PUNCT.indexOf(cur[cur.length - 1]) >= 0) {
        const opener = cur.pop()
        lines.push(cur.concat(['']))
        cur = [opener]
      } else {
        lines.push(cur)
        cur = []
      }
    }
    cur.push(ch)
  })
  if (cur.length) lines.push(cur)
  return lines
}

// 竖排换行（从上到下，从右到左）
export function wrapFlowVertical(chars, rows, indent) {
  const lines = []
  let cur = []
  for (let i = 0; i < indent && i < rows; i++) cur.push('')
  Array.from(chars).forEach(ch => {
    if (cur.length >= rows) {
      lines.push(cur)
      cur = []
    }
    cur.push(ch)
  })
  if (cur.length) lines.push(cur)
  return lines
}

// 居中一行；超过一行宽度则退化为流式换行
export function centerLine(chars, cols) {
  const cs = Array.from(chars)
  if (cs.length >= cols) return wrapFlow(cs, cols, 0)
  const left = Math.round((cols - cs.length) / 2)
  const pad = []
  for (let i = 0; i < left; i++) pad.push('')
  return [pad.concat(cs)]
}

// 竖排居中（从上到下，从右到左）
export function centerLineVertical(chars, rows) {
  const cs = Array.from(chars)
  if (cs.length >= rows) return wrapFlowVertical(cs, rows, 0)
  const top = Math.round((rows - cs.length) / 2)
  const pad = []
  for (let i = 0; i < top; i++) pad.push('')
  return [pad.concat(cs)]
}

// 英文格式：单词间空一格；按词换行（不拆词）；每个输入行另起一行；空输入行=空一行
// opts.blankRows: 每条内容行后补 N 行空行（0/1/2）；opts.repeat: 单词输入行重复 N 次（1~5）
export function layoutEnglish(text, cols, opts) {
  opts = opts || {}
  const blankRows = Math.max(0, Math.min(2, opts.blankRows | 0))
  const repeat = Math.max(1, Math.min(5, opts.repeat | 0))
  const out = []
  ;(text || '').split('\n').forEach(raw => {
    const s = raw.trim()
    if (!s) {
      out.push([])
      return
    }
    let words = s.split(/\s+/).filter(Boolean)
    if (repeat > 1 && words.length === 1) {
      const one = words[0]
      words = []
      for (let i = 0; i < repeat; i++) words.push(one)
    }
    const rs = []
    let cur = []
    words.forEach(wd => {
      const wcs = Array.from(wd)
      if (cur.length === 0) cur = wcs.slice()
      else if (cur.length + 1 + wcs.length <= cols) {
        cur.push('')
        cur = cur.concat(wcs)
      } else {
        rs.push(cur)
        cur = wcs.slice()
      }
      while (cur.length > cols) {
        rs.push(cur.slice(0, cols))
        cur = cur.slice(cols)
      } // 超长词硬换行
    })
    if (cur.length) rs.push(cur)
    rs.forEach((r, ri) => {
      out.push(r)
      if (ri < rs.length - 1) for (let i = 0; i < blankRows; i++) out.push([])
    })
  })
  const cells = []
  out.forEach(l => {
    cells.push.apply(cells, l)
    const n = l.length === 0 ? cols : (l.length % cols === 0 ? 0 : cols - l.length % cols)
    for (let i = 0; i < n; i++) cells.push('')
  })
  return { pages: [cells] }
}

// kind: '古诗格式' | '文章格式' | '英文格式'；text 按 \n 分行。返回 { pages:[cells] }，cells 已按 cols 对齐补齐
export function layoutDocument(kind, text, cols, opts) {
  if (kind === '英文格式') return layoutEnglish(text, cols, opts)
  const lines = (text || '').split('\n')
  let out = []
  if (kind === '古诗格式') {
    lines.forEach(rawLine => {
      const s = rawLine.trim()
      if (!s) {
        out.push([])
        return
      } // 空白行→空行，保留段落间隔
      const chars = Array.from(s)
      const isHeading = !/[，。！？；：、""《》「」.!?;:]/.test(s) && chars.length <= Math.max(12, Math.floor(cols * 1.5))
      if (isHeading) {
        out = out.concat(centerLine(chars, cols))
        return
      }
      s.split(/(?<=[，。！？；、""「」!?;.])/).filter(Boolean).forEach(seg => {
        const cs = Array.from(seg)
        out = out.concat(cs.length <= cols ? centerLine(cs, cols) : wrapFlow(cs, cols, 0))
      })
    })
  } else { // 文章格式：首行标题居中；其余每行为一个自然段，段首缩进两格；标点自动避头尾
    lines.forEach((rawLine, i) => {
      const s = rawLine.trim()
      if (!s) {
        out.push([])
        return
      } // 空白行→空行
      const chars = Array.from(s)
      if (i === 0) {
        out = out.concat(centerLine(chars, cols))
      } else {
        out = out.concat(wrapFlow(chars, cols, 2))
      }
    })
  }
  const cells = []
  out.forEach(l => {
    cells.push.apply(cells, l)
    const rem = l.length % cols
    if (rem !== 0) {
      for (let i = 0; i < cols - rem; i++) cells.push('')
    }
  })
  return { pages: [cells] }
}

// 竖排文档排版
export function layoutDocumentVertical(kind, text, rows, opts) {
  const lines = (text || '').split('\n')
  let out = []
  if (kind === '古诗格式' || kind === '竖排古诗') {
    lines.forEach(rawLine => {
      const s = rawLine.trim()
      if (!s) {
        out.push([])
        return
      }
      const chars = Array.from(s)
      const isHeading = !/[，。！？；：、""《》「」.!?;:]/.test(s) && chars.length <= Math.max(8, Math.floor(rows * 1.5))
      if (isHeading) {
        out = out.concat(centerLineVertical(chars, rows))
        return
      }
      // 竖排诗句：每个字符单独一行
      chars.forEach(c => {
        out.push([c])
      })
      out.push([]) // 诗句间空一行
    })
  } else if (kind === '竖排文章' || kind === '文章格式') {
    lines.forEach((rawLine, i) => {
      const s = rawLine.trim()
      if (!s) {
        out.push([])
        return
      }
      const chars = Array.from(s)
      if (i === 0) {
        out = out.concat(centerLineVertical(chars, rows))
      } else {
        chars.forEach(c => out.push([c]))
      }
    })
  } else { // 竖排连续
    const chars = Array.from(text || '')
    chars.forEach(c => {
      if (c !== '\n') out.push([c])
      else out.push([])
    })
  }

  // 将所有列合并为一个cells数组（竖排展开）
  const cells = []
  const numCols = Math.max(...out.map(l => l.length))
  for (let col = 0; col < numCols; col++) {
    out.forEach(line => {
      cells.push(line[col] || '')
    })
  }
  return { pages: [cells], vertical: true, rows: rows, cols: numCols }
}

// 随机采样
export function sampleRandom(pool, n, noRepeat) {
  if (!pool || pool.length === 0) return ''
  const cnt = Math.max(1, Math.min(n, noRepeat ? pool.length : n))
  if (noRepeat) {
    const shuffled = pool.slice()
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    return shuffled.slice(0, cnt).join('')
  } else {
    let out = ''
    for (let i = 0; i < cnt; i++) {
      out += pool[Math.floor(Math.random() * pool.length)]
    }
    return out
  }
}
