(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  function splitInput(mode,text){ const t=(text||'').trim(); if(mode==='多字') return Array.from(t); if(mode==='多词'){ const arr=t.replace(/，/g,',').split(/[\|\s,]+/).filter(Boolean); return arr; } if(mode==='多句'){ const pages=t.split('|').map(s=>s.trim()).filter(Boolean); return pages.map(p=>p.split(/(?<=[。！？!?.])/).filter(Boolean)); } if(mode==='文章'){ return Array.from(t.replace(/\s+/g,'')); } return []; }
  function toCells(mode,text,variant){ if(mode==='多句'){ const pages=splitInput(mode,text); const flat=pages.map(pg=>{ const lineCells=[]; pg.forEach(sentence=>{ Array.from(sentence).forEach(ch=>lineCells.push(ch)); if(variant.includes('+1行')) lineCells.push('\n'); if(variant.includes('+1空行')) lineCells.push(''); }); return lineCells; }); return { pages: flat }; } const base=splitInput(mode,text); const cells=[]; if(mode==='多词'){ base.forEach(w=>{ Array.from(w).forEach(c=>cells.push(c)); if(variant.includes('+1行')) cells.push('\n'); if(variant.includes('+1空行')) cells.push(''); }); } else { base.forEach(c=>cells.push(c)); if(variant.includes('+1空行')) cells.push(''); } return { pages:[cells] }; }
  function paginate(cellsByPage,rows,cols,fillLast){ const pages=[]; cellsByPage.forEach(list=>{ const cap=rows*cols; let chunk=list.slice(); while(chunk.length>0){ const page=chunk.splice(0,cap); if(fillLast && page.length<cap){ while(page.length<cap) page.push(''); } pages.push(page); } }); return pages; }
  // ---------- 排版格式（考试标准） ----------
  // 不可出现于行首的标点（避头），不可落于行尾的标点（避尾）
  var HEAD_PUNCT='，。！？；：、”’）】》…—·,.!?;:)]}%';
  var TAIL_PUNCT='“‘（【《([{';
  // 流式换行：indent 为首行缩进格数；自动避让行首/行尾标点
  function wrapFlow(chars,cols,indent){
    const lines=[]; let cur=[];
    for(let i=0;i<indent&&i<cols;i++) cur.push('');
    Array.from(chars).forEach(ch=>{
      if(cur.length>=cols){
        if(HEAD_PUNCT.indexOf(ch)>=0){ // 标点不能行首：把上一行末字移下来，标点跟随其后
          const last=cur.pop(); lines.push(cur.concat([''])); cur=[last];
        } else if(TAIL_PUNCT.indexOf(cur[cur.length-1])>=0){ // 前引号等不能行尾：整体移到下一行
          const opener=cur.pop(); lines.push(cur.concat([''])); cur=[opener];
        } else { lines.push(cur); cur=[]; }
      }
      cur.push(ch);
    });
    if(cur.length) lines.push(cur);
    return lines;
  }
  // 居中一行；超过一行宽度则退化为流式换行
  function centerLine(chars,cols){
    const cs=Array.from(chars);
    if(cs.length>=cols) return wrapFlow(cs,cols,0);
    const left=Math.floor((cols-cs.length)/2);
    const pad=[]; for(let i=0;i<left;i++) pad.push('');
    return [pad.concat(cs)];
  }
  // 英文格式：单词间空一格；按词换行（不拆词）；每个输入行另起一行；空输入行=空一行
  function layoutEnglish(text,cols){
    const out=[];
    (text||'').split('\n').forEach(raw=>{
      const s=raw.trim();
      if(!s){ out.push([]); return; }
      let cur=[];
      s.split(/\s+/).filter(Boolean).forEach(wd=>{
        const wcs=Array.from(wd);
        if(cur.length===0) cur=wcs.slice();
        else if(cur.length+1+wcs.length<=cols){ cur.push(''); cur=cur.concat(wcs); }
        else { out.push(cur); cur=wcs.slice(); }
        while(cur.length>cols){ out.push(cur.slice(0,cols)); cur=cur.slice(cols); } // 超长词硬换行
      });
      if(cur.length) out.push(cur);
    });
    const cells=[];
    out.forEach(l=>{ cells.push.apply(cells,l); const n=l.length===0?cols:(l.length%cols===0?0:cols-l.length%cols); for(let i=0;i<n;i++) cells.push(''); });
    return { pages:[cells] };
  }
  // kind: '古诗格式' | '文章格式' | '英文格式'；text 按 \n 分行。返回 { pages:[cells] }，cells 已按 cols 对齐补齐
  function layoutDocument(kind,text,cols){
    if(kind==='英文格式') return layoutEnglish(text,cols);
    const raw=(text||'').split('\n').map(s=>s.trim()).filter(s=>s.length>0);
    let out=[];
    if(kind==='古诗格式'){
      // 无标点且较短的行视为标题/作者（居中）；其余按标点分句，每句一行居中
      raw.forEach(s=>{
        const chars=Array.from(s);
        const isHeading=!/[，。！？；：,.!?;:]/.test(s) && chars.length<=Math.max(12,Math.floor(cols*1.5));
        if(isHeading){ out=out.concat(centerLine(chars,cols)); return; }
        s.split(/(?<=[，。！？；!?;.])/).filter(Boolean).forEach(seg=>{
          const cs=Array.from(seg);
          out=out.concat(cs.length<=cols?centerLine(cs,cols):wrapFlow(cs,cols,0));
        });
      });
    } else { // 文章格式：首行标题居中；其余每行为一个自然段，段首缩进两格
      raw.forEach((s,i)=>{
        const chars=Array.from(s);
        out=out.concat(i===0?centerLine(chars,cols):wrapFlow(chars,cols,2));
      });
    }
    const cells=[];
    out.forEach(l=>{ cells.push.apply(cells,l); const rem=l.length%cols; if(rem!==0){ for(let i=0;i<cols-rem;i++) cells.push(''); } });
    return { pages:[cells] };
  }
  function sampleRandom(pool,n,noRepeat){ if(pool.length===0) return ''; const cnt=Math.max(1,Math.min(n, noRepeat?pool.length:n)); if(noRepeat){ const shuffled=pool.slice(); for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; } return shuffled.slice(0,cnt).join(''); } else { let out=''; for(let i=0;i<cnt;i++){ out+=pool[Math.floor(Math.random()*pool.length)]; } return out; } }
  w.__copybook__.content={ splitInput, toCells, paginate, sampleRandom, layoutDocument, layoutEnglish, wrapFlow, centerLine };
})();