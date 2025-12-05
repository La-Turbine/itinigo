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
          <ion-label class="text-3xl font-bold">{{ sequence.transport }}</ion-label>
        </ion-list-header>
        <div class="-mt-[15px] mx-5 mb-[15px]" v-if="sequence.stops">
          <div class="font-bold">{{ sequence.stops.length }} arrêts</div>
          <div v-for="stop in sequence.stops">{{ stop.text }}</div>
        </div>
        <ion-list lines="none">
          <ion-reorder-group :disabled="!$route.query.reorder" @ionItemReorder="reorderPhoto(sequence, $event)">
            <ion-item v-for="(photo, j) in sequence.photos" :key="photo">
              <card-step class="w-full my-1" :i="i" :j="j" />
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>
        <ion-button class="my-2.5 mx-5" expand="block" @click="addPhoto(i, sequence.photos.length)">Ajouter une étape</ion-button>
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
