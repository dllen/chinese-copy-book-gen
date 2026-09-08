export function generateUnitPages(contents, options = {}) {
  const { cols = 8, rows = 10 } = options;
  const cellsPer = cols * rows;
  const allChars = [];
  contents.forEach((c) => {
    if (c.characters) allChars.push(...c.characters);
    if (c.vocabulary) c.vocabulary.forEach((v) => allChars.push(...v.split('')));
  });
  if (allChars.length === 0) return [];
  const pages = [];
  for (let i = 0; i < allChars.length; i += cellsPer) {
    pages.push(allChars.slice(i, i + cellsPer));
  }
  return pages;
}

export function estimatePageCount(contents, options = {}) {
  const { cols = 8, rows = 10 } = options;
  const cellsPer = cols * rows;
  let totalChars = 0;
  contents.forEach((c) => {
    if (c.characters) totalChars += c.characters.length;
    if (c.vocabulary) totalChars += c.vocabulary.reduce((s, v) => s + v.length, 0);
  });
  return Math.max(1, Math.ceil(totalChars / cellsPer));
}
