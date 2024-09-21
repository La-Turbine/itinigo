<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Config</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-item button @click="requestInstall" :disabled="isInstalled">
        <ion-label>INSTALL PWA - {{ isInstalled ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button @click="requestNotification">
        <ion-label>NOTIFICATION - {{ isNotifiable ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button @click="requestLocalisation">
        <ion-label>LOCALISATION - {{ isLocalisable ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item>
        <ion-input v-model="$state.home" label="🏠 Maison"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input v-model="$state.work" label="🏢 Travail"></ion-input>
      </ion-item>
      <ion-item>
        <ion-label>VERSION: {{ version }} // {{ os }} // {{ browser }}</ion-label>
      </ion-item>
      <ion-item button color="danger" @click="reset">
        <ion-label>RESET</ion-label>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { version } from "../../package.json"
import { ref, onMounted } from "vue"
const isInstalled = ref(window.matchMedia("(display-mode: standalone)").matches || !!window.navigator.standalone)
const isNotifiable = ref(false)
const isLocalisable = ref(false)
const os = /android|iphone/i.exec(navigator.userAgent)?.[0] ?? "?"
const browser = /chrome|safari/i.exec(navigator.userAgent)?.[0] ?? "?"
if (browser === "chrome" && os === "iphone") alert("Merci d'utiliser Safari sur iPhone")
if (browser !== "chrome" && os === "android") alert("Merci d'utiliser Chrome sur Android")
onMounted(async () => {
  isNotifiable.value = (await navigator.permissions.query({ name: "notifications" })).state === "granted"
  isLocalisable.value = (await navigator.permissions.query({ name: "geolocation" })).state === "granted"
  if (!isNotifiable.value) requestNotification()
  if (!isLocalisable.value) requestLocalisation()
})
let installPrompt
window.addEventListener("beforeinstallprompt", (e) => {
  e.preventDefault()
  installPrompt = e
})
async function requestInstall() {
  if (isInstalled.value) return
  if (!installPrompt) return alert("Impossible d'installer l'application")
  installPrompt.prompt()
}
async function requestNotification() {
  if (!isNotifiable.value) return Notification.requestPermission().then((permission) => (isNotifiable.value = permission === "granted"))
  return notify("Préparez-vous à recevoir des notifications")
}
async function requestLocalisation() {
  if (!isLocalisable.value) return navigator.geolocation.getCurrentPosition((position) => (isLocalisable.value = true))
  navigator.geolocation.getCurrentPosition(
    (position) => console.log(position),
    (err) => console.log(err)
  )
}
async function reset() {
  if (!confirm("Are you sure you want to reset?")) return
  await idb.clear()
  location.href = "/"
}
</script>
