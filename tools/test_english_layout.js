// Node 单测：js/content.js 英文排版。运行：node tools/test_english_layout.js
global.window = {};
require('../js/content.js');
const C = global.window.__copybook__.content;
let fail = 0;
function eq(name, got, want) {
  const a = JSON.stringify(got), b = JSON.stringify(want);
  if (a === b) { console.log('✅ ' + name); }
  else { fail++; console.log('❌ ' + name + '\n  got:  ' + a + '\n  want: ' + b); }
}
// cells 数组按 cols 切回行字符串（'' 单元格显示为空格），便于断言
function rows(res, cols) {
  const out = [];
  const cs = res.pages[0].map(c => (c === '' || c === '\n') ? ' ' : c); // 空格单元格显示为空格
  for (let i = 0; i + cols <= cs.length; i += cols) out.push(cs.slice(i, i + cols).join(''));
  return out;
}
// 内容串 + 补齐到 cols 宽
function p(s, cols) { while (s.length < cols) s += ' '; return s; }
const blank = cols => ' '.repeat(cols);

// ---- 回归：无 opts 时行为不变 ----
eq('回归-贪心换行不拆词', rows(C.layoutEnglish('hello world', 10), 10), [p('hello', 10), p('world', 10)]);
eq('回归-词间一格', rows(C.layoutEnglish('a b', 5), 5), [p('a b', 5)]);
eq('回归-空输入行=空行', rows(C.layoutEnglish('ab\n\ncd', 4), 4), [p('ab', 4), blank(4), p('cd', 4)]);
eq('回归-每个输入行另起行', rows(C.layoutEnglish('ab\ncd', 4), 4), [p('ab', 4), p('cd', 4)]);
eq('回归-超长词硬换行', rows(C.layoutEnglish('abcdef', 3), 3), ['abc', 'def']);

// ---- blankRows：每条内容行后补 N 行空行；空输入行后不补 ----
eq('blankRows=1', rows(C.layoutEnglish('ab\ncd', 4, { blankRows: 1 }), 4), [p('ab', 4), blank(4), p('cd', 4), blank(4)]);
eq('blankRows=1-空输入行不补', rows(C.layoutEnglish('ab\n\ncd', 4, { blankRows: 1 }), 4), [p('ab', 4), blank(4), blank(4), p('cd', 4), blank(4)]);
eq('blankRows=2', rows(C.layoutEnglish('ab', 4, { blankRows: 2 }), 4), [p('ab', 4), blank(4), blank(4)]);
eq('blankRows-绕排行每行都补', rows(C.layoutEnglish('aaa bbb', 3, { blankRows: 1 }), 3), ['aaa', blank(3), 'bbb', blank(3)]);
eq('blankRows-越界钳制为2', rows(C.layoutEnglish('ab', 4, { blankRows: 9 }), 4), [p('ab', 4), blank(4), blank(4)]);

// ---- repeat：单词行重复 N 次；多词句子行不重复 ----
eq('repeat=3-单词', rows(C.layoutEnglish('apple', 16, { repeat: 3 }), 16), [p('apple apple', 16), p('apple', 16)]);
eq('repeat=3-句子不受影响', rows(C.layoutEnglish('hello world', 16, { repeat: 3 }), 16), [p('hello world', 16)]);
eq('repeat=1-不变', rows(C.layoutEnglish('apple', 8, { repeat: 1 }), 8), [p('apple', 8)]);
eq('repeat-越界钳制为5', rows(C.layoutEnglish('ab', 20, { repeat: 9 }), 20), [p('ab ab ab ab ab', 20)]);

// ---- blankRows 与 repeat 组合 ----
eq('组合', rows(C.layoutEnglish('ab', 8, { repeat: 2, blankRows: 1 }), 8), [p('ab ab', 8), blank(8)]);

// ---- layoutDocument 透传 opts ----
eq('layoutDocument-透传', rows(C.layoutDocument('英文格式', 'ab', 4, { blankRows: 1 }), 4), [p('ab', 4), blank(4)]);
eq('layoutDocument-无opts兼容', rows(C.layoutDocument('英文格式', 'ab', 4), 4), [p('ab', 4)]);

if (fail) { console.log('\n' + fail + ' 个失败'); process.exit(1); }
console.log('\n全部通过');
