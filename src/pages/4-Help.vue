<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>{{ $route.query.mode === "card" ? "Ma carte d'aide" : "Mes Aides" }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="display: flex; flex-direction: column; gap: 20px; padding: 20px">
        <template v-if="$route.query.mode === 'card'">
          <div style="font-size: 2rem; text-align: center; text-wrap: balance">Bonjour 👋,</div>
          <div style="font-size: 1.25rem; text-align: center; text-wrap: balance">Je m’appelle {{ $state.name }} et j’ai besoin de votre aide pour retrouver le fil de mon trajet.</div>
          <div style="font-size: 1.25rem; text-align: center; text-wrap: balance">Je comprends tout ce que vous dites si vous me parlez lentement.</div>
          <div style="font-size: 1.25rem; font-weight: 600; text-align: center; text-wrap: balance">Pourriez-vous m’aider à rejoindre ma destination s’il vous plait ?</div>
          <div style="font-size: 1.25rem; font-weight: 600; text-align: center; text-wrap: balance">Merci beaucoup.</div>
          <hr style="border-top: 1px solid rgba(0, 0, 0, 0.5); width: 50%" />
          <div style="font-size: 1.25rem; font-weight: 600">Mon Itinéraire</div>
          <div style="font-size: 1.25rem">
            <div style="font-weight: 600">Arrêt de départ :</div>
            <div>{{ first.stops[0].text }}, {{ first.type }}</div>
          </div>
          <div style="font-size: 1.25rem">
            <div style="font-weight: 600">Arrêt d’arrivée :</div>
            <div>{{ last.stops.at(-1).text }}, {{ last.type }}</div>
          </div>
          <div style="font-size: 1.25rem">
            <div style="font-weight: 600">Je souhaite me rendre ici :</div>
            <div>{{ travel.to.text }}</div>
          </div>
          <hr style="border-top: 1px solid rgba(0, 0, 0, 0.5); width: 50%" />
          <div style="display: flex; gap: 10px; padding: 10px">
            <ion-button fill="outline" @click="$router.go(-2)">Retour à mon trajet</ion-button>
          </div>
        </template>
        <template v-if="!$route.query.mode">
          <div style="display: flex; max-width: 28rem; padding: 20px; background-color: white; border-radius: 0.5rem; border: 1px solid rgba(0, 0, 0, 0.15); gap: 20px" @click="help">
            <div style="font-size: 50px">✋</div>
            <div style="margin: auto 0; font-weight: 500; text-wrap: balance">J’affiche ma carte d’aide pour la montrer à quelqu’un autour de moi</div>
          </div>
          <div style="display: flex; max-width: 28rem; padding: 20px; background-color: white; border-radius: 0.5rem; border: 1px solid rgba(0, 0, 0, 0.15); gap: 20px" @click="map">
            <div style="font-size: 50px">🚶‍➡️</div>
            <div style="margin: auto 0; font-weight: 500; text-wrap: balance">Je continue mon trajet à pied avec Google maps.</div>
          </div>
          <div style="display: flex; max-width: 28rem; padding: 20px; background-color: white; border-radius: 0.5rem; border: 1px solid rgba(0, 0, 0, 0.15); gap: 20px" @click="call">
            <div style="font-size: 50px">📞</div>
            <div style="margin: auto 0; font-weight: 500; text-wrap: balance">J’appelle un proche</div>
          </div>
          <hr style="border-top: 1px solid rgba(0, 0, 0, 0.5); width: 50%" />
          <div style="display: flex; gap: 10px; padding: 10px">
            <ion-button fill="outline" @click="$router.back()">Retour à mon trajet</ion-button>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { computed } from "vue"
const travel = computed(() => $state.trips[$route.query.travel - 1])
const first = computed(() => travel.value.sequences.find((v) => v.type))
const last = computed(() => travel.value.sequences.findLast((v) => v.type))
function help() {
  $router.push(`/help?travel=${$route.query.travel}&mode=card`)
}
function map() {
  navigator.geolocation.getCurrentPosition(goto, (err) => goto())
  function goto(position) {
    const to = travel.value.to.lat + "," + travel.value.to.lng
    if (!position) return (window.location.href = `https://www.google.com/maps?q=${to}`)
    const from = position.coords.latitude + "," + position.coords.longitude
    window.location.href = `https://www.google.com/maps/dir/?api=1&origin=${from}&destination=${to}&travelmode=walking`
  }
}
function call() {
  window.location.href = "tel:+33" + $state.phone?.slice(1)
}
</script>
