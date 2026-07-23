import { useState, useEffect } from 'react';

/**
 * 统一加载常用汉字数据
 * 加载顺序：embed 数据 > fetch JSON > fetch Markdown > 失败提示
 * 加载完成后自动去重并过滤非汉字
 */
export function useCommonChars(toast) {
  const [commonChars, setCommonChars] = useState([]);

  useEffect(() => {
    const emb = (window.__copybookData__ || {}).commonChars;
    if (emb) {
      setCommonChars([...new Set(emb.filter(ch => /[一-鿿]/.test(ch)))]);
      return;
    }

    loadFromFetch(toast, setCommonChars);

    return () => {};
  }, []);

  return commonChars;
}

function loadFromFetch(toast, setCommonChars) {
  // 同时发起 JSON 和 Markdown 请求，先到先得
  const controllerJson = new AbortController();
  const controllerMd = new AbortController();
  const timeoutJson = setTimeout(() => controllerJson.abort(), 5000);
  const timeoutMd = setTimeout(() => controllerMd.abort(), 5000);

  let settled = false;
  function settle() {
    if (settled) return;
    settled = true;
    clearTimeout(timeoutJson);
    clearTimeout(timeoutMd);
  }

  Promise.all([
    fetch('./common-chars.json', { signal: controllerJson.signal })
      .then(r => { clearTimeout(timeoutJson); return r.json(); })
      .then(arr => {
        settle();
        const uniq = [...new Set((arr || []).filter(ch => /[一-鿿]/.test(ch)))];
        setCommonChars(uniq);
      })
      .catch(e => {
        if (e.name === 'AbortError') return Promise.reject(e);
        // 非 abort 错误，继续尝试 markdown
        return Promise.reject(e);
      }),
    fetch('./常用1000汉子.md', { signal: controllerMd.signal })
      .then(r => { clearTimeout(timeoutMd); return r.text(); })
      .then(t => {
        settle();
        const lines = t.split('\n');
        let curName = '', curChars = [];
        for (const line of lines) {
          if (line.startsWith('##')) {
            if (curName) curChars = [];
            curName = line.replace(/^#+\s*/, '').trim();
          } else {
            const arr = Array.from(line).filter(ch => /[一-鿿]/.test(ch));
            if (arr.length) curChars.push(...arr);
          }
        }
        const all = [...new Set(curChars)];
        setCommonChars(all);
      })
      .catch(e => {
        if (e.name === 'AbortError') return Promise.reject(e);
        return Promise.reject(e);
      }),
  ]).catch((e) => {
    settle();
    if (e.name === 'AbortError') {
      toast?.warn('常用汉字加载超时，请检查网络后刷新页面');
    } else {
      toast?.error('常用汉字加载失败', { action: () => window.location.reload() });
      setCommonChars([]);
    }
  });
}
