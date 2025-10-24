<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" @pointerdown.stop="back" @click.stop></ion-back-button>
        </ion-buttons>
        <div class="text-[80%] font-medium whitespace-pre-line text-center">{{ triptitle(currentTrip) }}</div>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div class="flex flex-col justify-around p-5 h-full overflow-hidden" v-if="!current">
        <div>
          <div class="text-[2rem] font-bold text-center mb-5">Mon itinéraire</div>
          <card-trip class="m-0" :trip="currentTrip" />
        </div>
        <div>
          <div class="text-[2rem] font-bold text-center mb-5">Je vérifie</div>
          <div class="flex gap-2.5">
            <div class="flex-1">
              <img class="h-[110px] p-[30px]" src="/img/battery.svg" />
              <div class="text-[1.4rem] font-medium text-center text-balance">La batterie de mon téléphone</div>
            </div>
            <div class="flex-1">
              <img class="h-[110px] object-cover" src="/img/card.png" />
              <div class="text-[1.4rem] font-medium text-center text-balance">Mon ticket de transport</div>
            </div>
          </div>
        </div>
        <ion-button class="h-20 text-[1.4rem] font-bold" @click="gogo">C'est Parti !</ion-button>
      </div>
      <div class="flex flex-col h-full overflow-hidden" v-else-if="!current.stops">
        <div class="relative flex h-[80%]" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
          <img class="max-w-full max-h-full object-cover m-auto select-none pointer-events-none" :src="$state.photos[current.id]" :style="cardStyle" />
          <img class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 m-auto" src="/img/success.svg" @load="confetti" v-if="currentStep === steps.length" />
        </div>
        <div class="flex h-[20%] gap-2.5 p-2.5 bg-[#f6f7f7] border-t border-black/20">
          <h2 class="m-auto text-center text-balance max-h-full whitespace-pre-line" :ref="adjust">{{ current?.text }}</h2>
          <ion-button class="absolute top-0 left-0 rounded" color="light" @click="$router.push(`/help?travel=${$route.params.id}`)">✋ AIDE</ion-button>
          <ion-button class="text-[125%]" @click="$router.push({ query: { step: currentStep + 1 } })" v-if="currentStep < steps.length">SUIVANT</ion-button>
          <ion-button class="text-[125%]" @click="$router.push('/')" v-if="currentStep === steps.length">
            RETOUR
            <br />
            AUX
            <br />
            TRAJETS
          </ion-button>
        </div>
      </div>
      <!-- https://play.tailwindcss.com/90GckuhEBW -->
      <div class="h-full w-screen overflow-x-auto overflow-y-hidden" v-else>
        <div class="relative flex min-w-fit items-center justify-between m-16">
          <div
            class="z-10 mx-16 h-4 w-4 flex items-center justify-center rounded-full bg-white"
            :class="[i === 0 && 'ml-0', i === current.stops.length - 1 && 'mr-0', i <= progress.number ? 'bg-blue-600' : 'border-2 border-black']"
            v-for="(stop, i) in current.stops"
            ref="stops"
          >
            <div class="absolute z-10 -m-2 h-[1.4rem] w-[1.4rem] rounded-full bg-blue-600 animate-ping" v-if="i === current.stops.length - 1 && progress.number > i - 2"></div>
            <div class="min-w-[10rem] min-h-8 -translate-y-full text-center text-balance">{{ stop.text }}</div>
          </div>
          <div class="absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-gray-300"></div>
          <div class="absolute left-0 right-0 top-1/2 h-4 -translate-y-1/2 rounded-full bg-blue-300" :style="progress"></div>
        </div>
        <ion-button class="absolute top-0 rounded" color="light" @click="$router.push(`/help?travel=${$route.params.id}`)">✋ AIDE</ion-button>
        <ion-button class="absolute top-0 right-0 rounded" color="light" @click="$router.push({ query: { step: currentStep + 1 } })">SUIVANT</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from "vue"
