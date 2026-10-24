# 工作台 (dsh-workbench)

DeepSeek Harness Web 插件：左侧边栏唯一的「工作台」入口，集中展示会话概览、网页搜索与书签、待办、可自定义分类并拖动整理的应用与会话，以及按类型自动归类、自动收纳的常用工具。

## 功能

### 网页搜索 + 最近书签

- 支持 **百度 / Bing / Google** 三种搜索引擎；标题右侧的三个方块点击即可设置当前引擎，选择会记在 `localStorage`（`dsh.workbench.searchEngine.v1`）。
- 输入关键词会按当前搜索引擎打开结果页；输入域名或 `http(s)` 网址则直接打开该网页。
- 优先通过 **`dsh-builtin-browser`** 打开：工作台调用该插件在页面暴露的 `__dshBuiltinBrowser.openPanel(sessionId, url)`，在会话右侧栏打开网页并切换到该会话；插件不可用或侧栏未挂载时回退到浏览器新标签页。
- 打开过的网页自动记入「最近书签」（最多 8 条，去重、新的在前），可点击再次打开或删除。
- 书签保存在 `localStorage`（`dsh.workbench.bookmarks.v1`）。

### 待办

- 长方形卡片展示；标题栏输入名称即可添加。
- 点击待办自动标记为「已完成」（再点一次撤销），右上角 × 删除；键盘 Enter/空格同样可切换。
- 标题栏显示“已完成/总数”；数据保存在 `localStorage`（`dsh.workbench.todos.v1`，会自动迁移旧的 `dsh.workbench.modules.v1`）。

### 自定义背景

- 问候区右侧的图片按钮打开背景设置：选择本地 JPG/PNG/WebP（建议小于 2MB）作为工作台背景，或清除背景。
- 背景上方叠加一层半透明的主题色，保证文字可读；图片保存在 `localStorage`（`dsh.workbench.background.v1`）。

### 我的应用（自动分类 + 自定义分类 + 拖动）

- 自动分类规则保持不变（见下表），另外可以在应用区顶部**新建自定义分类**（最多 20 个）。
- 应用卡片可**拖动**到自定义分类；拖动到「拖到这里恢复自动分类」区域可取消自定义归属。分类标题右侧 × 删除分类，分类内的应用回到自动分类。
- 自定义分类与应用归属保存在 `localStorage`（`dsh.workbench.appCats.v1` / `dsh.workbench.appAssign.v1`）。
- 点击「我的应用」标题行可展开/收起整个应用网格。

当前会出现的应用：

| 分类 | 应用 | 来源 |
| --- | --- | --- |
| 行情分析 | 个股分析、美国收盘报 | 显式注册到 `workbench.apps` |
| 资金流向 | 资金雷达 | 显式注册到 `workbench.apps` |
| 费用与预算 | 费用统计（`dsh-bill`） | 从侧边栏自动收纳 |
| 自动化 | 任务监控 | 显式注册到 `workbench.apps` |
| 自动化 | 定时任务 | 从侧边栏自动收纳 |
| 系统 | 插件 | 从侧边栏自动收纳 |

自动分类规则（按 id + 标题关键词，先匹配者优先）：

- `资金|雷达|fund|flow|radar` → 资金流向
- `费用|账单|花费|成本|预算|用量|bill|cost|spend|expense|price|budget` → 费用与预算
- `任务|自动化|监控|调度|task|monitor|auto|schedul|workflow` → 自动化
- `个股|股票|行情|收盘|美股|报告|stock|equity|quote|close|report|market` → 行情分析
- `插件|设置|系统|plugin|plugins|setting|settings` → 系统
- 其余 → 其他

卡片复用应用自己的图标与本地化标题，点击调用 `layout.selectPanel(id)` 打开对应面板；面板未注册时给出提示。

### 最近会话（自定义分类 + 拖动）

- 最近会话列表可以**新建分类**（最多 20 个）；会话行可拖动到分类，或拖动到「未分类」取消归属。
- 分类标题右侧 × 删除分类，分类内的会话回到「未分类」；搜索框继续用于过滤标题。
- 分类与会话归属保存在 `localStorage`（`dsh.workbench.sessionCats.v1` / `dsh.workbench.sessionAssign.v1`）。
- 点击「最近会话」标题行可展开/收起列表与搜索框。

### 问候

按本地时间问候、日期、星期与每 30 秒刷新的时钟；会话总数与运行中数量。

## 以后有任务插件：自己移动到工作台

工作台对两种方式都自动生效，新增插件不需要改工作台代码：

