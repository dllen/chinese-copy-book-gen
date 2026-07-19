// 验证脚本 - 检查所有关键功能是否正确定义

(function() {
  const checks = [];
  
  // 检查函数存在性
  const requiredFunctions = [
    'svgDataURL', 'splitInput', 'toCells', 'paginate',
    'pageSize', 'validate', 'Cell', 'Section', 'PreviewStatus',
    'toHex', 'strokeLevel', 'fontByTemplate', 'ConfigSummary'
  ];
  
  requiredFunctions.forEach(fn => {
    const exists = typeof window[fn] !== 'undefined' || eval(`typeof ${fn}`) !== 'undefined';
    checks.push({ name: `函数 ${fn}`, status: exists ? '✓' : '✗' });
  });
  
  // 检查__copybook__对象
  const cp = window.__copybook__ || {};
  checks.push({ name: '__copybook__ 对象', status: cp ? '✓' : '✗' });
  
  // 检查模块
  checks.push({ name: 'grid.svgDataURL', status: cp.grid?.svgDataURL ? '✓' : '✗' });
  checks.push({ name: 'content.*', status: cp.content ? '✓' : '✗' });
  checks.push({ name: 'features.*', status: cp.features ? '✓' : '✗' });
  checks.push({ name: 'exporting.*', status: cp.exporting ? '✓' : '✗' });
  
  // 打印结果
  console.log('\n=== 字帖生成器验证 ===\n');
  checks.forEach(check => {
    console.log(`${check.status} ${check.name}`);
  });
  
  const passed = checks.filter(c => c.status === '✓').length;
  console.log(`\n总计: ${passed}/${checks.length} 项通过\n`);
  
  return passed === checks.length;
})();
