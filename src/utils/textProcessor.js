export function splitIntoChars(text) {
  if (!text) return [];
  const chars = text.match(/[\u4e00-\u9fff]/g) || [];
  return [...new Set(chars)];
}

export function splitIntoWords(text) {
  if (!text) return [];
  const words = text.match(/[a-zA-Z]+/g) || [];
  // Case-insensitive deduplication, preserving first-seen case
  const seen = new Set();
  return words.filter((w) => {
    const lower = w.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

export function detectLanguage(text) {
  if (!text) return 'chinese';
  const chineseCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
  const englishCount = (text.match(/[a-zA-Z]/g) || []).length;
  return chineseCount >= englishCount ? 'chinese' : 'english';
}
