(function(){
  const { useState, useEffect, useMemo } = React;

  // --- utils from module (duplicates removed) ---
  const { toHex, strokeLevel, fontByTemplate, pageSize, validate } = window.__copybook__.utils || {};
  const { splitInput, toCells, paginate, splitRows } = window.__copybook__.content || {};

  // Shared config field list (used by saveTemplate/exportConfig/importConfig/loadTemplate)
  const CONFIG_FIELDS = ['gridType','gridColor','customGridColor','customTextColor','textColorOpt','strokeMode','stylePreset','autoLayout','gridStrokeWidth','lineStyle','cellRadius','pageBg','cellBg','cellBorder','textStroke','textShadow','template','customFont','rows','cols','cellSize','gridGap','fontSize','marginTop','marginRight','marginBottom','marginLeft','paper'];

  function Cell({ ch,bg,textColor,strokeMode,font,fontSize,showGuide,cls }){ const style=strokeLevel(strokeMode,textColor); return React.createElement('div',{ className:'cell'+(cls?' '+cls:''), style:{ backgroundImage:bg, color:style.color, WebkitTextStroke:style.WebkitTextStroke, opacity:style.opacity, fontFamily:font, fontSize:fontSize } }, ch||'', showGuide?React.createElement('div',{ className:'guide' }, React.createElement('div',{ className:'guide-arrow' })):null); }

  function Section({title, children, defaultOpen}){
    const [open, setOpen] = React.useState(defaultOpen !== false);
    return React.createElement('div', {className:'mb-3 border rounded'},
      React.createElement('div',{className:'p-2 d-flex justify-content-between align-items-center'},
        React.createElement('div',{className:'fw-semibold'}, title),
        React.createElement('button',{
          className:'btn btn-sm btn-outline-secondary',
          type:'button',
          'aria-expanded': String(open),
          onClick:()=>setOpen(v=>!v)
        }, open ? '收起' : '展开')
      ),
      open ? React.createElement('div',{className:'p-2 pt-0'}, children) : null
    );
  }

  function PreviewStatus({pages, rows, cols}){
    const capacity = (rows||0)*(cols||0);
    const used = pages.reduce((sum,pg)=>sum+pg.filter(ch=>ch&&ch!=='\n').length,0);
    const warn = pages.length > 50;
    return React.createElement('div',{className:'d-flex flex-wrap gap-2 align-items-center legend'},
      React.createElement('span',null,`页数：${pages.length}`),
      React.createElement('span',null,`容量：${capacity}，已用：${used}`),
      warn ? React.createElement('span',{className:'error'},'页面过多，建议分批打印') : null
    );
  }


  function ConfigSummary({gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize}){
    const summary = [
      { label: '格子', value: gridType },
      { label: '颜色', value: gridColor },
      { label: '预设', value: stylePreset },
      { label: '尺寸', value: `${cols}×${rows}格` },
      { label: '格子大小', value: `${cellSize}px` },
      { label: '字体', value: `${fontSize}px` }
    ].filter(item => item.value).map(item =>
      React.createElement('span',{className:'badge bg-secondary me-1 mb-1'},
        `${item.label}: ${item.value}`
      )
    );
    return React.createElement('div',{className:'config-summary mt-2 p-2 bg-light rounded'},
      React.createElement('small',{className:'text-muted'},'当前配置：'),
      React.createElement('div',{className:'mt-1'},...summary)
    );
  }

  function App(){
    const [commonChars,setCommonChars]=useState([]);
    const [previewScale,setPreviewScale]=useState(1);
    const [stylePreset,setStylePreset]=useState('四线三格标准');
    const [autoLayout,setAutoLayout]=useState(true);
    const [gridStrokeWidth,setGridStrokeWidth]=useState(1);
    const [lineStyle,setLineStyle]=useState('实线'); // 实线/虚线/点线/点划线
    const [cellRadius,setCellRadius]=useState(0); // 格子圆角
    const [pageBg,setPageBg]=useState('白色'); // 页面背景
    const [cellBg,setCellBg]=useState('透明'); // 格子填充
    const [cellBorder,setCellBorder]=useState(false); // 格子边框
    const [textShadow,setTextShadow]=useState(false); // 文字阴影
    const [cellShadow,setCellShadow]=useState(false); // 立体效果（格子阴影）
    const [textStroke,setTextStroke]=useState('无'); // 文字描边
    const [feature,setFeature]=useState('字帖模板');
    const [difficulty,setDifficulty]=useState('初级');
    const [showGuide,setShowGuide]=useState(false);
    const [letterStyle,setLetterStyle]=useState('印刷体');
    const [enBlankRows,setEnBlankRows]=useState(0);
    const [enRepeat,setEnRepeat]=useState(1);
    const [engShowZh,setEngShowZh]=useState(false);
    const [alnumIncludeDigits,setAlnumIncludeDigits]=useState(true);
    const [alnumIncludeUpper,setAlnumIncludeUpper]=useState(true);
    const [alnumIncludeLower,setAlnumIncludeLower]=useState(true);
    const [alnumCount,setAlnumCount]=useState(20);
    const [alnumNoRepeat,setAlnumNoRepeat]=useState(true);
    const [alnumSeq,setAlnumSeq]=useState('');
    const [mode,setMode]=useState('多字');
    const [variant,setVariant]=useState('多字');
    const [layout,setLayout]=useState('连续排列');
    const [verticalLayout,setVerticalLayout]=useState(false);
    const [text,setText]=useState('');
    const [gridType,setGridType]=useState('田字格');
    const [gridColor,setGridColor]=useState('绿色');
    const [customGridColor,setCustomGridColor]=useState('');
    const [customTextColor,setCustomTextColor]=useState('');
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

    // Map config field → setter (used by loadTemplate / importConfig)
    const CONFIG_SETTERS = {
      gridType:setGridType, gridColor:setGridColor, customGridColor:setCustomGridColor,
      customTextColor:setCustomTextColor, textColorOpt:setTextColorOpt, strokeMode:setStrokeMode,
      stylePreset:setStylePreset, autoLayout:setAutoLayout, gridStrokeWidth:setGridStrokeWidth,
      lineStyle:setLineStyle, cellRadius:setCellRadius, pageBg:setPageBg, cellBg:setCellBg,
      cellBorder:setCellBorder, textStroke:setTextStroke, textShadow:setTextShadow,
      template:setTemplate, customFont:setCustomFont, rows:setRows, cols:setCols,
      cellSize:setCellSize, gridGap:setGridGap, fontSize:setFontSize,
      marginTop:setMarginTop, marginRight:setMarginRight, marginBottom:setMarginBottom,
      marginLeft:setMarginLeft, paper:setPaper
    };

    useEffect(()=>{ const saved=localStorage.getItem('copybook.settings'); if(saved){ try{ const s=JSON.parse(saved); Object.entries(s).forEach(([k,v])=>{ if(v!==undefined) switch(k){ case 'mode':setMode(v);break; case 'variant':setVariant(v);break; case 'layout':setLayout(v);break; case 'gridType':setGridType(v);break; case 'gridColor':setGridColor(v);break; case 'customGridColor':setCustomGridColor(v);break; case 'customTextColor':setCustomTextColor(v);break; case 'textColorOpt':setTextColorOpt(v);break; case 'strokeMode':setStrokeMode(v);break; case 'tailFill':setTailFill(v);break; case 'template':setTemplate(v);break; case 'customFont':setCustomFont(v);break; case 'rows':setRows(v);break; case 'cols':setCols(v);break; case 'cellSize':setCellSize(v);break; case 'gridGap':setGridGap(v);break; case 'fontSize':setFontSize(v);break; case 'marginTop':setMarginTop(v);break; case 'marginRight':setMarginRight(v);break; case 'marginBottom':setMarginBottom(v);break; case 'marginLeft':setMarginLeft(v);break; case 'paper':setPaper(v);break; case 'header':setHeader(v);break; case 'text':setText(v);break; case 'feature':setFeature(v);break; case 'difficulty':setDifficulty(v);break; case 'showGuide':setShowGuide(v);break; case 'letterStyle':setLetterStyle(v);break; case 'enBlankRows':setEnBlankRows(v);break; case 'enRepeat':setEnRepeat(v);break; case 'engShowZh':setEngShowZh(v);break; case 'previewScale':setPreviewScale(v);break; case 'stylePreset':setStylePreset(v);break; case 'autoLayout':setAutoLayout(v);break; case 'gridStrokeWidth':setGridStrokeWidth(v);break; case 'lineStyle':setLineStyle(v);break; case 'cellRadius':setCellRadius(v);break; case 'pageBg':setPageBg(v);break; case 'cellBg':setCellBg(v);break; case 'cellBorder':setCellBorder(v);break; case 'cellShadow':setCellShadow(v);break; case 'textShadow':setTextShadow(v);break; case 'textStroke':setTextStroke(v);break; case 'alnumIncludeDigits':setAlnumIncludeDigits(v);break; case 'alnumIncludeUpper':setAlnumIncludeUpper(v);break; case 'alnumIncludeLower':setAlnumIncludeLower(v);break; case 'alnumCount':setAlnumCount(v);break; case 'alnumNoRepeat':setAlnumNoRepeat(v);break; case 'alnumSeq':setAlnumSeq(v);break; } }); }catch(e){} } },[]);
    useEffect(()=>{ const s={ mode,variant,layout,gridType,gridColor,customGridColor,customTextColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale,feature,difficulty,showGuide,letterStyle,enBlankRows,enRepeat,engShowZh,stylePreset,autoLayout,gridStrokeWidth,lineStyle,cellRadius,pageBg,cellBg,cellBorder,cellShadow,textShadow,textStroke,alnumIncludeDigits,alnumIncludeUpper,alnumIncludeLower,alnumCount,alnumNoRepeat,alnumSeq }; localStorage.setItem('copybook.settings', JSON.stringify(s)); },[mode,variant,layout,gridType,gridColor,customGridColor,customTextColor,textColorOpt,strokeMode,tailFill,template,customFont,rows,cols,cellSize,gridGap,fontSize,marginTop,marginRight,marginBottom,marginLeft,paper,header,text,randCount,randNoRepeat,previewScale,feature,difficulty,showGuide,letterStyle,enBlankRows,enRepeat,engShowZh,stylePreset,autoLayout,gridStrokeWidth,lineStyle,cellRadius,pageBg,cellBg,cellBorder,cellShadow,textShadow,textStroke,alnumIncludeDigits,alnumIncludeUpper,alnumIncludeLower,alnumCount,alnumNoRepeat,alnumSeq]);

    useEffect(()=>{
      const emb=(window.__copybookData__||{}).commonChars;
      if(emb){ setCommonChars([...new Set(emb.filter(ch=>/[\u4e00-\u9fff]/.test(ch)))]); return; }
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
    const gColor=useMemo(()=>{ const custom = customGridColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customGridColor) ? customGridColor : null; return custom || toHex(gridColor); },[gridColor,customGridColor]);
    const tColor=useMemo(()=>{ const custom = customTextColor && /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(customTextColor) ? customTextColor : null; return custom || toHex(textColorOpt); },[textColorOpt,customTextColor]);
    const parsed=useMemo(()=>{ const cp=window.__copybook__||{}; if(feature==='控笔字帖'){ if(cp.features&&cp.features.buildControlPages) return cp.features.buildControlPages(difficulty); const basic=['一','丨','丿','丶','亅']; const mids=['氵','亻','讠','艹','月','女','口','木','火','土','日','目','田']; const adv=['永','德','善','爱','勇','强']; let pool=[]; if(difficulty==='初级') pool=basic; else if(difficulty==='中级') pool=mids; else pool=adv; const seq=[]; pool.forEach(c=>{ seq.push(c); seq.push(''); }); return { pages:[seq] }; } if(feature==='数字字母'){ const s=alnumSeq||''; return { pages:[Array.from(s)] }; } if(feature==='字帖模板'&&layout!=='连续排列'&&layout!=='竖排连续'&&cp.content&&cp.content.layoutDocument) return cp.content.layoutDocument(layout,text,cols,{ blankRows:enBlankRows, repeat:enRepeat }); if(layout==='竖排连续'||layout==='竖排古诗'||layout==='竖排文章'){ const isVertical=true; const effectiveRows=cols; const effectiveCols=rows; if(cp.content&&cp.content.layoutDocumentVertical) return cp.content.layoutDocumentVertical(layout,text,effectiveRows,{ blankRows:enBlankRows, repeat:enRepeat }); return (cp.content&&cp.content.toCells?cp.content.toCells(mode,text,variant):{}); } return (cp.content&&cp.content.toCells?cp.content.toCells(mode,text,variant):{}); },[feature,mode,text,variant,difficulty,alnumSeq,layout,cols,rows,enBlankRows,enRepeat]);
    const pages=useMemo(()=>{ const cp=window.__copybook__||{}; const paginateFn=cp.content&&cp.content.paginate||paginate; return paginateFn(parsed.pages,rows,cols,tailFill); },[parsed,rows,cols,tailFill]);
    const usage=useMemo(()=>{ const capacity=rows*cols*pages.length; let used=0; pages.forEach(pg=>pg.forEach(ch=>{ if(ch&&ch!=='\n') used++; })); const warn=pages.length>50; return { capacity, used, warn }; },[pages,rows,cols]);
    const bg=useMemo(()=>{ const cp=window.__copybook__||{}; return cp.grid?cp.grid.svgDataURL(gridType,cellSize,gColor,lineStyle):''; },[gridType,cellSize,gColor,lineStyle]);
    useEffect(()=>{ const sz=pageSize(paper); document.documentElement.style.setProperty('--page-width', sz.w); document.documentElement.style.setProperty('--page-height', sz.h); document.documentElement.style.setProperty('--cell-size', `${cellSize}px`); document.documentElement.style.setProperty('--grid-gap', `${gridGap}px`); document.documentElement.style.setProperty('--grid-color', gColor); document.documentElement.style.setProperty('--text-color', tColor); document.documentElement.style.setProperty('--font-size', `${fontSize}px`); document.documentElement.style.setProperty('--page-margin-top', `${marginTop}mm`); document.documentElement.style.setProperty('--page-margin-right', `${marginRight}mm`); document.documentElement.style.setProperty('--page-margin-bottom', `${marginBottom}mm`); document.documentElement.style.setProperty('--page-margin-left', `${marginLeft}mm`); document.documentElement.style.setProperty('--guide-color', gColor); document.documentElement.style.setProperty('--page-bg', toHex(pageBg)||'#fff'); document.documentElement.style.setProperty('--cell-bg', toHex(cellBg)||'transparent'); document.documentElement.style.setProperty('--cell-border-width', cellBorder?'2px':'0px'); document.documentElement.style.setProperty('--cell-shadow', cellShadow?'0 2px 4px rgba(0,0,0,0.1)':'none'); document.documentElement.style.setProperty('--text-stroke-width', textStroke==='无'?'0px':textStroke==='细'?'0.5px':textStroke==='中'?'1px':'2px'); document.documentElement.style.setProperty('--text-shadow', textShadow?'2px 2px 4px rgba(0,0,0,0.3)':'none'); },[paper,cellSize,gridGap,gColor,tColor,fontSize,marginTop,marginRight,marginBottom,marginLeft,pageBg,cellBg,cellBorder,cellShadow,textShadow,textStroke]);
    useEffect(()=>{ document.documentElement.style.setProperty('--grid-stroke-width', String(gridStrokeWidth)); document.documentElement.style.setProperty('--cell-radius', `${cellRadius}px`); },[gridStrokeWidth,cellRadius]);
    useEffect(()=>{ document.documentElement.style.setProperty('--en-descent', letterStyle==='手写体'?'0.286em':'0.238em'); },[letterStyle]);
    useEffect(()=>{ if(stylePreset==='四线三格标准'){ document.documentElement.style.setProperty('--fourline-y1','0.25'); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3','0.75'); document.documentElement.style.setProperty('--fourline-y4','0.92'); setGridType('四线三格'); } else if(stylePreset==='四线三格宽间'){ document.documentElement.style.setProperty('--fourline-y1','0.20'); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3','0.80'); document.documentElement.style.setProperty('--fourline-y4','0.95'); setGridType('四线三格'); } else if(stylePreset==='回宫格黄金'){ setGridType('回宫格黄金'); } else if(stylePreset==='拼音格标准'){ setGridType('拼音格'); } else if(stylePreset==='数字格标准'){ setGridType('数字格'); } else if(stylePreset==='竖排书法'){ setGridType('竖排米字格'); } else if(stylePreset==='田字格标准'){ setGridType('田字格'); } else if(stylePreset==='米字格标准'){ setGridType('米字格'); } else if(stylePreset==='米字格宽间'){ setGridType('米字格'); } else if(stylePreset==='回宫格标准'){ setGridType('回宫格'); } else if(stylePreset==='回宫格宽间'){ setGridType('回宫格'); } else if(stylePreset==='现代简约'){ setGridType('田字格'); document.documentElement.style.setProperty('--cell-radius','4px'); document.documentElement.style.setProperty('--grid-stroke-width','0.5'); } else if(stylePreset==='儿童卡通'){ setGridType('田字格'); document.documentElement.style.setProperty('--cell-radius','8px'); document.documentElement.style.setProperty('--grid-stroke-width','2'); } },[stylePreset]);
    useEffect(()=>{ if(autoLayout && gridType==='四线三格'){ const s=(text||''); const upp=(s.match(/[A-Z]/g)||[]).length; const low=(s.match(/[a-z]/g)||[]).length; const dig=(s.match(/[0-9]/g)||[]).length; const total=Math.max(1, upp+low+dig); const ru=upp/total, rl=low/total, rd=dig/total; let y1='0.23', y2='0.50', y3='0.77', y4='0.94'; if(ru>0.5){ y1='0.20'; y3='0.80'; y4='0.96'; } else if(rl>0.5){ y1='0.25'; y3='0.75'; y4='0.92'; } else if(rd>0.5){ y1='0.22'; y3='0.78'; y4='0.95'; } document.documentElement.style.setProperty('--fourline-y1', y1); document.documentElement.style.setProperty('--fourline-y2','0.50'); document.documentElement.style.setProperty('--fourline-y3', y3); document.documentElement.style.setProperty('--fourline-y4', y4); } },[autoLayout,gridType,text]);
    const font=fontByTemplate(template,customFont);
    const v= layout!=='连续排列' ? ((text&&text.trim())?{ok:true,msg:''}:{ok:false,msg:'请输入内容'}) : validate(mode,text);



    function resetConfig(){
      if(!confirm('确定要重置所有设置到默认值吗？')) return;
      localStorage.removeItem('copybook.settings');
      window.location.reload();
    }


    function saveTemplate(){
      const name = prompt('请输入模板名称：', '我的模板');
      if(!name) return;
      const config = { gridType, gridColor, customGridColor, customTextColor, textColorOpt, strokeMode, stylePreset, autoLayout, gridStrokeWidth, lineStyle, cellRadius, pageBg, cellBg, cellBorder, textStroke, textShadow, template, customFont, rows, cols, cellSize, gridGap, fontSize, marginTop, marginRight, marginBottom, marginLeft, paper };
      const payload = {
        name,
        createdAt: new Date().toISOString(),
        config,
        content: {
          mode, variant, layout, text
        }
      };

      const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${payload.name}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }

    function loadTemplate(e){
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const template = JSON.parse(event.target.result);
          const config = template.config || {};
          const content = template.content || {};
          
          // 应用配置
          Object.entries(config).forEach(([k,v]) => { if(v!==undefined&&CONFIG_SETTERS[k]) CONFIG_SETTERS[k](v); });
          
          // 应用内容
          if(content.mode) setMode(content.mode);
          if(content.variant) setVariant(content.variant);
          if(content.layout) setLayout(content.layout);
          if(content.text) setText(content.text);
          
          alert(`模板"${template.name || '未命名'}"加载成功！`);
        } catch(err) {
          alert('模板加载失败：' + err.message);
        }
      };
      reader.readAsText(file);
    }


    function exportConfig(){
      const config = {
        gridType, gridColor, customGridColor, customTextColor, textColorOpt,
        strokeMode, stylePreset, autoLayout, gridStrokeWidth, lineStyle,
        cellRadius, pageBg, cellBg, cellBorder, textStroke, textShadow,
        template, customFont, rows, cols, cellSize, gridGap, fontSize,
        marginTop, marginRight, marginBottom, marginLeft, paper
      };
      const blob = new Blob([JSON.stringify(config, null, 2)], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = '字帖配置.json';
      a.click();
      URL.revokeObjectURL(url);
    }

    function importConfig(e){
      const file = e.target.files[0];
      if(!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const config = JSON.parse(event.target.result);
          Object.entries(config).forEach(([k,v]) => { if(v!==undefined&&CONFIG_SETTERS[k]) CONFIG_SETTERS[k](v); });
          alert('配置导入成功！');
        } catch(err) {
          alert('配置导入失败：' + err.message);
        }
      };
      reader.readAsText(file);
    }

    function genAlnum(opts={}){
      const includeUpper = opts.includeUpper !== undefined ? opts.includeUpper : alnumIncludeUpper;
      const includeLower = opts.includeLower !== undefined ? opts.includeLower : alnumIncludeLower;
      const includeDigits = opts.includeDigits !== undefined ? opts.includeDigits : alnumIncludeDigits;
      const count = opts.count !== undefined ? opts.count : alnumCount;
      const noRepeat = opts.noRepeat !== undefined ? opts.noRepeat : alnumNoRepeat;
      let pool='';
      if(includeUpper) pool+='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      if(includeLower) pool+='abcdefghijklmnopqrstuvwxyz';
      if(includeDigits) pool+='0123456789';
      const arr=Array.from(pool);
      if(arr.length===0){ setAlnumSeq(''); return; }
      const n=Math.max(1,Math.min(count, noRepeat?arr.length:count));
      const out=[];
      if(noRepeat){
        const used=new Set();
        for(let i=0;i<n;i++){
          let idx;
          do{ const u=new Uint32Array(1); crypto.getRandomValues(u); idx=u[0]%arr.length; } while(used.has(idx));
          used.add(idx); out.push(arr[idx]);
        }
      } else {
        for(let i=0;i<n;i++){
          const u=new Uint32Array(1); crypto.getRandomValues(u); const idx=u[0]%arr.length; out.push(arr[idx]);
        }
      }
      setAlnumSeq(out.join(''));
    }
    const alnumStats=useMemo(()=>{ const s=alnumSeq||''; const up=(s.match(/[A-Z]/g)||[]).length; const low=(s.match(/[a-z]/g)||[]).length; const dig=(s.match(/[0-9]/g)||[]).length; const total=Math.max(1,s.length); return { up, low, dig, upPct:Math.round(up*100/total), lowPct:Math.round(low*100/total), digPct:Math.round(dig*100/total), total }; },[alnumSeq]);

    function exportPDF(){ const cp=window.__copybook__||{}; if(cp.exporting&&cp.exporting.exportPDF){ cp.exporting.exportPDF(paper); } else { const opt={ margin:0, filename:'字帖.pdf', image:{ type:'jpeg', quality:0.98 }, html2canvas:{ scale:4 }, jsPDF:{ unit:'mm', format: paper.indexOf('横版')>-1?'a4':'a4', orientation: paper.indexOf('横版')>-1?'landscape':'portrait' } }; const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).set(opt).save(); } }
    function exportImage(){ const cp=window.__copybook__||{}; if(cp.exporting&&cp.exporting.exportImage){ cp.exporting.exportImage(); } else { const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).toImg().save('字帖.png'); } }

    function exportSVG(){
      const node = document.querySelectorAll('.page');
      if(!node.length) return;
      
      // 创建SVG页面列表
      const svgPages = [];
      node.forEach((page, pageIndex) => {
        const grid = page.querySelector('.grid');
        if(!grid) return;
        
        const cells = grid.querySelectorAll('.cell');
        const rect = page.getBoundingClientRect();
        
        // 创建单页SVG
        let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${rect.width}" height="${rect.height}" viewBox="0 0 ${rect.width} ${rect.height}">`;
        svg += `<style>text { font-family: inherit; }</style>`;
        svg += `<rect width="100%" height="100%" fill="${getComputedStyle(page).backgroundColor || '#fff'}"/>`;
        
        cells.forEach((cell, i) => {
          const cellRect = cell.getBoundingClientRect();
          const x = cellRect.left - rect.left;
          const y = cellRect.top - rect.top;
          const w = cellRect.width;
          const h = cellRect.height;
          const text = cell.textContent || '';
          const bg = cell.style.backgroundImage || '';
          
          // 格子背景
          if(bg) {
            svg += `<image x="${x}" y="${y}" width="${w}" height="${h}" href="${bg}" />`;
          }
          
          // 文字
          if(text.trim()) {
            const style = cell.style;
            const fontSize = style.fontSize || '42px';
            const color = style.color || '#000';
            svg += `<text x="${x + w/2}" y="${y + h/2 + parseFloat(fontSize)/3}" text-anchor="middle" font-size="${fontSize}" fill="${color}">${text}</text>`;
          }
        });
        
        svg += '</svg>';
        svgPages.push(svg);
      });
      
      // 下载第一个页面
      if(svgPages.length > 0) {
        const blob = new Blob([svgPages[0]], {type: 'image/svg+xml'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = '字帖.svg';
        a.click();
        URL.revokeObjectURL(url);
      }
    }

    function fillRandom(overwrite){ const s=window.__copybook__.content.sampleRandom(commonChars,randCount,randNoRepeat); if(!s) return; if(overwrite){ setText(s); } else { setText(prev=> (prev||'')+s); } }
    function engFont(style){ return style==='手写体' ? "'Comic Sans MS','Chalkboard SE','Segoe Script',cursive" : "'Arial','Helvetica Neue','Helvetica',sans-serif"; }
    function insertFromLibrary(m,t,append,layoutKind){ if(layoutKind){ setLayout(layoutKind); if(layoutKind==='英文格式'){ setGridType('四线三格'); setCols(c=>Math.max(c,10)); } } setMode(m); setVariant(m); if(append){ setText(prev=>{ const p=(prev||'').trim(); if(!p) return t; const sep= layoutKind? '\n' : (m==='多句'?'|':''); return p+sep+t; }); } else { setText(t); } }

    const cp = window.__copybook__ || {};

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
                  React.createElement('label',{ className:'form-label', htmlFor:'layout' },'排版格式'),
                  React.createElement('select',{ id:'layout', className:'form-select', value:layout, onChange:e=>setLayout(e.target.value), 'aria-label':'排版格式' },
                    ['连续排列','竖排连续','古诗格式','竖排古诗','文章格式','竖排文章','英文格式'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  ),
                  layout==='古诗格式'?React.createElement('div',{ className:'form-text' },'无标点的短行（标题、作者）自动居中；诗句按标点分行居中。'):null,
                  layout==='文章格式'?React.createElement('div',{ className:'form-text' },'首行为标题（居中）；其余每行为一段，段首缩进两格；标点自动避头尾。'):null,
                  layout==='英文格式'?React.createElement('div',{ className:'form-text' },'按词换行（不拆词），词间一格；每个输入行另起一行，空行留空行。自动使用四线三格，建议 10 列以上。'):null
                ):null,
                layout==='英文格式'?React.createElement('div',{ className:'row g-2 mb-2' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'letterStyle' },'英文字体'),
                    React.createElement('select',{ id:'letterStyle', className:'form-select', value:letterStyle, onChange:e=>setLetterStyle(e.target.value) },
                      ['印刷体','手写体'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'enBlankRows' },'临摹空行'),
                    React.createElement('select',{ id:'enBlankRows', className:'form-select', value:enBlankRows, onChange:e=>setEnBlankRows(parseInt(e.target.value||'0')) },
                      [[0,'无'],[1,'1 行'],[2,'2 行']].map(([v,l])=>React.createElement('option',{ key:v, value:v },l))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'enRepeat' },'单词重复'),
                    React.createElement('input',{ id:'enRepeat', className:'form-control', type:'number', min:1, max:5, value:enRepeat, onChange:e=>setEnRepeat(Math.max(1,Math.min(5,parseInt(e.target.value||'1')))) })
                  )
                ):null,
                feature==='字帖模板'&&layout==='连续排列'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'mode' },'文本类型'),
                  React.createElement('select',{ id:'mode', className:'form-select', value:mode, onChange:e=>{ setMode(e.target.value); setVariant(e.target.value); }, 'aria-label':'文本类型' },
                    ['多字','多词','多句','文章'].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ):null,
                feature==='字帖模板'&&layout==='连续排列'?React.createElement('div',{ className:'mb-2' },
                  React.createElement('label',{ className:'form-label', htmlFor:'variant' },'变体'),
                  React.createElement('select',{ id:'variant', className:'form-select', value:variant, onChange:e=>setVariant(e.target.value) },
                    [ `${mode}`, `${mode}+1行`, `${mode}+1空行`, `${mode}+1行+1空行` ].map(v=>React.createElement('option',{ key:v, value:v },v))
                  )
                ):null,
                feature==='字帖模板'&&window.__copybook__.library?React.createElement(window.__copybook__.library.LibraryPanel,{ onInsert:insertFromLibrary, engShowZh:engShowZh, onEngShowZhChange:v=>setEngShowZh(v) }):null,
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
                      React.createElement('input',{ id:'alnumCount', className:'form-control', type:'number', min:1, value:alnumCount, onChange:e=>{ const n=parseInt(e.target.value||'20'); setAlnumCount(n); genAlnum({count:n}); } })
                    ),
                    React.createElement('div',{ className:'col-6 d-flex align-items-end' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumNoRepeat', checked:alnumNoRepeat, onChange:e=>{ const v=e.target.checked; setAlnumNoRepeat(v); genAlnum({noRepeat:v}); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumNoRepeat' },'不重复')
                      )
                    )
                  ),
                  React.createElement('div',{ className:'row g-2 mt-1' },
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumDigits', checked:alnumIncludeDigits, onChange:e=>{ const v=e.target.checked; setAlnumIncludeDigits(v); genAlnum({includeDigits:v}); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumDigits' },'包含数字')
                      )
                    ),
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumUpper', checked:alnumIncludeUpper, onChange:e=>{ const v=e.target.checked; setAlnumIncludeUpper(v); genAlnum({includeUpper:v}); } }),
                        React.createElement('label',{ className:'form-check-label', htmlFor:'alnumUpper' },'包含大写')
                      )
                    ),
                    React.createElement('div',{ className:'col-4' },
                      React.createElement('div',{ className:'form-check form-switch' },
                        React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'alnumLower', checked:alnumIncludeLower, onChange:e=>{ const v=e.target.checked; setAlnumIncludeLower(v); genAlnum({includeLower:v}); } }),
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
                  React.createElement('div',{ className:'col-5' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gridType' },'格子类型'),
                    React.createElement('select',{ id:'gridType', className:'form-select', value:gridType, onChange:e=>setGridType(e.target.value) },
                      ['田字格','米字格','回宫格','回宫格黄金','四线三格','拼音格','九宫格','十六宫格','作文格','椭圆米字格','圆形格','口字格','横线格','横线','田字格+斜','双田字格','竖线格','竖排田字格','竖排米字格','数字格','田格','方格','无格'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'gridColor' },'格子颜色'),
                    React.createElement('select',{ id:'gridColor', className:'form-select', value:gridColor, onChange:e=>setGridColor(e.target.value) },
                      ['绿色','黑色','红色','蓝色','紫色'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-3' },
                    React.createElement('label',{ className:'form-label', htmlFor:'customGridColor' },'自定义'),
                    React.createElement('input',{ id:'customGridColor', className:'form-control form-control-sm', type:'color', value:customGridColor||toHex(gridColor), onChange:e=>setCustomGridColor(e.target.value) })
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'lineStyle' },'线条样式'),
                    React.createElement('select',{ id:'lineStyle', className:'form-select form-select-sm', value:lineStyle, onChange:e=>setLineStyle(e.target.value) },
                      ['实线','虚线','点线','点划线'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'cellRadius' },'格子圆角'),
                    React.createElement('input',{ id:'cellRadius', className:'form-range form-range-sm', type:'range', min:'0', max:'10', step:'1', value:cellRadius, onChange:e=>setCellRadius(parseInt(e.target.value||'0')) })
                  ),
                  React.createElement('div',{ className:'col-4 d-flex align-items-end' },
                    React.createElement('div',{ className:'form-check' },
                      React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'cellBorder', checked:cellBorder, onChange:e=>setCellBorder(e.target.checked) }),
                      React.createElement('label',{ className:'form-check-label', htmlFor:'cellBorder' },'加边框')
                    )
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'stylePreset' },'打印样式'),
                    React.createElement('select',{ id:'stylePreset', className:'form-select', value:stylePreset, onChange:e=>setStylePreset(e.target.value) },
                      ['四线三格标准','四线三格宽间','回宫格黄金','拼音格标准','数字格标准','竖排书法','田字格标准','米字格标准','米字格宽间','回宫格标准','回宫格宽间','现代简约','儿童卡通'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-6' },
                    React.createElement('label',{ className:'form-label', htmlFor:'strokeWidth' },'线条粗细'),
                    React.createElement('input',{ id:'strokeWidth', className:'form-range', type:'range', min:'0.5', max:'3', step:'0.5', value:gridStrokeWidth, onChange:e=>setGridStrokeWidth(parseFloat(e.target.value||'1')) })
                  )
                ),
                React.createElement('div',{ className:'form-check mt-1' },
                  React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'autoLayout', checked:autoLayout, onChange:e=>setAutoLayout(e.target.checked) }),
                  React.createElement('label',{ className:'form-check-label', htmlFor:'autoLayout' },'智能排版（四线三格）'),
                  React.createElement('div',{ className:'form-check mt-1' },
                    React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'verticalLayout', checked:verticalLayout, onChange:e=>setVerticalLayout(e.target.checked) }),
                    React.createElement('label',{ className:'form-check-label', htmlFor:'verticalLayout' },'竖排模式（从上到下，从右到左）')
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'textColor' },'文字颜色'),
                    React.createElement('select',{ id:'textColor', className:'form-select', value:textColorOpt, onChange:e=>setTextColorOpt(e.target.value) },
                      ['绿色','黑色','红色','蓝色','紫色'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'customTextColor' },'自定义'),
                    React.createElement('input',{ id:'customTextColor', className:'form-control form-control-sm', type:'color', value:customTextColor||toHex(textColorOpt), onChange:e=>setCustomTextColor(e.target.value) })
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'stroke' },'描红背景'),
                    React.createElement('select',{ id:'stroke', className:'form-select', value:strokeMode, onChange:e=>setStrokeMode(e.target.value) },
                      ['非常深','深','较深','略浅','适中','非常浅','白色（不可见）','空芯'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  )
                ),
                React.createElement('div',{ className:'row g-2 mt-1' },
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'textStroke' },'文字描边'),
                    React.createElement('select',{ id:'textStroke', className:'form-select form-select-sm', value:textStroke, onChange:e=>setTextStroke(e.target.value) },
                      ['无','细','中','粗'].map(v=>React.createElement('option',{ key:v, value:v },v))
                    )
                  ),
                  React.createElement('div',{ className:'col-4' },
                    React.createElement('label',{ className:'form-label', htmlFor:'textShadow' },'文字阴影'),
                    React.createElement('div',{ className:'form-check form-switch' },
                      React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'textShadow', checked:textShadow, onChange:e=>setTextShadow(e.target.checked) }),
                      React.createElement('label',{ className:'form-check-label', htmlFor:'textShadow' }, textShadow?'开启':'关闭')
                    )
                  ),
                  React.createElement('div',{ className:'col-4 d-flex align-items-end' },
                    React.createElement('div',{ className:'form-check' },
                      React.createElement('input',{ className:'form-check-input', type:'checkbox', id:'cellShadow', checked:cellShadow||false, onChange:e=>{ setCellShadow(e.target.checked); if(e.target.checked) setCellBorder(true); } }),
                      React.createElement('label',{ className:'form-check-label', htmlFor:'cellShadow' },'立体效果')
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
                React.createElement('div',{ className:'mt-3 d-flex flex-wrap gap-2' },
                  React.createElement('div',{ className:'btn-group' },
                    React.createElement('button',{ className:'btn btn-success', onClick:()=>window.print(), disabled:pages.length===0 },'打印/另存为PDF'),
                    React.createElement('button',{ className:'btn btn-primary', onClick:exportPDF, disabled:pages.length===0 },'生成高清PDF'),
                    React.createElement('button',{ className:'btn btn-outline-primary', onClick:exportImage, disabled:pages.length===0 },'导出PNG')
                  ),
                  React.createElement('div',{ className:'btn-group' },
                    React.createElement('button',{ className:'btn btn-outline-secondary', onClick:exportConfig },'导出配置'),
                    React.createElement('button',{ className:'btn btn-outline-secondary' },
                      React.createElement('input',{ type:'file', accept:'.json', style:{position:'absolute',opacity:0,width:'100%',height:'100%',cursor:'pointer'}, onChange:importConfig }),
                      '导入配置'
                    ),
                    React.createElement('button',{ className:'btn btn-outline-danger', onClick:resetConfig },'重置')
                  ),
                  React.createElement('div',{ className:'btn-group' },
                    React.createElement('button',{ className:'btn btn-info', onClick:saveTemplate },'保存模板'),
                    React.createElement('button',{ className:'btn btn-info' },
                      React.createElement('input',{ type:'file', accept:'.json', style:{position:'absolute',opacity:0,width:'100%',height:'100%',cursor:'pointer'}, onChange:loadTemplate }),
                      '加载模板'
                    )
                  ),
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
                React.createElement(ConfigSummary,{ gridType, gridColor, stylePreset, rows, cols, cellSize, fontSize }),
                
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
          React.createElement('div',{ className:'grid' },
            (layout.startsWith('竖排')?((cp.content&&cp.content.splitRowsVertical)?cp.content.splitRowsVertical(page,cols):splitRows?splitRows(page,cols):[page]):(cp.content&&cp.content.splitRows?cp.content.splitRows(page,cols):(splitRows?splitRows(page,cols):[page]))).map((row,ri)=>React.createElement('div',{
                key:ri,
                className:'grid-row'+(layout.startsWith('竖排')?' vertical-row':''),
                style:{ display:'grid', gridTemplateColumns:`repeat(${cols}, var(--cell-size))`, gap: (layout==='英文格式'||layout.startsWith('竖排'))?0:`var(--grid-gap)`, writingMode: layout.startsWith('竖排')?'vertical-rl':'horizontal-tb', textOrientation: layout.startsWith('竖排')?'upright':'mixed' }
              },
              row.map((ch,ci)=>React.createElement(Cell,{ key:ci, ch:ch||'', bg:bg, textColor:tColor, strokeMode, cls: (layout==='英文格式'||feature==='数字字母')?'cell-en':undefined, font: layout==='英文格式'?engFont(letterStyle):feature==='数字字母'?(letterStyle==='印刷体'?'monospace':'cursive'):font, fontSize, showGuide: feature==='数字字母' && showGuide }))
            ))
          )
        ))
      )
    );
  }

  window.__copybook__ = window.__copybook__ || {};
  window.__copybook__.Section = Section;
  window.__copybook__.PreviewStatus = PreviewStatus;
  ReactDOM.createRoot(document.getElementById('root')).render(React.createElement(App));
})();
