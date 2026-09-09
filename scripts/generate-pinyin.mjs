import { pinyin } from 'pinyin-pro';
import { readFileSync, writeFileSync } from 'fs';

const texts = JSON.parse(readFileSync('data/texts-xiaoxue.json', 'utf8'));
const chars = new Set();
texts.forEach(t => {
  t.paragraphs.join('').split('').forEach(ch => {
    if (ch >= '\u4e00' && ch <= '\u9fff') chars.add(ch);
  });
});

console.log(`Found ${chars.size} unique characters`);

const toneMap = {'ā':1,'á':2,'ǎ':3,'à':4,'ē':1,'é':2,'ě':3,'è':4,'ī':1,'í':2,'ǐ':3,'ì':4,'ō':1,'ó':2,'ǒ':3,'ò':4,'ū':1,'ú':2,'ǔ':3,'ù':4,'ǖ':1,'ǘ':2,'ǚ':3,'ǜ':4};

const result = {};
let count = 0;
chars.forEach(ch => {
  try {
    const py = pinyin(ch, { toneType: 'symbol', type: 'array' })[0];
    let toneNum = null;
    for (const c of py) {
      if (toneMap[c]) { toneNum = toneMap[c]; break; }
    }
    result[ch] = { pinyin: py, tones: toneNum };
  } catch (e) {
    result[ch] = { pinyin: ch, tones: null };
  }
  count++;
  if (count % 500 === 0) console.log(`Processed ${count}/${chars.size}`);
});

writeFileSync('data/chinese-pinyin.json', JSON.stringify(result, null, 2));
console.log(`Done! Generated pinyin for ${Object.keys(result).length} characters`);
console.log(`File size: ${(JSON.stringify(result).length / 1024).toFixed(1)} KB`);
