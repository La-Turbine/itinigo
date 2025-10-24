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
      <ion-item button @click="downloadManual">
        <ion-label>MODE D'EMPLOI</ion-label>
      </ion-item>
      <div class="h-10"></div>
      <ion-item>
        <ion-input v-model="$state.name" label="👋 Prénom" placeholder="Bruno"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input v-model="$state.phone" label="📞 N° Aide" placeholder="0612121212"></ion-input>
      </ion-item>
      <ion-item>
        <ion-textarea
          class="text-[80%]"
          rows="3"
          :auto-grow="true"
          v-model="$state.instruction"
          label="📋 Instruction"
          placeholder="Je comprends tout ce que vous dites si vous me parlez lentement."
        ></ion-textarea>
      </ion-item>
      <ion-item>
        <ion-input v-model="$state.home" label="🏠 Maison" placeholder="40 Rue du Drac"></ion-input>
      </ion-item>
      <ion-item>
        <ion-input v-model="$state.work" label="🏢 Travail" placeholder="40 Rue du Drac"></ion-input>
      </ion-item>
      <ion-item button @click="requestInstall" :disabled="isInstalled">
        <ion-label>INSTALLATION - {{ isInstalled ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button @click="requestNotification">
        <ion-label>NOTIFICATION - {{ isNotifiable ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button @click="requestLocalisation">
        <ion-label>LOCALISATION - {{ isLocalisable ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <div class="h-10"></div>
      <ion-item button @click="window.location.reload()">
        <ion-label>
          VERSION:
          <b class="text-[125%]">{{ version.split(".")[0] }}</b>
          // {{ os }} // {{ browser }}
        </ion-label>
      </ion-item>
      <ion-item button @click="$state.fake = !$state.fake">
        <ion-label>FAKE TIMER - {{ $state.fake ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button @click="onExport">
        <ion-label>EXPORT</ion-label>
      </ion-item>
      <ion-item button @click="onImport">
        <ion-label>IMPORT</ion-label>
      </ion-item>
      <ion-item button color="danger" @click="reset">
        <ion-label>RESET</ion-label>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup>
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
  if (os === "iphone") return alert(`Pour installer cette application, appuyez sur le bouton "Partager" dans Safari, puis sélectionnez "Ajouter à l'écran d'accueil".`)
  if (!installPrompt) return alert(`Pour installer cette application, appuyez sur le bouton "Installer" dans Chrome.`)
  installPrompt.prompt()
}
async function requestNotification() {
  const registration = await navigator.serviceWorker.ready
  if ("sync" in registration) registration.sync.register("notify")
  if (!isNotifiable.value) return Notification.requestPermission().then((permission) => (isNotifiable.value = permission === "granted"))
  return notify("Préparez-vous à recevoir des notifications")
}
async function requestLocalisation() {
  if (!isLocalisable.value) return navigator.geolocation.getCurrentPosition((position) => (isLocalisable.value = true))
  navigator.geolocation.getCurrentPosition(
    (position) => console.log(position),
    (err) => console.log(err),
  )
}
async function onExport() {
  const blob = new Blob([JSON.stringify($state)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `itinigo-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
}
async function onImport() {
  const input = document.createElement("input")
  input.type = "file"
  input.accept = ".json"
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      Object.entries(JSON.parse(reader.result)).forEach(([key, value]) => {
        if (key === "photos") idb.clear().then(() => Object.entries(value).forEach(([key, value]) => idb.set(key, value)))
        $state[key] = value
      })
    }
    reader.readAsText(file)
  }
  input.click()
}
async function reset() {
  if (!confirm("Êtes-vous sûr de vouloir réinitialiser l'application ?")) return
  await idb.clear()
  location.href = "/"
}
function downloadManual() {
  const a = document.createElement("a")
  a.href = "/manual.pdf"
  a.download = "itinigo-manual.pdf"
  a.click()
}
</script>
