# -*- coding: utf-8 -*-
"""构建小学英语预置数据：人教版 PEP（三年级起点）单词 + 课文句子

数据源：
  - 单词（单元/顺序）: LinXueyuanStdio/DictionaryData（book.csv / word.csv / relation_book_word.csv）
  - 单词（释义）:      mikigo/english-chinese-words（books/人教版小学/*.json，JSONL）
  - 课文句子:          chncaesar/ChinaTextbook-Text（小学/英语/人教版（PEP）/*/PEP英语*.md）

输入缓存目录：.build/（先运行 tools/download_sources.sh 或手动下载）
输出：data/english-words.json/.js、data/english-sentences.json/.js
用法：python3 tools/build_english_data.py
"""
import csv, json, os, re, urllib.request, urllib.parse

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BUILD = os.path.join(ROOT, '.build')
OUT = os.path.join(ROOT, 'data')
os.makedirs(BUILD, exist_ok=True)
os.makedirs(OUT, exist_ok=True)

GRADES = ['三年级上册', '三年级下册', '四年级上册', '四年级下册',
          '五年级上册', '五年级下册', '六年级上册', '六年级下册']

# 人教版三年级起点 8 册的 book_id（DictionaryData book.csv）
BOOKS = {
    '34173cb38f07f89ddbebc2ac': '三年级上册', 'c16a5320fa475530d9583c34': '三年级下册',
    '6364d3f0f495b6ab9dcf8d3b': '四年级上册', '149e9677a5989fd342ae4421': '四年级下册',
    'a4a042cf4fd6bfb47701cbc8': '五年级上册', 'f7e6c85504ce6e82442c770f': '五年级下册',
    'bf8229696f7a3bb4700cfdde': '六年级上册', '82161242827b703e6acf9c72': '六年级下册',
}

SOURCES = {
    'book.csv': 'https://raw.githubusercontent.com/LinXueyuanStdio/DictionaryData/master/book.csv',
    'word.csv': 'https://raw.githubusercontent.com/LinXueyuanStdio/DictionaryData/master/word.csv',
    'word_translation.csv': 'https://raw.githubusercontent.com/LinXueyuanStdio/DictionaryData/master/word_translation.csv',
    'relation_book_word.csv': None,  # 由 relation_book_word.zip 解压
    'relation_book_word.zip': 'https://github.com/LinXueyuanStdio/DictionaryData/raw/master/relation_book_word.zip',
}


def fetch(url, dst):
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req, timeout=300) as r, open(dst, 'wb') as f:
        f.write(r.read())


def ensure_sources():
    for name, url in SOURCES.items():
        p = os.path.join(BUILD, name)
        if not os.path.exists(p) and url:
            print('download', name)
            fetch(url, p)
    rel_csv = os.path.join(BUILD, 'relation_book_word.csv')
    if not os.path.exists(rel_csv):
        import zipfile
        with zipfile.ZipFile(os.path.join(BUILD, 'relation_book_word.zip')) as z:
            z.extractall(BUILD)
    for g in GRADES:
        p = os.path.join(BUILD, f'mikigo_{g}.json')
        if not os.path.exists(p):
            enc = urllib.parse.quote(f'books/人教版小学/人教版小学英语-{g}.json')
            print('download mikigo', g)
            fetch(f'https://raw.githubusercontent.com/mikigo/english-chinese-words/main/{enc}', p)
        p = os.path.join(BUILD, f'pepmd_{g}.md')
        if not os.path.exists(p):
            enc = urllib.parse.quote(f'小学/英语/人教版（PEP）（三年级起点）（主编：吴欣）/PEP英语{g}.md')
            print('download textbook', g)
            fetch(f'https://raw.githubusercontent.com/chncaesar/ChinaTextbook-Text/main/{enc}', p)


def emit(name, var, obj):
    js = json.dumps(obj, ensure_ascii=False, separators=(',', ':'))
    with open(os.path.join(OUT, name + '.json'), 'w', encoding='utf-8') as f:
        f.write(js)
    with open(os.path.join(OUT, name + '.js'), 'w', encoding='utf-8') as f:
        f.write('// 预置数据（由 tools/build_english_data.py 生成，请勿手改）\n')
        f.write('window.__copybookData__=window.__copybookData__||{};\n')
        f.write(f'window.__copybookData__.{var}={js};\n')
    print(f'{name}: {len(obj)} 条')