1. **显式注册（推荐，可自定义图标/标题）**
   插件的客户端半边注册到工作台的 `workbench.apps` 插槽：

   ```js
   ctx.slots.inject('workbench.apps', () =>
     ctx.slots.register(
       { name: 'workbench.apps', id: 'my-task-panel', order: 30, label: () => t('panel') },
       MyPanelIcon,
     ),
   )
   ```

2. **零改动收纳**
   插件照常注册 `sidebar.panellist`。工作台会自动读取侧边栏所有面板，把它们作为应用卡片纳入网格，并按标题归类；其侧边栏图标会被隐藏。

两种来源都在每次插槽变化时重新读取，工作台面板打开或侧边栏更新后立即生效，无需重启。

## 侧边栏入口

- 侧边栏只保留「工作台」一个面板入口（以及新会话/会话列表等 shell 控件）。
- 被收纳面板的侧边栏行由工作台图标内联的一条窄作用域规则隐藏：
  `nav[aria-label="全局面板"] button[aria-label="<面板标题>"]`（英文对应 `Global panels`）→ `display:none`。
- 语言不在中/英范围、或宿主改了导航按钮的无障碍标签时，那些图标会重新显示；功能不受影响。
- 工作台被停用时，内联规则随图标一起消失，所有面板恢复原来的侧边栏图标，不会锁死。

## 移到工作台的插件

下列本地插件把注册从 `sidebar.panellist` 改为 `workbench.apps`（`main` 面板注册不变）：

| 插件 | 修改文件 |
| --- | --- |
| 个股分析 `dsh-stock-analyzer` | `stock-analyzer/client.js` |
| 美国收盘报 `dsh-us-close-report` | `us-close-report/client.js` |
| 资金雷达 `dsh-market-radar` | `market-radar/client.js` |
| 任务监控 `@local/task-monitor` | `task-monitor/client.js` |

`dsh-bill`（费用统计）、内置「插件」与「定时任务」没有改动源码，走上面的「零改动收纳」。

## 实现

| 项 | 值 |
| --- | --- |
| 侧边栏入口 | `sidebar.panellist`，`id = workbench`，`order = 5` |
| 中央面板 | `main`，`key = workbench` |
| 应用插槽 | `workbench.apps`（`main` 入口声明的 `list` 子插槽，scope `root`） |
| 自动收纳来源 | `sidebar.panellist`（除 `workbench` 外的全部条目） |
| 网页搜索 | `globalThis.__dshBuiltinBrowser.openPanel(sessionId, url)`，回退 `window.open` |
| 包名 / 客户端模块 id | `dsh-workbench` |
| 语言命名空间 | `workbench` |

Host 半边 (`index.js`) 只有空的 `apply()`。渲染与交互都在 `client.js`，使用 `window.__ModuleLoader__.load` 的懒工厂格式，React 由浏览器模块表提供。应用与侧边栏面板列表通过 `ctx.slots.entries` / `ctx.slots.subscribe` 读取；可选服务 `layout` / `uiWorkspace` 通过 `ctx.get()` 判空取用。

## 安装与更新

```text
plugin_manager  install_bundle  target: <本目录绝对路径>\workbench
```

以目录软链安装时，修改客户端代码后需要刷新 Harness 页面（或先 remove_bundle 再 install_bundle）才能加载新的客户端模块代。

## 自测

```powershell
node --check workbench\client.js
node --check workbench\index.js
node workbench\test\smoke.mjs   # 加载模块、执行 apply，并用 stub React 执行页面组件（含种子化的分类/书签/待办）
```

## 已知限制

- 网页搜索依赖 `dsh-builtin-browser` 及其“会话右侧栏”面板；如果当前没有可用会话或侧栏未挂载，会回退到浏览器新标签页，并在无法打开时给出提示。
- 拖动使用桌面 HTML5 拖放，触屏设备暂不支持。
- 自定义分类、书签、待办与背景都保存在当前浏览器的 `localStorage`；换浏览器、无痕模式或清缓存后会丢失。
- 背景图片建议小于 2MB；超出会提示。`localStorage` 配额不足时图片当次仍生效，但可能无法持久保存。
- 「最近会话」不显示相对时间：会话摘要未提供稳定的更新时间字段，按会话列表既有顺序展示。
- 从应用面板返回工作台请点侧边栏「工作台」图标。
- 显式注册方式依赖对四个本地插件 `client.js` 的注册改动；插件升级会覆盖，需要重新改回 `workbench.apps`。零改动收纳方式不受插件升级影响。
- 视觉验证依赖已连接的 Harness 页面；本机浏览器控制不可用时只能验证 JS 语法、清单、资源与线上插槽注册。
