<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button text="Retour" default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Config</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content forceOverscroll="false">
      <ion-list lines="none" inset class="**:[.label-text-wrapper]:min-w-28 **:[.label-text-wrapper]:p-1!">
        <ion-button class="mx-5" expand="block" @click="downloadManual">
          <div class="i-lucide/download mx-2 -my-1 text-xl"></div>
          Télécharger le mode d'emploi
        </ion-button>
        <ion-input v-model="$state.name" label="👋 Prénom" placeholder="Bruno"></ion-input>
        <ion-input v-model="$state.phone" label="📞 N° Aide" placeholder="0612121212"></ion-input>
        <ion-textarea class="text-[80%]" rows="3" :auto-grow="true" v-model="$state.instruction" label="📋 Instruction" placeholder="Je comprends tout ce que vous dites si vous me parlez lentement."></ion-textarea>
        <ion-input v-model="$state.home" label="🏠 Maison" placeholder="40 Rue du Drac"></ion-input>
        <ion-input v-model="$state.work" label="🏢 Travail" placeholder="40 Rue du Drac"></ion-input>
        <div class="flex" @pointerdown="requestInstall"><ion-toggle class="pointer-events-none mx-5 w-full" :checked="isInstalled">Application installée</ion-toggle></div>
        <div class="flex" @pointerdown="requestNotification"><ion-toggle class="pointer-events-none mx-5 w-full" :checked="isNotifiable">Notifications activées</ion-toggle></div>
        <div class="flex" @pointerdown="requestLocalisation"><ion-toggle class="pointer-events-none mx-5 w-full" :checked="isLocalisable">Localisation activée</ion-toggle></div>
        <ion-toggle class="mx-5" v-model="$state.fake">Fake Timer</ion-toggle>
        <ion-button class="mx-5" expand="block" @pointerdown="window.location.reload()">
          <div class="i-lucide/refresh-ccw mx-2 -my-1 text-xl"></div>
          Version N° {{ version.split(".")[0] }}
        </ion-button>
        <ion-button class="mx-5" @click="onExport">
          <div class="i-lucide/save mx-2 -my-1 text-xl"></div>
          Exporter les données
        </ion-button>
        <ion-button class="mx-5" @click="onImport">
          <div class="i-lucide/archive-restore mx-2 -my-1 text-xl"></div>
          Importer les données
        </ion-button>
        <ion-button class="mx-5" color="danger" @click="reset">
          <div class="i-lucide/timer-reset mx-2 -my-1 text-xl"></div>
          Réinitialiser l'application
        </ion-button>
      </ion-list>
      <!-- <ion-item button @click="$state.fake = !$state.fake">
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
      </ion-list> -->
    </ion-content>
  </ion-page>
</template>

<script setup>
import { version } from "../../package.json"
import { ref, onMounted } from "vue"
const isInstalled = ref(window.matchMedia("(display-mode: standalone)").matches || !!window.navigator.standalone)
const isNotifiable = ref(false)
const isLocalisable = ref(false)
const os = /android|iphone/i.exec(navigator.userAgent)?.[0].toLowerCase() ?? "desktop"
const browser = /Version\/[\d.]+.*Safari/i.test(navigator.userAgent) ? "safari" : "chrome"
if (os === "iphone" && browser !== "safari") popup("Merci d'utiliser Safari sur iPhone")
if (os === "android" && browser !== "chrome") popup("Merci d'utiliser Chrome sur Android")
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
  if (os === "iphone") return popup(`Pour installer cette application, appuyez sur le bouton "Partager" dans Safari, puis sélectionnez "Ajouter à l'écran d'accueil".`)
  if (!installPrompt) return popup(`Pour installer cette application, appuyez sur le bouton "Installer" dans Chrome.`)
  installPrompt.prompt()
}
async function requestNotification(event) {
  const registration = await navigator.serviceWorker.getRegistration()
  if (registration?.showNotification) return event && notify("Notification push activées.", "Notification")
  if ("Notification" in window) {
    const permission = await Notification.requestPermission()
    if (permission === "granted") return event && notify("Notification native activées.", "Notification")
  }
  event && popup("Notification native refusées, installez l'application et vérifiez les permissions.")
}
async function requestLocalisation(event) {
  return navigator.geolocation.getCurrentPosition(
    (position) => {
      isLocalisable.value = true
      event && popup(`${position.coords.latitude.toFixed(5)}x${position.coords.longitude.toFixed(5)} (±${+position.coords.accuracy.toFixed(1)}m)`)
    },
    (err) => {
      event && popup(`Erreur de localisation : ${err.message}`)
    },
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
  if (!(await window.popup("Êtes-vous sûr de vouloir réinitialiser l'application ?\n\nCela supprimera toutes les données, il est conseillé de faire une sauvegarde au préalable.", { ok: "Confirmer", ko: "Annuler" }))) return
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
