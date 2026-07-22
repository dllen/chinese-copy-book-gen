/**
 * 分页工具
 * 将单元格数组按行和列分页
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
