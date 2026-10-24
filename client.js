/**
 * Client half of the Workbench bundle (工作台).
 *
 * A left-sidebar entry (`sidebar.panellist`) opens a central panel (`main`).
 * The panel is a personal start page for the current Harness window:
 *
 * - greeting, date, and a live clock for the reader's locale;
 * - a collapsible list of recent sessions that can be grouped into
 *   user-created categories by drag and drop;
 * - a web search card that opens pages through the built-in browser when it
 *   is available, with a recent-bookmarks list;
 * - a to-do board: rectangular cards that can be added, clicked to complete,
 *   and removed, with an optional custom background;
 * - an app center: auto-classified groups plus user-created categories, both
 *   accepting dragged app cards; every global `sidebar.panellist` panel is
 *   adopted automatically and its sidebar row hidden.
 *
 * Data comes from the slot's standard session hooks, so the panel is a pure
 * projection of the live Client state: no polling, no duplicated store.
 * Panel navigation and session opening use the optional `layout` and
 * `uiWorkspace` services, looked up defensively so the panel still renders
 * when one of them is absent.
 */
window.__ModuleLoader__.load({
  id: 'dsh-workbench',
  factory(require) {
    'use strict'

    const React = require('react')
    const h = React.createElement
    const { useEffect, useMemo, useState } = React

    const NS = 'workbench'
    const PANEL_ID = 'workbench'
    const RECENT_LIMIT = 8

    const zh = {
      panel: '工作台',
      eyebrow: '工作台',
      greetNight: '夜深了',
      greetMorning: '早上好',
      greetNoon: '中午好',
      greetAfternoon: '下午好',
      greetEvening: '晚上好',
      chipSessions: '个会话',
      chipRunning: '个运行中',
      newSession: '新建会话',
      recent: '最近会话',
      search: '搜索会话',
      running: '运行中',
      emptyTitle: '还没有会话',
      emptyHint: '新建一个会话，开始你的第一次对话。',
      noMatch: '没有找到匹配的会话。',
      webSearch: '网页搜索',
      webSearchHint: '用内置浏览器打开',
      webSearchPlaceholder: '搜索网页或输入网址…',
      webSearchButton: '搜索',
      webSearchEngine: '搜索引擎',
      engineBaidu: '百度',
      engineBing: 'Bing',
      engineGoogle: 'Google',
      recentBookmarks: '最近书签',
      bookmarksEmpty: '通过上方搜索打开的网页会出现在这里。',
      bookmarkDelete: '删除书签',
      categoryPlaceholder: '新分类名称…',
      categoryAdd: '新建分类',
      categoryDelete: '删除分类（项目回到原来的分组）',
      categoryCustomDesc: '自定义分类',
      dragSessionsHint: '拖动会话到分类',
      appAutoZone: '拖到这里恢复自动分类',
      unclassified: '未分类',
      dropHere: '拖到这里',
      noticeBrowserUnavailable: '内置浏览器不可用，无法打开网页。',
      modules: '待办',
      modulePlaceholder: '添加待办…',
      moduleAdd: '添加',
      moduleEmpty: '还没有待办。输入名称后添加；点击即可标记为已完成，再点一次撤销。',
      moduleDoneBadge: '已完成',
      moduleDone: '点击标记为已完成',
      moduleUndo: '点击撤销完成',
      moduleDelete: '删除待办',
      background: '自定义背景',
      backgroundLabel: '背景图片',
      backgroundChoose: '选择图片',
      backgroundClear: '清除背景',
      backgroundHint: '支持 JPG/PNG/WebP，建议小于 2MB，保存在本机浏览器。',
      backgroundNone: '未设置',
      backgroundSet: '已设置',
      apps: '我的应用',
      appsHint: '按类型自动归类 · 可拖动',
      appsEmpty: '暂无已注册的应用',
      appsEmptyHint: '插件注册到 workbench.apps 后会自动出现在这里。',
      pluginsApp: '插件',
      pluginsAppDesc: '安装、启用与配置插件',
      catSystem: '系统',
      catSystemDesc: '管理与配置',
      catBilling: '费用与预算',
      catBillingDesc: '花费、预算与用量',
      catMarket: '行情分析',
      catMarketDesc: '个股、指数与收盘行情',
      catFunds: '资金流向',
      catFundsDesc: '净流入、主力与异动',
      catAutomation: '自动化',
      catAutomationDesc: '任务、会话与调度',
      catOther: '其他',
      catOtherDesc: '其他已注册的应用',
      appStockDesc: '输入代码或名称，查看行情、技术面、资金、行业与投资建议',
      appUsCloseDesc: '美股指数、板块、个股与 ETF 的实时看板与详情',
      appRadarDesc: '每个交易日更新 A 股与 ETF 资金净流入、主力动向与市场异动',
      appTaskDesc: '自动收录运行中的会话与任务看板',
      appBillDesc: '每轮/每会话花费、预算与全账户费用报告',
      appPluginsDesc: '安装、启用与配置插件',
      appSchedulesDesc: '查看与管理定时提醒',
      footNote: '应用按类型自动归类，新插件的侧边栏面板会自动收进工作台；会话列表实时更新。',
      noticePanelMissing: '该面板未安装或已停用。',
      noticeActionUnavailable: '操作暂不可用，请稍后重试。',
      noticeBgType: '请选择图片文件。',
      noticeBgSize: '图片太大，请选择小于 2MB 的图片。',
      noticeBgRead: '背景图片读取失败。',
    }

    const en = {
      panel: 'Workbench',
      eyebrow: 'Workbench',
      greetNight: 'Working late',
      greetMorning: 'Good morning',
      greetNoon: 'Good afternoon',
      greetAfternoon: 'Good afternoon',
      greetEvening: 'Good evening',
      chipSessions: 'sessions',
      chipRunning: 'running',
      newSession: 'New session',
      recent: 'Recent sessions',
      search: 'Search sessions',
      running: 'Running',
      emptyTitle: 'No sessions yet',
      emptyHint: 'Start a session to begin your first conversation.',
      noMatch: 'No sessions match your search.',
      webSearch: 'Web search',
      webSearchHint: 'Opens in the built-in browser',
      webSearchPlaceholder: 'Search the web or enter a URL…',
      webSearchButton: 'Search',
      webSearchEngine: 'Search engine',
      engineBaidu: 'Baidu',
      engineBing: 'Bing',
      engineGoogle: 'Google',
      recentBookmarks: 'Recent bookmarks',
      bookmarksEmpty: 'Pages opened from the search above appear here.',
      bookmarkDelete: 'Remove bookmark',
      categoryPlaceholder: 'New category name…',
      categoryAdd: 'Add category',
      categoryDelete: 'Delete category (items return to their default group)',
      categoryCustomDesc: 'Custom category',
      dragSessionsHint: 'Drag sessions into a category',
      appAutoZone: 'Drop here to return to automatic grouping',
      unclassified: 'Uncategorized',
      dropHere: 'Drop here',
      noticeBrowserUnavailable: 'The built-in browser is unavailable; could not open the page.',
      modules: 'To-dos',
      modulePlaceholder: 'Add a to-do…',
      moduleAdd: 'Add',
      moduleEmpty: 'No to-dos yet. Type a name to add one; click a to-do to mark it done, click again to undo.',
      moduleDoneBadge: 'Done',
      moduleDone: 'Click to mark as done',
      moduleUndo: 'Click to mark as pending',
      moduleDelete: 'Delete to-do',
      background: 'Custom background',
      backgroundLabel: 'Background',
      backgroundChoose: 'Choose image',
      backgroundClear: 'Clear',
      backgroundHint: 'JPG/PNG/WebP, under 2MB, stored in this browser.',
      backgroundNone: 'Not set',
      backgroundSet: 'Set',
      apps: 'My apps',
      appsHint: 'Grouped automatically · drag to a category',
      appsEmpty: 'No apps registered yet',
      appsEmptyHint: 'A plugin appears here after it registers into workbench.apps.',
      pluginsApp: 'Plugins',
      pluginsAppDesc: 'Install, enable, and configure plugins',
      catSystem: 'System',
      catSystemDesc: 'Management and configuration',
      catBilling: 'Costs & budget',
      catBillingDesc: 'Spend, budget, and usage',
      catMarket: 'Markets',
      catMarketDesc: 'Stocks, indices, and close reports',
      catFunds: 'Fund flows',
      catFundsDesc: 'Net inflows, main funds, and anomalies',
      catAutomation: 'Automation',
      catAutomationDesc: 'Tasks, sessions, and schedules',
      catOther: 'Other',
      catOtherDesc: 'Other registered apps',
      appStockDesc: 'Search a ticker or name for quotes, technicals, funds, industry, and advice',
      appUsCloseDesc: 'Live boards and detail for US indices, sectors, stocks, and ETFs',
      appRadarDesc: 'Daily A-share and ETF net inflows, main-fund moves, and anomalies',
      appTaskDesc: 'A board that collects running sessions and tasks automatically',
      appBillDesc: 'Per-turn and per-session spend, budget, and account-wide reports',
      appPluginsDesc: 'Install, enable, and configure plugins',
      appSchedulesDesc: 'Review and manage scheduled reminders',
      footNote: 'Apps are grouped automatically; a new plugin panel is adopted into the workbench; session data stays live.',
      noticePanelMissing: 'That panel is not installed or is disabled.',
      noticeActionUnavailable: 'That action is unavailable right now.',
      noticeBgType: 'Please choose an image file.',
      noticeBgSize: 'That image is too large; choose one under 2MB.',
      noticeBgRead: 'Could not read that background image.',
    }

    const EMPTY_SESSION_STATE = { ids: [], byId: {}, phase: 'ready', projectionsBySession: {} }

    let moduleCtx
    let moduleLocale
    let moduleSlots

    /**
     * App descriptors by registration id. Anything else that registers into
     * `workbench.apps` still shows up; it only lacks a bespoke description.
     */
    const APP_DESCRIPTIONS = {
      'stock-analyzer': 'appStockDesc',
      'us-close-report': 'appUsCloseDesc',
      'market-radar': 'appRadarDesc',
      'task-monitor': 'appTaskDesc',
      'bill': 'appBillDesc',
      'plugins': 'appPluginsDesc',
      'schedules': 'appSchedulesDesc',
    }

    /**
     * Keyword rules that classify a registered app by its id and label. The
     * order matters: the first matching rule wins, so a "market radar" that
     * mentions both words stays in fund flows.
     */
    const CLASSIFY_RULES = [
      { category: 'funds', pattern: /(fund|flow|radar|capital|资金|流入|雷达|主力)/ },
      { category: 'billing', pattern: /(bill|cost|spend|expense|price|budget|费用|账单|花费|成本|预算|用量)/ },
      { category: 'automation', pattern: /(task|monitor|auto|schedul|workflow|任务|自动化|监控|调度)/ },
      { category: 'market', pattern: /(stock|equity|quote|close|report|market|个股|股票|行情|收盘|美股|报告)/ },
      { category: 'system', pattern: /(plugin|plugins|setting|settings|插件|设置|系统)/ },
    ]

    /**
     * Classify a registered app into one of the workbench categories.
     * @param id - registration id.
     * @param label - resolved display label.
     * @returns category id (`market` | `funds` | `billing` | `automation` | `system` | `other`).
     */
    function classifyApp(id, label) {
      const text = String(id || '') + ' ' + String(label || '')
      const lower = text.toLowerCase()
      for (let index = 0; index < CLASSIFY_RULES.length; index += 1) {
        if (CLASSIFY_RULES[index].pattern.test(lower)) return CLASSIFY_RULES[index].category
      }
      return 'other'
    }

    // ------------------------------------------------------------------
    // Locale helpers
    // ------------------------------------------------------------------

    function dictFor(active) {
      return String(active || '').toLowerCase().indexOf('zh') === 0 ? zh : en
    }

    function translate(dict, key) {
      const text = dict && typeof dict[key] === 'string' ? dict[key] : en[key]
      return typeof text === 'string' ? text : key
    }

    function activeLocaleOf(locale) {
      try {
        if (locale !== undefined && locale !== null && typeof locale.getSnapshot === 'function') {
          const snapshot = locale.getSnapshot()
          if (snapshot !== undefined && snapshot !== null && typeof snapshot.active === 'string') return snapshot.active
        }
      } catch (error) {
        // Fall through to the browser language.
      }
      try {
        if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') return navigator.language
      } catch (error) {
        // No navigator: English.
      }
      return 'en'
    }

    function useActiveLocale(locale) {
      const [active, setActive] = useState(function () { return activeLocaleOf(locale) })
      useEffect(function () {
        setActive(activeLocaleOf(locale))
        if (locale === undefined || locale === null || typeof locale.subscribe !== 'function') return undefined
        function onLocaleChange() { setActive(activeLocaleOf(locale)) }
        try {
          return locale.subscribe(onLocaleChange)
        } catch (error) {
          return undefined
        }
      }, [locale])
      return active
    }

    function readLocaleService() {
      try {
        if (moduleCtx && typeof moduleCtx.get === 'function') {
          const value = moduleCtx.get('locale')
          return value === null ? undefined : value
        }
      } catch (error) {
        // The panel falls back to the browser language.
      }
      return undefined
    }

    // ------------------------------------------------------------------
    // Date formatting
    // ------------------------------------------------------------------

    function localeTag(active) {
      return String(active || '').toLowerCase().indexOf('zh') === 0 ? 'zh-CN' : 'en-US'
    }

    function formatDate(now, active) {
      try {
        return new Intl.DateTimeFormat(localeTag(active), {
          year: 'numeric', month: 'long', day: 'numeric', weekday: 'long',
        }).format(now)
      } catch (error) {
        return now.toDateString()
      }
    }

    function formatTime(now, active) {
      try {
        return new Intl.DateTimeFormat(localeTag(active), {
          hour: '2-digit', minute: '2-digit',
        }).format(now)
      } catch (error) {
        return String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0')
      }
    }

    function greetingKey(now) {
      const hour = now.getHours()
      if (hour < 6) return 'greetNight'
      if (hour < 11) return 'greetMorning'
      if (hour < 13) return 'greetNoon'
      if (hour < 18) return 'greetAfternoon'
      return 'greetEvening'
    }

    // ------------------------------------------------------------------
    // Services and actions
    // ------------------------------------------------------------------

    function service(name) {
      try {
        if (moduleCtx && typeof moduleCtx.get === 'function') {
          const value = moduleCtx.get(name)
          return value === null ? undefined : value
        }
      } catch (error) {
        // Optional service: the caller degrades.
      }
      return undefined
    }

    /**
     * Run one panel action against the optional Client services.
     * @returns 'ok' when dispatched, 'missing' for an unregistered panel,
     * 'unavailable' for any other absence or failure.
     */
    function runAction(name, argument) {
      if (name === 'newSession' || name === 'openSession') {
        const workspace = service('uiWorkspace')
        if (!workspace) return 'unavailable'
        try {
          if (name === 'newSession' && typeof workspace.startSession === 'function') {
            workspace.startSession()
            return 'ok'
          }
          if (name === 'openSession' && typeof workspace.openSession === 'function') {
            workspace.openSession(argument)
            return 'ok'
          }
        } catch (error) {
          return 'unavailable'
        }
        return 'unavailable'
      }
      if (name === 'panel') {
        const layout = service('layout')
        if (!layout) return 'missing'
        try {
          if (typeof layout.selectPanel === 'function') {
            layout.selectPanel(argument)
            return 'ok'
          }
        } catch (error) {
          return 'missing'
        }
      }
      return 'unavailable'
    }

    // ------------------------------------------------------------------
    // Icons
    // ------------------------------------------------------------------

    function iconProps(size, active) {
      return {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: active ? 1.9 : 1.6,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        focusable: false,
        style: { display: 'block', pointerEvents: 'none' },
      }
    }

    /**
     * Sidebar glyph: a bento-style workbench of four panels. The same component
     * hides the sidebar rows of every panel the workbench adopts, so a plugin
     * that registers a global panel moves into the workbench by itself.
     */
    function WorkbenchIcon(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 18
      const active = props !== null && props !== undefined && !!props.active
      useActiveLocale(moduleLocale)
      const panels = useSidebarPanels()
      const selectors = []
      for (let index = 0; index < panels.length; index += 1) {
        const panel = panels[index]
        if (!panel || panel.id === PANEL_ID) continue
        const label = String(panel.label || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"')
        if (label === '') continue
        selectors.push('nav[aria-label="全局面板"] button[aria-label="' + label + '"]')
        selectors.push('nav[aria-label="Global panels"] button[aria-label="' + label + '"]')
      }
      return h(React.Fragment, null,
        h('svg', iconProps(size, active),
          h('rect', { key: 'a', x: 3.5, y: 3.5, width: 7, height: 7, rx: 1.8 }),
          h('rect', { key: 'b', x: 13.5, y: 3.5, width: 7, height: 4.5, rx: 1.6 }),
          h('rect', { key: 'c', x: 3.5, y: 13.5, width: 7, height: 7, rx: 1.8 }),
          h('rect', { key: 'd', x: 13.5, y: 11, width: 7, height: 9.5, rx: 1.8 })
        ),
        selectors.length > 0
          ? h('style', null, selectors.join(',') + '{display:none!important}')
          : null
      )
    }

    function IconPlus(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 16
      return h('svg', iconProps(size, false),
        h('path', { key: 'v', d: 'M12 5.5v13' }),
        h('path', { key: 'h', d: 'M5.5 12h13' })
      )
    }

    function IconGrid(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 16
      return h('svg', iconProps(size, false),
        h('rect', { key: 'a', x: 4, y: 4, width: 7, height: 7, rx: 1.8 }),
        h('rect', { key: 'b', x: 13, y: 4, width: 7, height: 7, rx: 1.8 }),
        h('rect', { key: 'c', x: 4, y: 13, width: 7, height: 7, rx: 1.8 }),
        h('rect', { key: 'd', x: 13, y: 13, width: 7, height: 7, rx: 1.8 })
      )
    }

    function IconChevron(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'p', d: 'M9.5 5.5 16 12l-6.5 6.5' })
      )
    }

    function IconChart(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'axis', d: 'M4 4v16h16' }),
        h('path', { key: 'line', d: 'm7.5 14 3.2-3.8 2.8 2.2 3.9-4.9' })
      )
    }

    function IconWaves(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'a', d: 'M4 9c2.5-2.6 5-2.6 7.5 0S16.5 11.6 20 9' }),
        h('path', { key: 'b', d: 'M4 15c2.5-2.6 5-2.6 7.5 0S16.5 17.6 20 15' })
      )
    }

    function IconBolt(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'bolt', d: 'M13.5 3.5 5.5 13.2h5.2l-.9 7.3 8.3-10h-5.3z' })
      )
    }

    function IconBill(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'body', d: 'M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 19z' }),
        h('path', { key: 'line1', d: 'M9.2 8h5.6' }),
        h('path', { key: 'line2', d: 'M9.2 11.4h5.6' })
      )
    }

    function IconCheck(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('path', { key: 'check', d: 'M5.2 12.4 9.6 16.8 19 7.4' })
      )
    }

    function IconX(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 12
      return h('svg', iconProps(size, false),
        h('path', { key: 'a', d: 'M6 6l12 12' }),
        h('path', { key: 'b', d: 'M18 6 6 18' })
      )
    }

    function IconImage(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 17
      return h('svg', iconProps(size, false),
        h('rect', { key: 'frame', x: 3, y: 4, width: 18, height: 16, rx: 2.2 }),
        h('circle', { key: 'dot', cx: 8.4, cy: 9.4, r: 1.5 }),
        h('path', { key: 'mountain', d: 'm21 15-4.6-4.6L7.2 19.6' })
      )
    }

    function IconSearch(props) {
      const size = props !== null && props !== undefined && typeof props.size === 'number' ? props.size : 14
      return h('svg', iconProps(size, false),
        h('circle', { key: 'lens', cx: 10.5, cy: 10.5, r: 6.2 }),
        h('path', { key: 'handle', d: 'm15.4 15.4 5.1 5.1' })
      )
    }

    /** Category order and presentation for the auto-classified app grid. */
    const CATEGORY_DEFS = [
      { id: 'market', titleKey: 'catMarket', descKey: 'catMarketDesc', icon: IconChart },
      { id: 'funds', titleKey: 'catFunds', descKey: 'catFundsDesc', icon: IconWaves },
      { id: 'billing', titleKey: 'catBilling', descKey: 'catBillingDesc', icon: IconBill },
      { id: 'automation', titleKey: 'catAutomation', descKey: 'catAutomationDesc', icon: IconBolt },
      { id: 'system', titleKey: 'catSystem', descKey: 'catSystemDesc', icon: IconGrid },
      { id: 'other', titleKey: 'catOther', descKey: 'catOtherDesc', icon: IconGrid },
    ]

    /**
     * Read the apps other plugins registered into `workbench.apps` and
     * re-render when that slot's occupants change.
     * @returns ordered `{ id, label }` descriptors.
     */
    function useAppEntries() {
      const [, bump] = useState(0)
      useEffect(function () {
        if (!moduleSlots || typeof moduleSlots.subscribe !== 'function') return undefined
        let off
        try {
          off = moduleSlots.subscribe('workbench.apps', function () {
            bump(function (version) { return version + 1 })
          })
        } catch (error) {
          off = undefined
        }
        return function () {
          try { if (typeof off === 'function') off() } catch (error) { /* ignore */ }
        }
      }, [])
      const apps = []
      try {
        const entries = moduleSlots && typeof moduleSlots.entries === 'function'
          ? moduleSlots.entries('workbench.apps')
          : []
        for (let index = 0; index < entries.length; index += 1) {
          const options = entries[index] && entries[index].options ? entries[index].options : {}
          if (typeof options.id !== 'string' || options.id === '') continue
          let label = options.label
          if (typeof label === 'function') {
            try { label = label() } catch (error) { label = undefined }
          }
          apps.push({
            id: options.id,
            order: typeof options.order === 'number' ? options.order : 0,
            label: typeof label === 'string' && label !== '' ? label : options.id,
          })
        }
      } catch (error) {
        return []
      }
      apps.sort(function (left, right) { return left.order - right.order })
      return apps
    }

    /**
     * Read every global panel the sidebar currently offers, including shipped
     * and third-party panels. The workbench adopts them: each becomes an app
     * card and its sidebar row is hidden by the workbench icon's style rule.
     * @returns ordered `{ id, label }` descriptors.
     */
    function useSidebarPanels() {
      const [, bump] = useState(0)
      useEffect(function () {
        if (!moduleSlots || typeof moduleSlots.subscribe !== 'function') return undefined
        let off
        try {
          off = moduleSlots.subscribe('sidebar.panellist', function () {
            bump(function (version) { return version + 1 })
          })
        } catch (error) {
          off = undefined
        }
        return function () {
          try { if (typeof off === 'function') off() } catch (error) { /* ignore */ }
        }
      }, [])
      const panels = []
      try {
        const entries = moduleSlots && typeof moduleSlots.entries === 'function'
          ? moduleSlots.entries('sidebar.panellist')
          : []
        for (let index = 0; index < entries.length; index += 1) {
          const options = entries[index] && entries[index].options ? entries[index].options : {}
          if (typeof options.id !== 'string' || options.id === '' || options.id === PANEL_ID) continue
          let label = options.label
          if (typeof label === 'function') {
            try { label = label() } catch (error) { label = undefined }
          }
          panels.push({
            id: options.id,
            order: typeof options.order === 'number' ? options.order : 0,
            label: typeof label === 'string' && label !== '' ? label : options.id,
          })
        }
      } catch (error) {
        return []
      }
      panels.sort(function (left, right) { return left.order - right.order })
      return panels
    }

    // ------------------------------------------------------------------
    // Page
    // ------------------------------------------------------------------

    function useNow() {
      const [now, setNow] = useState(function () { return new Date() })
      useEffect(function () {
        const timer = window.setInterval(function () { setNow(new Date()) }, 30000)
        return function () { window.clearInterval(timer) }
      }, [])
      return now
    }

    function sessionRowsOf(state) {
      const byId = state !== null && state !== undefined && state.byId ? state.byId : {}
      const listed = state !== null && state !== undefined && Array.isArray(state.ids) && state.ids.length > 0
        ? state.ids
        : Object.keys(byId)
      const rows = []
      for (let index = 0; index < listed.length; index += 1) {
        const id = listed[index]
        if (typeof id !== 'string' || id === '') continue
        const view = byId[id] || {}
        const title = view.displayTitle || view.title || view.name || id
        rows.push({ id: id, title: String(title), running: !!view.running })
      }
      return rows
    }

    const TODOS_KEY = 'dsh.workbench.todos.v1'
    const LEGACY_MODULES_KEY = 'dsh.workbench.modules.v1'
    const BACKGROUND_KEY = 'dsh.workbench.background.v1'
    const SEARCH_ENGINE_KEY = 'dsh.workbench.searchEngine.v1'
    const APP_CATS_KEY = 'dsh.workbench.appCats.v1'
    const APP_ASSIGN_KEY = 'dsh.workbench.appAssign.v1'
    const SESSION_CATS_KEY = 'dsh.workbench.sessionCats.v1'
    const SESSION_ASSIGN_KEY = 'dsh.workbench.sessionAssign.v1'
    const BOOKMARKS_KEY = 'dsh.workbench.bookmarks.v1'
    const BACKGROUND_MAX_BYTES = 2 * 1024 * 1024
    const TODO_MAX_LENGTH = 120
    const CATEGORY_MAX_LENGTH = 24
    const MAX_CATEGORIES = 20
    const MAX_BOOKMARKS = 8

    const SEARCH_ENGINES = [
      { id: 'baidu', labelKey: 'engineBaidu', url: 'https://www.baidu.com/s?wd=' },
      { id: 'bing', labelKey: 'engineBing', url: 'https://www.bing.com/search?q=' },
      { id: 'google', labelKey: 'engineGoogle', url: 'https://www.google.com/search?q=' },
    ]

    function readLocal(key) {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return null
        return window.localStorage.getItem(key)
      } catch (error) {
        return null
      }
    }

    function writeLocal(key, value) {
      try {
        if (typeof window === 'undefined' || !window.localStorage) return false
        window.localStorage.setItem(key, value)
        return true
      } catch (error) {
        return false
      }
    }

    function loadJson(key, fallback) {
      const raw = readLocal(key)
      if (!raw) return fallback
      try {
        const parsed = JSON.parse(raw)
        return parsed === null || parsed === undefined ? fallback : parsed
      } catch (error) {
        return fallback
      }
    }

    function saveJson(key, value) {
      writeLocal(key, JSON.stringify(value))
    }

    function parseTodos(parsed) {
      if (!Array.isArray(parsed)) return []
      const rows = []
      for (let index = 0; index < parsed.length; index += 1) {
        const item = parsed[index]
        if (!item || typeof item.id !== 'string' || typeof item.title !== 'string') continue
        const title = item.title.trim().slice(0, TODO_MAX_LENGTH)
        if (title === '') continue
        rows.push({ id: item.id, title: title, done: !!item.done })
      }
      return rows.slice(0, 200)
    }

    function loadTodos() {
      const raw = readLocal(TODOS_KEY)
      if (raw) {
        try { return parseTodos(JSON.parse(raw)) } catch (error) { return [] }
      }
      const legacy = readLocal(LEGACY_MODULES_KEY)
      if (legacy) {
        try { return parseTodos(JSON.parse(legacy)) } catch (error) { return [] }
      }
      return []
    }

    function saveTodos(rows) {
      saveJson(TODOS_KEY, rows)
    }

    function loadBackground() {
      const raw = readLocal(BACKGROUND_KEY)
      return typeof raw === 'string' ? raw : ''
    }

    function saveBackground(value) {
      writeLocal(BACKGROUND_KEY, typeof value === 'string' ? value : '')
    }

    function loadSearchEngine() {
      const raw = readLocal(SEARCH_ENGINE_KEY)
      for (let index = 0; index < SEARCH_ENGINES.length; index += 1) {
        if (SEARCH_ENGINES[index].id === raw) return raw
      }
      return SEARCH_ENGINES[0].id
    }

    function saveSearchEngine(id) {
      writeLocal(SEARCH_ENGINE_KEY, typeof id === 'string' ? id : SEARCH_ENGINES[0].id)
    }

    function loadCategories(key) {
      const parsed = loadJson(key, [])
      if (!Array.isArray(parsed)) return []
      const rows = []
      for (let index = 0; index < parsed.length; index += 1) {
        const item = parsed[index]
        if (!item || typeof item.id !== 'string' || typeof item.name !== 'string') continue
        const name = item.name.trim().slice(0, CATEGORY_MAX_LENGTH)
        if (name === '') continue
        rows.push({ id: item.id, name: name })
        if (rows.length >= MAX_CATEGORIES) break
      }
      return rows
    }

    function saveCategories(key, rows) {
      saveJson(key, rows)
    }

    function loadAssignments(key) {
      const parsed = loadJson(key, {})
      if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return {}
      const out = {}
      const keys = Object.keys(parsed)
      for (let index = 0; index < keys.length; index += 1) {
        const itemId = keys[index]
        const categoryId = parsed[itemId]
        if (typeof itemId === 'string' && itemId !== '' && typeof categoryId === 'string' && categoryId !== '') {
          out[itemId] = categoryId
        }
      }
      return out
    }

    function saveAssignments(key, value) {
      saveJson(key, value)
    }

    function loadBookmarks() {
      const parsed = loadJson(BOOKMARKS_KEY, [])
      if (!Array.isArray(parsed)) return []
      const rows = []
      for (let index = 0; index < parsed.length; index += 1) {
        const item = parsed[index]
        if (!item || typeof item.url !== 'string' || !/^https?:\/\//i.test(item.url)) continue
        const title = typeof item.title === 'string' && item.title.trim() !== ''
          ? item.title.trim().slice(0, 120)
          : item.url
        rows.push({ url: item.url, title: title })
        if (rows.length >= MAX_BOOKMARKS) break
      }
      return rows
    }

    function saveBookmarks(rows) {
      saveJson(BOOKMARKS_KEY, rows)
    }

    function newId(prefix) {
      try {
        if (typeof crypto !== 'undefined' && crypto && typeof crypto.randomUUID === 'function') {
          return prefix + '-' + crypto.randomUUID()
        }
      } catch (error) {
        // Fall through to the timestamp id.
      }
      return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8)
    }

    function WorkbenchPage(props) {
      const locale = props !== null && props !== undefined && props.locale ? props.locale : moduleLocale
      const active = useActiveLocale(locale)
      const dict = dictFor(active)
      const t = function (key) { return translate(dict, key) }
      const now = useNow()

      const apps = useAppEntries()
      const sidebarPanels = useSidebarPanels()
      const renderSlot = typeof props.renderSlot === 'function' ? props.renderSlot : null
      // Apps that self-register into workbench.apps come first; every global
      // sidebar panel not given explicitly is adopted automatically, so a new
      // plugin moves itself here by registering a panel in the sidebar.
      const appEntries = []
      const seenApps = {}
      const pushApp = function (id, label, source) {
        if (typeof id !== 'string' || id === '' || seenApps[id]) return
        seenApps[id] = true
        appEntries.push({
          id: id,
          label: label,
          description: APP_DESCRIPTIONS[id] ? t(APP_DESCRIPTIONS[id]) : '',
          source: source,
          category: classifyApp(id, label),
        })
      }
      apps.forEach(function (app) { pushApp(app.id, app.label, 'registered') })
      sidebarPanels.forEach(function (panel) { pushApp(panel.id, panel.label, 'sidebar') })
      const appGroups = []
      for (let index = 0; index < CATEGORY_DEFS.length; index += 1) {
        const def = CATEGORY_DEFS[index]
        const matched = appEntries.filter(function (app) { return app.category === def.id })
        if (matched.length > 0) appGroups.push({ def: def, apps: matched })
      }

      const sessions = typeof props.useSessions === 'function'
        ? props.useSessions(function (state) { return state })
        : EMPTY_SESSION_STATE
      const statuses = typeof props.useSessionStatus === 'function'
        ? props.useSessionStatus(function (state) { return state })
        : undefined
      const [appsOpen, setAppsOpen] = useState(true)
      const [recentOpen, setRecentOpen] = useState(true)
      const [todos, setTodos] = useState(loadTodos)
      const [todoDraft, setTodoDraft] = useState('')
      const [appCats, setAppCats] = useState(function () { return loadCategories(APP_CATS_KEY) })
      const [appAssign, setAppAssign] = useState(function () { return loadAssignments(APP_ASSIGN_KEY) })
      const [appCatDraft, setAppCatDraft] = useState('')
      const [sessionCats, setSessionCats] = useState(function () { return loadCategories(SESSION_CATS_KEY) })
      const [sessionAssign, setSessionAssign] = useState(function () { return loadAssignments(SESSION_ASSIGN_KEY) })
      const [sessionCatDraft, setSessionCatDraft] = useState('')
      const [bookmarks, setBookmarks] = useState(loadBookmarks)
      const [webQuery, setWebQuery] = useState('')
      const [searchEngine, setSearchEngine] = useState(loadSearchEngine)
      const [dragOver, setDragOver] = useState('')
      const [background, setBackground] = useState(loadBackground)
      const [bgOpen, setBgOpen] = useState(false)

      useEffect(function () { saveTodos(todos) }, [todos])
      useEffect(function () { saveCategories(APP_CATS_KEY, appCats) }, [appCats])
      useEffect(function () { saveAssignments(APP_ASSIGN_KEY, appAssign) }, [appAssign])
      useEffect(function () { saveCategories(SESSION_CATS_KEY, sessionCats) }, [sessionCats])
      useEffect(function () { saveAssignments(SESSION_ASSIGN_KEY, sessionAssign) }, [sessionAssign])
      useEffect(function () { saveBookmarks(bookmarks) }, [bookmarks])
      useEffect(function () { saveSearchEngine(searchEngine) }, [searchEngine])
      useEffect(function () { saveBackground(background) }, [background])

      const [query, setQuery] = useState('')
      const [notice, setNotice] = useState(null)

      useEffect(function () {
        if (!notice) return undefined
        const timer = window.setTimeout(function () { setNotice(null) }, 2800)
        return function () { window.clearTimeout(timer) }
      }, [notice])

      const rows = useMemo(function () {
        const base = sessionRowsOf(sessions)
        if (!statuses || typeof statuses.get !== 'function') return base
        return base.map(function (row) {
          if (row.running) return row
          let status
          try { status = statuses.get(row.id) } catch (error) { status = undefined }
          return status && status.running ? { id: row.id, title: row.title, running: true } : row
        })
      }, [sessions, statuses])

      const total = rows.length
      const running = useMemo(function () {
        return rows.reduce(function (count, row) { return count + (row.running ? 1 : 0) }, 0)
      }, [rows])

      const visible = useMemo(function () {
        const needle = query.trim().toLowerCase()
        const matched = needle === ''
          ? rows
          : rows.filter(function (row) { return row.title.toLowerCase().indexOf(needle) !== -1 })
        return matched.slice(0, RECENT_LIMIT)
      }, [rows, query])

      function showNotice(key) {
        setNotice({ id: Date.now() + ':' + Math.random(), text: t(key) })
      }

      function handleNewSession() {
        const result = runAction('newSession')
        if (result !== 'ok') showNotice('noticeActionUnavailable')
      }

      function handleOpenSession(sessionId) {
        const result = runAction('openSession', sessionId)
        if (result !== 'ok') showNotice('noticeActionUnavailable')
      }

      function handleOpenPanel(panelId) {
        const result = runAction('panel', panelId)
        if (result !== 'ok') showNotice('noticePanelMissing')
      }

      function addTodo(event) {
        if (event) event.preventDefault()
        const title = todoDraft.trim().slice(0, TODO_MAX_LENGTH)
        if (title === '') return
        const item = { id: newId('todo'), title: title, done: false }
        setTodos(function (list) { return [item].concat(list) })
        setTodoDraft('')
      }

      function toggleTodo(todoId) {
        setTodos(function (list) {
          return list.map(function (item) {
            return item.id === todoId ? { id: item.id, title: item.title, done: !item.done } : item
          })
        })
      }

      function removeTodo(todoId) {
        setTodos(function (list) {
          return list.filter(function (item) { return item.id !== todoId })
        })
      }

      function currentSessionId() {
        const byId = sessions !== null && sessions !== undefined && sessions.byId ? sessions.byId : {}
        const ids = sessions !== null && sessions !== undefined && Array.isArray(sessions.ids)
          ? sessions.ids
          : Object.keys(byId)
        let fallback = ''
        let best = ''
        let bestScore = -1
        for (let index = 0; index < ids.length; index += 1) {
          const id = ids[index]
          if (typeof id !== 'string' || id === '') continue
          const view = byId[id] || {}
          if (fallback === '') fallback = id
          const retained = view.retainedBy || {}
          let score = 0
          if (retained.mainView > 0) score += 10
          for (const key in retained) {
            if (typeof retained[key] === 'number' && retained[key] > 0) score += 1
          }
          if (score > bestScore) {
            bestScore = score
            best = id
          }
        }
        return best || fallback
      }

      function addBookmark(url, title) {
        const entry = { url: url, title: title || url }
        const next = [entry]
        for (let index = 0; index < bookmarks.length; index += 1) {
          if (bookmarks[index].url !== url) next.push(bookmarks[index])
        }
        const trimmed = next.slice(0, MAX_BOOKMARKS)
        // Write before a possible navigation away from the workbench.
        saveBookmarks(trimmed)
        setBookmarks(trimmed)
      }

      function removeBookmark(url) {
        setBookmarks(function (list) {
          return list.filter(function (item) { return item.url !== url })
        })
      }

      function openUrl(url, title) {
        addBookmark(url, title)
        const api = typeof globalThis !== 'undefined' ? globalThis.__dshBuiltinBrowser : undefined
        const sessionId = currentSessionId()
        if (api && typeof api.openPanel === 'function' && sessionId !== '') {
          let result = null
          try { result = api.openPanel(sessionId, url) } catch (error) { result = null }
          if (result && result.ok === true) {
            try {
              const workspace = service('uiWorkspace')
              if (workspace && typeof workspace.openSession === 'function') workspace.openSession(sessionId)
            } catch (error) {
              // The browser tab is open even if revealing the session failed.
            }
            return true
          }
        }
        try {
          if (typeof window !== 'undefined' && typeof window.open === 'function') {
            const opened = window.open(url, '_blank', 'noopener,noreferrer')
            if (opened) return true
          }
        } catch (error) {
          // Fall through to the notice.
        }
        showNotice('noticeBrowserUnavailable')
        return false
      }

      function handleWebSearch(event) {
        if (event) event.preventDefault()
        const raw = webQuery.trim()
        if (raw === '') return
        let url = raw
        if (!/^https?:\/\//i.test(url)) {
          if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(raw) && raw.indexOf(' ') === -1) {
            url = 'https://' + raw
          } else {
            let engine = SEARCH_ENGINES[0]
            for (let index = 0; index < SEARCH_ENGINES.length; index += 1) {
              if (SEARCH_ENGINES[index].id === searchEngine) {
                engine = SEARCH_ENGINES[index]
                break
              }
            }
            url = engine.url + encodeURIComponent(raw)
          }
        }
        if (openUrl(url, raw)) setWebQuery('')
      }

      function addAppCategory(event) {
        if (event) event.preventDefault()
        const name = appCatDraft.trim().slice(0, CATEGORY_MAX_LENGTH)
        if (name === '' || appCats.length >= MAX_CATEGORIES) return
        setAppCats(function (list) { return list.concat([{ id: newId('appcat'), name: name }]) })
        setAppCatDraft('')
      }

      function removeAppCategory(categoryId) {
        setAppCats(function (list) {
          return list.filter(function (item) { return item.id !== categoryId })
        })
        setAppAssign(function (map) {
          const next = {}
          for (const itemId in map) {
            if (map[itemId] !== categoryId) next[itemId] = map[itemId]
          }
          return next
        })
      }

      function addSessionCategory(event) {
        if (event) event.preventDefault()
        const name = sessionCatDraft.trim().slice(0, CATEGORY_MAX_LENGTH)
        if (name === '' || sessionCats.length >= MAX_CATEGORIES) return
        setSessionCats(function (list) { return list.concat([{ id: newId('sesscat'), name: name }]) })
        setSessionCatDraft('')
      }

      function removeSessionCategory(categoryId) {
        setSessionCats(function (list) {
          return list.filter(function (item) { return item.id !== categoryId })
        })
        setSessionAssign(function (map) {
          const next = {}
          for (const itemId in map) {
            if (map[itemId] !== categoryId) next[itemId] = map[itemId]
          }
          return next
        })
      }

      function readDrag(event) {
        try {
          const raw = event.dataTransfer ? event.dataTransfer.getData('text/plain') : ''
          const data = raw ? JSON.parse(raw) : null
          if (data && (data.kind === 'app' || data.kind === 'session') && typeof data.id === 'string') return data
        } catch (error) {
          return null
        }
        return null
      }

      function startDrag(event, kind, id) {
        try {
          if (event.dataTransfer) {
            event.dataTransfer.setData('text/plain', JSON.stringify({ kind: kind, id: id }))
            event.dataTransfer.effectAllowed = 'move'
          }
        } catch (error) {
          // Dragging still works without the custom payload in some shells.
        }
      }

      function dragOverCategory(event, key) {
        event.preventDefault()
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
        if (dragOver !== key) setDragOver(key)
      }

      function dropApp(event, categoryId) {
        event.preventDefault()
        setDragOver('')
        const data = readDrag(event)
        if (!data || data.kind !== 'app') return
        setAppAssign(function (map) {
          const next = {}
          for (const itemId in map) next[itemId] = map[itemId]
          if (categoryId) next[data.id] = categoryId
          else delete next[data.id]
          return next
        })
      }

      function dropSession(event, categoryId) {
        event.preventDefault()
        setDragOver('')
        const data = readDrag(event)
        if (!data || data.kind !== 'session') return
        setSessionAssign(function (map) {
          const next = {}
          for (const itemId in map) next[itemId] = map[itemId]
          if (categoryId) next[data.id] = categoryId
          else delete next[data.id]
          return next
        })
      }

      function handleBackgroundFile(event) {
        const input = event && event.target ? event.target : null
        const file = input && input.files ? input.files[0] : null
        if (input) input.value = ''
        if (!file) return
        if (!/^image\//.test(String(file.type || ''))) {
          showNotice('noticeBgType')
          return
        }
        if (file.size > BACKGROUND_MAX_BYTES) {
          showNotice('noticeBgSize')
          return
        }
        try {
          const reader = new FileReader()
          reader.onload = function () {
            if (typeof reader.result === 'string') {
              setBackground(reader.result)
              setBgOpen(false)
            } else {
              showNotice('noticeBgRead')
            }
          }
          reader.onerror = function () { showNotice('noticeBgRead') }
          reader.readAsDataURL(file)
        } catch (error) {
          showNotice('noticeBgRead')
        }
      }

      const search = h('input', {
        key: 'search',
        type: 'search',
        className: 'dswb-search',
        value: query,
        placeholder: t('search'),
        'aria-label': t('search'),
        autoComplete: 'off',
        spellCheck: false,
        onChange: function (event) { setQuery(event.target.value) },
      })

      const list = visible.length === 0
        ? h('div', { key: 'empty', className: 'dswb-empty' },
            h('p', { key: 'title', className: 'dswb-emptyTitle', }, query.trim() !== '' ? t('noMatch') : t('emptyTitle')),
            query.trim() !== ''
              ? null
              : h('p', { key: 'hint', className: 'dswb-emptyHint' }, t('emptyHint')),
            query.trim() !== ''
              ? null
              : h('button', {
                  key: 'action',
                  type: 'button',
                  className: 'dswb-primary dswb-primarySmall',
                  onClick: handleNewSession,
                }, h(IconPlus, { key: 'icon', size: 14 }), h('span', { key: 'text' }, t('newSession')))
          )
        : visible.map(function (row) {
            return h('button', {
              key: row.id,
              type: 'button',
              className: 'dswb-row',
              title: row.title,
              onClick: function () { handleOpenSession(row.id) },
            },
              h('span', { key: 'dot', className: row.running ? 'dswb-dot is-on' : 'dswb-dot', 'aria-hidden': true }),
              h('span', { key: 'title', className: 'dswb-rowTitle' }, row.title),
              row.running
                ? h('span', { key: 'state', className: 'dswb-rowState' }, t('running'))
                : null,
              h('span', { key: 'chevron', className: 'dswb-chevron' }, h(IconChevron, { size: 14 }))
            )
          })

      const renderAppCard = function (app, fallbackIcon, fallbackDescription) {
        const description = app.description || fallbackDescription
        let icon = null
        if (renderSlot) {
          try {
            icon = renderSlot(
              app.source === 'sidebar' ? 'sidebar.panellist' : 'workbench.apps',
              { size: 22, active: true },
              { only: app.id },
            )
          } catch (error) {
            icon = null
          }
        }
        if (!icon) icon = h(fallbackIcon, { size: 22 })
        return h('button', {
          key: app.id,
          type: 'button',
          className: 'dswb-app',
          draggable: true,
          onDragStart: function (event) { startDrag(event, 'app', app.id) },
          title: app.label + ' — ' + description,
          'aria-label': app.label + ' — ' + description,
          onClick: function () { handleOpenPanel(app.id) },
        },
          h('span', { key: 'icon', className: 'dswb-appIcon' }, icon),
          h('span', { key: 'copy', className: 'dswb-appCopy' },
            h('span', { key: 'title', className: 'dswb-appTitle' }, app.label),
            h('span', { key: 'desc', className: 'dswb-appDesc' }, description)
          ),
          h('span', { key: 'chevron', className: 'dswb-chevron' }, h(IconChevron, { size: 14 }))
        )
      }

      const validAppCatIds = {}
      appCats.forEach(function (cat) { validAppCatIds[cat.id] = true })
      const appCategoryOf = function (appId) {
        const catId = appAssign[appId]
        return typeof catId === 'string' && validAppCatIds[catId] === true ? catId : ''
      }
      const hasAppAssignments = appEntries.some(function (app) { return appCategoryOf(app.id) !== '' })
      const customAppGroups = appCats.map(function (cat) {
        return {
          id: cat.id,
          name: cat.name,
          apps: appEntries.filter(function (app) { return appCategoryOf(app.id) === cat.id }),
        }
      })
      const autoAppGroups = appGroups.map(function (group) {
        return {
          def: group.def,
          apps: group.apps.filter(function (app) { return appCategoryOf(app.id) === '' }),
        }
      }).filter(function (group) { return group.apps.length > 0 })

      const appCreateRow = h('form', { key: 'app-create', className: 'dswb-catCreate', onSubmit: addAppCategory },
        h('input', {
          key: 'input',
          type: 'text',
          className: 'dswb-addInput',
          value: appCatDraft,
          placeholder: t('categoryPlaceholder'),
          'aria-label': t('categoryPlaceholder'),
          maxLength: CATEGORY_MAX_LENGTH,
          onChange: function (event) { setAppCatDraft(event.target.value) },
        }),
        h('button', { key: 'add', type: 'submit', className: 'dswb-bgButton' }, t('categoryAdd'))
      )

      const appAutoZone = h('div', {
        key: 'app-auto-zone',
        className: dragOver === 'appcat:' ? 'dswb-dropZone is-over' : 'dswb-dropZone',
        onDragOver: function (event) { dragOverCategory(event, 'appcat:') },
        onDragLeave: function () { setDragOver('') },
        onDrop: function (event) { dropApp(event, null) },
      }, t('appAutoZone'))

      const customAppNodes = customAppGroups.map(function (cat) {
        const active = dragOver === 'appcat:' + cat.id
        return h('div', {
          key: 'appcat-' + cat.id,
          className: active ? 'dswb-cat is-over' : 'dswb-cat',
          onDragOver: function (event) { dragOverCategory(event, 'appcat:' + cat.id) },
          onDragLeave: function () { setDragOver('') },
          onDrop: function (event) { dropApp(event, cat.id) },
        },
          h('div', { key: 'head', className: 'dswb-catHead' },
            h('span', { key: 'glyph', className: 'dswb-catGlyph' }, h(IconGrid, { size: 14 })),
            h('h3', { key: 'title', className: 'dswb-catTitle' }, cat.name),
            h('span', { key: 'count', className: 'dswb-catCount' }, String(cat.apps.length)),
            h('span', { key: 'desc', className: 'dswb-catDesc' }, t('categoryCustomDesc')),
            h('button', {
              key: 'delete',
              type: 'button',
              className: 'dswb-groupDelete',
              title: t('categoryDelete'),
              'aria-label': t('categoryDelete'),
              onClick: function () { removeAppCategory(cat.id) },
            }, h(IconX, { size: 11 }))
          ),
          cat.apps.length > 0
            ? h('div', { key: 'grid', className: 'dswb-appGrid' },
                cat.apps.map(function (app) {
                  return renderAppCard(app, IconGrid, t('categoryCustomDesc'))
                })
              )
            : h('div', { key: 'drop', className: 'dswb-dropHint' }, t('dropHere'))
        )
      })

      const autoAppNodes = autoAppGroups.map(function (group) {
        return h('div', { key: group.def.id, className: 'dswb-cat' },
          h('div', { key: 'head', className: 'dswb-catHead' },
            h('span', { key: 'glyph', className: 'dswb-catGlyph' }, h(group.def.icon, { size: 14 })),
            h('h3', { key: 'title', className: 'dswb-catTitle' }, t(group.def.titleKey)),
            h('span', { key: 'count', className: 'dswb-catCount' }, String(group.apps.length)),
            h('span', { key: 'desc', className: 'dswb-catDesc' }, t(group.def.descKey))
          ),
          h('div', { key: 'grid', className: 'dswb-appGrid' },
            group.apps.map(function (app) {
              return renderAppCard(app, group.def.icon, t(group.def.descKey))
            })
          )
        )
      })

      const appsBody = appEntries.length === 0
        ? [
            appCreateRow,
            h('div', { key: 'empty', className: 'dswb-empty dswb-appsEmpty' },
              h('p', { key: 'title', className: 'dswb-emptyTitle' }, t('appsEmpty')),
              h('p', { key: 'hint', className: 'dswb-emptyHint' }, t('appsEmptyHint'))
            ),
          ]
        : [appCreateRow]
          .concat(hasAppAssignments ? [appAutoZone] : [])
          .concat(customAppNodes)
          .concat(autoAppNodes)

      const appsNode = h('section', { key: 'apps', className: 'dswb-apps', 'aria-label': t('apps') },
        h('div', { key: 'head', className: 'dswb-sectionHead' },
          h('h2', { key: 'title', className: 'dswb-sectionTitle' },
            h('button', {
              key: 'toggle',
              type: 'button',
              className: 'dswb-sectionToggle',
              'aria-expanded': appsOpen,
              'aria-controls': 'dswb-apps-body',
              onClick: function () { setAppsOpen(function (open) { return !open }) },
            },
              h('span', { key: 'label', className: 'dswb-sectionLabel' }, t('apps')),
              h('span', { key: 'hint', className: 'dswb-sectionHint' }, t('appsHint')),
              h('span', { key: 'chevron', className: appsOpen ? 'dswb-toggleChevron is-open' : 'dswb-toggleChevron' },
                h(IconChevron, { size: 14 }))
            )
          )
        ),
        appsOpen
          ? h('div', { key: 'body', id: 'dswb-apps-body', className: 'dswb-appsBody' }, appsBody)
          : null
      )

      const webNode = h('section', { key: 'web', className: 'dswb-card dswb-webCard', 'aria-label': t('webSearch') },
        h('div', { key: 'head', className: 'dswb-cardHead dswb-webHead' },
          h('div', { key: 'copy', className: 'dswb-webHeadCopy' },
            h('h2', { key: 'title', className: 'dswb-cardTitle' },
              h('span', { key: 'label', className: 'dswb-sectionLabel' }, t('webSearch'))
            ),
            h('span', { key: 'hint', className: 'dswb-sectionHint' }, t('webSearchHint'))
          ),
          h('div', { key: 'engines', className: 'dswb-engines', role: 'group', 'aria-label': t('webSearchEngine') },
            SEARCH_ENGINES.map(function (engine) {
              const active = searchEngine === engine.id
              return h('button', {
                key: engine.id,
                type: 'button',
                className: active ? 'dswb-engine is-active' : 'dswb-engine',
                'aria-pressed': active,
                title: t(engine.labelKey),
                'aria-label': t(engine.labelKey),
                onClick: function () { setSearchEngine(engine.id) },
              }, t(engine.labelKey))
            })
          )
        ),
        h('form', { key: 'form', className: 'dswb-webForm', onSubmit: handleWebSearch },
          h('input', {
            key: 'input',
            type: 'search',
            className: 'dswb-webInput',
            value: webQuery,
            placeholder: t('webSearchPlaceholder'),
            'aria-label': t('webSearchPlaceholder'),
            onChange: function (event) { setWebQuery(event.target.value) },
          }),
          h('button', { key: 'go', type: 'submit', className: 'dswb-primary dswb-primarySmall' },
            h(IconSearch, { key: 'icon', size: 14 }),
            h('span', { key: 'text' }, t('webSearchButton'))
          )
        ),
        h('div', { key: 'bookmarks', className: 'dswb-bookmarks' },
          h('div', { key: 'bhead', className: 'dswb-bookmarksHead' }, t('recentBookmarks')),
          bookmarks.length === 0
            ? h('p', { key: 'empty', className: 'dswb-bookmarksEmpty' }, t('bookmarksEmpty'))
            : bookmarks.map(function (item) {
                return h('div', { key: item.url, className: 'dswb-bookmark' },
                  h('button', {
                    key: 'open',
                    type: 'button',
                    className: 'dswb-bookmarkOpen',
                    title: item.url,
                    onClick: function () { openUrl(item.url, item.title) },
                  },
                    h('span', { key: 'title', className: 'dswb-bookmarkTitle' }, item.title),
                    h('span', { key: 'url', className: 'dswb-bookmarkUrl' }, item.url)
                  ),
                  h('button', {
                    key: 'delete',
                    type: 'button',
                    className: 'dswb-bookmarkDelete',
                    title: t('bookmarkDelete'),
                    'aria-label': t('bookmarkDelete'),
                    onClick: function () { removeBookmark(item.url) },
                  }, h(IconX, { size: 11 }))
                )
              })
        )
      )

      const doneCount = todos.reduce(function (count, item) { return count + (item.done ? 1 : 0) }, 0)

      const todosNode = h('section', { key: 'todos', className: 'dswb-card dswb-modulesCard', 'aria-label': t('modules') },
        h('div', { key: 'head', className: 'dswb-cardHead dswb-modulesHead' },
          h('h2', { key: 'title', className: 'dswb-cardTitle' },
            h('span', { key: 'text', className: 'dswb-sectionLabel' }, t('modules')),
            h('span', { key: 'count', className: 'dswb-count' }, doneCount + '/' + todos.length)
          ),
          h('form', { key: 'add', className: 'dswb-addForm', onSubmit: addTodo },
            h('input', {
              key: 'input',
              type: 'text',
              className: 'dswb-addInput',
              value: todoDraft,
              placeholder: t('modulePlaceholder'),
              'aria-label': t('modulePlaceholder'),
              maxLength: TODO_MAX_LENGTH,
              onChange: function (event) { setTodoDraft(event.target.value) },
            }),
            h('button', { key: 'submit', type: 'submit', className: 'dswb-primary dswb-primarySmall' },
              h(IconPlus, { key: 'icon', size: 13 }),
              h('span', { key: 'text' }, t('moduleAdd'))
            )
          )
        ),
        todos.length === 0
          ? h('div', { key: 'empty', className: 'dswb-modulesEmpty' }, t('moduleEmpty'))
          : h('div', { key: 'grid', className: 'dswb-modulesBody' },
              todos.map(function (item) {
                return h('div', {
                  key: item.id,
                  className: item.done ? 'dswb-module is-done' : 'dswb-module',
                  role: 'button',
                  tabIndex: 0,
                  'aria-pressed': item.done,
                  title: item.done ? t('moduleUndo') : t('moduleDone'),
                  onClick: function () { toggleTodo(item.id) },
                  onKeyDown: function (event) {
                    if (event.target !== event.currentTarget) return
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      toggleTodo(item.id)
                    }
                  },
                },
                  h('span', { key: 'check', className: 'dswb-moduleCheck', 'aria-hidden': true },
                    item.done ? h(IconCheck, { size: 14 }) : null),
                  h('span', { key: 'body', className: 'dswb-moduleBody' },
                    h('span', { key: 'title', className: 'dswb-moduleTitle' }, item.title),
                    item.done ? h('span', { key: 'state', className: 'dswb-moduleState' }, t('moduleDoneBadge')) : null
                  ),
                  h('button', {
                    key: 'delete',
                    type: 'button',
                    className: 'dswb-moduleDelete',
                    title: t('moduleDelete'),
                    'aria-label': t('moduleDelete'),
                    onClick: function (event) {
                      event.stopPropagation()
                      removeTodo(item.id)
                    },
                  }, h(IconX, { size: 12 }))
                )
              })
            )
      )

      const renderSessionRow = function (row) {
        return h('button', {
          key: row.id,
          type: 'button',
          className: 'dswb-row',
          draggable: true,
          onDragStart: function (event) { startDrag(event, 'session', row.id) },
          title: row.title,
          onClick: function () { handleOpenSession(row.id) },
        },
          h('span', { key: 'dot', className: row.running ? 'dswb-dot is-on' : 'dswb-dot', 'aria-hidden': true }),
          h('span', { key: 'title', className: 'dswb-rowTitle' }, row.title),
          row.running
            ? h('span', { key: 'state', className: 'dswb-rowState' }, t('running'))
            : null,
          h('span', { key: 'chevron', className: 'dswb-chevron' }, h(IconChevron, { size: 14 }))
        )
      }

      const validSessionCatIds = {}
      sessionCats.forEach(function (cat) { validSessionCatIds[cat.id] = true })
      const sessionCategoryOf = function (sessionId) {
        const catId = sessionAssign[sessionId]
        return typeof catId === 'string' && validSessionCatIds[catId] === true ? catId : ''
      }

      const sessionCreateRow = h('form', { key: 'sess-create', className: 'dswb-catCreate', onSubmit: addSessionCategory },
        h('input', {
          key: 'input',
          type: 'text',
          className: 'dswb-addInput',
          value: sessionCatDraft,
          placeholder: t('categoryPlaceholder'),
          'aria-label': t('categoryPlaceholder'),
          maxLength: CATEGORY_MAX_LENGTH,
          onChange: function (event) { setSessionCatDraft(event.target.value) },
        }),
        h('button', { key: 'add', type: 'submit', className: 'dswb-bgButton' }, t('categoryAdd')),
        h('span', { key: 'hint', className: 'dswb-catHint' }, t('dragSessionsHint'))
      )

      const renderSessionGroup = function (id, title, rows, dropCategoryId) {
        const dropKey = 'sesscat:' + (dropCategoryId || 'none')
        const active = dragOver === dropKey
        return h('div', {
          key: 'sessgroup-' + id,
          className: active ? 'dswb-sessionGroup is-over' : 'dswb-sessionGroup',
          onDragOver: function (event) { dragOverCategory(event, dropKey) },
          onDragLeave: function () { setDragOver('') },
          onDrop: function (event) { dropSession(event, dropCategoryId) },
        },
          h('div', { key: 'head', className: 'dswb-sessionGroupHead' },
            h('span', { key: 'title', className: 'dswb-sessionGroupTitle' }, title),
            h('span', { key: 'count', className: 'dswb-groupCount' }, String(rows.length)),
            dropCategoryId
              ? h('button', {
                  key: 'delete',
                  type: 'button',
                  className: 'dswb-groupDelete',
                  title: t('categoryDelete'),
                  'aria-label': t('categoryDelete'),
                  onClick: function () { removeSessionCategory(dropCategoryId) },
                }, h(IconX, { size: 11 }))
              : null
          ),
          rows.length > 0
            ? rows.map(renderSessionRow)
            : h('div', { key: 'drop', className: 'dswb-dropHint' }, t('dropHere'))
        )
      }

      const customSessionNodes = sessionCats.map(function (cat) {
        return renderSessionGroup(
          cat.id,
          cat.name,
          visible.filter(function (row) { return sessionCategoryOf(row.id) === cat.id }),
          cat.id,
        )
      })
      const unclassifiedSessions = visible.filter(function (row) { return sessionCategoryOf(row.id) === '' })
      const unclassifiedNode = renderSessionGroup('none', t('unclassified'), unclassifiedSessions, null)
      const recentContent = visible.length === 0 || sessionCats.length === 0
        ? list
        : h('div', { key: 'groups', className: 'dswb-sessionGroups' }, customSessionNodes.concat([unclassifiedNode]))

      const recentBody = h('div', { key: 'body', id: 'dswb-recent-body', className: 'dswb-recentBody' },
        sessionCreateRow,
        recentContent
      )

      const recentNode = h('section', { key: 'recent', className: 'dswb-card', 'aria-label': t('recent') },
        h('div', { key: 'head', className: 'dswb-cardHead' },
          h('h2', { key: 'title', className: 'dswb-cardTitle' },
            h('button', {
              key: 'toggle',
              type: 'button',
              className: 'dswb-sectionToggle',
              'aria-expanded': recentOpen,
              'aria-controls': 'dswb-recent-body',
              onClick: function () { setRecentOpen(function (open) { return !open }) },
            },
              h('span', { key: 'text', className: 'dswb-sectionLabel' }, t('recent')),
              h('span', { key: 'count', className: 'dswb-count' }, String(total)),
              h('span', { key: 'chevron', className: recentOpen ? 'dswb-toggleChevron is-open' : 'dswb-toggleChevron' },
                h(IconChevron, { size: 14 }))
            )
          ),
          recentOpen ? search : null
        ),
        recentOpen ? recentBody : null
      )

      const bgBar = h('div', { key: 'bgbar', id: 'dswb-bg-settings', className: 'dswb-bgBar' },
        h('span', { key: 'label', className: 'dswb-bgLabel' }, t('backgroundLabel')),
        h('label', {
          key: 'choose',
          htmlFor: 'dswb-bg-file',
          className: 'dswb-bgButton',
          tabIndex: 0,
          role: 'button',
          onKeyDown: function (event) {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault()
              try {
                const input = typeof document !== 'undefined' ? document.getElementById('dswb-bg-file') : null
                if (input) input.click()
              } catch (error) {
                // The native picker is optional; the click path still works.
              }
            }
          },
        },
          h(IconImage, { key: 'icon', size: 14 }),
          h('span', { key: 'text' }, t('backgroundChoose'))
        ),
        h('input', {
          key: 'file',
          id: 'dswb-bg-file',
          type: 'file',
          accept: 'image/*',
          className: 'dswb-fileInput',
          onChange: handleBackgroundFile,
        }),
        background
          ? h('button', { key: 'clear', type: 'button', className: 'dswb-bgButton', onClick: function () { setBackground('') } }, t('backgroundClear'))
          : null,
        h('span', { key: 'state', className: 'dswb-bgHint' }, background ? t('backgroundSet') : t('backgroundNone')),
        h('span', { key: 'hint', className: 'dswb-bgHint' }, t('backgroundHint'))
      )

      const rootStyle = background
        ? {
            backgroundColor: 'var(--dsw-alias-bg-base)',
            backgroundImage: 'linear-gradient(color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent), color-mix(in srgb, var(--dsw-alias-bg-base) 88%, transparent)), url("' + String(background).replace(/"/g, '\\"') + '")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'local',
          }
        : undefined

      return h('div', { className: 'dswb-root', style: rootStyle, role: 'region', 'aria-label': t('panel') },
        h('style', { key: 'style' }, CSS),
        h('div', { key: 'inner', className: 'dswb-inner' },
          h('header', { key: 'hero', className: 'dswb-hero' },
            h('div', { key: 'main', className: 'dswb-heroMain' },
              h('div', { key: 'eyebrow', className: 'dswb-eyebrow' }, t('eyebrow')),
              h('h1', { key: 'title', className: 'dswb-title' }, t(greetingKey(now))),
              h('p', { key: 'meta', className: 'dswb-meta' },
                h('span', { key: 'date' }, formatDate(now, active)),
                h('span', { key: 'sep', className: 'dswb-metaSep', 'aria-hidden': true }, '·'),
                h('span', { key: 'time', className: 'dswb-metaTime' }, formatTime(now, active))
              ),
              h('div', { key: 'chips', className: 'dswb-chips' },
                h('span', { key: 'sessions', className: 'dswb-chip' },
                  h('span', { key: 'num', className: 'dswb-chipNum' }, String(total)),
                  h('span', { key: 'label' }, t('chipSessions'))
                ),
                h('span', { key: 'running', className: running > 0 ? 'dswb-chip is-running' : 'dswb-chip' },
                  h('span', { key: 'dot', className: running > 0 ? 'dswb-dot is-on' : 'dswb-dot', 'aria-hidden': true }),
                  h('span', { key: 'num', className: 'dswb-chipNum' }, String(running)),
                  h('span', { key: 'label' }, t('chipRunning'))
                )
              )
            ),
            h('div', { key: 'action', className: 'dswb-heroAction' },
              h('div', { key: 'buttons', className: 'dswb-heroActions' },
                h('button', {
                  key: 'bg',
                  type: 'button',
                  className: 'dswb-ghost',
                  title: t('background'),
                  'aria-label': t('background'),
                  'aria-expanded': bgOpen,
                  'aria-controls': 'dswb-bg-settings',
                  onClick: function () { setBgOpen(function (open) { return !open }) },
                }, h(IconImage, { size: 17 })),
                h('button', { key: 'new', type: 'button', className: 'dswb-primary', onClick: handleNewSession },
                  h(IconPlus, { key: 'icon', size: 15 }),
                  h('span', { key: 'text' }, t('newSession'))
                )
              )
            )
          ),
          bgOpen ? bgBar : null,
          webNode,
          todosNode,
          appsNode,
          recentNode,
          h('p', { key: 'foot', className: 'dswb-foot' }, t('footNote')),
          notice
            ? h('div', { key: 'notice', className: 'dswb-toast', role: 'status', 'aria-live': 'polite' }, notice.text)
            : null
        )
      )
    }

    // ------------------------------------------------------------------
    // Styles (component-local: removed with the panel on unmount)
    // ------------------------------------------------------------------

    const CSS = [
      '.dswb-root{height:100%;overflow:auto;box-sizing:border-box;padding:28px 24px 56px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-size:14px;line-height:1.55}',
      '.dswb-inner{max-width:940px;margin:0 auto;display:flex;flex-direction:column;gap:18px}',
      '.dswb-hero{position:relative;overflow:hidden;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:26px 28px;border:1px solid var(--dsw-alias-border-l1);border-radius:18px;background:linear-gradient(135deg,color-mix(in srgb,var(--dsw-alias-brand-primary) 15%,var(--dsw-alias-bg-layer-1)),var(--dsw-alias-bg-layer-1) 62%)}',
      '.dswb-hero:after{content:"";position:absolute;right:-70px;top:-90px;width:230px;height:230px;border-radius:50%;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);pointer-events:none}',
      '.dswb-heroMain{position:relative;z-index:1;min-width:0}',
      '.dswb-heroAction{position:relative;z-index:1;flex:none;padding-bottom:4px}',
      '.dswb-heroActions{display:flex;align-items:center;gap:10px}',
      '.dswb-ghost{display:inline-flex;align-items:center;justify-content:center;width:38px;height:38px;padding:0;border:1px solid var(--dswb-alias-border-l1);border-radius:10px;background:var(--dswb-alias-bg-layer-1);color:var(--dswb-alias-label-secondary);cursor:pointer;transition:border-color .15s ease,color .15s ease,background .15s ease}',
      '.dswb-ghost:hover{border-color:color-mix(in srgb,var(--dswb-alias-brand-primary) 45%,var(--dswb-alias-border-l1));color:var(--dswb-alias-label-primary);background:var(--dswb-alias-bg-layer-2)}',
      '.dswb-ghost:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:2px}',
      '.dswb-bgBar{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:10px 16px;border:1px solid var(--dswb-alias-border-l1);border-radius:12px;background:var(--dswb-alias-bg-layer-1);font-size:12px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-bgLabel{font-weight:600;color:var(--dswb-alias-label-primary)}',
      '.dswb-bgButton{display:inline-flex;align-items:center;gap:6px;padding:5px 10px;border:1px solid var(--dswb-alias-border-l1);border-radius:8px;background:var(--dswb-alias-bg-base);color:var(--dswb-alias-label-primary);font-family:inherit;font-size:12px;cursor:pointer;transition:border-color .15s ease,background .15s ease}',
      '.dswb-bgButton:hover{border-color:color-mix(in srgb,var(--dswb-alias-brand-primary) 45%,var(--dswb-alias-border-l1));background:var(--dswb-alias-bg-layer-2)}',
      '.dswb-bgButton:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:2px}',
      '.dswb-fileInput{display:none}',
      '.dswb-bgHint{font-size:11.5px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-eyebrow{font-size:11px;font-weight:650;letter-spacing:.16em;text-transform:uppercase;color:var(--dsw-alias-label-secondary)}',
      '.dswb-title{margin:8px 0 6px;font-size:30px;line-height:1.15;font-weight:650;letter-spacing:-.015em}',
      '.dswb-meta{display:flex;align-items:center;flex-wrap:wrap;gap:7px;margin:0;font-size:12.5px;color:var(--dsw-alias-label-secondary);font-variant-numeric:tabular-nums}',
      '.dswb-metaSep{opacity:.6}',
      '.dswb-metaTime{font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.dswb-chips{display:flex;align-items:center;flex-wrap:wrap;gap:8px;margin-top:16px}',
      '.dswb-chip{display:inline-flex;align-items:center;gap:6px;padding:4px 11px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);background:color-mix(in srgb,var(--dsw-alias-bg-base) 55%,transparent);font-size:12px;color:var(--dsw-alias-label-secondary)}',
      '.dswb-chipNum{font-weight:650;color:var(--dsw-alias-label-primary);font-variant-numeric:tabular-nums}',
      '.dswb-chip.is-running{border-color:color-mix(in srgb,var(--dsw-alias-state-success-primary) 42%,var(--dsw-alias-border-l1))}',
      '.dswb-dot{display:inline-block;width:6px;height:6px;border-radius:50%;background:var(--dsw-alias-state-idle-primary);flex:none}',
      '.dswb-dot.is-on{background:var(--dsw-alias-state-success-primary);animation:dswb-pulse 1.9s ease-in-out infinite}',
      '@keyframes dswb-pulse{0%,100%{box-shadow:0 0 0 0 color-mix(in srgb,var(--dsw-alias-state-success-primary) 42%,transparent)}55%{box-shadow:0 0 0 4px color-mix(in srgb,var(--dsw-alias-state-success-primary) 0%,transparent)}}',
      '.dswb-primary{display:inline-flex;align-items:center;gap:8px;padding:10px 18px;border:none;border-radius:10px;background:var(--dsw-alias-label-primary);color:var(--dsw-alias-bg-base);font-family:inherit;font-size:13px;font-weight:600;cursor:pointer;transition:opacity .15s ease,transform .15s ease}',
      '.dswb-primary:hover{opacity:.88}',
      '.dswb-primary:active{transform:translateY(1px)}',
      '.dswb-primary:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dswb-primarySmall{padding:7px 14px;font-size:12.5px}',
      '.dswb-card{border:1px solid var(--dsw-alias-border-l1);border-radius:16px;background:var(--dsw-alias-bg-layer-1);overflow:hidden}',
      '.dswb-cardHead{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 20px;border-bottom:1px solid var(--dsw-alias-border-l1)}',
      '.dswb-cardTitle{display:flex;align-items:center;gap:9px;margin:0;font-size:14px;font-weight:600;letter-spacing:-.005em}',
      '.dswb-modulesHead{flex-wrap:wrap;row-gap:10px}',
      '.dswb-addForm{display:flex;align-items:center;gap:8px;flex:1;justify-content:flex-end;min-width:0}',
      '.dswb-addInput{width:200px;max-width:42vw;box-sizing:border-box;padding:7px 11px;border:1px solid var(--dswb-alias-border-l1);border-radius:9px;background:var(--dswb-alias-bg-base);color:var(--dswb-alias-label-primary);font-family:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease}',
      '.dswb-addInput::placeholder{color:var(--dswb-alias-label-secondary);opacity:.85}',
      '.dswb-addInput:focus-visible{border-color:var(--dswb-alias-brand-primary)}',
      '.dswb-modulesBody{display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:10px;padding:16px 20px}',
      '.dswb-module{position:relative;display:flex;align-items:flex-start;gap:10px;min-height:84px;padding:14px;border:1px solid var(--dswb-alias-border-l1);border-radius:12px;background:var(--dswb-alias-bg-layer-1);cursor:pointer;transition:border-color .15s ease,background .15s ease,transform .15s ease}',
      '.dswb-module:hover{border-color:color-mix(in srgb,var(--dswb-alias-brand-primary) 45%,var(--dswb-alias-border-l1));background:var(--dswb-alias-bg-layer-2)}',
      '.dswb-module:active{transform:translateY(1px)}',
      '.dswb-module:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:2px}',
      '.dswb-module.is-done{background:color-mix(in srgb,var(--dswb-alias-state-success-primary) 8%,var(--dswb-alias-bg-layer-1))}',
      '.dswb-moduleCheck{display:grid;place-items:center;width:20px;height:20px;flex:none;border-radius:6px;border:1px solid var(--dswb-alias-border-l2);color:var(--dswb-alias-brand-primary)}',
      '.dswb-module.is-done .dswb-moduleCheck{background:color-mix(in srgb,var(--dswb-alias-state-success-primary) 18%,transparent);border-color:var(--dswb-alias-state-success-primary);color:var(--dswb-alias-state-success-primary)}',
      '.dswb-moduleBody{display:flex;flex-direction:column;gap:6px;flex:1;min-width:0;padding-right:16px}',
      '.dswb-moduleTitle{font-size:13px;font-weight:600;line-height:1.45;word-break:break-word;color:var(--dswb-alias-label-primary)}',
      '.dswb-module.is-done .dswb-moduleTitle{text-decoration:line-through;color:var(--dswb-alias-label-secondary)}',
      '.dswb-moduleState{align-self:flex-start;padding:1px 7px;border-radius:999px;border:1px solid color-mix(in srgb,var(--dswb-alias-state-success-primary) 40%,var(--dswb-alias-border-l1));color:var(--dswb-alias-state-success-primary);font-size:10px;font-weight:600}',
      '.dswb-moduleDelete{position:absolute;top:6px;right:6px;display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dswb-alias-label-secondary);opacity:.35;cursor:pointer;transition:opacity .15s ease,background .15s ease,color .15s ease}',
      '.dswb-module:hover .dswb-moduleDelete,.dswb-module:focus-within .dswb-moduleDelete{opacity:1}',
      '.dswb-moduleDelete:hover{background:var(--dswb-alias-bg-layer-2);color:var(--dswb-alias-state-error-primary)}',
      '.dswb-moduleDelete:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:1px;opacity:1}',
      '.dswb-modulesEmpty{padding:26px 20px;text-align:center;color:var(--dswb-alias-label-secondary);font-size:12.5px}',
      '.dswb-catCreate{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 20px}',
      '.dswb-apps .dswb-catCreate{padding:0 2px}',
      '.dswb-catCreate .dswb-addInput{width:190px;max-width:50vw}',
      '.dswb-catHint{margin-left:auto;font-size:11px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-groupDelete{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dswb-alias-label-secondary);cursor:pointer;flex:none;transition:background .15s ease,color .15s ease}',
      '.dswb-groupDelete:hover{background:var(--dswb-alias-bg-layer-2);color:var(--dswb-alias-state-error-primary)}',
      '.dswb-groupDelete:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:1px}',
      '.dswb-dropZone{border:1px dashed var(--dswb-alias-border-l2);border-radius:10px;padding:9px 12px;text-align:center;font-size:11.5px;color:var(--dswb-alias-label-secondary);transition:border-color .15s ease,background .15s ease}',
      '.dswb-dropZone.is-over{border-color:var(--dswb-alias-brand-primary);background:color-mix(in srgb,var(--dswb-alias-brand-primary) 8%,transparent);color:var(--dswb-alias-label-primary)}',
      '.dswb-cat{border-radius:10px;outline:1px dashed transparent;outline-offset:4px;transition:background .15s ease,outline-color .15s ease}',
      '.dswb-cat.is-over{outline-color:var(--dswb-alias-brand-primary);background:color-mix(in srgb,var(--dswb-alias-brand-primary) 8%,transparent)}',
      '.dswb-dropHint{border:1px dashed var(--dswb-alias-border-l1);border-radius:8px;padding:10px;margin:2px 0 4px;text-align:center;font-size:11.5px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-sessionGroups{display:flex;flex-direction:column}',
      '.dswb-sessionGroup{transition:background .15s ease}',
      '.dswb-sessionGroup.is-over{background:color-mix(in srgb,var(--dswb-alias-brand-primary) 8%,transparent)}',
      '.dswb-sessionGroup + .dswb-sessionGroup{border-top:1px solid var(--dswb-alias-border-l1)}',
      '.dswb-sessionGroupHead{display:flex;align-items:center;gap:8px;padding:8px 20px 2px;font-size:11.5px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-sessionGroupTitle{font-weight:600;color:var(--dswb-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-groupCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:16px;padding:0 5px;border-radius:999px;border:1px solid var(--dswb-alias-border-l1);font-size:10px;font-weight:500;font-variant-numeric:tabular-nums}',
      '.dswb-recentBody{display:flex;flex-direction:column}',
      '.dswb-webCard{overflow:hidden}',
      '.dswb-webForm{display:flex;align-items:center;gap:10px;padding:14px 20px 0}',
      '.dswb-webHead{align-items:center}',
      '.dswb-webHeadCopy{display:flex;flex-direction:column;gap:3px;min-width:0}',
      '.dswb-engines{display:flex;align-items:center;gap:8px;flex:none}',
      '.dswb-engine{display:inline-flex;align-items:center;justify-content:center;width:48px;height:48px;padding:4px;border:1px solid var(--dswb-alias-border-l1);border-radius:12px;background:var(--dswb-alias-bg-layer-1);color:var(--dswb-alias-label-secondary);font-family:inherit;font-size:10.5px;font-weight:600;line-height:1.2;text-align:center;cursor:pointer;transition:border-color .15s ease,background .15s ease,color .15s ease;word-break:break-word}',
      '.dswb-engine:hover{border-color:color-mix(in srgb,var(--dswb-alias-brand-primary) 45%,var(--dswb-alias-border-l1));background:var(--dswb-alias-bg-layer-2);color:var(--dswb-alias-label-primary)}',
      '.dswb-engine.is-active{border-color:var(--dswb-alias-brand-primary);background:color-mix(in srgb,var(--dswb-alias-brand-primary) 13%,var(--dswb-alias-bg-layer-1));color:var(--dswb-alias-label-primary);box-shadow:inset 0 0 0 1px var(--dswb-alias-brand-primary)}',
      '.dswb-engine:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:2px}',
      '.dswb-webInput{flex:1;min-width:0;box-sizing:border-box;padding:8px 12px;border:1px solid var(--dswb-alias-border-l1);border-radius:9px;background:var(--dswb-alias-bg-base);color:var(--dswb-alias-label-primary);font-family:inherit;font-size:13px;outline:none;transition:border-color .15s ease}',
      '.dswb-webInput:focus-visible{border-color:var(--dswb-alias-brand-primary)}',
      '.dswb-webInput::placeholder{color:var(--dswb-alias-label-secondary);opacity:.85}',
      '.dswb-bookmarks{display:flex;flex-direction:column;gap:6px;padding:12px 20px 16px}',
      '.dswb-bookmarksHead{font-size:11.5px;font-weight:600;color:var(--dswb-alias-label-secondary)}',
      '.dswb-bookmarksEmpty{margin:0;padding:2px 0 4px;font-size:12px;color:var(--dswb-alias-label-secondary)}',
      '.dswb-bookmark{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--dswb-alias-border-l1);border-radius:9px;background:var(--dswb-alias-bg-base);transition:border-color .15s ease}',
      '.dswb-bookmark:hover{border-color:color-mix(in srgb,var(--dswb-alias-brand-primary) 40%,var(--dswb-alias-border-l1))}',
      '.dswb-bookmarkOpen{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px;padding:0;border:none;background:none;color:inherit;font-family:inherit;text-align:left;cursor:pointer}',
      '.dswb-bookmarkTitle{font-size:12.5px;font-weight:600;color:var(--dswb-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-bookmarkUrl{font-size:11px;color:var(--dswb-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-bookmarkDelete{display:inline-flex;align-items:center;justify-content:center;width:20px;height:20px;padding:0;border:none;border-radius:6px;background:transparent;color:var(--dswb-alias-label-secondary);cursor:pointer;flex:none}',
      '.dswb-bookmarkDelete:hover{background:var(--dswb-alias-bg-layer-2);color:var(--dswb-alias-state-error-primary)}',
      '.dswb-count{display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:18px;padding:0 6px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:11px;font-weight:500;font-variant-numeric:tabular-nums}',
      '.dswb-search{width:210px;max-width:46vw;box-sizing:border-box;padding:7px 11px;border:1px solid var(--dsw-alias-border-l1);border-radius:9px;background:var(--dsw-alias-bg-base);color:var(--dsw-alias-label-primary);font-family:inherit;font-size:12.5px;outline:none;transition:border-color .15s ease}',
      '.dswb-search::placeholder{color:var(--dsw-alias-label-secondary);opacity:.85}',
      '.dswb-search:focus-visible{border-color:var(--dsw-alias-brand-primary)}',
      '.dswb-list{display:flex;flex-direction:column}',
      '.dswb-row{display:flex;align-items:center;gap:12px;width:100%;box-sizing:border-box;padding:12px 20px;border:none;border-top:1px solid var(--dsw-alias-border-l1);background:transparent;color:inherit;font-family:inherit;font-size:13.5px;text-align:left;cursor:pointer;transition:background .12s ease}',
      '.dswb-row:first-child{border-top:none}',
      '.dswb-row:hover{background:var(--dsw-alias-bg-layer-2)}',
      '.dswb-row:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:-2px}',
      '.dswb-rowTitle{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-rowState{flex:none;padding:1px 8px;border-radius:999px;border:1px solid color-mix(in srgb,var(--dsw-alias-state-success-primary) 40%,var(--dsw-alias-border-l1));color:var(--dsw-alias-state-success-primary);font-size:10.5px;font-weight:600}',
      '.dswb-chevron{display:inline-flex;flex:none;color:var(--dsw-alias-state-idle-primary);opacity:.8}',
      '.dswb-empty{display:flex;flex-direction:column;align-items:center;gap:10px;padding:30px 20px;text-align:center;color:var(--dsw-alias-label-secondary);font-size:13px}',
      '.dswb-emptyTitle{margin:0;font-size:13.5px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.dswb-emptyHint{margin:0;font-size:12.5px}',
      '.dswb-sectionHead{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding:0 2px}',
      '.dswb-sectionTitle{margin:0;font-size:14px;font-weight:600;letter-spacing:-.005em}',
      '.dswb-sectionHint{font-size:11.5px;color:var(--dsw-alias-label-secondary)}',
      '.dswb-sectionToggle{display:flex;align-items:center;gap:8px;width:100%;padding:0;border:none;border-radius:6px;background:none;color:inherit;font:inherit;font-size:14px;font-weight:600;letter-spacing:-.005em;text-align:left;cursor:pointer}',
      '.dswb-sectionToggle:hover .dswb-sectionLabel{color:var(--dswb-alias-brand-primary)}',
      '.dswb-sectionToggle .dswb-sectionHint{margin-left:auto;font-weight:400;letter-spacing:0}',
      '.dswb-sectionToggle:focus-visible{outline:2px solid var(--dswb-alias-brand-primary);outline-offset:2px}',
      '.dswb-cardTitle .dswb-sectionToggle{width:auto}',
      '.dswb-toggleChevron{display:inline-flex;flex:none;color:var(--dswb-alias-state-idle-primary);margin-left:2px}',
      '.dswb-toggleChevron svg{transition:transform .15s ease}',
      '.dswb-toggleChevron.is-open svg{transform:rotate(90deg)}',
      '.dswb-appsBody{display:flex;flex-direction:column;gap:14px}',
      '.dswb-apps .dswb-sectionHead{align-items:center}',
      '.dswb-apps .dswb-sectionHead .dswb-sectionTitle{flex:1;min-width:0}',
      '.dswb-apps{display:flex;flex-direction:column;gap:14px}',
      '.dswb-appsEmpty{border:1px dashed var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1)}',
      '.dswb-cat{display:flex;flex-direction:column;gap:8px}',
      '.dswb-catHead{display:flex;align-items:center;gap:8px;padding:0 2px;min-width:0}',
      '.dswb-catGlyph{display:inline-flex;flex:none;color:var(--dsw-alias-brand-primary);opacity:.9}',
      '.dswb-catTitle{margin:0;font-size:12px;font-weight:600;color:var(--dsw-alias-label-secondary)}',
      '.dswb-catCount{display:inline-flex;align-items:center;justify-content:center;min-width:18px;height:16px;padding:0 5px;border-radius:999px;border:1px solid var(--dsw-alias-border-l1);color:var(--dsw-alias-label-secondary);font-size:10px;font-weight:500;font-variant-numeric:tabular-nums}',
      '.dswb-catDesc{margin-left:auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;color:var(--dsw-alias-label-secondary);opacity:.85}',
      '.dswb-appGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}',
      '.dswb-app{display:flex;align-items:center;gap:12px;padding:13px 15px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);color:inherit;font-family:inherit;text-align:left;cursor:pointer;min-width:0;transition:border-color .15s ease,background .15s ease,transform .15s ease}',
      '.dswb-app:hover{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-layer-2)}',
      '.dswb-app:active{transform:translateY(1px)}',
      '.dswb-app:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dswb-appIcon{display:grid;place-items:center;width:38px;height:38px;flex:none;border-radius:11px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 13%,transparent);color:var(--dsw-alias-brand-primary)}',
      '.dswb-appCopy{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}',
      '.dswb-appTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-appDesc{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-quickSection{display:flex;flex-direction:column;gap:10px}',
      '.dswb-quick{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px}',
      '.dswb-tile{display:flex;align-items:center;gap:12px;padding:14px 16px;border:1px solid var(--dsw-alias-border-l1);border-radius:14px;background:var(--dsw-alias-bg-layer-1);color:inherit;font-family:inherit;text-align:left;cursor:pointer;transition:border-color .15s ease,background .15s ease}',
      '.dswb-tile:hover{border-color:color-mix(in srgb,var(--dsw-alias-brand-primary) 45%,var(--dsw-alias-border-l1));background:var(--dsw-alias-bg-layer-2)}',
      '.dswb-tile:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:2px}',
      '.dswb-tileGlyph{display:grid;place-items:center;width:34px;height:34px;flex:none;border-radius:10px;background:color-mix(in srgb,var(--dsw-alias-brand-primary) 14%,transparent);color:var(--dsw-alias-brand-primary)}',
      '.dswb-tileCopy{display:flex;flex-direction:column;gap:2px;min-width:0;flex:1}',
      '.dswb-tileTitle{font-size:13px;font-weight:600;color:var(--dsw-alias-label-primary)}',
      '.dswb-tileDesc{font-size:11.5px;color:var(--dsw-alias-label-secondary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
      '.dswb-foot{margin:2px 0 0;padding:0 2px;color:var(--dsw-alias-label-secondary);font-size:11.5px;text-align:center;opacity:.9}',
      '.dswb-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:40;max-width:80vw;padding:9px 15px;border:1px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-overlay);color:var(--dsw-alias-label-primary);box-shadow:0 8px 26px color-mix(in srgb,var(--dsw-alias-label-primary) 18%,transparent);font-size:12.5px}',
      '@media (max-width:820px){.dswb-quick{grid-template-columns:minmax(0,1fr)}}',
      '@media (max-width:720px){.dswb-appGrid{grid-template-columns:minmax(0,1fr)}}',
      '@media (max-width:640px){.dswb-hero{flex-direction:column;align-items:flex-start}.dswb-heroAction{padding-bottom:0}.dswb-cardHead{flex-wrap:wrap}.dswb-search{width:100%;max-width:none}.dswb-catDesc{display:none}.dswb-addInput{width:100%;max-width:none}.dswb-addForm{flex-basis:100%;justify-content:flex-start}.dswb-webForm{flex-wrap:wrap}.dswb-engines{width:100%;justify-content:flex-start}.dswb-webInput{flex-basis:100%}.dswb-catCreate .dswb-addInput{width:100%;max-width:none}}',
      '@media (prefers-reduced-motion:reduce){.dswb-dot.is-on{animation:none}}',
      '.dswb-root ::-webkit-scrollbar{width:10px;height:10px}',
      '.dswb-root ::-webkit-scrollbar-thumb{background:var(--dsw-alias-border-l2);border-radius:8px}',
    ].join('\n')

    // ------------------------------------------------------------------
    // Plugin
    // ------------------------------------------------------------------

    return {
      inject: ['slots'],
      apply(ctx) {
        moduleCtx = ctx
        moduleSlots = ctx.slots
        moduleLocale = readLocaleService()

        ctx.effect(function () {
          let dispose = function () {}
          if (moduleLocale !== undefined && typeof moduleLocale.register === 'function') {
            try {
              const offZh = moduleLocale.register(NS, 'zh', zh)
              const offEn = moduleLocale.register(NS, 'en', en)
              dispose = function () {
                try { if (typeof offZh === 'function') offZh() } catch (error) { /* ignore */ }
                try { if (typeof offEn === 'function') offEn() } catch (error) { /* ignore */ }
              }
            } catch (error) {
              // The panel's own dictionaries still resolve from the browser language.
            }
          }
          return dispose
        }, 'workbench: dictionaries')

        ctx.slots.inject('sidebar.panellist', function () {
          return ctx.slots.register({
            name: 'sidebar.panellist',
            id: PANEL_ID,
            order: 5,
            label: function () { return translate(dictFor(activeLocaleOf(moduleLocale)), 'panel') },
          }, WorkbenchIcon)
        })

        ctx.slots.inject('main', function () {
          return ctx.slots.register({
            name: 'main',
            key: PANEL_ID,
            // Apps contributed by other plugins land here; the workbench
            // auto-classifies them into the market / funds / automation grid.
            children: {
              'workbench.apps': { kind: 'list', scope: 'root' },
            },
            inject: function () { return { locale: moduleLocale } },
          }, WorkbenchPage)
        })
      },
    }
  },
})
