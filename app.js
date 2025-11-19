(function(){
  const { useState, useEffect, useMemo } = React;

  function toHex(c){ if(!c) return '#000000'; const m=c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if(m) return c; const map={绿色:'#198754',黑色:'#000000',红色:'#dc3545'}; return map[c]||'#000000'; }
  function strokeLevel(level,textColor){ const map={'非常深':1,'深':0.9,'较深':0.8,'略浅':0.6,'适中':0.5,'非常浅':0.35,'白色（不可见）':0,'空芯':'outline'}; const v=map[level]??0.5; if(v==='outline') return { color:'transparent', WebkitTextStroke:`1px ${textColor}` }; return { opacity:String(v), color:textColor, WebkitTextStroke:'0' }; }
  function fontByTemplate(t,custom){ if(t==='楷书') return `'STKaiti','KaiTi','Kaiti SC','AR PL KaitiM GB',serif`; if(t==='行书') return `'Hiragino Sans GB','KaiTi','Kaiti SC',serif`; if(t==='草书') return `'CaoShu','KaiTi','Kaiti SC',serif`; if(t==='隶书') return `'LiSu','KaiTi','Kaiti SC',serif`; if(t==='庞中华') return `'PangZhongHuaKaiTi','PangZhongHua',serif`; if(t==='田英章') return `'TianYingZhangKaiTi','TianYingZhang',serif`; if(t==='自定义') return custom||'serif'; return 'serif'; }
  function svgDataURL(type,size,color){ const s=size,c=color; if(type==='无格') return ''; const w=parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--grid-stroke-width')||'1'); if(type==='田字格'){ const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${w}'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${w}'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } if(type==='米字格'){ const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${w}'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${w}'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } if(type==='回宫格'){ const inner=Math.round(s*0.6),offset=(s-inner)/2; const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${w}'/>`+`<rect x='${offset}' y='${offset}' width='${inner}' height='${inner}' fill='none' stroke='${c}' stroke-width='${w}'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${w}'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } if(type==='四线三格'){ const cs=getComputedStyle(document.documentElement); const y1=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y1')||'0.25')); const y2=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y2')||'0.50')); const y3=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y3')||'0.75')); const y4=Math.round(s*parseFloat(cs.getPropertyValue('--fourline-y4')||'0.92')); const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+`<line x1='1' y1='${y1}' x2='${s-1}' y2='${y1}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='${y2}' x2='${s-1}' y2='${y2}' stroke='${c}' stroke-width='${w}' stroke-dasharray='4,4'/>`+`<line x1='1' y1='${y3}' x2='${s-1}' y2='${y3}' stroke='${c}' stroke-width='${w}'/>`+`<line x1='1' y1='${y4}' x2='${s-1}' y2='${y4}' stroke='${c}' stroke-width='${w}'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } return ''; }
  function splitInput(mode,text){ const t=(text||'').trim(); if(mode==='多字') return Array.from(t); if(mode==='多词'){ const arr=t.replace(/，/g,',').split(/[\|\s,]+/).filter(Boolean); return arr; } if(mode==='多句'){ const pages=t.split('|').map(s=>s.trim()).filter(Boolean); return pages.map(p=>p.split(/(?<=[。！？!?.])/).filter(Boolean)); } if(mode==='文章'){ return Array.from(t.replace(/\s+/g,'')); } return []; }
  function toCells(mode,text,variant){ if(mode==='多句'){ const pages=splitInput(mode,text); const flat=pages.map(pg=>{ const lineCells=[]; pg.forEach(sentence=>{ Array.from(sentence).forEach(ch=>lineCells.push(ch)); if(variant.includes('+1行')) lineCells.push('\n'); if(variant.includes('+1空行')) lineCells.push(''); }); return lineCells; }); return { pages: flat }; } const base=splitInput(mode,text); const cells=[]; if(mode==='多词'){ base.forEach(w=>{ Array.from(w).forEach(c=>cells.push(c)); if(variant.includes('+1行')) cells.push('\n'); if(variant.includes('+1空行')) cells.push(''); }); } else { base.forEach(c=>cells.push(c)); if(variant.includes('+1空行')) cells.push(''); } return { pages:[cells] }; }
  function paginate(cellsByPage,rows,cols,fillLast){ const pages=[]; cellsByPage.forEach(list=>{ const cap=rows*cols; let chunk=list.slice(); while(chunk.length>0){ const page=chunk.splice(0,cap); if(fillLast && page.length<cap){ while(page.length<cap) page.push(''); } pages.push(page); } }); return pages; }
  function pageSize(format){ if(format==='A4竖版') return { w:'210mm', h:'297mm' }; if(format==='A4横版') return { w:'297mm', h:'210mm' }; if(format==='A5竖版') return { w:'148mm', h:'210mm' }; if(format==='A5横版') return { w:'210mm', h:'148mm' }; if(format==='作文纸A4') return { w:'210mm', h:'297mm' }; return { w:'210mm', h:'297mm' }; }
  function validate(mode,text){ if(!text||!text.trim()) return { ok:false, msg:'请输入内容' }; if(mode==='多字' && /[\s,;，；\n]/.test(text)) return { ok:false, msg:'多字模式不允许空格或标点' }; if(mode==='文章' && /\n/.test(text)) return { ok:false, msg:'文章模式不允许换行' }; return { ok:true, msg:'' }; }
  function Cell({ ch,bg,textColor,strokeMode,font,fontSize,showGuide }){ const style=strokeLevel(strokeMode,textColor); return React.createElement('div',{ className:'cell', style:{ backgroundImage:bg, color:style.color, WebkitTextStroke:style.WebkitTextStroke, opacity:style.opacity, fontFamily:font, fontSize:fontSize } }, ch||'', showGuide?React.createElement('div',{ className:'guide' }, React.createElement('div',{ className:'guide-arrow' })):null); }

  function App(){
    const [commonChars,setCommonChars]=useState([]);
    const [previewScale,setPreviewScale]=useState(1);
    const [stylePreset,setStylePreset]=useState('四线三格标准');
    const [autoLayout,setAutoLayout]=useState(true);
    const [gridStrokeWidth,setGridStrokeWidth]=useState(1);
    const [feature,setFeature]=useState('字帖模板');
    const [difficulty,setDifficulty]=useState('初级');
    const [showGuide,setShowGuide]=useState(false);
    const [letterStyle,setLetterStyle]=useState('印刷体');
    const [alnumIncludeDigits,setAlnumIncludeDigits]=useState(true);
    const [alnumIncludeUpper,setAlnumIncludeUpper]=useState(true);
    const [alnumIncludeLower,setAlnumIncludeLower]=useState(true);
    const [alnumCount,setAlnumCount]=useState(20);
    const [alnumNoRepeat,setAlnumNoRepeat]=useState(true);
    const [alnumSeq,setAlnumSeq]=useState('');
    const [mode,setMode]=useState('多字');
    const [variant,setVariant]=useState('多字');
    const [text,setText]=useState('');
    const [gridType,setGridType]=useState('田字格');
    const [gridColor,setGridColor]=useState('绿色');
    const [textColorOpt,setTextColorOpt]=useState('黑色');
    const [strokeMode,setStrokeMode]=useState('适中');
    const [tailFill,setTailFill]=useState(true);
    const [template,setTemplate]=useState('楷书');
    const [customFont,setCustomFont]=useState('');
    const [rows,setRows]=useState(10);
    const [cols,setCols]=useState(8);
    const [cellSize,setCellSize]=useState(60);
    const [gridGap,setGridGap]=useState(8);
    const [fontSize,setFontSize]=useState(42);
    const [marginTop,setMarginTop]=useState(16);
    const [marginRight,setMarginRight]=useState(12);
    const [marginBottom,setMarginBottom]=useState(16);
    const [marginLeft,setMarginLeft]=useState(12);
    const [paper,setPaper]=useState('A4竖版');
    const [header,setHeader]=useState('');
    const [randCount,setRandCount]=useState(50);
    const [randNoRepeat,setRandNoRepeat]=useState(true);

    useEffect(()=>{ const saved=localStorage.getItem('copybook.settings'); if(saved){ try{ const s=JSON.parse(saved); Object.entries(s).forEach(([k,v])=>{ if(v!==undefined) switch(k){ case 'mode':setMode(v);break; case 'variant':setVariant(v);break; case 'gridType':setGridType(v);break; case 'gridColor':setGridColor(v);break; case 'textColorOpt':setTextColorOpt(v);break; case 'strokeMode':setStrokeMode(v);break; case 'tailFill':setTailFill(v);break; case 'template':setTemplate(v);break; case 'customFont':setCustomFont(v);break; case 'rows':setRows(v);break; case 'cols':setCols(v);break; case 'cellSize':setCellSize(v);break; case 'gridGap':setGridGap(v);break; case 'fontSize':setFontSize(v);break; case 'marginTop':setMarginTop(v);break; case 'marginRight':setMarginRight(v);break; case 'marginBottom':setMarginBottom(v);break; case 'marginLeft':setMarginLeft(v);break; case 'paper':setPaper(v);break; case 'header':setHeader(v);break; case 'text':setText(v);break; case 'feature':setFeature(v);break; case 'difficulty':setDifficulty(v);break; case 'showGuide':setShowGuide(v);break; case 'letterStyle':setLetterStyle(v);break; case 'previewScale':setPreviewScale(v);break; case 'stylePreset':setStylePreset(v);break; case 'autoLayout':setAutoLayout(v);break; case 'gridStrokeWidth':setGridStrokeWidth(v);break; case 'alnumIncludeDigits':setAlnumIncludeDigits(v);break; case 'alnumIncludeUpper':setAlnumIncludeUpper(v);break; case 'alnumIncludeLower':setAlnumIncludeLower(v);break; case 'alnumCount':setAlnumCount(v);break; case 'alnumNoRepeat':setAlnumNoRepeat(v);break; case 'alnumSeq':setAlnumSeq(v);break; } }); }catch(e){} } },[]);
    useEffect(()=>{ const s={ mode,variant,gridType,gridColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale,feature,difficulty,showGuide,letterStyle,stylePreset,autoLayout,gridStrokeWidth,alnumIncludeDigits,alnumIncludeUpper,alnumIncludeLower,alnumCount,alnumNoRepeat,alnumSeq }; localStorage.setItem('copybook.settings', JSON.stringify(s)); },[mode,variant,gridType,gridColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale,feature,difficulty,showGuide,letterStyle,stylePreset,autoLayout,gridStrokeWidth,alnumIncludeDigits,alnumIncludeUpper,alnumIncludeLower,alnumCount,alnumNoRepeat,alnumSeq]);

    useEffect(()=>{
      fetch('./common-chars.json').then(r=>r.json()).then(arr=>{
        const uniq=[...new Set((arr||[]).filter(ch=>/[\u4e00-\u9fff]/.test(ch)))];
        setCommonChars(uniq);
      }).catch(()=>{
        fetch('./常用1000汉子.md').then(r=>r.text()).then(t=>{
          const lines=t.split('\n'); let buckets=[]; let curName=''; let curChars=[];
          for(const line of lines){ const isTitle=line.startsWith('##'); if(isTitle){ if(curName){ buckets.push({ name:curName.trim(), chars:[...new Set(curChars)] }); } curName=line.replace(/^#+\s*/,'').trim(); curChars=[]; } else { const arr=Array.from(line).filter(ch=>/[\u4e00-\u9fff]/.test(ch)); if(arr.length) curChars.push(...arr); } }
          if(curName){ buckets.push({ name:curName.trim(), chars:[...new Set(curChars)] }); }
          const all=[...new Set(buckets.flatMap(b=>b.chars))];
          setCommonChars(all);
        }).catch(()=>{ setCommonChars([]); });
      });
    },[]);
    useEffect(()=>{ if(window.matchMedia && window.matchMedia('(max-width: 576px)').matches){ setPreviewScale(0.6); } },[]);
    useEffect(()=>{ if(feature==='数字字母'){ setGridType('四线三格'); if(!alnumSeq) genAlnum(); } },[feature]);
    useEffect(()=>{ document.documentElement.style.setProperty('--preview-scale', String(previewScale)); },[previewScale]);
    const gColor=toHex(gridColor); const tColor=toHex(textColorOpt);
    const parsed=useMemo(()=>{ const cp=window.__copybook__||{}; if(feature==='控笔字帖'){ if(cp.features&&cp.features.buildControlPages) return cp.features.buildControlPages(difficulty); const basic=['一','丨','丿','丶','亅']; const mids=['氵','亻','讠','艹','月','女','口','木','火','土','日','目','田']; const adv=['永','德','善','爱','勇','强']; let pool=[]; if(difficulty==='初级') pool=basic; else if(difficulty==='中级') pool=mids; else pool=adv; const seq=[]; pool.forEach(c=>{ seq.push(c); seq.push(''); }); return { pages:[seq] }; } if(feature==='数字字母'){ const s=alnumSeq||''; return { pages:[Array.from(s)] }; } return (cp.content&&cp.content.toCells?cp.content.toCells(mode,text,variant):toCells(mode,text,variant)); },[feature,mode,text,variant,difficulty,alnumSeq]);
    const pages=useMemo(()=>paginate(parsed.pages,rows,cols,tailFill),[parsed,rows,cols,tailFill]);
    const usage=useMemo(()=>{ const capacity=rows*cols*pages.length; let used=0; pages.forEach(pg=>pg.forEach(ch=>{ if(ch&&ch!=='\n') used++; })); const warn=pages.length>50; return { capacity, used, warn }; },[pages,rows,cols]);
    const bg=useMemo(()=>{ const cp=window.__copybook__||{}; return (cp.grid?cp.grid.svgDataURL(gridType,cellSize,gColor):svgDataURL(gridType,cellSize,gColor)); },[gridType,cellSize,gColor]);
    useEffect(()=>{ const sz=pageSize(paper); document.documentElement.style.setProperty('--page-width', sz.w); document.documentElement.style.setProperty('--page-height', sz.h); document.documentElement.style.setProperty('--cell-size', `${cellSize}px`); document.documentElement.style.setProperty('--grid-gap', `${gridGap}px`); document.documentElement.style.setProperty('--grid-color', gColor); document.documentElement.style.setProperty('--text-color', tColor); document.documentElement.style.setProperty('--font-size', `${fontSize}px`); document.documentElement.style.setProperty('--page-margin-top', `${marginTop}mm`); document.documentElement.style.setProperty('--page-margin-right', `${marginRight}mm`); document.documentElement.style.setProperty('--page-margin-bottom', `${marginBottom}mm`); document.documentElement.style.setProperty('--page-margin-left', `${marginLeft}mm`); document.documentElement.style.setProperty('--guide-color', gColor); },[paper,cellSize,gridGap,gColor,tColor,fontSize,marginTop,marginRight,marginBottom,marginLeft]);
    useEffect(()=>{ document.documentElement.style.setProperty('--grid-stroke-width', String(gridStrokeWidth)); },[gridStrokeWidth]);
    useEffect(()=>{ if(stylePreset==='四线三格标准'){ document.documentElement.style.setProperty('--fourline-y1','0.25'); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3','0.75'); document.documentElement.style.setProperty('--fourline-y4','0.92'); setGridType('四线三格'); } else if(stylePreset==='四线三格宽间'){ document.documentElement.style.setProperty('--fourline-y1','0.20'); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3','0.80'); document.documentElement.style.setProperty('--fourline-y4','0.95'); setGridType('四线三格'); } else if(stylePreset==='田字格标准'){ setGridType('田字格'); } },[stylePreset]);
    useEffect(()=>{ if(autoLayout && gridType==='四线三格'){ const s=(text||''); const upp=(s.match(/[A-Z]/g)||[]).length; const low=(s.match(/[a-z]/g)||[]).length; const dig=(s.match(/[0-9]/g)||[]).length; const total=Math.max(1, upp+low+dig); const ru=upp/total, rl=low/total, rd=dig/total; let y1='0.23', y2='0.50', y3='0.77', y4='0.94'; if(ru>0.5){ y1='0.20'; y3='0.80'; y4='0.96'; } else if(rl>0.5){ y1='0.25'; y3='0.75'; y4='0.92'; } else if(rd>0.5){ y1='0.22'; y3='0.78'; y4='0.95'; } document.documentElement.style.setProperty('--fourline-y1', y1); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3', y3); document.documentElement.style.setProperty('--fourline-y4', y4); } },[autoLayout,gridType,text]);
    const font=fontByTemplate(template,customFont);
    const v=validate(mode,text);

    function genAlnum(){ let pool=''; if(alnumIncludeUpper) pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZ'; if(alnumIncludeLower) pool+='abcdefghijklmnopqrstuvwxyz'; if(alnumIncludeDigits) pool+='0123456789'; const arr=Array.from(pool); if(arr.length===0){ setAlnumSeq(''); return; } const n=Math.max(1,Math.min(alnumCount, alnumNoRepeat?arr.length:alnumCount)); const out=[]; if(alnumNoRepeat){ const used=new Set(); for(let i=0;i<n;i++){ let idx; do{ const u=new Uint32Array(1); crypto.getRandomValues(u); idx=u[0]%arr.length; } while(used.has(idx)); used.add(idx); out.push(arr[idx]); } } else { for(let i=0;i<n;i++){ const u=new Uint32Array(1); crypto.getRandomValues(u); const idx=u[0]%arr.length; out.push(arr[idx]); } } setAlnumSeq(out.join('')); }
    const alnumStats=useMemo(()=>{ const s=alnumSeq||''; const up=(s.match(/[A-Z]/g)||[]).length; const low=(s.match(/[a-z]/g)||[]).length; const dig=(s.match(/[0-9]/g)||[]).length; const total=Math.max(1,s.length); return { up, low, dig, upPct:Math.round(up*100/total), lowPct:Math.round(low*100/total), digPct:Math.round(dig*100/total), total }; },[alnumSeq]);

    function exportPDF(){ const cp=window.__copybook__||{}; if(cp.exporting&&cp.exporting.exportPDF){ cp.exporting.exportPDF(paper); } else { const opt={ margin:0, filename:'字帖.pdf', image:{ type:'jpeg', quality:0.98 }, html2canvas:{ scale:4 }, jsPDF:{ unit:'mm', format: paper.indexOf('横版')>-1?'a4':'a4', orientation: paper.indexOf('横版')>-1?'landscape':'portrait' } }; const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).set(opt).save(); } }
    function exportImage(){ const cp=window.__copybook__||{}; if(cp.exporting&&cp.exporting.exportImage){ cp.exporting.exportImage(); } else { const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).toImg().save('字帖.png'); } }
    function fillRandom(overwrite){ const s=window.__copybook__.content.sampleRandom(commonChars,randCount,randNoRepeat); if(!s) return; if(overwrite){ setText(s); } else { setText(prev=> (prev||'')+s); } }
    

    return React.createElement('div',{ className:'container py-3' },
      React.createElement('div',{ className:'no-print mb-3' },
        React.createElement('h1',{ className:'h4 mb-3' },'字帖生成器'),
        React.createElement('div',{ className:'row g-3' },
          React.createElement('div',{ className:'col-lg-7' },
            React.createElement('div',{ className:'card' },
              React.createElement('div',{ className:'card-body' },
                React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'feature' },'功能模块'),
                  React.createElement('select',{ id:'feature', className:'form-select', value:feature, onChange:e=>setFeature(e.target.value) },
                    ['字帖模板','控笔字帖','数字字母'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ),
                feature==='字帖模板'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'mode' },'文本类型'),
                  React.createElement('select',{ id:'mode', className:'form-select', value:mode, onChange:e=>{ setMode(e.target.value); setVariant(e.target.value); }, 'aria-label':'文本类型' },
                    ['多字','多词','多句','文章'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ):null,
                feature==='字帖模板'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'variant' },'变体'),
                  React.createElement('select',{ id:'variant', className:'form-select', value:variant, onChange:e=>setVariant(e.target.value) },
                    [ `${mode}`, `${mode}+1行`, `${mode}+1空行`, `${mode}+1行+1空行` ].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ):null,
                feature==='字帖模板'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'text' },'输入'),
                  React.createElement('textarea',{ id:'text', className:`form-control ${v.ok?'':'is-invalid'}`, rows:4, placeholder:'在此输入内容。多词用 | 或逗号/空格分隔；多句用 | 分隔页面。', value:text, onChange:e=>setText(e.target.value), 'aria-describedby':'textHelp' }),
                  React.createElement('div',{ id:'textHelp', className:'form-text' },'支持批量粘贴。'),
                  v.ok?null:React.createElement('div',{ className:'invalid-feedback', role:'alert' }, v.msg)
                ):null,
                feature==='控笔字帖'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'difficulty' },'难度'),
                  React.createElement('select',{ id:'difficulty', className:'form-select', value:difficulty, onChange:e=>setDifficulty(e.target.value) },
                    ['初级','中级','高级'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ):null,
                feature==='数字字母'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'letterStyle' },'风格'),
                  React.createElement('select',{ id:'letterStyle', className:'form-select', value:letterStyle, onChange:e=>setLetterStyle(e.target.value) },
                    ['印刷体','手写体'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  ),
                  React.createElement('div',{ className:'form-check mt-2' },
                    React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'guide', checked:showGuide, onChange:e=>setShowGuide(e.target.checked) }),
                    React.createElement('label',{ className:'form-check-label', htmlFor:'guide' },'显示指示箭头')
                  )
                ):null,
                feature==='数字字母'?React.createElement('div',{ className:'mt-2' },
                  React.createElement('div',{ className:'fw-bold mb-2' },'字母数字（随机生成）'),
                  React.createElement('div',{ className:'row g-2' },
                    React.createElement('div',{ className:'col-6' },
                      React.createElement('label',{ className:'form-label', htmlFor:'alnumCount' },'数量'),
                      React.createElement('input',{ id:'alnumCount', className:'form-control', type:'number', min:1, value:alnumCount, onChange:e=>{ setAlnumCount(parseInt(e.target.value||'20')); genAlnum(); } })
                    ),
                    React.createElement('div',{ className:'col-6 d-flex align-items-end' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumNoRepeat', checked:alnumNoRepeat, onChange:e=>{ setAlnumNoRepeat(e.target.checked); genAlnum(); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumNoRepeat' },'不重复')
                      )
                    )
                  ),
                  React.createElement('div',{ className:'row g-2 mt-1' },
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumDigits', checked:alnumIncludeDigits, onChange:e=>{ setAlnumIncludeDigits(e.target.checked); genAlnum(); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumDigits' },'包含数字')
                      )
                    ),
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumUpper', checked:alnumIncludeUpper, onChange:e=>{ setAlnumIncludeUpper(e.target.checked); genAlnum(); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumUpper' },'包含大写')
                      )
                    ),
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumLower', checked:alnumIncludeLower, onChange:e=>{ setAlnumIncludeLower(e.target.checked); genAlnum(); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumLower' },'包含小写')
                      )
                    )
                  ),
                  React.createElement('div',{ className:'mt-2 d-flex gap-2 align-items-center flex-wrap' },
                    React.createElement('button',{ className:'btn btn-outline-primary', onClick:genAlnum },'重新生成'),
                    React.createElement('button',{ className:'btn btn-outline-secondary', onClick:()=>{ if(navigator.clipboard) navigator.clipboard.writeText(alnumSeq||''); } },'复制结果'),
                    React.createElement('span',{ className:'legend' }, `总数：${alnumStats.total}，大写：${alnumStats.up}（${alnumStats.upPct}%） 小写：${alnumStats.low}（${alnumStats.lowPct}%） 数字：${alnumStats.dig}（${alnumStats.digPct}%）`)
                  ),
                  React.createElement('div',{ className:'mt-2 p-2 border rounded font-monospace' }, alnumSeq||'')
                ):null,
                React.createElement('div',{ className:'row g-2' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gridType' },'格子类型'),
                    React.createElement('select',{ id:'gridType', className:'form-select', value:gridType, onChange:e=>setGridType(e.target.value) },
                      ['田字格','米字格','回宫格','四线三格','无格'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gridColor' },'格子颜色'),
                    React.createElement('select',{ id:'gridColor', className:'form-select', value:gridColor, onChange:e=>setGridColor(e.target.value) },
                      ['绿色','黑色','红色'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'stylePreset' },'打印样式'),
                    React.createElement('select',{ id:'stylePreset', className:'form-select', value:stylePreset, onChange:e=>setStylePreset(e.target.value) },
                      ['四线三格标准','四线三格宽间','田字格标准'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'strokeWidth' },'线条粗细'),
                    React.createElement('input',{ id:'strokeWidth', className:'form-range', type:'range', min:'0.5', max:'3', step:'0.5', value:gridStrokeWidth, onChange:e=>setGridStrokeWidth(parseFloat(e.target.value||'1')) })
                  )
                ),
                React.createElement('div',{ className:'form-check mt-1' },
                  React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'autoLayout', checked:autoLayout, onChange:e=>setAutoLayout(e.target.checked) }),
                  React.createElement('label',{ className:'form-check-label', htmlFor:'autoLayout' },'智能排版（四线三格）')
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'textColor' },'文字颜色'),
                    React.createElement('select',{ id:'textColor', className:'form-select', value:textColorOpt, onChange:e=>setTextColorOpt(e.target.value) },
                      ['绿色','黑色','红色'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'stroke' },'描红背景'),
                    React.createElement('select',{ id:'stroke', className:'form-select', value:strokeMode, onChange:e=>setStrokeMode(e.target.value) },
                      ['非常深','深','较深','略浅','适中','非常浅','白色（不可见）','空芯'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'rows' },'行数/页'),
                    React.createElement('input',{ id:'rows', className:'form-control', type:'number', min:1, value:rows, onChange:e=>setRows(parseInt(e.target.value||'1')) })
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'cols' },'列数/行'),
                    React.createElement('input',{ id:'cols', className:'form-control', type:'number', min:1, value:cols, onChange:e=>setCols(parseInt(e.target.value||'1')) })
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'cell' },'格子尺寸'),
                    React.createElement('input',{ id:'cell', className:'form-control', type:'number', min:30, value:cellSize, onChange:e=>setCellSize(parseInt(e.target.value||'60')) })
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gap' },'行距'),
                    React.createElement('input',{ id:'gap', className:'form-control', type:'number', min:0, value:gridGap, onChange:e=>setGridGap(parseInt(e.target.value||'0')) })
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'fsize' },'字体大小'),
                    React.createElement('input',{ id:'fsize', className:'form-control', type:'number', min:12, value:fontSize, onChange:e=>setFontSize(parseInt(e.target.value||'42')) })
                  ),
                  React.createElement('div',{ className:'col-4' },
                  React.createElement('label',{ className:'form-label', htmlFor:'paper' },'纸张格式'),
                  React.createElement('select',{ id:'paper', className:'form-select', value:paper, onChange:e=>setPaper(e.target.value) },
                      ['A4竖版','A4横版','A5竖版','A5横版','作文纸A4'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-3' },
                    React.createElement('label',{ className:'form-label', htmlFor:'mt' },'上边距(mm)'),
                    React.createElement('input',{ id:'mt', className:'form-control', type:'number', min:0, value:marginTop, onChange:e=>setMarginTop(parseInt(e.target.value||'0')) })
                  ),
                  React.createElement('div',{ className:'col-3' },
                    React.createElement('label',{ className:'form-label', htmlFor:'mr' },'右边距(mm)'),
                    React.createElement('input',{ id:'mr', className:'form-control', type:'number', min:0, value:marginRight, onChange:e=>setMarginRight(parseInt(e.target.value||'0')) })
                  ),
                  React.createElement('div',{ className:'col-3' },
                    React.createElement('label',{ className:'form-label', htmlFor:'mb' },'下边距(mm)'),
                    React.createElement('input',{ id:'mb', className:'form-control', type:'number', min:0, value:marginBottom, onChange:e=>setMarginBottom(parseInt(e.target.value||'0')) })
                  ),
                  React.createElement('div',{ className:'col-3' },
                    React.createElement('label',{ className:'form-label', htmlFor:'ml' },'左边距(mm)'),
                    React.createElement('input',{ id:'ml', className:'form-control', type:'number', min:0, value:marginLeft, onChange:e=>setMarginLeft(parseInt(e.target.value||'0')) })
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'template' },'字帖模板'),
                    React.createElement('select',{ id:'template', className:'form-select', value:template, onChange:e=>setTemplate(e.target.value) },
                      ['楷书','行书','草书','隶书','庞中华','田英章','自定义'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'cfont' },'自定义字体'),
                    React.createElement('input',{ id:'cfont', className:'form-control', placeholder:'系统已安装字体名', disabled:template!=='自定义', value:customFont, onChange:e=>setCustomFont(e.target.value) })
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'header' },'自定义页眉'),
                    React.createElement('input',{ id:'header', className:'form-control', value:header, onChange:e=>setHeader(e.target.value) })
                  ),
                  React.createElement('div',{ className:'col-6 d-flex align-items-end' },
                    React.createElement('div',{ className:'form-check' },
                      React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'fill', checked:tailFill, onChange:e=>setTailFill(e.target.checked) }),
                      React.createElement('label',{ className:'form-check-label', htmlFor:'fill' },'填充尾页')
                    )
                  )
                ),
                React.createElement('div',{ className:'mt-3 d-flex gap-2' },
                  React.createElement('button',{ className:'btn btn-success', onClick:()=>window.print(), disabled:pages.length===0 },'打印/另存为PDF'),
                  React.createElement('button',{ className:'btn btn-primary', onClick:exportPDF, disabled:pages.length===0 },'生成高清PDF'),
                  React.createElement('button',{ className:'btn btn-outline-primary', onClick:exportImage, disabled:pages.length===0 },'导出PNG'),
                  React.createElement('span',{ className:'legend' },'建议使用现代浏览器。')
                )
              )
            )
          ),
          React.createElement('div',{ className:'col-lg-5' },
            React.createElement('div',{ className:'card' },
              React.createElement('div',{ className:'card-body' },
                React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'previewScale' },'预览缩放'),
                  React.createElement('input',{ id:'previewScale', className:'form-range', type:'range', min:'0.4', max:'1.2', step:'0.05', value:previewScale, onChange:e=>setPreviewScale(parseFloat(e.target.value||'1')) })
                ),
                
                React.createElement('div',null,
                  React.createElement('div',{ className:'fw-bold mb-2' },'常用汉字随机'),
                  React.createElement('div',{ className:'row g-2' },
                    React.createElement('div',{ className:'col-6' },
                      React.createElement('label',{ className:'form-label', htmlFor:'randCount' },'筛选数量'),
                      React.createElement('input',{ id:'randCount', className:'form-control', type:'number', min:1, value:randCount, onChange:e=>setRandCount(parseInt(e.target.value||'1')) })
                    ),
                    React.createElement('div',{ className:'col-6 d-flex align-items-end' },
                      React.createElement('div',{ className:'form-check' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'noRepeat', checked:randNoRepeat, onChange:e=>setRandNoRepeat(e.target.checked) }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'noRepeat' },'不重复')
                      )
                    )
                  ),
                  React.createElement('div',{ className:'mt-2 d-flex gap-2 align-items-center flex-wrap' },
                    React.createElement('button',{ className:'btn btn-outline-primary', onClick:()=>fillRandom(true), disabled:commonChars.length===0 },'覆盖输入'),
                    React.createElement('button',{ className:'btn btn-outline-secondary', onClick:()=>fillRandom(false), disabled:commonChars.length===0 },'追加到输入'),
                    React.createElement('span',{ className:'legend' }, commonChars.length>0?`可用汉字：${commonChars.length}`:'未读取到常用汉字'),
                    React.createElement('span',{ className:'legend' }, `容量：${usage.capacity}，已用：${usage.used}`),
                    usage.warn?React.createElement('span',{ className:'error' },'页面过多，建议分批打印'):null
                  )
                ),
                React.createElement('div',{ className:'mt-2 text-muted small' },'模板需本机安装相应字体。')
              )
            )
          )
        )
      ),
      React.createElement('div',{ className:'page-wrapper' },
        pages.map((page,i)=>React.createElement('div',{ key:i, className:'page' },
          header?React.createElement('div',{ className:'header' },header):null,
          React.createElement('div',{ className:'grid', style:{ gridTemplateColumns:`repeat(${cols}, var(--cell-size))` } },
            page.map((ch,idx)=>React.createElement(Cell,{ key:idx, ch: ch==='\n'?'':ch, bg:bg, textColor:tColor, strokeMode, font: feature==='数字字母'?(letterStyle==='印刷体'?'monospace':'cursive'):font, fontSize, showGuide: feature==='数字字母' && showGuide }))
          )
        ))
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();