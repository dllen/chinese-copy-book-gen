/**
 * 分页工具（canonical 实现）
 * 将单元格数组按行和列分页，并提供行分割（含竖排）。
 *
 * 这是分页/行分割的唯一真实来源；`js/content.js` 仅作为其「旧全局
 * (`window.__copybook__.content`) 访问」的适配层，不再重复实现。
 */

/**
 * 将单元格分页
 * @param {string[][]} cellsByPage - 每页的单元格数组
 * @param {number} rows - 每页行数
 * @param {number} cols - 每行列数
 * @param {boolean} fillLast - 是否填充最后一页
 * @returns {string[][]} 分页后的数组
 */
export function paginate(cellsByPage, rows, cols, fillLast) {
  const pages = []

  cellsByPage.forEach(list => {
    const cap = rows * cols
    let chunk = list.slice()

    while (chunk.length > 0) {
      const page = chunk.splice(0, cap)

      if (fillLast && page.length < cap) {
        while (page.length < cap) {
          page.push('')
        }
      }

      pages.push(page)
    }
  })

  return pages
}

/**
 * 将单页单元格按行列分割
 * @param {string[]} cells - 单元格数组
 * @param {number} cols - 列数
 * @returns {string[][]} 行数组
 */
export function splitRows(cells, cols) {
  const rows = [[]]

  const list = cells || []
  list.forEach(ch => {
    if (ch === '\n') {
      // 换行符：开始新行
      rows.push([])
    } else {
      // 普通字符：添加到当前行
      rows[rows.length - 1].push(ch)

      // 达到列数：开始新行
      if (cols && rows[rows.length - 1].length >= cols) {
        rows.push([])
      }
    }
  })

  // 过滤空行
  return rows.filter(r => r.length > 0)
}

/**
 * 竖排分页（按列填充）
 * @param {string[][]} cellsByPage - 每页的单元格数组
 * @param {number} rows - 每页行数
 * @param {number} cols - 每行列数
 * @param {boolean} fillLast - 是否填充最后一页
 * @returns {string[][]} 分页后的数组
 */
export function paginateVertical(cellsByPage, rows, cols, fillLast) {
  const pages = []
  const cap = rows * cols
  cellsByPage.forEach(list => {
    let chunk = list.slice()
    while (chunk.length > 0) {
      // 直接平铺（保持与原实现一致的行为）
      const flatPage = []
      for (let i = 0; i < cap && chunk.length > 0; i++) {
        flatPage.push(chunk.shift())
      }
      if (fillLast && flatPage.length < cap) {
        while (flatPage.length < cap) flatPage.push('')
      }
      pages.push(flatPage)
    }
  })
  return pages
}

/**
 * 竖排行分割（从上到下，从右到左）
 * @param {string[]} cells - 单元格数组
 * @param {number} cols - 列数
 * @returns {string[][]} 行数组
 */
export function splitRowsVertical(cells, cols) {
  // 竖排时，每个"行"实际上是一列
  const chars = cells.filter(c => c && c !== '\n' && c !== '')
  const result = []
  for (let i = 0; i < chars.length; i += cols) {
    const line = chars.slice(i, i + cols)
    while (line.length < cols) line.push('')
    result.push(line)
  }
  return result.length > 0 ? result : [[]]
}
