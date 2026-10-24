# 工作台 (dsh-workbench)

DeepSeek Harness Web 插件：左侧边栏的「工作台」入口，集中展示账户用量、网页搜索与最近书签、待办、可自定义分类的应用与会话。应用区不再自动收纳或自动分类——**从左侧边栏把插件拖进工作台**才会加入。

## 功能

### 账户与用量

- 工作台顶部三张卡片：**剩余余额、今日使用 Token、今日使用金额**。
- 余额来自 `dsh-api-dashboard` 的 `/api-dashboard/balances?stale=1`（取 `platform: "deepseek"` 的 `total`），不可用时回退核心 account 远端；打开工作台时读取一次。
- 今日 Token / 金额来自会话的 `queryBalanceCost` 投影（`todayTokens` / `todayByCurrency`），随会话存储实时更新；数据缺失时显示「—」。

### 网页搜索 + 最近书签

- 支持 **百度 / Bing / Google** 三种搜索引擎：标题右侧一个固定方框内放三个方块，点击方块即设置，方框底部显示当前选择并打勾；选择会记在 `localStorage`（`dsh.workbench.searchEngine.v1`）。
- 输入关键词会按当前搜索引擎打开结果页；输入域名或 `http(s)` 网址则直接打开该网页。
- 优先通过 **`dsh-builtin-browser`** 打开：调用 `__dshBuiltinBrowser.openPanel(sessionId, url)` 在会话右侧栏打开并切换到该会话；不可用时回退浏览器新标签页。
- 打开过的网页自动记入「最近书签」（最多 8 条，去重、新的在前），可点击再次打开或删除；书签存在 `dsh.workbench.bookmarks.v1`。

### 待办

- 长方形卡片展示；标题栏输入内容即可添加。
- 点击标记为「已完成」（再点一次撤销），右上角 × 删除；键盘 Enter/空格同样可切换。
- 数据保存在 `localStorage`（`dsh.workbench.todos.v1`，会自动迁移旧的 `dsh.workbench.modules.v1`）。

### 我的应用（手动拖入 + 自定义分类）

- 应用区默认只有「从左侧把插件拖到这里」的投放区；**不会自动收纳、不会自动分类**。
- 从左侧边栏按住任意插件图标，拖到应用区即可加入：
  - 该插件的侧边栏行会被隐藏（只隐藏你拖入的那些）；
  - 应用卡出现在「未分类」分组，点击打开对应面板；
  - 应用卡右上角 × 把插件移出工作台，侧边栏图标恢复。
- 可以在应用区顶部**新建自定义分类**（最多 20 个），把应用卡拖进分类；拖回「未分类」取消分类。
- 拖入列表存在 `dsh.workbench.pinned.v1`；分类与归属存在 `dsh.workbench.appCats.v1` / `dsh.workbench.appAssign.v1`。
- 显式注册到 `workbench.apps` 的应用会直接出现，无需拖入。

### 最近会话（自定义分类 + 拖动）

- 最近会话列表可以**新建分类**（最多 20 个）；会话行可拖动到分类，或拖到「未分类」取消归属。
- 分类标题右侧 × 删除分类，分类内的会话回到「未分类」；搜索框继续用于过滤标题。
- 分类与会话归属保存在 `localStorage`（`dsh.workbench.sessionCats.v1` / `dsh.workbench.sessionAssign.v1`）。
- 点击「最近会话」标题行可展开/收起列表与搜索框。

### 自定义背景

- 问候区右侧的图片按钮打开背景设置：选择本地 JPG/PNG/WebP（建议小于 2MB）作为工作台背景，或清除背景。
- 图片保存在 `localStorage`（`dsh.workbench.background.v1`）。

## 插件如何进入工作台

1. **手动拖入（推荐）**
   在工作台打开时，左侧边栏的插件行会自动变成可拖动（`draggable`）；拖到「我的应用」投放区即可。拖入后侧边栏行隐藏，移出后恢复。
2. **显式注册（不需要拖）**
   插件客户端半边注册到 `workbench.apps`：

   ```js
   ctx.slots.inject('workbench.apps', () =>
     ctx.slots.register(
       { name: 'workbench.apps', id: 'my-task-panel', order: 30, label: () => t('panel') },
       MyPanelIcon,
     ),
   )
   ```

旧的「零改动自动收纳 + 自动分类」已取消：未拖入的插件始终留在侧边栏。

## 侧边栏入口

- 侧边栏保留「工作台」入口，以及所有**未被拖入**的插件行。
- 只有拖入工作台的插件，其侧边栏行由工作台图标内联的一条窄作用域规则隐藏：
  `nav[aria-label="全局面板"] button[aria-label="<面板标题>"]`（英文对应 `Global panels`）→ `display:none`。
- 把插件移出工作台后规则立即消失，该行恢复；工作台被停用时所有行恢复，不会锁死。
- 语言不在中/英范围、或宿主改了导航按钮的无障碍标签时，隐藏规则可能不生效；功能不受影响。

## 实现

| 项 | 值 |
| --- | --- |
| 侧边栏入口 | `sidebar.panellist`，`id = workbench`，`order = 5` |
| 中央面板 | `main`，`key = workbench` |
| 应用插槽 | `workbench.apps`（`main` 入口声明的 `list` 子插槽，scope `root`） |
| 拖入列表 | `localStorage` 键 `dsh.workbench.pinned.v1` |
| 拖放 payload | `application/x-dsh-workbench-panel` + `text/plain` JSON `{kind:"panel", id}` |
| 网页搜索 | `globalThis.__dshBuiltinBrowser.openPanel(sessionId, url)`，回退 `window.open` |
| 包名 / 客户端模块 id | `dsh-workbench` |
| 语言命名空间 | `workbench` |

Host 半边 (`index.js`) 只有空的 `apply()`。渲染与交互都在 `client.js`，使用 `window.__ModuleLoader__.load` 的懒工厂格式，React 由浏览器模块表提供。侧边栏面板列表通过 `ctx.slots.entries` / `ctx.slots.subscribe` 读取；拖动能力通过给宿主已有的侧边栏按钮加 `draggable` 和委托 `dragstart` 实现。

## 安装与更新

```text
plugin_manager  install_bundle  target: <本目录绝对路径>\workbench
```

以目录软链安装时，修改客户端代码后需要刷新 Harness 页面（或先 remove_bundle 再 install_bundle）才能加载新的客户端模块代。

## 自测

```powershell
node --check workbench\client.js
node --check workbench\index.js
node workbench\test\smoke.mjs   # 加载模块、执行 apply，并用 stub React 执行工作台页面（含拖入应用/取消拖入）
```

## 已知限制

- 拖入依赖桌面 HTML5 拖放；触屏设备暂不支持。
- 侧边栏行由宿主渲染，工作台通过 DOM 给它加 `draggable`；宿主大改侧边栏结构时可能需要重新适配。
- 拖入列表、分类、书签、待办与背景都保存在当前浏览器的 `localStorage`；换浏览器、无痕模式或清缓存后会丢失。
- 插件被卸载后，其拖入记录会保留；重装后重新出现。若面板已不存在，点击应用卡会提示「面板未注册」。
- 网页搜索依赖 `dsh-builtin-browser` 及其“会话右侧栏”面板；不可用时回退浏览器新标签页。
- 「最近会话」不显示相对时间：会话摘要未提供稳定的更新时间字段，按会话列表既有顺序展示。
- 视觉验证依赖已连接的 Harness 页面；本机浏览器控制不可用时只能验证 JS 语法、清单与线上插槽注册。
