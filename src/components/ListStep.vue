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
          <ion-label class="text-2xl font-bold whitespace-pre-line">{{ sequence.transport }}</ion-label>
        </ion-list-header>
        <div v-if="sequence.stops" class="flex items-stretch gap-4">
          <div class="flex flex-col items-center py-1">
            <div class="size-2.5 rounded-full bg-(--ion-color-primary) ring-2 ring-(--ion-color-primary)/20"></div>
            <div class="w-0.5 flex-1 rounded-full bg-(--ion-color-primary)"></div>
            <div class="i-lucide/arrow-down -my-1 -mt-1.5 text-[22px] text-(--ion-color-primary)"></div>
          </div>
          <div class="flex min-w-0 flex-1 flex-col">
            <div class="truncate text-base leading-[22px] text-slate-600" v-for="stop in $route.query[`expand${i}`] ? sequence.stops.slice(0, -1) : [sequence.stops[0], ...(sequence.stops.length === 3 ? [sequence.stops[1]] : [])]">{{ stop.text }}</div>
            <div class="inline-flex cursor-pointer items-center gap-1 self-start rounded-full bg-slate-100 px-2 py-0.5 text-sm leading-[22px] text-slate-600 transition-colors hover:bg-slate-200" v-if="sequence.stops.length > 3" @click="$router.replace({ query: { ...$route.query, [`expand${i}`]: $route.query[`expand${i}`] ? undefined : 1 } })">
              {{ $route.query[`expand${i}`] ? "Masquer" : `+ ${sequence.stops.length - 2} arrêt${sequence.stops.length - 2 > 1 ? "s" : ""}` }}
              <div :class="$route.query[`expand${i}`] ? 'i-lucide/chevron-up' : 'i-lucide/chevron-down'" class="-my-1 text-base text-slate-500"></div>
            </div>
            <div class="truncate text-lg leading-[22px] font-semibold text-slate-800">{{ sequence.stops.at(-1).text }}</div>
          </div>
        </div>
        <ion-list lines="none">
          <ion-reorder-group :disabled="!$route.query.reorder" @ionItemReorder="reorderPhoto(sequence, $event)">
            <ion-item v-for="(photo, j) in sequence.photos" :key="photo">
              <card-step class="my-1 w-full" :i="i" :j="j" />
              <ion-reorder slot="end"></ion-reorder>
            </ion-item>
          </ion-reorder-group>
        </ion-list>
        <ion-button class="mx-5 my-2.5" expand="block" @click="addPhoto(i, sequence.photos.length)">
          <div class="i-lucide/plus mx-2 -my-1 text-2xl"></div>
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
  if (sequenceIndex === currentTrip.value.sequences.length - 1 && photoIndex === sequence.photos.length) photoIndex -= 1
  sequence.photos.splice(photoIndex, 0, photo)
  $router.push({ query: { step: 4, sequence: sequenceIndex, photo: photoIndex } })
}
</script>
