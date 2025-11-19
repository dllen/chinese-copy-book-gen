(function(){
  const { useState, useEffect, useMemo } = React;

  function toHex(c){ if(!c) return '#000000'; const m=c.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i); if(m) return c; const map={绿色:'#198754',黑色:'#000000',红色:'#dc3545'}; return map[c]||'#000000'; }
  function strokeLevel(level,textColor){ const map={'非常深':1,'深':0.9,'较深':0.8,'略浅':0.6,'适中':0.5,'非常浅':0.35,'白色（不可见）':0,'空芯':'outline'}; const v=map[level]??0.5; if(v==='outline') return { color:'transparent', WebkitTextStroke:`1px ${textColor}` }; return { opacity:String(v), color:textColor, WebkitTextStroke:'0' }; }
  function fontByTemplate(t,custom){ if(t==='楷书') return `'STKaiti','KaiTi','Kaiti SC','AR PL KaitiM GB',serif`; if(t==='行书') return `'Hiragino Sans GB','KaiTi','Kaiti SC',serif`; if(t==='草书') return `'CaoShu','KaiTi','Kaiti SC',serif`; if(t==='庞中华') return `'PangZhongHuaKaiTi','PangZhongHua',serif`; if(t==='田英章') return `'TianYingZhangKaiTi','TianYingZhang',serif`; if(t==='自定义') return custom||'serif'; return 'serif'; }
  function svgDataURL(type,size,color){ const s=size,c=color; if(type==='无格') return ''; if(type==='田字格'){ const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='1'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='1'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='1'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } if(type==='米字格'){ const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='1'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='1'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='1'/>`+`<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='1'/>`+`<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='1'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } if(type==='回宫格'){ const inner=Math.round(s*0.6),offset=(s-inner)/2; const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}'>`+`<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='1'/>`+`<rect x='${offset}' y='${offset}' width='${inner}' height='${inner}' fill='none' stroke='${c}' stroke-width='1'/>`+`<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='1'/>`+`<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='1'/>`+`</svg>`; return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`; } return ''; }
  function splitInput(mode,text){ const t=(text||'').trim(); if(mode==='多字') return Array.from(t); if(mode==='多词'){ const arr=t.replace(/，/g,',').split(/[\|\s,]+/).filter(Boolean); return arr; } if(mode==='多句'){ const pages=t.split('|').map(s=>s.trim()).filter(Boolean); return pages.map(p=>p.split(/(?<=[。！？!?.])/).filter(Boolean)); } if(mode==='文章'){ return Array.from(t.replace(/\s+/g,'')); } return []; }
  function toCells(mode,text,variant){ if(mode==='多句'){ const pages=splitInput(mode,text); const flat=pages.map(pg=>{ const lineCells=[]; pg.forEach(sentence=>{ Array.from(sentence).forEach(ch=>lineCells.push(ch)); if(variant.includes('+1行')) lineCells.push('\n'); if(variant.includes('+1空行')) lineCells.push(''); }); return lineCells; }); return { pages: flat }; } const base=splitInput(mode,text); const cells=[]; if(mode==='多词'){ base.forEach(w=>{ Array.from(w).forEach(c=>cells.push(c)); if(variant.includes('+1行')) cells.push('\n'); if(variant.includes('+1空行')) cells.push(''); }); } else { base.forEach(c=>cells.push(c)); if(variant.includes('+1空行')) cells.push(''); } return { pages:[cells] }; }
  function paginate(cellsByPage,rows,cols,fillLast){ const pages=[]; cellsByPage.forEach(list=>{ const cap=rows*cols; let chunk=list.slice(); while(chunk.length>0){ const page=chunk.splice(0,cap); if(fillLast && page.length<cap){ while(page.length<cap) page.push(''); } pages.push(page); } }); return pages; }
  function pageSize(format){ if(format==='A4竖版') return { w:'210mm', h:'297mm' }; if(format==='A4横版') return { w:'297mm', h:'210mm' }; if(format==='作文纸A4') return { w:'210mm', h:'297mm' }; return { w:'210mm', h:'297mm' }; }
  function validate(mode,text){ if(!text||!text.trim()) return { ok:false, msg:'请输入内容' }; if(mode==='多字' && /[\s,;，；\n]/.test(text)) return { ok:false, msg:'多字模式不允许空格或标点' }; if(mode==='文章' && /\n/.test(text)) return { ok:false, msg:'文章模式不允许换行' }; return { ok:true, msg:'' }; }
  function Cell({ ch,bg,textColor,strokeMode,font,fontSize }){ const style=strokeLevel(strokeMode,textColor); return React.createElement('div',{ className:'cell', style:{ backgroundImage:bg, color:style.color, WebkitTextStroke:style.WebkitTextStroke, opacity:style.opacity, fontFamily:font, fontSize:fontSize } }, ch||''); }

  function App(){
    const [commonChars,setCommonChars]=useState([]);
    const [previewScale,setPreviewScale]=useState(1);
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

    useEffect(()=>{ const saved=localStorage.getItem('copybook.settings'); if(saved){ try{ const s=JSON.parse(saved); Object.entries(s).forEach(([k,v])=>{ if(v!==undefined) switch(k){ case 'mode':setMode(v);break; case 'variant':setVariant(v);break; case 'gridType':setGridType(v);break; case 'gridColor':setGridColor(v);break; case 'textColorOpt':setTextColorOpt(v);break; case 'strokeMode':setStrokeMode(v);break; case 'tailFill':setTailFill(v);break; case 'template':setTemplate(v);break; case 'customFont':setCustomFont(v);break; case 'rows':setRows(v);break; case 'cols':setCols(v);break; case 'cellSize':setCellSize(v);break; case 'gridGap':setGridGap(v);break; case 'fontSize':setFontSize(v);break; case 'marginTop':setMarginTop(v);break; case 'marginRight':setMarginRight(v);break; case 'marginBottom':setMarginBottom(v);break; case 'marginLeft':setMarginLeft(v);break; case 'paper':setPaper(v);break; case 'header':setHeader(v);break; case 'text':setText(v);break; } }); }catch(e){} } },[]);
    useEffect(()=>{ const s={ mode,variant,gridType,gridColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale }; localStorage.setItem('copybook.settings', JSON.stringify(s)); },[mode,variant,gridType,gridColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale]);

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
    useEffect(()=>{ document.documentElement.style.setProperty('--preview-scale', String(previewScale)); },[previewScale]);
    const gColor=toHex(gridColor); const tColor=toHex(textColorOpt);
    const parsed=useMemo(()=>toCells(mode,text,variant),[mode,text,variant]);
    const pages=useMemo(()=>paginate(parsed.pages,rows,cols,tailFill),[parsed,rows,cols,tailFill]);
    const bg=useMemo(()=>svgDataURL(gridType,cellSize,gColor),[gridType,cellSize,gColor]);
    useEffect(()=>{ const sz=pageSize(paper); document.documentElement.style.setProperty('--page-width', sz.w); document.documentElement.style.setProperty('--page-height', sz.h); document.documentElement.style.setProperty('--cell-size', `${cellSize}px`); document.documentElement.style.setProperty('--grid-gap', `${gridGap}px`); document.documentElement.style.setProperty('--grid-color', gColor); document.documentElement.style.setProperty('--text-color', tColor); document.documentElement.style.setProperty('--font-size', `${fontSize}px`); document.documentElement.style.setProperty('--page-margin-top', `${marginTop}mm`); document.documentElement.style.setProperty('--page-margin-right', `${marginRight}mm`); document.documentElement.style.setProperty('--page-margin-bottom', `${marginBottom}mm`); document.documentElement.style.setProperty('--page-margin-left', `${marginLeft}mm`); },[paper,cellSize,gridGap,gColor,tColor,fontSize,marginTop,marginRight,marginBottom,marginLeft]);
    const font=fontByTemplate(template,customFont);
    const v=validate(mode,text);

    function exportPDF(){ const opt={ margin:0, filename:'字帖.pdf', image:{ type:'jpeg', quality:0.98 }, html2canvas:{ scale:2 }, jsPDF:{ unit:'mm', format: paper==='A4横版'?'a4':'a4', orientation: paper==='A4横版'?'landscape':'portrait' } }; const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).set(opt).save(); }
    function sampleRandom(n,noRepeat){ const pool=commonChars; if(pool.length===0) return ''; const cnt=Math.max(1,Math.min(n, noRepeat?pool.length:n)); if(noRepeat){ const shuffled=pool.slice(); for(let i=shuffled.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]; } return shuffled.slice(0,cnt).join(''); } else { let out=''; for(let i=0;i<cnt;i++){ out+=pool[Math.floor(Math.random()*pool.length)]; } return out; } }
    function fillRandom(overwrite){ const s=sampleRandom(randCount,randNoRepeat); if(!s) return; if(overwrite){ setText(s); } else { setText(prev=> (prev||'')+s); } }
    

    return React.createElement('div',{ className:'container py-3' },
      React.createElement('div',{ className:'no-print mb-3' },
        React.createElement('h1',{ className:'h4 mb-3' },'字帖生成器'),
        React.createElement('div',{ className:'row g-3' },
          React.createElement('div',{ className:'col-lg-7' },
            React.createElement('div',{ className:'card' },
              React.createElement('div',{ className:'card-body' },
                React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'mode' },'文本类型'),
                  React.createElement('select',{ id:'mode', className:'form-select', value:mode, onChange:e=>{ setMode(e.target.value); setVariant(e.target.value); }, 'aria-label':'文本类型' },
                    ['多字','多词','多句','文章'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ),
                React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'variant' },'变体'),
                  React.createElement('select',{ id:'variant', className:'form-select', value:variant, onChange:e=>setVariant(e.target.value) },
                    [ `${mode}`, `${mode}+1行`, `${mode}+1空行`, `${mode}+1行+1空行` ].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ),
                React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'text' },'输入'),
                  React.createElement('textarea',{ id:'text', className:`form-control ${v.ok?'':'is-invalid'}`, rows:4, placeholder:'在此输入内容。多词用 | 或逗号/空格分隔；多句用 | 分隔页面。', value:text, onChange:e=>setText(e.target.value), 'aria-describedby':'textHelp' }),
                  React.createElement('div',{ id:'textHelp', className:'form-text' },'支持批量粘贴。'),
                  v.ok?null:React.createElement('div',{ className:'invalid-feedback', role:'alert' }, v.msg)
                ),
                React.createElement('div',{ className:'row g-2' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gridType' },'格子类型'),
                    React.createElement('select',{ id:'gridType', className:'form-select', value:gridType, onChange:e=>setGridType(e.target.value) },
                      ['田字格','米字格','回宫格','无格'].map(v=>React.createElement('option',{ key:v, value:v },v))
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
                      ['A4竖版','A4横版','作文纸A4'].map(v=>React.createElement('option',{ key:v, value:v },v))
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
                      ['楷书','行书','草书','庞中华','田英章','自定义'].map(v=>React.createElement('option',{ key:v, value:v },v))
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
                  React.createElement('button',{ className:'btn btn-success', onClick:()=>window.print(), disabled:!v.ok },'打印/另存为PDF'),
                  React.createElement('button',{ className:'btn btn-primary', onClick:exportPDF, disabled:!v.ok },'生成高清PDF'),
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
                  React.createElement('div',{ className:'mt-2 d-flex gap-2' },
                    React.createElement('button',{ className:'btn btn-outline-primary', onClick:()=>fillRandom(true), disabled:commonChars.length===0 },'覆盖输入'),
                    React.createElement('button',{ className:'btn btn-outline-secondary', onClick:()=>fillRandom(false), disabled:commonChars.length===0 },'追加到输入'),
                    React.createElement('span',{ className:'legend' }, commonChars.length>0?`可用汉字：${commonChars.length}`:'未读取到常用汉字')
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
            page.map((ch,idx)=>React.createElement(Cell,{ key:idx, ch: ch==='\n'?'':ch, bg:bg, textColor:tColor, strokeMode, font, fontSize }))
          )
        ))
      )
    );
  }

  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
  window.__copybook__={ splitInput, paginate, svgDataURL };
})();