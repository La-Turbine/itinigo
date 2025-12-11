<template>
  <template v-if="currentStep === 4">
    <div class="flex h-full flex-col overflow-hidden">
      <div class="relative flex h-[calc(100%-140px)] p-5" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <div class="relative flex flex-1 overflow-hidden rounded-4xl bg-gray-200" :style="cardStyle">
          <div class="absolute inset-0 flex w-full flex-col justify-end gap-5 p-10">
            <ion-button expand="block" @click="$router.push({ query: { ...$route.query, step: 5 } })">
              <div class="i-lucide/type mx-2 -my-1 text-2xl"></div>
              Décrire l'action
            </ion-button>
            <ion-button expand="block" @click="$router.push({ query: { ...$route.query, step: 6 } })">
              <div class="i-lucide/image-plus mx-2 -my-1 text-2xl"></div>
              Ajouter une photo
            </ion-button>
          </div>
          <img class="object-cover select-none" :src="$state.photos[currentPhoto.id]" />
        </div>
      </div>
      <div class="flex h-[140px] gap-2.5 overflow-auto border-t border-black/20 bg-gray-100 p-2.5">
        <template v-for="(sequence, i) in currentTrip.sequences">
          <template v-for="(photo, j) in sequence.photos">
            <card-step :i="i" :j="j" />
            <div class="m-auto flex h-10 min-w-10 items-center justify-center rounded-full bg-black text-white" @click="$router.push('/')" v-if="i === currentTrip.sequences.length - 1 && j === currentTrip.sequences.at(-1).photos.length - 1">
              <div class="i-lucide/check-check size-5"></div>
            </div>
            <div class="m-auto flex h-10 min-w-10 items-center justify-center rounded-full bg-black text-white" @click="addPhoto(i, j + 1)" v-else>
              <div class="i-lucide/plus size-5"></div>
            </div>
          </template>
        </template>
      </div>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, inject } from "vue"

const addPhoto = inject("addPhoto")
const deletePhoto = inject("deletePhoto")

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])

// Swipe to change photo
const touchStartX = ref(0)
const translateX = ref(0)
const cardStyle = ref({})
function prevStep() {
  let seq = +$route.query.sequence
  let pho = +$route.query.photo
  if (pho === 0) {
    while (seq > 0) {
      seq--
      pho = currentTrip.value.sequences[seq].photos.length
      if (pho > 0) break
    }
    if (seq === 0 && pho === 0) return
  }
  return $router.push({ query: { step: 4, sequence: seq, photo: pho - 1 } })
}
function nextStep() {
  let seq = +$route.query.sequence
  let pho = +$route.query.photo
  if (pho === currentTrip.value.sequences[seq].photos.length - 1) {
    while (seq < currentTrip.value.sequences.length - 1) {
      seq++
      pho = 0
      if (currentTrip.value.sequences[seq].photos.length > 0) break
    }
    if (seq === currentTrip.value.sequences.length - 1 && pho === 0 && currentTrip.value.sequences[seq].photos.length === 0) return
  } else {
    pho++
  }
  return $router.push({ query: { step: 4, sequence: seq, photo: pho } })
}
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
  if (diffX > 100) return prevStep()
  if (diffX < -100) return nextStep()
}
</script>
