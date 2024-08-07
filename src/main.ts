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

const app = createApp(App).use(IonicVue).use(router)

router.isReady().then(() => {
  app.mount("#app")
})

// Custom code from here
import * as Ion from "@ionic/vue"
Object.entries(Ion).forEach(([key, value]) => {
  if (!key.startsWith("Ion")) return
  app.component(key, value)
})
app.config.errorHandler = (err, vm, info) => {
  console.error(err, info)
  router.push("/")
}
import { useStorageAsync, toReactive } from "@vueuse/core"
import { idbStorage } from "./idb"
window.$state = app.config.globalProperties.$state = toReactive(useStorageAsync("$state", { mode: "user", trips: [] }, idbStorage))
window.$ = (selector: string, context = document as any) => context.querySelector(selector)
window.$$ = (selector: string, context = document as any) => Array.from(context.querySelectorAll(selector))

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $state: any
  }
}
declare global {
  interface Window {
    $: (selector: string, context?: HTMLElement) => HTMLElement | null
    $$: (selector: string, context?: HTMLElement) => HTMLElement[]
    $state: any
    $router: any
    $route: any
  }
}
