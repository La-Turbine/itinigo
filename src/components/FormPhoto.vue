<template>
  <template v-if="currentStep === 4">
    <div class="flex flex-col h-full overflow-hidden">
      <div class="relative flex h-[calc(100%-140px)]" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
        <button v-if="$state.photos[currentPhoto.id]" class="DoneButton absolute right-0" :class="change && 'bg-[#f87171]!'" @click.stop="clickGallery('change')">
          {{ change ? "Annuler" : "Changer" }}
        </button>
        <photo-stream v-if="change || !$state.photos[currentPhoto.id]" :style="cardStyle" ref="stream" />
        <photo-annotator v-else-if="photo" :url="$state.photos[`${photo}:snapshot`] || $state.photos[photo]" @done="annotatePhoto" ref="annotator" />
        <img v-else :style="cardStyle" class="max-w-full max-h-full object-cover m-auto select-none" :src="$state.photos[currentPhoto.id]" @click="clickGallery()" />
      </div>
      <div class="z-10 absolute bottom-[140px] w-full flex h-[140px]" v-if="change || !$state.photos[currentPhoto.id]">
        <!-- <div class="h-10 w-10 bg-gray-600 i-ion/arrow-back my-auto" @click="prevStep"></div> -->
        <div class="flex gap-4 m-auto">
          <div class="h-20 w-20 ring-1 ring-gray-300 rounded-full border-6 border-white bg-gray-200 active:scale-95" @click="clickCapture()"></div>
          <div class="h-20 w-20 ring-1 ring-gray-300 rounded-xl bg-gray-200 active:scale-95 flex" @click="input.click()"><div class="m-auto text-2xl bg-gray-600 i-lucide/image"></div></div>
        </div>
        <!-- <div class="h-10 w-10 bg-gray-600 i-ion/arrow-forward my-auto" @click="nextStep"></div> -->
      </div>
      <div class="flex h-[140px] gap-2.5 p-2.5 bg-gray-100 border-t border-black/20 overflow-auto">
        <template v-for="(sequence, i) in currentTrip.sequences">
          <card-step :i="i" :j="j" v-for="(photo, j) in sequence.photos" :key="photo" />
        </template>
      </div>
    </div>
    <input type="file" accept="image/*" class="hidden" @change="inputPhoto" ref="input" />
  </template>
</template>

<script setup>
import { ref, computed } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])

const change = ref(false)
const photo = ref(null)
const input = ref(null)
const stream = ref(null)
const annotator = ref(null)

async function clickCapture() {
  const blob = await stream.value.capturePhoto()
  savePhoto(blob)
}
function clickGallery(mode) {
  if (mode === "change") return (change.value = !change.value)
  if (currentPhoto.value.id.length < 20) return // BUS/TRAM IN/OUT
  window.currentPhoto = currentPhoto.value
  photo.value = currentPhoto.value.id
}
function inputPhoto(event) {
  const file = event.target.files[0]
  savePhoto(file)
}
function savePhoto(blob) {
  change.value = false
  const reader = new FileReader()
  reader.onload = async () => {
    function generateULID() {
      const alphabet = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"
      const time = Math.floor(Date.now() / 1000).toString(32).toUpperCase().padStart(10, "0") // prettier-ignore
      const randomPart = Array.from({ length: 16 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
      return `${time}${randomPart}`
    }
    const id = generateULID()
    await idb.del(currentPhoto.value.id)
    await idb.del(`${currentPhoto.value.id}:snapshot`)
    await idb.set(id, reader.result)
    currentPhoto.value.id = id
    $state.photos[id] = reader.result
    window.currentPhoto = currentPhoto.value
    photo.value = id
  }
  reader.readAsDataURL(blob)
}
function annotatePhoto({ blob, snapshot }) {
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
  if (annotator.value) return
  touchStartX.value = e.touches[0].clientX
}
function onTouchMove(e) {
  if (annotator.value) return
  translateX.value = e.touches[0].clientX - touchStartX.value
  cardStyle.value = { transform: `translateX(${translateX.value}px)` }
}
function onTouchEnd(e) {
  if (annotator.value) return
  cardStyle.value = {}
  const touchEndX = e.changedTouches[0].clientX
  const diffX = touchEndX - touchStartX.value
  if (diffX > 100) return prevStep()
  if (diffX < -100) return nextStep()
}

// Make sur to close annotator on any click outside it
addEventListener("pointerdown", (e) => {
  if (!annotator.value) return
  if (annotator.value.$el.contains(e.target)) return
  photo.value = null
})
</script>
