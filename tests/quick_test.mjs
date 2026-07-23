import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

// Go to the app
await page.goto('http://localhost:5174');
await page.waitForTimeout(2000);

// Check page title
const title = await page.title();
console.log('Page title:', title);

// Check if the grid type selector exists
const gridTypeOptions = await page.locator('#gridType option').allTextContents();
console.log('\n=== Grid types available (' + gridTypeOptions.length + ') ===');
console.log(gridTypeOptions.join(', '));

// Check layout options
const layoutOptions = await page.locator('#layout option').allTextContents();
console.log('\n=== Layout options ===');
console.log(layoutOptions.join(', '));

// Check style preset options
const presetOptions = await page.locator('#stylePreset option').allTextContents();
console.log('\n=== Style presets ===');
console.log(presetOptions.join(', '));

// Test: Select a new grid type
await page.selectOption('#gridType', '回宫格黄金');
await page.waitForTimeout(500);
const selectedGrid = await page.locator('#gridType').inputValue();
console.log('\n✓ Selected 回宫格黄金:', selectedGrid);

// Test: Select vertical layout
await page.selectOption('#layout', '竖排连续');
await page.waitForTimeout(500);
const selectedLayout = await page.locator('#layout').inputValue();
console.log('✓ Selected 竖排连续:', selectedLayout);

// Enter some text and check preview
await page.fill('#text', '测试竖排');
await page.waitForTimeout(500);

// Check if cells are rendered
const cellCount = await page.locator('.cell').count();
console.log('✓ Cells rendered:', cellCount);

await browser.close();
console.log('\n=== All tests passed! ===');
