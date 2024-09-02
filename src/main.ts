import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"

import { IonicVue } from "@ionic/vue"

/* Core CSS required for Ionic components to work properly */
import "@ionic/vue/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/vue/css/normalize.css"
import "@ionic/vue/css/structure.css"
import "@ionic/vue/css/typography.css"

/* Optional CSS utils that can be commented out */
import "@ionic/vue/css/padding.css"
import "@ionic/vue/css/float-elements.css"
import "@ionic/vue/css/text-alignment.css"
import "@ionic/vue/css/text-transformation.css"
import "@ionic/vue/css/flex-utils.css"
import "@ionic/vue/css/display.css"

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* @import '@ionic/vue/css/palettes/dark.always.css'; */
/* @import '@ionic/vue/css/palettes/dark.class.css'; */
// import "@ionic/vue/css/palettes/dark.system.css"

import * as Ion from "@ionic/vue"
import { reactive, watch } from "vue"
import { idb } from "./idb"
import "./tldraw"
function initPWA() {
  if (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone) return // already installed and used
  if (location.protocol === "http:") return // not secure
  // Prompt the user to use chrome on android or safari on ios
  // The prompt message is in french, once it is displayed it should not be displayed again
  const isAndroid = /android/i.test(navigator.userAgent)
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
  const isChrome = /chrome/i.test(navigator.userAgent)
  const isSafari = /safari/i.test(navigator.userAgent)
  if (isAndroid && !isChrome) return alert("Merci d'utiliser Chrome sur Android et d'installer cette application")
  if (isIOS && !isSafari) return alert("Merci d'utiliser Safari sur iOS et d'installer cette application")
  if (localStorage.prompted) return
  alert("Merci d'installer cette application en utilisant le bouton `Ajouter à l'écran d'accueil`")
  localStorage.prompted = true
}
async function initApp() {
  const app = createApp(App).use(IonicVue).use(router)
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
  window.$$ = (selector: string, context = document as any) => Array.from(context.querySelectorAll(selector))
  window.idb = app.config.globalProperties.idb = idb
  window.$state = app.config.globalProperties.$state = $state
  app.mount("#app")
}
initPWA()
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
    idb: any
    $state: any
    $router: any
    $route: any
  }
}
