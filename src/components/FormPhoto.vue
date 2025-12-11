<template>
  <template v-if="currentStep === 6">
    <div class="flex h-full flex-col overflow-hidden">
      <div class="relative flex h-[calc(100%-140px)] p-5">
        <div class="flex flex-1 overflow-hidden rounded-4xl">
          <photo-stream v-if="!photo" ref="stream" />
          <photo-annotator v-else :url="$state.photos[`${photo}:snapshot`] || $state.photos[photo]" @done="annotatePhoto" ref="annotator" />
        </div>
      </div>
      <div class="flex h-[140px] gap-2.5 overflow-auto border-t border-black/20 bg-gray-100 p-2.5">
        <div class="m-auto flex gap-4">
          <div class="h-20 w-20 rounded-full border-6 border-white bg-gray-200 ring-1 ring-gray-300 active:scale-95" @click="clickCapture()"></div>
          <div class="flex h-20 w-20 rounded-xl bg-gray-200 ring-1 ring-gray-300 active:scale-95" @click="input.click()"><div class="i-lucide/image m-auto bg-gray-600 text-2xl"></div></div>
        </div>
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
const currentPhoto = computed(() => (window.currentPhoto = currentSequence.value?.photos[+$route.query.photo]))

const photo = ref(null)
const input = ref(null)
const stream = ref(null)
const annotator = ref(null)

async function clickCapture() {
  const blob = await stream.value.capturePhoto()
  savePhoto(blob)
}
function clickGallery(mode) {
  if (currentPhoto.value.id.length < 20) return // BUS/TRAM IN/OUT
  window.currentPhoto = currentPhoto.value
  photo.value = currentPhoto.value.id
}
function inputPhoto(event) {
  const file = event.target.files[0]
  savePhoto(file)
}
function savePhoto(blob) {
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
    $router.push({ query: { step: 4, sequence: $route.query.sequence, photo: $route.query.photo } })
  }
}
</script>
