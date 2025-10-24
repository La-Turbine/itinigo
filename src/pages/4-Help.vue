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
      <div class="flex flex-col gap-5 p-5">
        <template v-if="$route.query.mode === 'card'">
          <div class="text-[2rem] text-center text-balance">Bonjour 👋,</div>
          <div class="text-[1.25rem] text-center text-balance">Je m'appelle {{ $state.name }} et j'ai besoin de votre aide pour retrouver le fil de mon trajet.</div>
          <div class="text-[1.25rem] text-center text-balance">{{ $state.instruction || "Je comprends tout ce que vous dites si vous me parlez lentement." }}</div>
          <div class="text-[1.25rem] font-semibold text-center text-balance">Pourriez-vous m'aider à rejoindre ma destination s'il vous plait ?</div>
          <div class="text-[1.25rem] font-semibold text-center text-balance">Merci beaucoup.</div>
          <hr class="border-t border-black/50 w-1/2" />
          <div class="text-[1.25rem] font-semibold">Mon Itinéraire</div>
          <div class="text-[1.25rem]">
            <div class="font-semibold">Arrêt de départ :</div>
            <div>{{ first.stops[0].text }}, {{ first.type }}</div>
          </div>
          <div class="text-[1.25rem]">
            <div class="font-semibold">Arrêt d'arrivée :</div>
            <div>{{ last.stops.at(-1).text }}, {{ last.type }}</div>
          </div>
          <div class="text-[1.25rem]">
            <div class="font-semibold">Je souhaite me rendre ici :</div>
            <div>{{ travel.to.text }}</div>
          </div>
          <hr class="border-t border-black/50 w-1/2" />
          <div class="flex gap-2.5 p-2.5">
            <ion-button fill="outline" @click="$router.go(-2)">Retour à mon trajet</ion-button>
          </div>
        </template>
        <template v-if="!$route.query.mode">
          <div class="flex max-w-[28rem] p-5 bg-white rounded-lg border border-black/15 gap-5" @click="help">
            <div class="text-[50px]">✋</div>
            <div class="my-auto font-medium text-balance">J'affiche ma carte d'aide pour la montrer à quelqu'un autour de moi</div>
          </div>
          <div class="flex max-w-[28rem] p-5 bg-white rounded-lg border border-black/15 gap-5" @click="map">
            <div class="w-[85px]">
              <!-- prettier-ignore -->
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 150 150">
                <path fill="#1a73e8" d="M89.77,10.4c-4.4-1.39-9.08-2.15-13.94-2.15c-14.18,0-26.87,6.41-35.33,16.48l21.8,18.34L89.77,10.4z"/>
                <path fill="#ea4335" d="M40.49,24.73c-6.74,8.02-10.81,18.37-10.81,29.66c0,8.68,1.73,15.71,4.57,22.01l28.04-33.33L40.49,24.73z"/>
                <path fill="#4285f4" d="M75.83,36.75c9.75,0,17.65,7.9,17.65,17.65c0,4.34-1.57,8.32-4.17,11.39c0,0,13.94-16.58,27.47-32.66   c-5.59-10.75-15.28-19.02-27-22.73L62.29,43.07C65.53,39.2,70.39,36.75,75.83,36.75"/>
                <path fill="#fbbc04" d="M75.83,72.04c-9.75,0-17.65-7.9-17.65-17.65c0-4.31,1.55-8.26,4.11-11.33L34.25,76.4   c4.79,10.63,12.76,19.16,20.97,29.91L89.3,65.79C86.07,69.61,81.23,72.04,75.83,72.04"/>
                <path fill="#34a853" d="M88.63,117.37c15.39-24.07,33.34-35,33.34-62.98c0-7.67-1.88-14.9-5.19-21.26l-61.55,73.18   c2.61,3.42,5.24,7.06,7.81,11.07c9.36,14.46,6.76,23.13,12.8,23.13C81.86,140.51,79.27,131.83,88.63,117.37"/>
              </svg>
            </div>
            <div class="my-auto font-medium text-balance">Je continue mon trajet à pied avec Google maps.</div>
          </div>
          <div class="flex max-w-[28rem] p-5 bg-white rounded-lg border border-black/15 gap-5" @click="call" v-if="$state.phone">
            <div class="text-[50px]">📞</div>
            <div class="my-auto font-medium text-balance">J'appelle un proche</div>
          </div>
          <hr class="border-t border-black/50 w-1/2" />
          <div class="flex gap-2.5 p-2.5">
            <ion-button fill="outline" @click="$router.back()">Retour à mon trajet</ion-button>
          </div>
        </template>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed } from "vue"
const travel = computed(() => $state.trips[$route.query.travel - 1])
const first = computed(() => travel.value.sequences.find((v) => v.stops))
const last = computed(() => travel.value.sequences.findLast((v) => v.stops))
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
async function call() {
  const phone = `+33${$state.phone.replace(/^(0|\+33)/, "")}`
  const destination = travel.value.to.text
  navigator.geolocation.getCurrentPosition(goto, (err) => goto())
  async function goto(position) {
    if (position) {
      const from = position.coords.latitude + "," + position.coords.longitude
      const map = `https://www.google.com/maps?q=${from}`
      // not awaiting for sms to be sent
      sms(`Bonjour, je suis en difficulté, je suis ici: ${map} et je cherche à me rendre ici: ${destination}`, phone)
    } else sms(`Bonjour, je suis en difficulté, je cherche à me rendre ici: ${destination}`, phone)
    window.location.href = `tel:${phone}`
  }
}
</script>
