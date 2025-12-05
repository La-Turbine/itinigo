<template>
  <div v-if="currentStep === 3">
    <ion-list lines="none" inset>
      <ion-label class="text-xs font-bold uppercase">Rappel du trajet</ion-label>
      <card-trip :trip="currentTrip" />
    </ion-list>
    <ion-label class="m-5 text-xs font-bold uppercase">Détails du trajet</ion-label>
    <template v-for="(sequence, i) in currentTrip.sequences">
      <ion-list lines="none" inset>
        <ion-list-header>
          <ion-label class="text-xl font-bold">{{ sequence.transport }}</ion-label>
        </ion-list-header>
        <div v-if="sequence.stops">
          <div class="flex gap-4 items-stretch">
            <div class="flex flex-col items-center py-1">
              <div class="size-2.5 rounded-full bg-emerald-400 ring-2 ring-emerald-100"></div>
              <div class="flex-1 w-0.5 bg-linear-to-b from-emerald-400 to-blue-500 rounded-full"></div>
              <div class="i-lucide/arrow-down text-blue-500 text-[22px] -mt-1.5 -my-1"></div>
            </div>
            <div class="flex flex-col flex-1 min-w-0">
              <div class="text-base text-slate-600 truncate">{{ sequence.stops[0].text }}</div>
              <div class="text-base text-slate-600 truncate" v-if="sequence.stops.length === 3">{{ sequence.stops[1].text }}</div>
              <div class="text-base text-slate-600 truncate" v-if="sequence.stops.length > 3">+ {{ sequence.stops.length - 2 }} arrêt{{ sequence.stops.length - 2 > 1 ? "s" : "" }}</div>
              <div class="text-lg font-semibold text-slate-800 truncate">{{ sequence.stops.at(-1).text }}</div>
            </div>
          </div>
        </div>
        <ion-list lines="none">
          <ion-reorder-group :disabled="!$route.query.reorder" @ionItemReorder="reorderPhoto(sequence, $event)">
            <ion-item v-for="(photo, j) in sequence.photos" :key="photo">
              <card-step class="w-full my-1" :i="i" :j="j" />
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>
        <ion-button class="my-2.5 mx-5" expand="block" @click="addPhoto(i, sequence.photos.length)">
          <div class="text-2xl i-lucide/plus mx-1 -my-1"></div>
          Ajouter une étape
        </ion-button>
      </ion-list>
    </template>
  </div>
</template>

<script setup>
import { ref, computed } from "vue"
const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
function reorderPhoto(sequence, event) {
  event.detail.complete(sequence.photos)
}
function addPhoto(sequenceIndex, photoIndex) {
  const sequence = currentTrip.value.sequences[sequenceIndex]
  const photo = { type: 0, text: "" }
  sequence.photos.splice(photoIndex, 0, photo)
  $router.push({ query: { step: 4, sequence: sequenceIndex, photo: photoIndex } })
}
</script>
