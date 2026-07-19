// 英文格式截图验证。用法：node tools/shot_english.js [out-prefix]
// 需要本机可用的 playwright。
// playwright 路径从 tools/.playwrightrc.js 读取，需自行创建并配置 localPlaywright 路径。
const path = require('path');
const fs = require('fs');

let playwright;
try { playwright = require('playwright'); }
catch (e) {
  // 从本地配置文件读取 playwright 路径
  const rcPath = path.resolve(__dirname, '.playwrightrc.js');
  let localPlaywright = null;
  if (fs.existsSync(rcPath)) {
    const rc = require(rcPath);
    localPlaywright = rc.localPlaywright;
  }
  if (!localPlaywright) {
    // 回退到常见路径
    localPlaywright = '/Users/shichaopeng/.local/lib/node_modules/@ks-tool/ks-cli/node_modules/playwright';
  }
  playwright = require(localPlaywright);
}
const { chromium } = playwright;

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1400, height: 1100 } });
  await page.goto('file://' + path.resolve(__dirname, '../index.html'));
  await page.evaluate(() => {
    localStorage.setItem('copybook.settings', JSON.stringify({
      layout: '英文格式', text: 'Bgypq fox\nMy name’s Zip.\napple 苹果',
      gridType: '四线三格', gridColor: '绿色', cols: 12, rows: 10, cellSize: 60,
      fontSize: 42, gridGap: 8, letterStyle: '印刷体', enBlankRows: 1, enRepeat: 1,
      feature: '字帖模板', mode: '多句', stylePreset: '四线三格标准', autoLayout: false
    }));
  });
  await page.reload();
  await page.waitForTimeout(1000);
  await page.locator('.page').first().screenshot({ path: '/tmp/en-print.png' });
  await page.selectOption('#letterStyle', '手写体');
  await page.waitForTimeout(500);
  await page.locator('.page').first().screenshot({ path: '/tmp/en-hand.png' });
  // 中文回归
  await page.evaluate(() => {
    const s = JSON.parse(localStorage.getItem('copybook.settings'));
    s.layout = '古诗格式'; s.text = '静夜思\n李白\n床前明月光，疑是地上霜。\n举头望明月，低头思故乡。';
    s.gridType = '田字格'; s.enBlankRows = 0;
    localStorage.setItem('copybook.settings', JSON.stringify(s));
  });
  await page.reload();
  await page.waitForTimeout(800);
  await page.locator('.page').first().screenshot({ path: '/tmp/zh-poem.png' });
  await browser.close();
  console.log('done: /tmp/en-print.png /tmp/en-hand.png /tmp/zh-poem.png');
})();
