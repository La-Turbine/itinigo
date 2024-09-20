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
      <div style="display: flex; flex-direction: column; height: 100%">
        <div style="display: flex; height: 85%">
          <!-- https://play.tailwindcss.com/90GckuhEBW -->
          <div style="width: 100vw; overflow-x: auto" v-if="currentChoice.stops">
            <div style="position: relative; display: flex; min-width: fit-content; align-items: center; justify-content: space-between; margin: 4rem">
              <div
                style="z-index: 10; margin: 4rem; height: 1rem; width: 1rem; display: flex; align-items: center; justify-content: center; border-radius: 9999px; background-color: white"
                :style="[i === 0 && 'margin-left: 0', i === currentChoice.stops.length - 1 && 'margin-right: 0', i <= progress.number ? 'background-color: #2563eb' : 'border: 2px solid black;']"
                v-for="(stop, i) in currentChoice.stops"
                ref="stops"
              >
                <div
                  style="position: absolute; z-index: 10; margin: -0.5rem; height: 1.5rem; width: 1.5rem; border-radius: 9999px; background-color: #2563eb"
                  class="animate-ping"
                  v-if="i === currentChoice.stops.length - 1 && progress.number > i - 2"
                ></div>
                <div style="min-width: 10rem; min-height: 2rem; transform: translateY(-100%); text-align: center; text-wrap: balance">{{ stop.name }}</div>
              </div>
              <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #d1d5db"></div>
              <div style="position: absolute; left: 0; right: 0; top: 50%; height: 1rem; transform: translateY(-50%); border-radius: 9999px; background-color: #93c5fd" :style="progress"></div>
            </div>
          </div>
          <img style="max-width: 100%; max-height: 100%; height: auto; margin: auto" :src="$state.photos[currentChoice.id]" v-else />
        </div>
        <div style="display: flex; flex: 1">
          <h2 style="padding: 4px; margin: auto">{{ currentChoice.text }}</h2>
          <ion-button @click="$router.push({ query: { step: currentStep + 1 } })" v-if="currentStep < steps.length">SUIVANT</ion-button>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
const currentTrip = $state.trips[$route.params.id - 1] || {}
const currentStep = computed(() => +($route.query.step || 1))
const steps = computed(() => currentTrip.sequences.flatMap((v) => (v.stops ? [v.photos[0], v, v.photos[1]].filter((v) => v) : v.photos)).filter((v) => v.stops || v.id))
const currentChoice = computed(() => steps.value[currentStep.value - 1])
const timer = ref(0)
setInterval(() => timer.value++, 20)
const progress = computed(() => {
  const number = Math.floor(timer.value / 100)
  const percentage = (timer.value % 100) / 100
  return { number, percentage, width: `${9 * number + 9 * percentage + 1}rem`, maxWidth: "100%" }
})
const stops = ref([])
watch(
  () => progress.value.number,
  (n) => stops.value[n]?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" })
)
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
