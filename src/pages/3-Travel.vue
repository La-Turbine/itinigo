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
          <div style="display: flex; flex-direction: column; gap: 4px; padding: 20px" v-if="currentChoice.stops">
            <h2 v-for="stop in currentChoice.stops">{{ stop }}</h2>
          </div>
          <img style="max-width: 100%; height: auto; margin: auto" :src="currentChoice.image" v-else />
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
import { computed } from "vue"
const currentTrip = $state.trips[$route.params.id - 1] || {}
const currentStep = computed(() => +($route.query.step || 1))
const steps = computed(() => currentTrip.sequences.flatMap((v) => (v.stops ? [v.photos[0], v, v.photos[1]] : v.photos)).filter((v) => v.stops || v.image))
const currentChoice = computed(() => steps.value[currentStep.value - 1])
</script>
