import { pinyin } from 'pinyin-pro';

export function toPinyin(char) {
  if (!char) return '';
  return pinyin(char, { toneType: 'symbol', type: 'array' }).join(' ');
}

export function toPinyinArray(char) {
  if (!char) return [];
  return pinyin(char, { toneType: 'symbol', type: 'array' });
}

export function hasPinyin() {
  return true;
}
