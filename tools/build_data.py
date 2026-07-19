# -*- coding: utf-8 -*-
"""构建字帖生成器的预置数据：唐诗三百首(简体) + 小学语文课文(统编版)

数据源：
  - 唐诗三百首: https://github.com/chinese-poetry/chinese-poetry （全唐诗/唐诗三百首.json，繁体 → OpenCC 转简体）
  - 小学语文课文: https://github.com/7jul/yuwen_text （统编版 1-6 年级）

输出（data/ 目录）：
  - *.json  规范 JSON 数据
  - *.js    同一份数据的 JS 包装（挂到 window.__copybookData__），
            供 index.html 用 <script> 标签直接加载，file:// 双击打开也能用

用法：python3 tools/build_data.py
依赖：pip3 install opencc-python-reimplemented
"""
import json, os, re, urllib.request, urllib.parse
from opencc import OpenCC

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'data')
os.makedirs(OUT, exist_ok=True)

TANG_URL = 'https://raw.githubusercontent.com/chinese-poetry/chinese-poetry/master/%E5%85%A8%E5%94%90%E8%AF%97/%E5%94%90%E8%AF%97%E4%B8%89%E7%99%BE%E9%A6%96.json'
TEXT_BASE = 'https://raw.githubusercontent.com/7jul/yuwen_text/main/'
GRADES = ['一年级上册', '一年级下册', '二年级上册', '二年级下册', '三年级上册', '三年级下册',
          '四年级上册', '四年级下册', '五年级上册', '五年级下册', '六年级上册', '六年级下册']


def fetch(url):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=60) as r:
        return r.read().decode('utf-8')


def emit(name, var, obj):
    js = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8') as f:
        f.write(js)
    with open(os.path.join(OUT, name + '.js'), 'w', encoding='utf-8') as f:
        f.write('// 预置数据（由 tools/build_data.py 生成，请勿手改）\n')
        f.write('window.__copybookData__=window.__copybookData__||{};\n')
        f.write(f'window.__copybookData__.{var}={js};\n')
    print(f'{name}: {len(obj)} 条')


def main():
    cc = OpenCC('t2s')

    # ---------- 唐诗三百首 ----------
    raw = json.loads(fetch(TANG_URL))
    poems, seen = [], set()
    for i, p in enumerate(raw):
        title = cc.convert(p.get('title', '').strip())
        author = cc.convert(p.get('author', '').strip())
        lines = [cc.convert(x.strip()) for x in p.get('paragraphs', []) if x.strip()]
        if not title or not lines or (title, author) in seen:
            continue
        seen.add((title, author))
        tags = [cc.convert(t) for t in p.get('tags', []) if t and t != '唐诗三百首']
        poems.append({'id': len(poems) + 1, 'title': title, 'author': author, 'lines': lines, 'tags': tags})
    emit('poems-tang300', 'poems', poems)

    # ---------- 小学语文课文 ----------
    texts = []
    for g in GRADES:
        url = TEXT_BASE + urllib.parse.quote(g + '.json')
        for item in json.loads(fetch(url)):
            title = (item.get('title') or '').strip()
            content = (item.get('content') or '').strip()
            if not title or not content:
                continue
            paras = [ln.strip() for ln in re.split(r'[\r\n]+', content) if ln.strip()]
            if paras:
                texts.append({'id': len(texts) + 1, 'grade': g, 'title': title, 'paragraphs': paras})
    emit('texts-xiaoxue', 'texts', texts)

    # ---------- 常用汉字（直接包装仓库内已有的 common-chars.json） ----------
    chars = json.load(open(os.path.join(ROOT, 'common-chars.json'), encoding='utf-8'))
    emit('common-chars', 'commonChars', chars)


if __name__ == '__main__':
    main()
