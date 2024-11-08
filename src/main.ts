import "./main.css"
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { IonicVue } from "@ionic/vue"
import * as Ion from "@ionic/vue"
import { reactive, watch } from "vue"
import { idb } from "./idb"
import "./tldraw"
import TldrawAnnotator from "./tldraw/annotator.vue"
import Card from "./components/card.vue"
async function initApp() {
  const app = createApp(App).use(IonicVue).use(router)
  app.component("TldrawAnnotator", TldrawAnnotator)
  app.component("Card", Card)
  Object.entries(Ion).forEach(([key, value]) => {
    if (!key.startsWith("Ion")) return
    app.component(key, value)
  })
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, info)
    router.push("/")
  }
  const keys = await idb.keys()
  const values = await Promise.all(keys.map((key) => idb.get(key)))
  const db = values.reduce(
    (acc, val, i) => {
      if (i === 0) return JSON.parse(val)
      acc.photos[keys[i]] = val
      return acc
    },
    { mode: "user", trips: [], photos: {} }
  )
  const $state = reactive(db)
  $state.photos.IN = "/img/IN.png"
  $state.photos.OUT = "/img/OUT.png"
  watch($state, (next) => idb.set("$state", JSON.stringify({ ...next, photos: {} })), { flush: "pre", deep: true })
  await router.isReady()
  window.$ = (selector: string, context = document as any) => context.querySelector(selector)
  window.$$ = (selector: string, context = document as any) => [...context.querySelectorAll(selector)]
  window.notify = async (message, title = "Notification") => {
    const notification = { body: message, icon: "/favicon.svg", badge: "/favicon.svg", data: { url: location.href } }
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.showNotification) return registration.showNotification(title, notification)
    return new Notification(title, notification)
  }
  window.idb = app.config.globalProperties.idb = idb
  window.$state = app.config.globalProperties.$state = $state
  app.config.globalProperties.window = window
  app.mount("#app")
  // Return to home page after 2 hours of inactivity (same page)
  // Return to last page on refresh, when < 2 hours of inactivity
  router.afterEach((to) => ($state.route = { fullPath: to.fullPath, timestamp: Date.now() }))
  if (Date.now() - $state.route?.timestamp < 1000 * 60 * 60 * 2) router.push($state.route.fullPath)
  else router.push("/")
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return
    if (Date.now() - $state.route.timestamp < 1000 * 60 * 60 * 2) return
    router.push("/")
  })
  // Start as helper in config page when no name is set
  if (!$state.name) {
    $state.mode = "helper"
    router.push("/config")
  }
}
initApp()

declare module "vue" {
  interface ComponentCustomProperties {
    idb: any
    $state: any
  }
}
declare global {
  interface Window {
    $: (selector: string, context?: HTMLElement) => HTMLElement | null
    $$: (selector: string, context?: HTMLElement) => HTMLElement[]
    notify: (message: string, title?: string) => Promise<void>
    idb: any
    $state: any
    $router: any
    $route: any
  }
}
