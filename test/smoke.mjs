/**
 * Load-time smoke test for the workbench client half.
 *
 * It evaluates `client.js` the way the browser module loader would, then runs
 * `apply()` against a minimal Cordis-shaped context and prints the slot
 * registrations it produced. No React rendering and no DOM are involved.
 *
 * Run: node workbench/test/smoke.mjs
 */
import fs from 'node:fs'
import vm from 'node:vm'
import { fileURLToPath } from 'node:url'

const clientPath = fileURLToPath(new URL('../client.js', import.meta.url))
const source = fs.readFileSync(clientPath, 'utf8')

let definition
const context = {
  window: {
    __ModuleLoader__: {
      load(value) { definition = value },
    },
    __DSH_BOOT__: { version: '0.0.0-test' },
  },
  navigator: { language: 'zh-CN' },
  console,
  Intl,
  Date,
  Math,
  JSON,
  Promise,
  setTimeout,
  clearTimeout,
  setInterval,
  clearInterval,
  encodeURIComponent,
  fetch: undefined,
}
vm.createContext(context)
vm.runInContext(source, context, { filename: clientPath })

if (!definition) throw new Error('client.js did not call window.__ModuleLoader__.load')
if (definition.id !== 'dsh-workbench') throw new Error(`unexpected module id: ${definition.id}`)
if (typeof definition.factory !== 'function') throw new Error('module factory is missing')

const stubReact = {
  Fragment: Symbol('Fragment'),
  createElement(type, props, ...children) {
    return { type, props: props || {}, children }
  },
  useState(initial) {
    return [typeof initial === 'function' ? initial() : initial, () => {}]
  },
  useEffect() {},
  useMemo(fn) { return fn() },
}
const plugin = definition.factory((name) => {
  if (name === 'react') return stubReact
  throw new Error(`unexpected require: ${name}`)
})
if (!plugin || !Array.isArray(plugin.inject) || !plugin.inject.includes('slots')) {
  throw new Error('plugin manifest is missing inject: [slots]')
}

const registrations = []
const disposers = []
const locale = {
  getSnapshot() { return { active: 'zh', revision: 1 } },
  subscribe() { return () => {} },
  register() { return () => {} },
  bind() { return (key) => key },
  resolveText(text) { return text },
}
const ctx = {
  effect(callback) {
    const dispose = callback()
    if (typeof dispose === 'function') disposers.push(dispose)
    return () => {}
  },
  get(name) {
    if (name === 'locale') return locale
    return undefined
  },
  slots: {
    inject(slot, callback) {
      const dispose = callback()
      if (typeof dispose === 'function') disposers.push(dispose)
      return () => {}
    },
    register(options, component) {
      registrations.push({
        name: options.name,
        key: options.key,
        id: options.id,
        label: options.label,
        children: options.children,
        component,
      })
      return () => {}
    },
    entries(key) {
      if (key === 'workbench.apps') {
        return [{ options: { id: 'stock-analyzer', order: 30, label: () => 'Stock' } }]
      }
      if (key === 'sidebar.panellist') {
        return [{ options: { id: 'smoke-panel', order: 1, label: () => 'Smoke panel' } }]
      }
      return []
    },
    subscribe() { return () => {} },
  },
}

plugin.apply(ctx)

const summary = registrations.map((entry) => {
  const target = entry.key !== undefined ? `key=${entry.key}` : `id=${entry.id}`
  return `${entry.name} ${target}`
})
console.log('registrations:')
for (const line of summary) console.log('  ' + line)

const expected = [
  'sidebar.panellist id=workbench',
  'main key=workbench',
]
for (const item of expected) {
  if (!summary.includes(item)) throw new Error(`missing registration: ${item}`)
}
const main = registrations.find((entry) => entry.name === 'main' && entry.key === 'workbench')
if (!main || !main.component) throw new Error('main panel component is missing')
if (!main.children || !main.children['workbench.apps']) {
  throw new Error('main panel does not declare the workbench.apps child slot')
}

// Execute the page component once with a stub React, so a missing binding or
// a bad top-level expression fails here instead of blanking the panel at
// runtime. This is not a visual render: createElement just records the tree.
const pageProps = {
  locale,
  renderSlot() { return null },
  useSessions(selector) {
    return selector({
      ids: ['smoke-session'],
      byId: { 'smoke-session': { title: 'Smoke session', running: false } },
      projectionsBySession: {},
    })
  },
  useSessionStatus(selector) {
    return selector({ get() { return undefined } })
  },
}
const pageTree = main.component(pageProps)
if (!pageTree || pageTree.type !== 'div') {
  throw new Error('workbench page did not produce its root element')
}

function hasClass(node, name) {
  if (node === null || node === undefined || typeof node !== 'object') return false
  if (Array.isArray(node)) return node.some((child) => hasClass(child, name))
  if (node.props && typeof node.props.className === 'string' && node.props.className.split(/\s+/).includes(name)) return true
  if (Array.isArray(node.children)) return node.children.some((child) => hasClass(child, name))
  return false
}
for (const className of ['dswb-metrics', 'dswb-ghost', 'dswb-webCard', 'dswb-engines', 'dswb-engineBox', 'dswb-engineCheck', 'dswb-modulesCard', 'dswb-countButton']) {
  if (!hasClass(pageTree, className)) throw new Error(`page is missing .${className}`)
}

// Seed the browser store, then render again so the custom-category, bookmark
// and drag-target branches are executed too.
const store = {
  'dsh.workbench.appCats.v1': JSON.stringify([{ id: 'appcat-1', name: 'My apps' }]),
  'dsh.workbench.appAssign.v1': JSON.stringify({ 'stock-analyzer': 'appcat-1' }),
  'dsh.workbench.sessionCats.v1': JSON.stringify([{ id: 'sesscat-1', name: 'My sessions' }]),
  'dsh.workbench.sessionAssign.v1': JSON.stringify({ 'smoke-session': 'sesscat-1' }),
  'dsh.workbench.bookmarks.v1': JSON.stringify([{ url: 'https://example.com', title: 'Example' }]),
  'dsh.workbench.todos.v1': JSON.stringify([{ id: 't1', title: 'Smoke todo', done: false }]),
  'dsh.workbench.pinned.v1': JSON.stringify(['smoke-panel']),
}
context.window.localStorage = {
  getItem(key) { return Object.prototype.hasOwnProperty.call(store, key) ? store[key] : null },
  setItem(key, value) { store[key] = String(value) },
}
const seededTree = main.component(pageProps)
for (const className of ['dswb-app', 'dswb-catCreate', 'dswb-bookmark', 'dswb-sessionGroups', 'dswb-module', 'dswb-dropZone', 'dswb-appPinned', 'dswb-appUnpin', 'dswb-groupEdit']) {
  if (!hasClass(seededTree, className)) throw new Error(`seeded page is missing .${className}`)
}
console.log('page render smoke ok')
console.log('smoke ok')
