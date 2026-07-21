# 字帖生成器产品化设计规格

> **日期**: 2026-07-21
> **目标用户**: 家长/个人用户（直接给孩子打印字帖用）
> **发布策略**: 先网站后小程序扩展
> **商业模式**: 免费 + 付费解锁（高级字体包/专属内容库）
> **运营模式**: 个人维护，GitHub Pages 静态托管

---

## 一、核心定位

**产品口号**: "完全免费、无广告的字帖生成器"

**核心竞争力**:
1. 全免费无广告 — 对比国内市场同类产品（多有广告/付费墙）
2. 稳定好用 — 崩溃有兜底、输入有反馈、导出可追踪
3. 内容开箱即用 — 内置古诗/常用字/英语词库，不用家长自己找内容

**不追求**: 功能数量、复杂模板体系、社交功能

---

## 二、技术架构

### 2.1 构建系统

- **Vite** 替代纯 CDN 引入方式
  - 开发时 HMR 支持
  - 生产构建：代码压缩、CDN 资源优化、Tree-shaking
  - ESM 模块化，替代现有 IIFE 全局命名空间模式

### 2.2 代码模块拆分

现有 `app.js` (714行 IIFE) 拆分为：

```
src/
├── main.jsx           # 入口，挂载 React
├── App.jsx            # 主组件，状态提升
├── components/
│   ├── Toolbar.jsx        # 工具栏（打印/导出/模板按钮）
│   ├── ConfigPanel.jsx    # 左侧配置面板
│   ├── PreviewPanel.jsx   # 右侧预览面板
│   ├── PageGrid.jsx       # 字帖页面渲染
│   ├── Toast.jsx          # Toast 通知组件
│   └── LibraryPanel.jsx   # 词库选择面板
├── hooks/
│   ├── useSettings.js     # 设置状态 + localStorage 持久化（带容错）
│   ├── useToast.js        # Toast 通知系统
│   └── useDebounce.js     # 输入防抖
└── styles/
    └── main.css           # 从 index.html 抽出的 CSS

js/                        # 纯算法模块（保持现有 IIFE 封装）
├── utils.js
├── grid.js
├── content.js
├── features.js
├── export.js
└── library.js
```

### 2.3 依赖管理

```
devDependencies:
  - vite
  - @vitejs/plugin-react
  - playwright

dependencies:
  - react, react-dom (CDN 保留或 npm)
  - bootstrap 5 (CDN)
  - html2pdf.js (CDN 保留)
```

**原则**: 现有 `js/*.js` 文件保持不变（纯算法，无框架依赖），只在 `src/` 中引入使用。

### 2.4 部署

- GitHub Actions 构建 → 发布到 GitHub Pages
- 构建产物: `dist/` 目录
- 现有 `.github/workflows/pages.yml` 改造适配 Vite 构建

---

## 三、稳定性增强

### 3.1 Error Boundary

```jsx
class ErrorBoundary extends React.Component {
  componentDidCatch(error, info) {
    this.setState({ hasError: true, error, info });
  }
  render() {
    if (this.state.hasError) {
      return <FallbackUI onReload={()=>location.reload()} />;
    }
    return this.props.children;
  }
}
```

### 3.2 localStorage 容错

```js
try {
  localStorage.setItem('copybook.settings', JSON.stringify(s));
} catch (e) {
  if (e.name === 'QuotaExceededError') {
    toast.warn('存储空间已满，部分设置未保存，请清理浏览器缓存');
  }
}
```

### 3.3 输入校验

- rows/cols: min=1, max=20, 超出自动 clamp
- cellSize: min=30, max=150
- 文字输入: 300ms debounce，避免每次按键触发完整 parse/paginate

### 3.4 网络容错

```js
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5000);
fetch(url, { signal: controller.signal })
  .then(r => r.json())
  .then(data => { clearTimeout(timeout); setData(data); })
  .catch(e => {
    if (e.name === 'AbortError') toast.error('加载超时，请重试');
    else toast.error('加载失败', { action: retry });
  });
```

### 3.5 数值校验

所有 `parseInt` 输入加 clamp：
```js
const clamped = Math.max(1, Math.min(20, parseInt(value) || 1));
```

---

## 四、UX 体验增强

### 4.1 Toast 通知系统

替换所有 `alert()/confirm()`：

| 类型 | 颜色 | 持续 | 场景 |
|------|------|------|------|
| success | 绿色 | 2s | 导入成功、模板保存成功 |
| error | 红色 | 4s | 导入失败、加载失败（可带重试按钮） |
| warning | 黄色 | 3s | localStorage 满、格式不支持 |
| info | 蓝色 | 2s | 操作提示 |
| progress | 蓝色 | 持续 | PDF 导出进度（可取消） |

### 4.2 加载状态

- 词库加载：骨架屏 + 顶部进度条
- PDF 导出：Toast 进度条，不阻塞其他操作，可取消
- 初始渲染：加载动画

### 4.3 空状态引导

首次打开无内容时：
- 显示示例字帖预览图
- 快捷操作指引：「试试输入：静夜思」「从词库选择一个模板」
- 关闭引导后不再显示（localStorage 记录）

### 4.4 帮助系统

- 配置项旁加 `?` 图标，hover 显示 tooltip
- 打印说明：打印预览模式自动隐藏 UI 面板

### 4.5 响应式优化

- 移动端：配置面板折叠/展开
- 打印缩放：localStorage 记录用户设置

---

## 五、测试方案

### 5.1 Playwright 端到端测试

覆盖核心用户流程：

```
tests/
├── e2e/
│   ├── app.spec.js          # 主流程测试
│   │   ├── 加载首页无崩溃
│   │   ├── 输入文字后预览更新
│   │   ├── 切换格子类型预览变化
│   │   ├── 导出 PDF 成功
│   │   ├── 导入配置成功
│   │   └── 词库搜索可用
│   └── layout.spec.js       # 排版测试
│       ├── 古诗格式居中正确
│       ├── 四线三格线条位置正确
│       └── 英文格式基线对齐
```

### 5.2 CI 流程

GitHub Actions:
1. `npm install`
2. `npm run build` (Vite 构建)
3. `npx playwright install --with-deps`
4. `npx playwright test`
5. 成功后 deploy 到 GitHub Pages

---

## 六、付费功能（后续）

在免费版稳定后，付费功能方向：

1. **高级字体包** — 楷书/行书/隶书多种字体解锁（需本地字体文件支持）
2. **专属内容库** — 更多古诗/成语/英文词库内容包

**注意**: 当前阶段不实现付费功能，只预留 UI 入口和数据架构。

---

## 七、不做的事（YAGNI）

- 不做用户系统/登录
- 不做数据同步
- 不做微信小程序（当前阶段）
- 不做深色模式
- 不做 undo/redo
- 不做键盘快捷键
- 不做 AI 生成内容

---

## 八、验收标准

产品化完成后，满足以下条件：

1. `npm run build` 成功生成 `dist/`
2. `npx playwright test` 全部通过
3. GitHub Actions CI 绿灯
4. GitHub Pages 正常访问
5. 所有 `alert()/confirm()` 替换为 Toast
6. Error Boundary 覆盖全 App
7. 文字输入 debounce 生效
8. localStorage 满时显示友好提示
9. PDF 导出有进度反馈
10. 词库加载失败可重试