const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 0))
const steps = computed(() => currentTrip.value.sequences?.flatMap((v) => (v.stops ? [...v.photos.slice(0, -1), v, v.photos.at(-1)] : v.photos)).filter((v) => v.stops || v.text) ?? [])
const current = computed(() => steps.value[currentStep.value - 1])
const stops = ref([])
const lat = computed(() => window.$position.value?.coords?.latitude ?? 0)
const lng = computed(() => window.$position.value?.coords?.longitude ?? 0)
if ("Notification" in window) Notification.requestPermission()
// HACK
const timer = ref(0)
setInterval(() => timer.value++, 20)
watch(() => current.value, () => (timer.value = 0)) // prettier-ignore
// TODO: For Android: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/periodicSync
// // WIP
// let wakeLock = null
// async function requestWakeLock() {
//   try {
//     wakeLock = await navigator.wakeLock.request("screen")
//     wakeLock.addEventListener("release", () => console.log("Wake Lock was released"))
//     console.log("Wake Lock is active")
//   } catch (err) {
//     console.error(`${err.name}, ${err.message}`)
//   }
// }
// document.addEventListener("visibilitychange", () => {
//   if (wakeLock !== null && document.visibilityState === "visible") requestWakeLock()
// })
// requestWakeLock()
const progress = computed(() => {
  // HACK
  if ($state.fake) {
    const number = Math.floor(timer.value / 100)
    const percentage = (timer.value % 100) / 100
    return { number, percentage, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
  }
  if (!current.value?.stops || !lat.value || !lng.value) return { number: 0, percentage: 0, distance: 0, width: "0", maxWidth: "100%" }
  let { number, percentage, distance } = progressBetweenStops({ lat: lat.value, lng: lng.value }, current.value.stops)
  percentage = percentage < 0.15 ? 0 : percentage > 0.85 ? 1 : percentage
  return { number, percentage, distance, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
})
watch(
  () => progress.value.number,
  (number) => {
    if (!stops.value[number]) return
    stops.value[number].scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
    if (number !== stops.value.length - 2) return
    watch(
      () => progress.value.percentage < 0.15,
      () => {
        if (current.value.type.startsWith("Bus")) return notify("Appuyez sur le bouton pour demander l'arrêt.\nPréparez-vous à descendre au prochain arrêt", "Appuyez sur le bouton")
        return notify("Préparez-vous à descendre quand les portes s'ouvriront.", "Préparez-vous à descendre")
      },
      { once: true },
    )
    watch(
      () => progress.value.percentage < 0.85,
      () => $router.push({ query: { step: currentStep.value + 1 } }),
      { once: true },
    )
  },
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
  try {
    if (
      haversineDistance(currentPos, stops[0]) < 1000 &&
      haversineDistance(currentPos, stops[1]) > haversineDistance(stops[0], stops[1]) &&
      haversineDistance(currentPos, stops[2]) > haversineDistance(stops[1], stops[2])
    )
      return { number: 0, percentage: 0, distance: -haversineDistance(currentPos, stops[0]).toFixed(2) } // Negative distance
    for (let i = 0; i < stops.length - 1; i++) {
      const totalDist = haversineDistance(stops[i], stops[i + 1])
      const distFromStart = haversineDistance(stops[i], currentPos)
      const progress = Math.min((distFromStart / totalDist) * 100, 100)
      if (progress < 100) return { number: i, percentage: progress.toFixed(2) / 100, distance: totalDist - distFromStart }
    }
    return { number: stops.length - 2, percentage: 1, distance: 0 }
  } catch (e) {
    return { number: 0, percentage: 0, distance: 0 }
  }
}
const touchStartX = ref(0)
const translateX = ref(0)
const cardStyle = ref({})
function onTouchStart(e) {
  touchStartX.value = e.touches[0].clientX
}
function onTouchMove(e) {
  translateX.value = e.touches[0].clientX - touchStartX.value
  cardStyle.value = { transform: `translateX(${translateX.value}px)` }
}
function onTouchEnd(e) {
  cardStyle.value = {}
  const touchEndX = e.changedTouches[0].clientX
  const diffX = touchEndX - touchStartX.value
  if (diffX > 100) return $router.push({ query: { step: currentStep.value - 1 } })
  if (diffX < -100 && currentStep.value === steps.length) return $router.push("/")
  if (diffX < -100) return $router.push({ query: { step: currentStep.value + 1 } })
}
function adjust(ref) {
  setTimeout(() => adjustFontSize(ref, 32))
  setTimeout(() => adjustFontSize(ref, 32), 200)
}
function adjustFontSize(el, size = +getComputedStyle(el).fontSize) {
  if (!el) return
  el.style.fontSize = `${size}px`
  while (el.scrollHeight > el.offsetHeight || el.scrollWidth > el.offsetWidth) el.style.fontSize = `${--size}px`
}
function back() {
  if ($state.mode === "helper") {
    const url = `/trip/${$route.params.id}?step=3`
    $router.push(`/`)
    return setTimeout(() => $router.push(url), 100)
  }
  if (!confirm("Êtes-vous sûr de vouloir quitter le guidage ?")) return
  $router.push("/")
}
function gogo() {
  if (!$position.value?.timestamp && !confirm("La geolocation n'est pas activé, voulez-vous commencer le guidage malgré tout ?")) return
  $router.push({ query: { step: 1 } })
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
