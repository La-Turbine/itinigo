import "./main.css"
import { createApp } from "vue"
import App from "./App.vue"
import router from "./router"
import { IonicVue } from "@ionic/vue"
import * as Ion from "@ionic/vue"
import { reactive, watch } from "vue"
// @ts-ignore
import { idb } from "./idb"
import CardStep from "./components/CardStep.vue"
import CardTrip from "./components/CardTrip.vue"
import FormAction from "./components/FormAction.vue"
import FormPhoto from "./components/FormPhoto.vue"
import FormTrip from "./components/FormTrip.vue"
import ListPhoto from "./components/ListPhoto.vue"
import ListStep from "./components/ListStep.vue"
import ListTrip from "./components/ListTrip.vue"
import "./tldraw"
import PhotoAnnotator from "./tldraw/annotator.vue"
import PhotoStream from "./components/PhotoStream.vue"
async function initApp() {
  window.Ionic = { config: { mode: "ios" } }
  const app = createApp(App).use(IonicVue).use(router)
  app.component("CardStep", CardStep)
  app.component("CardTrip", CardTrip)
  app.component("FormAction", FormAction)
  app.component("FormPhoto", FormPhoto)
  app.component("FormTrip", FormTrip)
  app.component("ListPhoto", ListPhoto)
  app.component("ListStep", ListStep)
  app.component("ListTrip", ListTrip)
  app.component("PhotoAnnotator", PhotoAnnotator)
  app.component("PhotoStream", PhotoStream)
  Object.entries(Ion).forEach(([key, value]) => {
    if (!key.startsWith("Ion")) return
    app.component(key, value)
  })
  app.config.errorHandler = (err, vm, info) => {
    console.error(err, info)
    router.push("/")
  }
  // GLOBAL STATE
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
  watch(
    () => $state.mode,
    (mode) => document.documentElement.style.setProperty("--ion-color-primary", mode === "helper" ? "#000000" : "#0054e9"),
    { immediate: true },
  )
  await router.isReady()
  // GLOBAL HELPERS
  window.$ = (selector: string, context = document as any) => context.querySelector(selector)
  window.$$ = (selector: string, context = document as any) => Array.from(context.querySelectorAll(selector))
  window.popup = async function (message, options) {
    const { title = "", ok = "OK", ko } = options || {}
    const alert = await Ion.alertController.create({
      header: title,
      message: message,
      buttons: [{ text: ok, role: "ok", cssClass: "alert-ok" }].concat(ko ? [{ text: ko, role: "cancel", cssClass: "alert-cancel" }] : []),
    })
    await alert.present()
    const { role } = await alert.onDidDismiss()
    return role === "ok"
  }
  window.notify = async function (message, title) {
    try {
      await window.push(message, title)
    } catch (e) {}
    await window.popup(message, { title })
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
    if (!number) return window.popup("Please enter a valid phone number")
    if (!message) return window.popup("Please enter a message")
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
    $: (selector: string, context?: HTMLElement | Document) => HTMLElement | null
    $$: (selector: string, context?: HTMLElement | Document) => HTMLElement[]
    popup: (message: string, options?: { title?: string; ok?: string; ko?: string; confirm?: boolean }) => Promise<boolean>
    notify: (message: string, title?: string) => Promise<void>
    push: (message: string, title?: string) => Promise<void | Notification>
    sms: (message: string, number: string) => Promise<any>
    idb: any
    $router: any
    $route: any
    $state: any
    $position: any
    homework: (place: string) => string
    triptitle: (trip: any) => string
  }
  var $: (selector: string, context?: HTMLElement | Document) => HTMLElement | null
  var $$: (selector: string, context?: HTMLElement | Document) => HTMLElement[]
  var popup: (message: string, options?: { title?: string; ok?: string; ko?: string; confirm?: boolean }) => Promise<boolean>
  var notify: (message: string, title?: string) => Promise<void>
  var push: (message: string, title?: string) => Promise<void | Notification>
  var sms: (message: string, number: string) => Promise<any>
  var idb: any
  var $router: any
  var $route: any
  var $state: any
  var $position: any
  var homework: (place: string) => string
  var triptitle: (trip: any) => string
}
