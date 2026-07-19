(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  const { useState, useEffect, useMemo } = React;

  const GRADES=['一年级上册','一年级下册','二年级上册','二年级下册','三年级上册','三年级下册','四年级上册','四年级下册','五年级上册','五年级下册','六年级上册','六年级下册'];

  // ---------- 数据加载与搜索 ----------
  const store={ poems:null, texts:null, loading:false, error:'' };
  const listeners=new Set();
  function notify(){ listeners.forEach(fn=>fn()); }
  function load(){
    if(store.poems||store.loading) return;
    // 优先读取预置数据（<script> 标签加载，file:// 双击打开也可用）
    const emb=w.__copybookData__||{};
    if(emb.poems&&emb.texts){ store.poems=emb.poems; store.texts=emb.texts; notify(); return; }
    // 兜底：fetch 加载（需本地服务器）
    store.loading=true; store.error='';
    Promise.all([
      fetch('./data/poems-tang300.json').then(r=>{ if(!r.ok) throw new Error('poems '+r.status); return r.json(); }),
      fetch('./data/texts-xiaoxue.json').then(r=>{ if(!r.ok) throw new Error('texts '+r.status); return r.json(); })
    ]).then(([poems,texts])=>{
      store.poems=poems||[]; store.texts=texts||[]; store.loading=false; notify();
    }).catch(e=>{
      store.error='数据加载失败'; store.loading=false; notify();
    });
  }
  function useStore(){
    const [,setTick]=useState(0);
    useEffect(()=>{ const fn=()=>setTick(t=>t+1); listeners.add(fn); load(); return ()=>listeners.delete(fn); },[]);
    return store;
  }
  function searchPoems(q){
    const arr=store.poems||[]; const s=(q||'').trim();
    if(!s) return arr;
    return arr.filter(p=> p.title.includes(s) || (p.author||'').includes(s) || p.lines.some(l=>l.includes(s)) || (p.tags||[]).some(t=>t.includes(s)));
  }
  function searchTexts(q,grade){
    const arr=store.texts||[]; const s=(q||'').trim();
    return arr.filter(t=> (grade==='全部'||t.grade===grade) && (!s || t.title.includes(s) || t.paragraphs.some(p=>p.includes(s))) );
  }

  // ---------- UI 组件 ----------
  function snippet(str,n){ str=(str||'').replace(/\s+/g,''); return str.length>n?str.slice(0,n)+'…':str; }

  // props: onInsert(mode, text, append)
  function LibraryPanel(props){
    const st=useStore();
    const [open,setOpen]=useState(false);
    const [tab,setTab]=useState('poem');           // poem | text
    const [query,setQuery]=useState('');
    const [grade,setGrade]=useState('全部');
    const [sel,setSel]=useState(null);             // 选中的条目
    const [checked,setChecked]=useState([]);       // 课文段落勾选
    const [includeTitle,setIncludeTitle]=useState(true);

    const poemResults=useMemo(()=>searchPoems(query).slice(0,100),[query,st.poems]);
    const textResults=useMemo(()=>searchTexts(query,grade).slice(0,100),[query,grade,st.texts]);
    const results= tab==='poem'?poemResults:textResults;

    function pick(item){
      setSel(item);
      if(tab==='text') setChecked(item.paragraphs.map(()=>true));
    }
    function buildText(){
      if(!sel) return null;
      if(tab==='poem'){
        const head=[];
        if(includeTitle){ head.push(sel.title); if(sel.author) head.push(sel.author); }
        return { mode:'多句', layout:'古诗格式', text: head.concat(sel.lines).join('\n') };
      }
      const paras=sel.paragraphs.filter((_,i)=>checked[i]);
      if(paras.length===0) return null;
      const head= includeTitle ? [sel.title] : [];
      return { mode:'多句', layout:'文章格式', text: head.concat(paras).join('\n') };
    }
    function insert(append){
      const r=buildText(); if(!r) return;
      props.onInsert(r.mode, r.text, append, r.layout);
    }

    const E=React.createElement;
    return E('div',{className:'mb-2 border rounded'},
      E('div',{className:'p-2 d-flex justify-content-between align-items-center'},
        E('div',{className:'fw-semibold'},'📚 唐诗三百首 / 小学语文课文'),
        E('button',{className:'btn btn-sm btn-outline-secondary',type:'button',onClick:()=>setOpen(v=>!v),'aria-expanded':String(open)}, open?'收起':'展开')
      ),
      open?E('div',{className:'p-2 pt-0'},
        E('div',{className:'btn-group btn-group-sm mb-2',role:'group'},
          E('button',{type:'button',className:'btn '+(tab==='poem'?'btn-primary':'btn-outline-primary'),onClick:()=>{setTab('poem');setSel(null);}},`唐诗三百首（${(st.poems||[]).length}）`),
          E('button',{type:'button',className:'btn '+(tab==='text'?'btn-primary':'btn-outline-primary'),onClick:()=>{setTab('text');setSel(null);}},`小学语文课文（${(st.texts||[]).length}）`)
        ),
        E('div',{className:'row g-2 mb-2'},
          E('div',{className: tab==='text'?'col-8':'col-12'},
            E('input',{className:'form-control form-control-sm',placeholder: tab==='poem'?'搜索：标题 / 作者 / 诗句，如「李白」「明月」':'搜索：标题 / 内容，如「燕子」「春天」',value:query,onChange:e=>setQuery(e.target.value),'aria-label':'搜索诗库课文'})
          ),
          tab==='text'?E('div',{className:'col-4'},
            E('select',{className:'form-select form-select-sm',value:grade,onChange:e=>{setGrade(e.target.value);setSel(null);},'aria-label':'年级筛选'},
              ['全部'].concat(GRADES).map(g=>E('option',{key:g,value:g},g))
            )
          ):null
        ),
        st.error?E('div',{className:'error small mb-1'},st.error):null,
        (!st.poems&&!st.error)?E('div',{className:'legend mb-1'},'数据加载中…'):null,
        E('div',{className:'list-group',style:{maxHeight:'200px',overflowY:'auto'}},
          results.length===0&&st.poems?E('div',{className:'list-group-item legend'},'无匹配结果'):null,
          results.map(item=>E('button',{
              key:item.id, type:'button',
              className:'list-group-item list-group-item-action py-1 px-2'+(sel&&sel.id===item.id?' active':''),
              onClick:()=>pick(item)
            },
            E('div',{className:'d-flex justify-content-between align-items-center'},
              E('span',{className:'fw-semibold'}, item.title),
              E('small',null, tab==='poem'?item.author:item.grade)
            ),
            E('small',{className: sel&&sel.id===item.id?'':'text-muted'},
              snippet(tab==='poem'?item.lines.join(''):item.paragraphs.join(''), 34))
          ))
        ),
        sel?E('div',{className:'mt-2 p-2 border rounded bg-light'},
          E('div',{className:'fw-semibold mb-1'}, sel.title, E('small',{className:'text-muted ms-2'}, tab==='poem'?sel.author:sel.grade)),
          tab==='poem'?E('div',{className:'small text-muted mb-1',style:{maxHeight:'90px',overflowY:'auto'}}, sel.lines.map((l,i)=>E('div',{key:i},l)))
          :E('div',null,
            E('div',{className:'mb-1'},
              E('button',{className:'btn btn-sm btn-link p-0 me-2',type:'button',onClick:()=>setChecked(checked.map(()=>true))},'全选'),
              E('button',{className:'btn btn-sm btn-link p-0',type:'button',onClick:()=>setChecked(checked.map(()=>false))},'清空'),
              E('span',{className:'legend ms-1'},`勾选要写入字帖的段落（${checked.filter(Boolean).length}/${sel.paragraphs.length}）`)
            ),
            E('div',{style:{maxHeight:'140px',overflowY:'auto'}},
              sel.paragraphs.map((p,i)=>E('div',{className:'form-check form-check-sm',key:i},
                E('input',{className:'form-check-input',type:'checkbox',id:'libP'+i,checked:!!checked[i],onChange:e=>setChecked(c=>c.map((v,j)=>j===i?e.target.checked:v))}),
                E('label',{className:'form-check-label small',htmlFor:'libP'+i},snippet(p,50))
              ))
            )
          ),
          E('div',{className:'form-check form-check-sm mt-1'},
            E('input',{className:'form-check-input',type:'checkbox',id:'libIncTitle',checked:includeTitle,onChange:e=>setIncludeTitle(e.target.checked)}),
            E('label',{className:'form-check-label',htmlFor:'libIncTitle'},tab==='poem'?'包含标题和作者（居中）':'包含标题（居中）')
          ),
          E('div',{className:'mt-2 d-flex gap-2 flex-wrap'},
            E('button',{className:'btn btn-sm btn-success',type:'button',onClick:()=>insert(false)},'覆盖到字帖'),
            E('button',{className:'btn btn-sm btn-outline-success',type:'button',onClick:()=>insert(true)},'追加到字帖（新起一页）')
          )
        ):null
      ):null
    );
  }

  w.__copybook__.library={ load, searchPoems, searchTexts, GRADES, LibraryPanel };
})();
