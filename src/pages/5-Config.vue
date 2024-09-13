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
        <ion-label>INSTALL PWA</ion-label>
      </ion-item>
      <ion-item button @click="requestNotification">
        <ion-label>NOTIFICATION {{ isNotifiable ? "ON" : "OFF" }}</ion-label>
      </ion-item>
      <ion-item button color="danger" @click="reset">
        <ion-label>RESET</ion-label>
      </ion-item>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref } from "vue"
const isInstalled = ref(window.matchMedia("(display-mode: standalone)").matches || !!window.navigator.standalone)
const isNotifiable = ref(Notification.permission === "granted")
async function requestInstall() {
  alert("Please install this app by using the `Add to Home Screen` button")
}
async function requestNotification() {
  if (isNotifiable.value) {
    const registration = await navigator.serviceWorker.getRegistration()
    registration.showNotification("Notification", {
      body: "Préparez-vous à déscendre au prochain arrêt.",
      icon: "/favicon.png",
      badge: "/favicon.png",
    })
  }
  const permission = await Notification.requestPermission()
  isNotifiable.value = permission === "granted"
}
async function reset() {
  if (!confirm("Are you sure you want to reset?")) return
  await idb.clear()
  location.href = "/"
}
// async function initPWA() {
// Prompt the user to install the app
// return new Promise((resolve, reject) => {
//   window.addEventListener("beforeinstallprompt", (e) => {
//     e.preventDefault()
//     const deferredPrompt = e
//     const button = document.createElement("button")
//     button.textContent = "Install PWA"
//     document.body.appendChild(button)
//     button.addEventListener("click", () => {
//       deferredPrompt.prompt()
//       deferredPrompt.userChoice.then((choiceResult) => {
//         document.body.removeChild(button)
//         if (choiceResult.outcome === "accepted") return resolve()
//         return reject(new Error("User dismissed the install prompt"))
//       })
//     })
//   })
// })
// // Prompt the user to use chrome on android or safari on ios
// // The prompt message is in french, once it is displayed it should not be displayed again
// const isAndroid = /android/i.test(navigator.userAgent)
// const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent)
// const isChrome = /chrome/i.test(navigator.userAgent)
// const isSafari = /safari/i.test(navigator.userAgent)
// if (isAndroid && !isChrome) return alert("Merci d'utiliser Chrome sur Android et d'installer cette application")
// if (isIOS && !isSafari) return alert("Merci d'utiliser Safari sur iOS et d'installer cette application")
// if (localStorage.prompted) return
// alert("Merci d'installer cette application en utilisant le bouton `Ajouter à l'écran d'accueil`")
// localStorage.prompted = true
// }
</script>
