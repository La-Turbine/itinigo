<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" @pointerdown.stop="back" @click.stop></ion-back-button>
        </ion-buttons>
        <ion-button class="mx-auto block h-10 w-24" size="small" @click.stop="$router.push({ query: { ...$route.query, step: 5 } })" v-if="currentStep === 4 && !currentPhoto.text">Nommer l'action</ion-button>
        <div class="text-center text-[80%] font-medium whitespace-pre-line" v-else-if="currentStep > 3">{{ currentPhoto.text }}</div>
        <div class="text-center text-[80%] font-medium whitespace-pre-line" v-else>{{ triptitle(currentTrip) }}</div>
        <ion-buttons slot="end" v-if="currentStep === 3">
          <ion-button @click="$router.push({ query: { ...$route.query, reorder: undefined } })" v-if="$route.query.reorder">OK</ion-button>
          <div class="i-lucide/eye mr-2 text-xl" @click="actions[0].handler()" v-if="!$route.query.reorder"></div>
        </ion-buttons>
        <ion-buttons slot="end" v-if="currentStep > 3">
          <div id="actionsTop" class="i-lucide/ellipsis-vertical text-xl"></div>
          <ion-action-sheet trigger="actionsTop" :buttons="actions.filter((v) => v.text !== 'Déplacer')"></ion-action-sheet>
        </ion-buttons>
      </ion-toolbar>
      <ion-action-sheet :isOpen="$route.query.action" @didDismiss="$router.push({ replace: true, query: { ...$route.query, action: undefined, ...(currentStep === 3 && { sequence: undefined, photo: undefined }) } })" :buttons="actions.filter((v) => ($route.query.step === '3' && !$route.query.reorder) || v.text !== 'Déplacer')"></ion-action-sheet>
    </ion-header>
    <ion-content forceOverscroll="false">
      <!-- Step 1 & 2 -->
      <form-trip />
      <!-- Step 3 -->
      <list-step />
      <!-- Step 4 -->
      <form-photo />
      <!-- Step 5 -->
      <form-action />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { computed, watch, provide } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])

const actions = [
  { text: "Prévisualiser", handler: () => $router.push(`/travel/${$route.params.id}?step=${sumStep(+$route.query.sequence, +$route.query.photo) || 1}`) },
  { text: "Ajouter avant", handler: () => addPhoto(+$route.query.sequence, +$route.query.photo) },
  { text: "Ajouter après", handler: () => addPhoto(+$route.query.sequence, +$route.query.photo + 1) },
  { text: "Éditer l'action", handler: () => $router.push({ query: { ...$route.query, step: 5 } }) },
  { text: "Éditer la photo", handler: () => $router.push({ query: { ...$route.query, step: 4 } }) },
  { text: "Déplacer", handler: () => $router.push({ query: { ...$route.query, reorder: 1 } }) },
  { text: "Supprimer", role: "destructive", handler: () => deletePhoto(currentSequence.value, +$route.query.photo) },
  { text: "Annuler", role: "cancel" },
]
// Step 3: List photos
function sumStep(sequence, photo) {
  // TODO: filter out empty photos { type: 0, text: "" }
  return currentTrip.value.sequences.slice(0, sequence).reduce((acc, v) => acc + v.photos.length + !!v.stops, 0) + photo + 1
}
function addPhoto(sequenceIndex, photoIndex) {
  const sequence = currentTrip.value.sequences[sequenceIndex]
  const photo = { type: 0, text: "" }
  sequence.photos.splice(photoIndex, 0, photo)
  $router.push({ query: { step: 4, sequence: sequenceIndex, photo: photoIndex } })
}
function deletePhoto(sequence, index) {
  idb.del(sequence.photos[index].id)
  sequence.photos.splice(index, 1)
}
// Utils
function back() {
  if (!$route.query.step || $route.query.step === "1") return $router.push("/")
  if ($route.query.step === "2") return $router.push({ query: { step: 1 } })
  if ($route.query.step === "3" && window.formTrip === $route.params.id) return $router.push({ query: { step: 2 } })
  if ($route.query.step === "3") return $router.push("/")
  if ($route.query.step === "4") return $router.push({ query: { step: 3 } })
  if ($route.query.step === "5") return $router.push({ query: { ...$route.query, step: 4 } })
  $router.go(-1)
}
// Scroll to selected photo
watch(
  () => [$route.query.sequence, $route.query.photo],
  () => {
    setTimeout(() => {
      if ($route.query.sequence === "0" && $route.query.photo === "0") return
      const el = $(`[data-sequence="${$route.query.sequence}"][data-photo="${$route.query.photo}"]`)
      el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" })
    }, 0)
  },
  { immediate: true },
)
// Provide addPhoto, deletePhoto to other components
provide("addPhoto", addPhoto)
provide("deletePhoto", deletePhoto)
</script>
