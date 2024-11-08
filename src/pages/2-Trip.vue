<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title v-if="currentStep === 1">Trajet {{ $route.params.id }} - Saisie Itinéraire</ion-title>
        <ion-title v-if="currentStep === 2">Trajet {{ $route.params.id }} - Choix Itinéraire</ion-title>
        <ion-title v-if="currentStep === 3">Trajet {{ $route.params.id }} - Choix Séquence</ion-title>
        <ion-title v-if="currentStep === 4">Trajet {{ $route.params.id }} - Détails Séquence</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="next">
        <ion-list v-if="currentStep === 1">
          <ion-item>
            <ion-input label="Départ" :value="state.from.text" @ionInput="onSearch" @ionFocus="onFocus('from')" @ionBlur="onBlur('from')" required></ion-input>
          </ion-item>
          <ion-item button detail="false" @click="onSelect(item)" v-for="item in items" v-if="focused === 'from'">{{ item.text }}</ion-item>
          <ion-item>
            <ion-input label="Arrivée" :value="state.to.text" @ionInput="onSearch" @ionFocus="onFocus('to')" @ionBlur="onBlur('to')" required></ion-input>
          </ion-item>
          <ion-item button detail="false" @click="onSelect(item)" v-for="item in items" v-if="focused === 'to'">{{ item.text }}</ion-item>
        </ion-list>

        <div v-if="currentStep === 2">
          <div style="cursor: pointer" @click.stop.prevent="next((state.choice = i))" v-for="(trip, i) in state.choices">
            <iframe :srcdoc="trip" style="width: 100%; height: 140px; border: 0; pointer-events: none"></iframe>
          </div>
        </div>

        <ion-list v-if="currentStep === 3">
          <ion-item style="font-size: 90%" button detail @click="next((state.sequence = i))" v-for="(sequence, i) in currentChoice">
            <div>
              {{ sequence.transport }}
              <br />
              <span style="font-size: 90%">{{ sequence.stops ? ` ${sequence.stops.length} arrêts, de ${sequence.stops[0].text} à ${sequence.stops.at(-1).text}` : "" }}</span>
            </div>
            <ion-note
              style="margin: auto; padding: 2px; font-size: 90%"
              slot="end"
              :color="!sequence.photos.length || sequence.photos.filter((v) => v.id).length !== sequence.photos.length ? 'danger' : 'success'"
            >
              {{ sequence.photos.filter((v) => v.id).length }}/{{ sequence.photos.length }}
            </ion-note>
          </ion-item>
        </ion-list>

        <ion-list v-if="currentStep === 4">
          <ion-list-header>{{ currentSequence.transport }}</ion-list-header>
          <ion-item>
            <div style="display: flex; gap: 8px; margin: auto; max-width: fit-content">
              <img :src="`/img/${i}.svg`" @click="currentSequence.photos.push({ type: i, text: texts[i - 1] })" v-for="i in 5" v-if="currentSequence.transport.includes(`Je marche`)" />
              <img :src="`/img/${i + 5}.svg`" @click="currentSequence.photos.push({ type: i + 5, text: texts[i + 4] })" v-for="i in 5" v-else-if="currentSequence.transport.includes(`J'attend`)" />
              <img :src="`/img/${i + 11}.svg`" @click="currentSequence.photos.push({ type: i + 11, text: texts[i + 10], id })" v-for="(id, i) in ['IN', 'OUT']" v-else />
            </div>
          </ion-item>
          <ion-list>
            <ion-reorder-group disabled="false" @ionItemReorder="reorderPhoto">
              <ion-item v-for="(photo, i) in currentSequence.photos" :key="photo">
                <div style="width: 100%; display: flex; gap: 8px; padding: 4px">
                  <ion-button style="position: absolute; left: 0; bottom: 0; width: 20px; height: 20px" color="danger" @click="deletePhoto(i)">
                    <ion-icon slot="icon-only" :icon="trash"></ion-icon>
                  </ion-button>
                  <img :src="`/img/${photo.type}.svg`" style="max-height: 40px" />
                  <div style="display: flex; flex-direction: column; gap: 10px">
                    <img :src="$state.photos[photo.id] || '/img/gallery.svg'" style="max-width: 40px; max-height: 40px" @click="clickPhoto(photo, state.refGallery)" />
                    <img src="/img/camera.svg" style="max-width: 40px; max-height: 40px" @click="clickPhoto(photo, state.refCamera)" v-if="/android/i.test(window.navigator.userAgent)" />
                  </div>
                  <ion-textarea style="flex: 1; font-size: 90%" fill="solid" :auto-grow="true" v-model="photo.text"></ion-textarea>
                </div>
                <ion-reorder slot="end"></ion-reorder>
              </ion-item>
            </ion-reorder-group>
            <!-- <input type="file" accept="image/*;capture" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refInput = ref)" /> -->
            <input type="file" accept="image/*" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refGallery = ref)" />
            <input type="file" accept="image/*" capture="environment" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refCamera = ref)" />
          </ion-list>
        </ion-list>

        <div style="display: flex; padding: 8px" v-if="currentStep === 1">
          <ion-button type="submit" :style="`margin-left: auto;${state.from.Latitude && state.to.Latitude ? '' : 'pointer-events: none;opacity: 0.5'}`">Suivant</ion-button>
        </div>
        <div style="display: flex; padding: 8px" v-if="currentStep === 3"><ion-button fill="outline" @click="$router.push('/')">Retour Trajets</ion-button></div>
        <div style="display: flex; padding: 8px" v-if="currentStep === 4">
          <ion-button fill="outline" @click="$router.push({ query: { step: currentStep - 1 } })">Retour Séquences</ion-button>
          <ion-button style="margin-left: auto" @click="state.sequence === currentChoice.length - 1 ? $router.push({ query: { step: currentStep - 1 } }) : state.sequence++">Suivant</ion-button>
        </div>
      </form>
    </ion-content>
    <tldraw-annotator :url="$state.photos[currentPhoto]" @done="annotatePhoto" v-if="currentPhoto" />
  </ion-page>
