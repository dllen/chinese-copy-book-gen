(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  const dashMap={'实线':'','虚线':` stroke-dasharray='5,2'`,'点线':` stroke-dasharray='1,4'`,'点划线':` stroke-dasharray='5,2,1,2'`};
  function svgDataURL(type,size,color,lineStyle){
    const s=size,c=color;
    if(type==='无格') return '';
    const rootCS = getComputedStyle(document.documentElement);
    const wv=parseFloat(rootCS.getPropertyValue('--grid-stroke-width')||'1');
    const dash = dashMap[lineStyle] || '';
    if(type==='田字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    if(type==='米字格'){
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='1' y1='1' x2='${s-1}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='${s-1}' y1='1' x2='1' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
    if(type==='回宫格'){
      const inner=Math.round(s*0.6),offset=(s-inner)/2;
      const svg=`<svg xmlns='http://www.w3.org/2000/svg' width='${s}' height='${s}' shape-rendering='crispEdges'>`+
        `<rect x='0.5' y='0.5' width='${s-1}' height='${s-1}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<rect x='${offset}' y='${offset}' width='${inner}' height='${inner}' fill='none' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='${s/2}' y1='1' x2='${s/2}' y2='${s-1}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `<line x1='1' y1='${s/2}' x2='${s-1}' y2='${s/2}' stroke='${c}' stroke-width='${wv}'${dash}/>`+
        `</svg>`;
      return `url("data:image/svg+xml;utf8,${encodeURIComponent(svg)}")`;
    }
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
    return '';
  }
  w.__copybook__.grid={ svgDataURL };
})();
