import "./main.css"
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { IonicVue } from "@ionic/vue"
import * as Ion from "@ionic/vue"
import { reactive, watch } from "vue"
// @ts-ignore
import { idb } from "./idb"
import "./tldraw"
import TldrawAnnotator from "./tldraw/annotator.vue"
import CardTrip from "./components/CardTrip.vue"
import ListTrip from "./components/ListTrip.vue"
async function initApp() {
  window.Ionic = { config: { mode: "ios" } }
  const app = createApp(App).use(IonicVue).use(router)
  app.component("TldrawAnnotator", TldrawAnnotator)
  app.component("CardTrip", CardTrip)
  app.component("ListTrip", ListTrip)
  Object.entries(Ion).forEach(([key, value]) => {
    if (!key.startsWith("Ion")) return
    app.component(key, value)
  })
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, info)
    router.push("/")
  }
  const keys = await idb.keys()
  const values = await Promise.all(keys.map((key: string) => idb.get(key)))
  const db = values.reduce(
    (acc: any, val: any, i: number) => {
      if (i === 0) return JSON.parse(val)
      acc.photos[keys[i]] = val
      return acc
    },
    { mode: "user", trips: [], photos: {} },
  )
  const $state = reactive(db)
  $state.photos.BUSIN = "/img/BUSIN.png"
  $state.photos.BUSOUT = "/img/BUSOUT.png"
  $state.photos.TRAMIN = "/img/TRAMIN.png"
  $state.photos.TRAMOUT = "/img/TRAMOUT.png"
  watch($state, (next) => idb.set("$state", JSON.stringify({ ...next, photos: {} })), { flush: "pre", deep: true })
  await router.isReady()
  window.$ = (selector: string, context = document as any) => context.querySelector(selector)
  window.$$ = (selector: string, context = document as any) => Array.from(context.querySelectorAll(selector))
  window.notify = async function (message, title) {
    try {
      await window.push(message, title)
    } catch (e) {}
    alert(message)
  }
  window.push = async (message: string, title?: string) => {
    title = title || message
    const notification = {
      body: message,
      icon: "/pwa-192x192.png",
      badge: "/pwa-192x192.png",
      data: { url: location.href },
    }
    const registration = await navigator.serviceWorker.getRegistration()
    if (registration?.showNotification) return registration.showNotification(title, notification)
    return new Notification(title, notification)
  }
  window.sms = async (message: string, number: string) => {
    if (!number) return alert("Please enter a valid phone number")
    if (!message) return alert("Please enter a message")
    const TWILIO_ACCOUNT_SID = import.meta.env.VITE_TWILIO_ACCOUNT_SID || ""
    const TWILIO_AUTH_TOKEN = import.meta.env.VITE_TWILIO_AUTH_TOKEN || ""
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: number, From: "+14696091036", Body: message }),
    })
    if (!response.ok) throw new Error(await response.text())
    return response.json()
  }
  window.idb = app.config.globalProperties.idb = idb
  window.$state = app.config.globalProperties.$state = $state
  const $position = reactive<{ value?: GeolocationPosition | object }>({ value: undefined })
  window.$position = app.config.globalProperties.$position = $position
  // UTILITIES
  function homework(place: string) {
    if (place.toLowerCase() === $state.home?.toLowerCase()) return "🏠 Maison"
    if (place.toLowerCase() === $state.work?.toLowerCase()) return "🏢 Travail"
    return place
  }
  function triptitle(trip: any) {
    return `${homework(trip.from?.text ?? "")}\n${homework(trip.to?.text ?? "")}`
  }
  window.homework = app.config.globalProperties.homework = homework
  window.triptitle = app.config.globalProperties.triptitle = triptitle
  // GEOLOCATION
  retryPosition()
  function retryPosition() {
    watchPosition()
    setInterval(watchPosition, 10000)
  }
  function watchPosition() {
    if ($position.value && "timestamp" in $position.value) return
    navigator.geolocation.watchPosition(
      (position) => ($position.value = position),
      (error) => ($position.value = {}),
      {
        enableHighAccuracy: true, // Use GPS if available
        timeout: 1000, // Maximum time to wait for a response (in ms)
        maximumAge: 0, // Don't use cached position
      },
    )
  }
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
    $position: any
    homework: (place: string) => string
    triptitle: (trip: any) => string
  }
}
declare global {
  interface Window {
    Ionic: { config: { mode: string } }
    $: (selector: string, context?: HTMLElement) => HTMLElement | null
    $$: (selector: string, context?: HTMLElement) => HTMLElement[]
    notify: (message: string, title?: string) => Promise<void>
    push: (message: string, title?: string) => Promise<void | Notification>
    sms: (message: string, number: string) => Promise<any>
    idb: any
    $state: any
    $position: any
    homework: (place: string) => string
    triptitle: (trip: any) => string
    $router: any
    $route: any
  }
}
