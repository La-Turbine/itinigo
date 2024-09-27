<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <div style="font-size: 80%; font-weight: 500">{{ currentTrip.from.text }} - {{ currentTrip.to.text }}</div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="display: flex; flex-direction: column; justify-content: space-around; height: 100%; padding: 20px" v-if="!current">
        <div>
          <div style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 20px">Mon itinéraire</div>
          <card :trip="currentTrip" />
        </div>
        <div>
          <div style="font-size: 2rem; font-weight: 700; text-align: center; margin-bottom: 20px">Je vérifie</div>
          <div style="display: flex; gap: 10px">
            <div style="flex: 1">
              <img style="height: 110px; padding: 30px" src="/img/battery.svg" />
              <div style="font-size: 1.5rem; font-weight: 500; text-align: center; text-wrap: balance">La batterie de mon téléphone</div>
            </div>
            <div style="flex: 1">
              <img style="height: 110px; object-fit: cover" src="/img/card.png" />
              <div style="font-size: 1.5rem; font-weight: 500; text-align: center; text-wrap: balance">Mon ticket de transport</div>
            </div>
          </div>
        </div>
        <ion-button style="height: 80px; font-size: 1.5rem; font-weight: 700" @click="$router.push({ query: { step: 1 } })">C'est Parti !</ion-button>
      </div>
      <div style="display: flex; flex-direction: column; height: 100%" v-else-if="!current.stops">
        <div style="position: relative; display: flex; height: 80%">
          <img style="max-width: 100%; max-height: 100%; height: auto; margin: auto" :src="$state.photos[current.id]" />
          <img style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: auto" src="/img/success.svg" @load="confetti" v-if="currentStep === steps.length" />
        </div>
        <div style="display: flex; flex-direction: column; flex: 1; gap: 10px; padding: 10px; background: #f6f7f7; border-top: 1px solid rgba(0, 0, 0, 0.2)">
          <h2 style="margin: auto; text-align: center; text-wrap: balance; font-size: 150%">{{ current?.text }}</h2>
          <div style="display: flex; gap: 10px">
            <ion-button style="margin-left: auto; font-size: 125%" fill="outline" @click="$router.push(`/help?travel=${$route.params.id}`)">✋ AIDE</ion-button>
            <ion-button style="flex: 1; font-size: 125%" @click="$router.push({ query: { step: currentStep + 1 } })" v-if="currentStep < steps.length">SUIVANT</ion-button>
            <ion-button style="flex: 1; font-size: 125%" @click="$router.push('/')" v-else="currentStep < steps.length">RETOUR</ion-button>
          </div>
        </div>
      </div>
      <!-- https://play.tailwindcss.com/90GckuhEBW -->
      <div style="height: 100%; width: 100vw; overflow-x: auto" v-else>
        <div style="position: relative; display: flex; min-width: fit-content; align-items: center; justify-content: space-between; margin: 4rem">
          <div
            style="z-index: 10; margin: 4rem; height: 1rem; width: 1rem; display: flex; align-items: center; justify-content: center; border-radius: 9999px; background-color: white"
            :style="[i === 0 && 'margin-left: 0', i === current.stops.length - 1 && 'margin-right: 0', i <= progress.number ? 'background-color: #2563eb' : 'border: 2px solid black;']"
            v-for="(stop, i) in current.stops"
            ref="stops"
          >
            <div
              style="position: absolute; z-index: 10; margin: -0.5rem; height: 1.5rem; width: 1.5rem; border-radius: 9999px; background-color: #2563eb"
              class="animate-ping"
              v-if="i === current.stops.length - 1 && progress.number > i - 2"
            ></div>
            <div style="min-width: 10rem; min-height: 2rem; transform: translateY(-100%); text-align: center; text-wrap: balance">{{ stop.text }}</div>
          </div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #d1d5db"></div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #93c5fd" :style="progress"></div>
        </div>
        <pre>{{ progress }}</pre>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
const currentTrip = $state.trips[$route.params.id - 1] || {}
const currentStep = computed(() => +($route.query.step || 0))
const steps = computed(() => currentTrip.sequences.flatMap((v) => (v.stops ? [v.photos[0], v, v.photos[1]].filter((v) => v) : v.photos)).filter((v) => v.stops || v.text))
const current = computed(() => steps.value[currentStep.value - 1])
const stops = ref([])
const lat = ref(0)
const lng = ref(0)
navigator.geolocation.watchPosition(
  (position) => {
    const { latitude, longitude } = position.coords
    lat.value = latitude
    lng.value = longitude
  },
  (error) => console.error(`Error: ${error.message}`),
  {
    enableHighAccuracy: true, // Use GPS if available
    timeout: 5000, // Maximum time to wait for a response (in ms)
    maximumAge: 0, // Don't use cached position
  }
)
// HACK
const timer = ref(0)
setInterval(() => timer.value++, 20)
watch(() => current.value, () => (timer.value = 0)) // prettier-ignore
const progress = computed(() => {
  const number = Math.floor(timer.value / 100)
  const percentage = (timer.value % 100) / 100
  return { number, percentage, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
})
// HACK
// const progress = computed(() => {
//   if (!current.value?.stops || !lat.value || !lng.value) return { number: 0, percentage: 0, distance: 0, width: "0", maxWidth: "100%" }
//   const { number, percentage, distance } = progressBetweenStops({ lat: lat.value, lng: lng.value }, current.value.stops)
//   return { number, percentage, distance, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
// })
watch(
  () => progress.value.number,
  (number) => {
    if (!stops.value[number]) return
    stops.value[number].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    if (number !== stops.value.length - 2) return
    watch(
      () => progress.value.percentage < 0.1,
      () => notify("Préparez-vous à descendre, quand les portes s'ouvriront"),
      { once: true }
    )
    watch(
      () => progress.value.percentage < 0.9,
      () => $router.push({ query: { step: currentStep.value + 1 } }),
      { once: true }
    )
  }
)
async function confetti() {
  const confetti = await import("https://esm.sh/canvas-confetti")
  confetti.default({ particleCount: 500, spread: 100, origin: { y: 0.5 } })
}
function progressBetweenStops(currentPos, stops) {
  function haversineDistance(point1, point2) {
    const R = 6371e3 // Earth radius in meters
    const toRad = (x) => (x * Math.PI) / 180
    const dLat = toRad(point2.lat - point1.lat)
    const dLon = toRad(point2.lng - point1.lng)
    const lat1 = toRad(point1.lat)
    const lat2 = toRad(point2.lat)
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in meters
  }
  if (haversineDistance(currentPos, stops[1]) > haversineDistance(stops[0], stops[1])) return { number: -1, percentage: 0, distance: -haversineDistance(currentPos, stops[0]).toFixed(2) } // Negative distance
  for (let i = 0; i < stops.length - 1; i++) {
    const totalDist = haversineDistance(stops[i], stops[i + 1])
    const distFromStart = haversineDistance(stops[i], currentPos)
    const progress = Math.min((distFromStart / totalDist) * 100, 100)
    if (progress < 100) return { number: i, percentage: progress.toFixed(2) / 100, distance: totalDist - distFromStart }
  }
  return { number: stops.length - 2, percentage: 1, distance: 0 }
}
</script>

<style>
@keyframes ping {
  75%,
  100% {
    transform: scale(2);
    opacity: 0;
  }
}
.animate-ping {
  animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
}
</style>
