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
  watch($state, (next) => idb.set("$state", JSON.stringify({ ...next, photos: {} })), { flush: "pre", deep: true })
  await router.isReady()
  window.$ = (selector: string, context = document as any) => context.querySelector(selector)
  window.$$ = (selector: string, context = document as any) => [...context.querySelectorAll(selector)]
  window.notify = async (message, title = "Notification") => {
    const notification = { body: message, icon: "/favicon.svg", badge: "/favicon.svg" }
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.showNotification) return registration.showNotification(title, notification)
    return new Notification(title, notification)
  }
  window.idb = app.config.globalProperties.idb = idb
  window.$state = app.config.globalProperties.$state = $state
  app.config.globalProperties.window = window
  app.mount("#app")
  // Start as helper in config page when no trips are present
  if (!$state.trips.length) {
    $state.mode = "helper"
    router.push("/config")
  }
  // Return to home page after 1.5 hours of inactivity
  let timer: any
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) return (timer = setInterval(() => router.push("/"), 1.5 * 60 * 60 * 1000))
    return clearInterval(timer)
  })
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
