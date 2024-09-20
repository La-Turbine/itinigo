<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Trajet {{ $route.params.id }} - {{ currentStep }} - {{ currentTrip.from }} - {{ currentTrip.to }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <div style="display: flex; flex-direction: column; height: 100%; gap: 60px; padding: 60px 20px" v-if="!current">
        <div style="font-size: 2rem; font-weight: 700; text-align: center">Mon itinéraire</div>
        <card :trip="currentTrip" />
        <div style="font-size: 2rem; font-weight: 700; text-align: center">Je vérifie</div>
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
        <ion-button style="height: 80px; font-size: 1.5rem; font-weight: 700" @click="$router.push({ query: { step: 1 } })">C'est Parti !</ion-button>
      </div>
      <div style="display: flex; flex-direction: column; height: 100%" v-else-if="!current.stops">
        <div style="position: relative; display: flex; height: 85%">
          <img style="max-width: 100%; max-height: 100%; height: auto; margin: auto" :src="$state.photos[current.id]" />
          <img style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); margin: auto" src="/img/success.svg" @load="confetti" v-if="currentStep === steps.length" />
        </div>
        <div style="display: flex; flex: 1">
          <h2 style="padding: 4px; margin: auto">{{ current?.text }}</h2>
          <ion-button @click="$router.push({ query: { step: currentStep + 1 } })" v-if="currentStep < steps.length">SUIVANT</ion-button>
          <ion-button @click="$router.push('/')" v-else="currentStep < steps.length">RETOUR</ion-button>
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
            <div style="min-width: 10rem; min-height: 2rem; transform: translateY(-100%); text-align: center; text-wrap: balance">{{ stop.name }}</div>
          </div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #d1d5db"></div>
          <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #93c5fd" :style="progress"></div>
        </div>
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
// HACK
const timer = ref(0)
setInterval(() => timer.value++, 20)
watch(() => current.value, () => (timer.value = 0)) // prettier-ignore
// HACK
const progress = computed(() => {
  const number = Math.floor(timer.value / 100)
  const percentage = (timer.value % 100) / 100
  return { number, percentage, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
})
const stops = ref([])
const battery = ref(0)
onMounted(async () => {
  const manager = await navigator.getBattery()
  battery.value = manager?.level
})
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
