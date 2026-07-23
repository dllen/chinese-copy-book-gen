(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  const dashMap={'实线':'','虚线':` stroke-dasharray='5,2'`,'点线':` stroke-dasharray='1,4'`,'点划线':` stroke-dasharray='5,2,1,2'`};
  function svgDataURL(type,size,color,lineStyle){
    const s=size,c=color;
    if(type==='无格') return '';
    const rootCS = getComputedStyle(document.documentElement);
    const wv=parseFloat(rootCS.getPropertyValue('--grid-stroke-width')||'1');
    const dash = dashMap[lineStyle] || '';
    const thinDash = ` stroke-dasharray='2,2'`;
    
    // 田字格
    if(type==='田字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 米字格
    if(type==='米字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 回宫格
    if(type==='回宫格'){
      const inner=Math.round(s*0.6),offset=(s-inner)/2;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<rect x='${offset}' y='${offset}' width='${inner}' height='${inner}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 回宫格黄金比例（0.618）
    if(type==='回宫格黄金'){
      const inner=Math.round(s*0.618);
      const offset=Math.round((s-inner)/2);
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<rect x='${offset}' y='${offset}' width='${inner}' height='${inner}' fill='none' stroke='${c}' stroke-width='${wv}' stroke-dasharray='5,3'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 四线三格
    if(type==='四线三格'){
      const y1=Math.round(s*parseFloat(rootCS.getPropertyValue('--fourline-y1')||'0.20'));
      const y2=Math.round(s*parseFloat(rootCS.getPropertyValue('--fourline-y2')||'0.47'));
      const y3=Math.round(s*parseFloat(rootCS.getPropertyValue('--fourline-y3')||'0.74'));
      const y4=Math.round(s*parseFloat(rootCS.getPropertyValue('--fourline-y4')||'0.94'));
      const don=rootCS.getPropertyValue('--fourline-dash-on')||'5';
      const doff=rootCS.getPropertyValue('--fourline-dash-off')||'2';
      const defaultDash=` stroke-dasharray='${don.trim()},${doff.trim()}'`;
      const fourDash = lineStyle && lineStyle !== '实线' ? (dashMap[lineStyle] || defaultDash) : defaultDash;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<line x1='0' y1='${y1}' x2='${s}' y2='${y1}' stroke='${c}' stroke-width='${wv}'${fourDash}/>`+
        `<line x1='0' y1='${y2}' x2='${s}' y2='${y2}' stroke='${c}' stroke-width='${wv}'${fourDash}/>`+
        `<line x1='0' y1='${y3}' x2='${s}' y2='${y3}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='0' y1='${y4}' x2='${s}' y2='${y4}' stroke='${c}' stroke-width='${wv}'${fourDash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 拼音格（改进版四线三格，适合拼音练习）
    if(type==='拼音格'){
      const y1=Math.round(s*0.20);
      const y2=Math.round(s*0.45);
      const y3=Math.round(s*0.70);
      const y4=Math.round(s*0.95);
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<line x1='0' y1='${y1}' x2='${s}' y2='${y1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `<line x1='0' y1='${y2}' x2='${s}' y2='${y2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='0' y1='${y3}' x2='${s}' y2='${y3}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `<line x1='0' y1='${y4}' x2='${s}' y2='${y4}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 方格
    if(type==='方格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 横线格（带中线的横线格）
    if(type==='横线格'){
      const mid=Math.round(s*0.5),top=Math.round(s*0.15),bot=Math.round(s*0.85);
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<line x1='0' y1='${top}' x2='${s}' y2='${top}' stroke='${c}' stroke-width='${wv}'${thinDash}/>`+
        `<line x1='0' y1='${mid}' x2='${s}' y2='${mid}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='0' y1='${bot}' x2='${s}' y2='${bot}' stroke='${c}' stroke-width='${wv}'${thinDash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 横线（单线）
    if(type==='横线'){
      const mid=Math.round(s*0.5);
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<line x1='0' y1='${mid}' x2='${s}' y2='${mid}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 九宫格
    if(type==='九宫格'){
      const t=s/3;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${t}' y1='1' x2='${t}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${t*2}' y1='1' x2='${t*2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${t}' x2='${s-1}' y2='${t}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${t*2}' x2='${s-1}' y2='${t*2}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 十六宫格
    if(type==='十六宫格'){
      const t=s/4;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${t}' y1='1' x2='${t}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${t*2}' y1='1' x2='${t*2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${t*3}' y1='1' x2='${t*3}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${t}' x2='${s-1}' y2='${t}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${t*2}' x2='${s-1}' y2='${t*2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${t*3}' x2='${s-1}' y2='${t*3}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 作文格（田字格+横线）
    if(type==='作文格'){
      const mid=s/2,third=s/3;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${mid}' y1='1' x2='${mid}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${mid}' x2='${s-1}' y2='${mid}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${third}' x2='${s-1}' y2='${third}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `<line x1='1' y1='${third*2}' x2='${s-1}' y2='${third*2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 椭圆米字格
    if(type==='椭圆米字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<ellipse cx='${s/2}' cy='${s/2}' rx='${s/2-1}' ry='${s/2-1}' fill='none' stroke='${c}' stroke-width='${wv}' stroke-dasharray='5,3'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 圆形格
    if(type==='圆形格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<circle cx='${s/2}' cy='${s/2}' r='${s/2-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='3,3'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 口字格
    if(type==='口字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 田字格+斜线
    if(type==='田字格+斜'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 双田字格
    if(type==='双田字格'){
      const h=s/2;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${h}' x2='${s-1}' y2='${h}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${h}' y1='1' x2='${h}' y2='${h}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${h}' y1='${h}' x2='${s-1}' y2='${h}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${h}' y1='1' x2='${h}' y2='${h}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${h/2}' y1='1' x2='${h/2}' y2='${h}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `<line x1='1' y1='${h/2}' x2='${h}' y2='${h/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `<line x1='${h+h/2}' y1='${h}' x2='${h+h/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `<line x1='${h+1}' y1='${h+h/2}' x2='${s-1}' y2='${h+h/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 竖线格（竖排书法用）
    if(type==='竖线格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<line x1='0' y1='0' x2='0' y2='${s}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s}' y1='0' x2='${s}' y2='${s}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 竖排田字格
    if(type==='竖排田字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 竖排米字格
    if(type==='竖排米字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${wv}'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 数字格（带中心虚线分隔，适合数字练习）
    if(type==='数字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    // 田格（简化田字格，仅外框和中心虚线）
    if(type==='田格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}' stroke-dasharray='2,2'/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    return '';
  }
  // 扩展格子类型列表（供UI下拉菜单使用）
  w.__copybook__.gridTypes=[
    '田字格','米字格','回宫格','回宫格黄金','四线三格','拼音格',
    '九宫格','十六宫格','作文格','椭圆米字格','圆形格','口字格',
    '横线格','横线','田字格+斜','双田字格',
    '竖线格','竖排田字格','竖排米字格',
    '数字格','田格','方格','无格'
  ];
  w.__copybook__.grid={ svgDataURL };
})();