</template>

<script setup lang="ts">
import { trash } from "ionicons/icons"
import { ref, reactive, computed } from "vue"
// https://api.ppp38v2.cityway.fr/search/address?keywords=40+rue&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=
// https://api.ppp38v2.cityway.fr/journeyplanner/hubs/plantrips?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885
const currentPhoto = ref(null)
const currentTrip = $state.trips[$route.params.id - 1] || {}
const currentStep = computed(() => +($route.query.step || 1))
const currentChoice = computed(() => state.sequences[state.choice])
const currentSequence = computed(() => state.sequences[state.choice][state.sequence])
const state = reactive({
  from: { text: currentTrip.from || "" },
  to: { text: currentTrip.to || "" },
  choices: [],
  choice: 0,
  sequences: currentTrip.sequences ? [currentTrip.sequences] : [],
  sequence: 0,
})
// Step 1: Search for "from" and "to" address/location
const focused = ref("")
const items = ref([])
const texts = [
  "Tournez à gauche",
  "Allez tout droit",
  "Tournez à droite",
  "Quand le feu piéton est vert, traversez le passage piéton",
  "Passage piéton sans feu, attention avant de traverser",
  "Vérifiez le nom de l'arrêt",
  "Vérifiez la direction",
  "Validez votre ticket",
  "Attendez à l'arrêt",
  "Quand le tram/bus arrive, vérifiez la direction",
  "Montez dans le tram/bus",
  "Descendez du tram/bus",
]
async function onSearch(event) {
  const query = event.target.value
  state[focused.value].text = query
  if (!query) return (items.value = [])
  try {
    const response = await fetch(`https://api.ppp38v2.cityway.fr/search/address?keywords=${query}&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=`)
    const data = await response.json()
    items.value = data.Data.map((item) => {
      item.text = `${item.Number ?? ""} ${item.Name} - ${item.PostalCode} ${item.Locality?.Name} ${item.Categories?.[0]?.Name ?? ""}`.trim()
      // item.text = `${item.Number ?? ""} ${item.Name}`.trim()
      return item
    })
  } catch (error) {}
}
function onSelect(item) {
  state[focused.value] = item
  items.value = []
  focused.value = ""
}
function onFocus(direction) {
  focused.value = direction
}
function onBlur(direction) {
  // focused.value = ""
}
// Step 2: Choose an itinerary
// Step 3: Choose a sequence
// Step 4: Take photos
function reorderPhoto(event) {
  event.detail.complete(currentSequence.value.photos)
}
function deletePhoto(index) {
  if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) return
  delete $state.photos[currentSequence.value.photos[index].id]
  currentSequence.value.photos.splice(index, 1)
}
function clickPhoto(photo, input) {
  window.currentPhoto = photo
  state.currentPhoto = photo
  input.click()
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
    await idb.set(id, reader.result)
    state.currentPhoto.id = id
    $state.photos[id] = reader.result
    currentPhoto.value = id
  }
  reader.readAsDataURL(file)
}
async function annotatePhoto(blob) {
  const reader = new FileReader()
  reader.readAsDataURL(blob)
  reader.onload = async () => {
    const id = currentPhoto.value
    const url = reader.result
    await idb.set(id, url)
    $state.photos[id] = url
    currentPhoto.value = null
  }
}
// Utils
const nexts = {
  async 1() {
    const request = {
      PointDep: ["Id", "PointType", "Number"].map((k) => state.from[k]).filter((v) => v).join("_"), // prettier-ignore
      LatDep: state.from.Latitude,
      LngDep: state.from.Longitude,
      PointArr: ["Id", "PointType", "Number"].map((k) => state.to[k]).filter((v) => v).join("_"), // prettier-ignore
      LatArr: state.to.Latitude,
      LngArr: state.to.Longitude,
      Date: new Date().toLocaleDateString("en-GB"),
      Hour: new Date().getHours(),
      Minute: new Date().getMinutes(),
      IgnoreDisruptions: true, // default to false
      WalkDistance: 2000,
      WalkSpeed: 4,
      CarDistance: 100,
      BikeDistance: 10,
      BikeSpeed: 15,
      BikeSecure: 2,
    }
    const response = await fetch("/itinisere/fr/itineraires/4/JourneyPlanner/PartialResult", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams({ request: JSON.stringify(request) }),
    })
    const text = await response.text()
    const html = new DOMParser().parseFromString(text, "text/html")
    const nodes = $("script", html)
      .innerText.split("#link_solutionPlanTrip")
      .slice(1, -1)
      .flatMap((text) => JSON.parse(/\[[^;]]*\]/.exec(text)[0])) // HACK: extract JSON array, it can also contain arrays for long trips so the non matching character is `;` instead of `]`
    const css = `<link href="https://static.PPP38v2.cityway.fr/Content/css/site-638562226680000000.css" rel="stylesheet" crossorigin="anonymous">
<style>
.JourneyPlanner { padding: 10px;height: 140px;overflow:hidden; }
.JourneyPlanner .trip-solutions .link-detail .type-trip { position: absolute;bottom: 5px; }
</style>`
    state.choices = $$(".panel-trip", html).map((el) => `${css}<div class="JourneyPlanner"><div class="trip-solutions">${el.outerHTML}</div></div>`)
    state.sequences = $$(".detail-trip", html).map((el) => {
      const sequence = []
      $$("td:nth-child(1) > .item-line", el).forEach((el, i) => {
        function extract(text) {
          const node = nodes.find((node) => node.Name === text)
          return { text, lat: node?.Latitude, lng: node?.Longitude }
        }
        const before = extract($(".details span", el.parentElement.parentElement.previousElementSibling).firstChild.textContent.trim())
        const intermediary = $$("ul li", el.parentElement.parentElement).map((el) => {
          const { lat, lng } = $("[data-lat]", el).dataset
          return { text: el.firstChild.textContent.trim(), lat: +lat, lng: +lng }
        })
        const after = extract($(".details span", el.parentElement.parentElement.nextElementSibling).firstChild.textContent.trim())
        const stops = [before, ...intermediary, after].filter((v) => v)
        const type = el.innerText.length === 1 ? `Tram ${el.innerText}` : `Bus ${el.innerText}`
        sequence.push({ transport: `Je marche vers l'arrêt n°${i + 1} ${stops[0].text}`, photos: [] })
        sequence.push({ transport: `J'attends à l'arrêt n°${i + 1} ${stops[0].text}`, photos: [] })
        sequence.push({ transport: `Je monte dans le ${type}`, type, stops, photos: [] })
      })
      sequence.push({ transport: `Je marche vers ma destination`, photos: [] })
      return sequence
    })
    $router.push({ query: { step: currentStep.value + 1 } })
  },
  async 2() {
    const from = { text: state.from.text.split(" - ")[0], lat: state.from.Latitude, lng: state.from.Longitude }
    const to = { text: state.to.text.split(" - ")[0], lat: state.to.Latitude, lng: state.to.Longitude }
    $state.trips[$route.params.id - 1] = { from, to, sequences: currentChoice.value }
    $router.push({ query: { step: currentStep.value + 1 } })
  },
  async 3(num) {
    $router.push({ query: { step: currentStep.value + 1 } })
  },
  async 4(num) {
    $router.push({ query: { step: currentStep.value - 1 } })
  },
}
async function next(...args) {
  const fn = nexts[currentStep.value]
  await fn(...args)
}
</script>

<style>
/* ion-textarea {
  height: 40px;
  min-height: 40px!important;
} */
.textarea-wrapper {
  --padding-end: 0px;
  --padding-start: 0px;
}
textarea {
  padding: 8px !important;
}
</style>
