<template>
  <div v-if="currentStep === 3">
    <div class="m-5">
      <b>Rappel de mon trajet:</b>
      <div>
        Départ de <b>{{ currentTrip.from.text }}</b>
      </div>
      <div>
        Transports en
        <span v-for="transport in currentTrip.sequences.filter((v) => v.stops)">
          <b>{{ transport.type }}</b> ({{ transport.stops.length }} arrêts)
        </span>
      </div>
      <div>
        Arrivée à <b>{{ currentTrip.to.text }}</b>
      </div>
      <div>
        Durée: <b>{{ currentTrip.duration }}</b>
      </div>
    </div>
    <div class="py-5 border-b border-black/25"></div>
    <ion-list lines="none" v-for="(sequence, i) in currentTrip.sequences">
      <ion-item class="font-bold m-5">{{ sequence.transport }}</ion-item>
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
      <div class="py-5 border-b border-black/25" v-if="i !== currentTrip.sequences.length - 1"></div>
    </ion-list>
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
