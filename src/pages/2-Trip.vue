<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" @pointerdown.stop="back" @click.stop></ion-back-button>
        </ion-buttons>
        <ion-button class="m-auto block w-[130px]" size="small" @click.stop="$router.push({ query: { ...$route.query, step: 5 } })" v-if="currentStep === 4 && !currentPhoto.text"
          >Nommer l'action</ion-button
        >
        <div class="text-[80%] font-medium whitespace-pre-line text-center" v-else-if="currentStep > 3">{{ currentPhoto.text }}</div>
        <div class="text-[80%] font-medium whitespace-pre-line text-center" v-else>{{ triptitle(currentTrip) }}</div>
        <ion-buttons slot="end" v-if="currentStep === 3">
          <ion-button @click="reorder = false" v-if="reorder">OK</ion-button>
          <div class="i-ion/eye text-xl mr-2" @click="actions[0].handler()" v-if="!reorder"></div>
        </ion-buttons>
        <ion-buttons slot="end" v-if="currentStep > 3">
          <div id="actionsTop" class="i-ion/ellipsis-vertical text-xl"></div>
          <ion-action-sheet trigger="actionsTop" :buttons="actions.filter((v) => v.text !== 'Déplacer')"></ion-action-sheet>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-action-sheet
      :isOpen="$route.query.action"
      @didDismiss="$router.push({ replace: true, query: { ...$route.query, action: undefined, ...(currentStep === 3 && { sequence: undefined, photo: undefined }) } })"
      :buttons="actions"
    ></ion-action-sheet>
    <ion-content>
      <form-trip />

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
        </div>
        <div class="py-5 border-b border-black/25"></div>
        <ion-list lines="none" v-for="(sequence, i) in currentTrip.sequences">
          <ion-item class="font-bold m-5">{{ sequence.transport }}</ion-item>
          <div class="-mt-[15px] mx-5 mb-[15px]" v-if="sequence.stops">
            <div class="font-bold">{{ sequence.stops.length }} arrêts</div>
            <div v-for="stop in sequence.stops">{{ stop.text }}</div>
          </div>
          <ion-list lines="none">
            <ion-reorder-group :disabled="!reorder" @ionItemReorder="reorderPhoto(sequence, $event)">
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

      <form-action />
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, reactive, computed, watch } from "vue"
// https://api.ppp38v2.cityway.fr/search/address?keywords=40+rue&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=
// https://api.ppp38v2.cityway.fr/journeyplanner/hubs/plantrips?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885
const photo = ref(null)
const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])
const state = reactive({
  refGallery: null,
  refCamera: null,
  currentPhoto: null,
})
const reorder = ref(false)
const actions = [
  { text: "Prévisualiser", handler: () => $router.push(`/travel/${$route.params.id}?step=${sumStep(+$route.query.sequence, +$route.query.photo, true) || 1}`) },
  { text: "Ajouter avant", handler: () => addPhoto(+$route.query.sequence, +$route.query.photo) },
  { text: "Ajouter après", handler: () => addPhoto(+$route.query.sequence, +$route.query.photo + 1) },
  { text: "Éditer l'action", handler: () => $router.push({ query: { ...$route.query, step: 5 } }) },
  { text: "Éditer la photo", handler: () => $router.push({ query: { ...$route.query, step: 4 } }) },
  { text: "Déplacer", handler: () => (reorder.value = !reorder.value) },
  { text: "Supprimer", role: "destructive", handler: () => deletePhoto(currentSequence.value, +$route.query.photo) },
  { text: "Annuler", role: "cancel" },
]
// Step 3: List photos
function reorderPhoto(sequence, event) {
  event.detail.complete(sequence.photos)
}
function sumStep(sequence, photo, travel = false) {
  if (travel) return currentTrip.value.sequences.slice(0, sequence).reduce((acc, v) => acc + v.photos.length + !!v.stops, 0) + photo + 1
  return currentTrip.value.sequences.slice(0, sequence).reduce((acc, v) => acc + v.photos.length, 0) + photo
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
  prevStep()
}
// Step 4: Add or Edit title
// Step 5: Add or Edit the photo + annotations
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
// Utils
function back() {
  if ($route.query.step === "1") return $router.push("/")
  if ($route.query.step === "2") return $router.push({ query: { step: 1 } })
  if ($route.query.step === "3" && state.sequences) return $router.push({ query: { step: 2 } })
  if ($route.query.step === "3") return $router.push("/")
  if ($route.query.step === "4") return $router.push({ query: { step: 3 } })
  $router.go(-1)
}
// Scroll to selected photo
watch(
  () => [$route.query.sequence, $route.query.photo],
  () => {
    setTimeout(() => {
      const el = $(`[data-sequence="${$route.query.sequence}"][data-photo="${$route.query.photo}"]`)
      el?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "start",
      })
    }, 0)
  },
  { immediate: true },
)
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
      pho = currentTrip.sequences[seq].photos.length
      if (pho > 0) break
    }
    if (seq === 0 && pho === 0) return
  }
  return $router.push({ query: { step: 4, sequence: seq, photo: pho - 1 } })
}
function nextStep() {
  let seq = +$route.query.sequence
  let pho = +$route.query.photo
  if (pho === currentTrip.sequences[seq].photos.length - 1) {
    while (seq < currentTrip.sequences.length - 1) {
      seq++
      pho = -1
      if (currentTrip.sequences[seq].photos.length > 0) break
    }
    if (seq === currentTrip.sequences.length - 1 && pho === -1) return
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