def build_words():
    # mikigo 干净释义：headWord(lower) -> tranCn
    tran = {}
    for g in GRADES:
        for line in open(os.path.join(BUILD, f'mikigo_{g}.json'), encoding='utf-8'):
            try:
                d = json.loads(line)
                c = d['content']['word']['content']
                t = (c.get('trans') or [{}])[0].get('tranCn', '').strip()
                if t:
                    tran[d['headWord'].lower()] = t
            except Exception:
                pass
    vocab = {}
    with open(os.path.join(BUILD, 'word.csv'), encoding='utf-8') as f:
        r = csv.reader(f, delimiter='>')
        next(r)
        for row in r:
            if len(row) >= 2:
                vocab[row[0]] = row[1]
    fallback = {}
    with open(os.path.join(BUILD, 'word_translation.csv'), encoding='utf-8') as f:
        r = csv.reader(f)
        next(r)
        for row in r:
            if len(row) >= 2 and row[0] not in fallback:
                t = re.split(r'[;；/]', row[1])[0]
                t = re.sub(r'^[a-z]+\.\s*', '', t).strip()
                fallback[row[0]] = t
    out, seen = [], set()
    with open(os.path.join(BUILD, 'relation_book_word.csv'), encoding='utf-8') as f:
        r = csv.reader(f, delimiter='>')
        next(r)
        for row in r:
            if len(row) < 6 or row[1] not in BOOKS:
                continue
            bk, voc, unit, order = row[1], row[2], row[4], row[5]
            w = vocab.get(voc, '').strip()
            if not w or (bk, w.lower()) in seen:
                continue
            seen.add((bk, w.lower()))
            t = tran.get(w.lower()) or fallback.get(w, '')
            out.append({'w': w, 't': t[:24], 'g': BOOKS[bk],
                        'u': unit if unit.startswith('Unit') else '',
                        'o': int(order) if order.isdigit() else 0})
    out.sort(key=lambda x: (GRADES.index(x['g']), x['u'], x['o']))
    for i, it in enumerate(out):
        it['id'] = i + 1
        del it['o']
    emit('english-words', 'englishWords', out)


UNIT_CN = {'One': 'Unit 1', 'Two': 'Unit 2', 'Three': 'Unit 3',
           'Four': 'Unit 4', 'Five': 'Unit 5', 'Six': 'Unit 6'}
CJK = re.compile(r'[\u4e00-\u9fff，。；：、（）【】《》！？“”]')


def looks_like_sentence(s):
    if len(s) < 4 or len(s) > 80 or ' ' not in s.strip():
        return False
    if CJK.search(s) or s.startswith(('#', '_', '-', '·', '*')):
        return False
    if not re.match(r'^[A-Z"“‘\']', s):
        return False
    if not re.search(r'[.!?]["”\']?$', s):
        return False
    if '___' in s or 'http' in s or '@' in s or 'Copyright' in s or '©' in s:
        return False
    letters = re.sub(r'[^A-Za-z]', '', s)
    if not letters or (len(letters) >= 3 and letters.isupper()):  # 纯缩写行
        return False
    return True


def build_sentences():
    out, seen = [], set()
    for g in GRADES:
        unit = ''
        for raw in open(os.path.join(BUILD, f'pepmd_{g}.md'), encoding='utf-8'):
            line = re.sub(r'\s+', ' ', raw).strip()
            if not line:
                continue
            m = re.match(r'^Unit\s+(\w+)', line)
            if m:
                unit = UNIT_CN.get(m.group(1), m.group(1) if m.group(1).isdigit() else '')
                if unit.isdigit():
                    unit = f'Unit {unit}'
                continue
            if line.startswith('Recycle'):
                unit = ''
                continue
            if not looks_like_sentence(line):
                continue
            s = re.sub(r'\s+', ' ', line).strip()
            key = s.lower()
            if key in seen:
                continue
            seen.add(key)
            out.append({'en': s, 'g': g, 'u': unit})
    for i, it in enumerate(out):
        it['id'] = i + 1
    emit('english-sentences', 'englishSentences', out)


if __name__ == '__main__':
    ensure_sources()
    build_words()
    build_sentences()
