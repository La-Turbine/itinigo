<template>
  <template v-if="currentStep === 4">
    <div class="flex flex-col h-full overflow-hidden">
      <div class="relative flex h-[80%]" @click="clickPhoto()" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <template v-if="!photo">
          <button class="DoneButton absolute left-0" @click.stop="clickPhoto(true)" v-if="$state.photos[currentPhoto.id]">Changer</button>
          <img class="max-w-full max-h-full object-cover m-auto select-none pointer-events-none" :src="$state.photos[currentPhoto.id] || '/img/gallery.svg'" :style="cardStyle" />
        </template>
        <tldraw-annotator :url="$state.photos[`${photo}:snapshot`] || $state.photos[photo]" @done="annotatePhoto" v-else />
      </div>
      <div class="flex h-[20%] gap-2.5 p-2.5 bg-gray-100 border-t border-black/20 overflow-auto">
        <template v-for="(sequence, i) in currentTrip.sequences">
          <card-step :i="i" :j="j" v-for="(photo, j) in sequence.photos" :key="photo" />
        </template>
      </div>
    </div>
    <!-- <input type="file" accept="image/*;capture" class="hidden" @change="inputPhoto" :ref="(ref) => (state.refInput = ref)" /> -->
    <input type="file" accept="image/*" class="hidden" @change="inputPhoto" :ref="(ref) => (state.refGallery = ref)" />
    <input type="file" accept="image/*" capture="environment" class="hidden" @change="inputPhoto" :ref="(ref) => (state.refCamera = ref)" />
  </template>
</template>

<script setup>
import { ref, reactive, computed } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])

const photo = ref(null)
const state = reactive({
  refGallery: null,
  refCamera: null,
  currentPhoto: null,
})

function clickPhoto(change, p = currentPhoto.value, ref = "refGallery") {
  window.currentPhoto = p
  state.currentPhoto = p
  if (p?.id && !change) photo.value = p.id
  else state[ref].click()
}
function inputPhoto(event) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onload = async () => {
    function generateULID() {
      const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
      const time = Math.floor(Date.now() / 1000).toString(32).toUpperCase().padStart(10, "0") // prettier-ignore
      const randomPart = Array.from({ length: 16 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
      return `${time}${randomPart}`
    }
    const id = generateULID()
    await idb.del(state.currentPhoto.id)
    await idb.del(`${state.currentPhoto.id}:snapshot`)
    await idb.set(id, reader.result)
    state.currentPhoto.id = id
    $state.photos[id] = reader.result
    photo.value = id
  }
  reader.readAsDataURL(file)
}
async function annotatePhoto({ blob, snapshot }) {
  if (!blob) return setTimeout(() => (photo.value = null), 0)
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = async () => {
    const id = photo.value
    const url = reader.result // .replace("text/plain", "image/svg+xml")
    $state.photos[id] = url
    $state.photos[`${id}:snapshot`] = JSON.stringify(snapshot)
    photo.value = null
    await idb.set(id, $state.photos[id])
    await idb.set(`${id}:snapshot`, $state.photos[`${id}:snapshot`])
  }
}

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
      pho = -1
      if (currentTrip.value.sequences[seq].photos.length > 0) break
    }
    if (seq === currentTrip.value.sequences.length - 1 && pho === -1) return
  }
  return $router.push({ query: { step: 4, sequence: seq, photo: pho + 1 } })
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
