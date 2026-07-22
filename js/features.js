(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  function buildControlPages(difficulty){ const basic=['一','丨','丿','丶','亅']; const mids=['氵','亻','讠','艹','月','女','口','木','火','土','日','目','田']; const adv=['永','德','善','爱','勇','强']; let pool=[]; if(difficulty==='初级') pool=basic; else if(difficulty==='中级') pool=mids; else pool=adv; const seq=[]; pool.forEach(c=>{ seq.push(c); seq.push(''); }); return { pages:[seq] }; }
  function buildAlnumPages(text){ const s=(text||'').replace(/[^0-9a-zA-Z]/g,''); const arr=Array.from(s); return { pages:[arr] }; }
  w.__copybook__.features={ buildControlPages, buildAlnumPages };
})();