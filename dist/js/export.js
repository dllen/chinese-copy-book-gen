(function(){
  var w=window; w.__copybook__=w.__copybook__||{};
  function exportPDF(paper){ const opt={ margin:0, filename:'字帖.pdf', image:{ type:'jpeg', quality:0.98 }, html2canvas:{ scale:4 }, jsPDF:{ unit:'mm', format: String(paper||'').indexOf('横版')>-1?'a4':'a4', orientation: String(paper||'').indexOf('横版')>-1?'landscape':'portrait' } }; const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).set(opt).save(); }
  function exportImage(){ const node=document.querySelectorAll('.page'); const container=document.createElement('div'); node.forEach(n=>container.appendChild(n.cloneNode(true))); html2pdf().from(container).toImg().save('字帖.png'); }
  w.__copybook__.exporting={ exportPDF, exportImage };
})();
