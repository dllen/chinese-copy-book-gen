(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  
  // 文本输入解析
  function splitInput(mode,text){ 
    const t=(text||'').trim(); 
    if(mode==='多字') return Array.from(t); 
    if(mode==='多词'){ 
      const arr=t.replace(/，/g,',').split(/[\|\s,]+/).filter(Boolean); 
      return arr; 
    } 
    if(mode==='多句'){ 
      const pages=t.split('|').map(s=>s.trim()).filter(Boolean); 
      return pages.map(p=>p.split(/(?<=[。！？!?.])/).filter(Boolean)); 
    } 
    if(mode==='文章'){ return Array.from(t.replace(/\s+/g,'')); } 
    return []; 
  }
  
  // 转换为格子数据
  function toCells(mode,text,variant){ 
    const v=variant||''; 
    if(mode==='多句'){ 
      const pages=splitInput(mode,text); 
      const flat=pages.map(pg=>{ 
        const lineCells=[]; 
        pg.forEach(sentence=>{ 
          Array.from(sentence).forEach(ch=>lineCells.push(ch)); 
          if(v.includes('+1行')) lineCells.push('\n'); 
          if(v.includes('+1空行')) lineCells.push(''); 
        }); 
        return lineCells; 
      }); 
      return { pages: flat }; 
    } 
    const base=splitInput(mode,text); 
    const cells=[]; 
    if(mode==='多词'){ 
      base.forEach(w=>{ 
        Array.from(w).forEach(c=>cells.push(c)); 
        if(v.includes('+1行')) cells.push('\n'); 
        if(v.includes('+1空行')) cells.push(''); 
      }); 
    } else if(mode==='文章'){ 
      base.forEach(c=>{ 
        cells.push(c); 
        if(v.includes('+1行')) cells.push('\n'); 
        if(v.includes('+1空行')) cells.push(''); 
      }); 
    } else { 
      base.forEach(c=>{ 
        cells.push(c); 
        if(v.includes('+1行')) cells.push('\n'); 
        if(v.includes('+1空行')) cells.push(''); 
      }); 
    } 
    return { pages:[cells] }; 
  }
  
  // 分页
  function paginate(cellsByPage,rows,cols,fillLast){ 
    const pages=[]; 
    cellsByPage.forEach(list=>{ 
      const cap=rows*cols; 
      let chunk=list.slice(); 
      while(chunk.length>0){ 
        const page=chunk.splice(0,cap); 
        if(fillLast && page.length<cap){ 
          while(page.length<cap) page.push(''); 
        } 
        pages.push(page); 
      } 
    }); 
    return pages; 
  }
  
  // 竖排分页（按列填充）
  function paginateVertical(cellsByPage,rows,cols,fillLast){
    const pages=[];
    const cap=rows*cols;
    cellsByPage.forEach(list=>{
      let chunk=list.slice();
      while(chunk.length>0){
        const page=[];
        // 竖排：从左到右，从上到下，但每个单元格内从右到左
        for(let col=0; col<cols; col++){
          for(let row=0; row<rows; row++){
            const idx=row*cols+col;
            page.push(chunk[idx] !== undefined ? chunk[idx] : '');
          }
        }
        // 简单版本：直接平铺
        const flatPage=[];
        for(let i=0; i<cap && chunk.length>0; i++){
          flatPage.push(chunk.shift());
        }
        if(fillLast && flatPage.length<cap){
          while(flatPage.length<cap) flatPage.push('');
        }
        pages.push(flatPage);
      }
    });
    return pages;
  }
  
  // 行分割
  function splitRows(cells,cols){
    const rows=[[]];
    (cells||[]).forEach(ch=>{
      if(ch==='\n') rows.push([]);
      else {
        rows[rows.length-1].push(ch);
        if(cols && rows[rows.length-1].length>=cols) rows.push([]);
      }
    });
    return rows.filter(r=>r.length>0);
  }
  
  // 竖排行分割（从上到下，从右到左）
  function splitRowsVertical(cells,cols){
    // 竖排时，每个"行"实际上是一列
    const lines=[];
    const totalChars=cells.filter(c=>c&&c!=='\n').length;
    const numCols=Math.ceil(totalChars/cols);
    
    for(let col=0; col<numCols; col++){
      const line=[];
      for(let row=0; row<cols; row++){
        const idx=row*numCols+col;
        if(idx<totalChars){
          const charIdx=cells.findIndex((c,i)=>c&&c!=='\n'&&(c!==''));
          // 简化处理
        }
      }
    }
    
    // 简化版本：每cols个字符为一组，最后一组补空
    const chars=cells.filter(c=>c&&c!=='\n'&&c!=='');
    const result=[];
    for(let i=0; i<chars.length; i+=cols){
      const line=chars.slice(i,i+cols);
      while(line.length<cols) line.push('');
      result.push(line);
    }
    return result.length>0 ? result : [[]];
  }
  
  // ---------- 排版格式（考试标准） ----------
  // 不可出现于行首的标点（避头），不可落于行尾的标点（避尾）
  var HEAD_PUNCT='，。！？；：、》」』）】…—·,.!?;:)]}%';
  var TAIL_PUNCT='"'/*"*/ + "'"/*'*/ + '（【《「『([{';
  
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
  
  // 竖排换行（从上到下，从右到左）
  function wrapFlowVertical(chars,rows,indent){
    const lines=[]; let cur=[];
    // 竖排indent表示上方留空行数
    for(let i=0;i<indent&&i<rows;i++) cur.push('');
    Array.from(chars).forEach(ch=>{
      if(cur.length>=rows){
        lines.push(cur); cur=[];
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
    const left=Math.round((cols-cs.length)/2);
    const pad=[]; for(let i=0;i<left;i++) pad.push('');
    return [pad.concat(cs)];
  }
  
  // 竖排居中（从上到下，从右到左）
  function centerLineVertical(chars,rows){
    const cs=Array.from(chars);
    if(cs.length>=rows) return wrapFlowVertical(cs,rows,0);
    const top=Math.round((rows-cs.length)/2);
    const pad=[]; for(let i=0;i<top;i++) pad.push('');
    return [pad.concat(cs)];
  }
  
  // 英文格式：单词间空一格；按词换行（不拆词）；每个输入行另起一行；空输入行=空一行
  // opts.blankRows: 每条内容行后补 N 行空行（0/1/2）；opts.repeat: 单词输入行重复 N 次（1~5）
  function layoutEnglish(text,cols,opts){
    opts=opts||{};
    const blankRows=Math.max(0,Math.min(2,opts.blankRows|0));
    const repeat=Math.max(1,Math.min(5,opts.repeat|0));
    const out=[];
    (text||'').split('\n').forEach(raw=>{
      const s=raw.trim();
      if(!s){ out.push([]); return; }
      let words=s.split(/\s+/).filter(Boolean);
      if(repeat>1&&words.length===1){ const one=words[0]; words=[]; for(let i=0;i<repeat;i++) words.push(one); }
      const rs=[]; let cur=[];
      words.forEach(wd=>{
        const wcs=Array.from(wd);
        if(cur.length===0) cur=wcs.slice();
        else if(cur.length+1+wcs.length<=cols){ cur.push(''); cur=cur.concat(wcs); }
        else { rs.push(cur); cur=wcs.slice(); }
        while(cur.length>cols){ rs.push(cur.slice(0,cols)); cur=cur.slice(cols); } // 超长词硬换行
      });
      if(cur.length) rs.push(cur);
      rs.forEach((r,ri)=>{ out.push(r); if(ri<rs.length-1) for(let i=0;i<blankRows;i++) out.push([]); });
    });
    const cells=[];
    out.forEach(l=>{ cells.push.apply(cells,l); const n=l.length===0?cols:(l.length%cols===0?0:cols-l.length%cols); for(let i=0;i<n;i++) cells.push(''); });
    return { pages:[cells] };
  }
  
  // kind: '古诗格式' | '文章格式' | '英文格式'；text 按 \n 分行。返回 { pages:[cells] }，cells 已按 cols 对齐补齐
  function layoutDocument(kind,text,cols,opts){
    if(kind==='英文格式') return layoutEnglish(text,cols,opts);
    const lines=(text||'').split('\n');
    let out=[];
    if(kind==='古诗格式'){
      lines.forEach(rawLine=>{
        const s=rawLine.trim();
        if(!s){ out.push([]); return; } // 空白行→空行，保留段落间隔
        const chars=Array.from(s);
        const isHeading=!/[，。！？；：、""《》「」.!?;:]/.test(s) && chars.length<=Math.max(12,Math.floor(cols*1.5));
        if(isHeading){ out=out.concat(centerLine(chars,cols)); return; }
        s.split(/(?<=[，。！？；、""「」!?;.])/).filter(Boolean).forEach(seg=>{
          const cs=Array.from(seg);
          out=out.concat(cs.length<=cols?centerLine(cs,cols):wrapFlow(cs,cols,0));
        });
      });
    } else { // 文章格式：首行标题居中；其余每行为一个自然段，段首缩进两格；标点自动避头尾
      lines.forEach((rawLine,i)=>{
        const s=rawLine.trim();
        if(!s){ out.push([]); return; } // 空白行→空行
        const chars=Array.from(s);
        if(i===0){ out=out.concat(centerLine(chars,cols)); }
        else { out=out.concat(wrapFlow(chars,cols,2)); }
      });
    }
    const cells=[];
    out.forEach(l=>{ cells.push.apply(cells,l); const rem=l.length%cols; if(rem!==0){ for(let i=0;i<cols-rem;i++) cells.push(''); } });
    return { pages:[cells] };
  }
  
  // 竖排文档排版
  function layoutDocumentVertical(kind,text,rows,opts){
    const lines=(text||'').split('\n');
    let out=[];
    if(kind==='古诗格式'||kind==='竖排古诗'){
      lines.forEach(rawLine=>{
        const s=rawLine.trim();
        if(!s){ out.push([]); return; }
        const chars=Array.from(s);
        const isHeading=!/[，。！？；：、""《》「」.!?;:]/.test(s) && chars.length<=Math.max(8,Math.floor(rows*1.5));
        if(isHeading){ out=out.concat(centerLineVertical(chars,rows)); return; }
        // 竖排诗句：每个字符单独一行
        chars.forEach(c=>{
          out.push([c]);
        });
        out.push([]); // 诗句间空一行
      });
    } else if(kind==='竖排文章'||kind==='文章格式'){
      lines.forEach((rawLine,i)=>{
        const s=rawLine.trim();
        if(!s){ out.push([]); return; }
        const chars=Array.from(s);
        if(i===0){ out=out.concat(centerLineVertical(chars,rows)); }
        else { 
          chars.forEach(c=>out.push([c]));
        }
      });
    } else { // 竖排连续
      const chars=Array.from(text||'');
      chars.forEach(c=>{
        if(c!=='\n') out.push([c]);
        else out.push([]);
      });
    }
    
    // 将所有列合并为一个cells数组（竖排展开）
    const cells=[];
    const numCols=Math.max(...out.map(l=>l.length));
    for(let col=0; col<numCols; col++){
      out.forEach(line=>{
        cells.push(line[col] || '');
      });
    }
    return { pages:[cells], vertical: true, rows: rows, cols: numCols };
  }
  
  // 随机采样
  function sampleRandom(pool,n,noRepeat){ 
    if(!pool||pool.length===0) return ''; 
    const cnt=Math.max(1,Math.min(n, noRepeat?pool.length:n)); 
    if(noRepeat){ 
      const shuffled=pool.slice(); 
      for(let i=shuffled.length-1;i>0;i--){ 
        const j=Math.floor(Math.random()*(i+1)); 
        [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; 
      } 
      return shuffled.slice(0,cnt).join(''); 
    } else { 
      let out=''; 
      for(let i=0;i<cnt;i++){ 
        out+=pool[Math.floor(Math.random()*pool.length)]; 
      } 
      return out; 
    } 
  }
  
  w.__copybook__.content={ 
    splitInput, 
    toCells, 
    paginate, 
    paginateVertical,
    splitRows, 
    splitRowsVertical,
    sampleRandom, 
    layoutDocument, 
    layoutDocumentVertical,
    layoutEnglish, 
    wrapFlow, 
    centerLine,
    wrapFlowVertical,
    centerLineVertical
  };
})();
