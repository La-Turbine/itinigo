<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Trajet {{ $route.params.id }} - Étape {{ currentStep }}</ion-title>
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
            <ion-input label="Arrivé" :value="state.to.text" @ionInput="onSearch" @ionFocus="onFocus('to')" @ionBlur="onBlur('to')" required></ion-input>
          </ion-item>
          <ion-item button detail="false" @click="onSelect(item)" v-for="item in items" v-if="focused === 'to'">{{ item.text }}</ion-item>
        </ion-list>

        <div v-if="currentStep === 2">
          <div style="cursor: pointer" @click.stop.prevent="next((state.choice = i))" v-for="(trip, i) in state.choices">
            <iframe :srcdoc="trip" style="width: 100%; height: 140px; border: 0; pointer-events: none"></iframe>
          </div>
        </div>

        <ion-list v-if="currentStep === 3">
          <ion-item button detail="false" @click="next((state.sequence = i))" v-for="(sequence, i) in currentChoice">
            {{ sequence.transport }}{{ sequence.stops ? ` (${sequence.stops.length} arrêts)` : "" }}
          </ion-item>
        </ion-list>

        <ion-list v-if="currentStep === 4">
          <ion-list-header>{{ currentSequence.transport }}</ion-list-header>
          <ion-item>
            <div style="display: flex; gap: 8px; margin: auto; max-width: fit-content">
              <img :src="`/svg/${i}.svg`" @click="currentSequence.photos.push({ type: i })" v-for="i in 5" v-if="currentSequence.transport.includes(`Je marche`)" />
              <img :src="`/svg/${i + 5}.svg`" @click="currentSequence.photos.push({ type: i + 5 })" v-for="i in 5" v-if="currentSequence.transport.includes(`J'attend`)" />
              <img :src="`/svg/${i + 10}.svg`" @click="currentSequence.photos.push({ type: i + 10 })" v-for="i in 2" v-if="currentSequence.transport.includes(`Je monte`)" />
            </div>
          </ion-item>
          <ion-list>
            <ion-reorder-group disabled="false" @ionItemReorder="reorderPhoto">
              <ion-item-sliding v-for="(photo, i) in currentSequence.photos" :key="photo">
                <ion-item>
                  <div style="display: flex; gap: 8px; padding: 4px">
                    <img :src="`/svg/${photo.type}.svg`" style="max-height: 40px; aspect-ratio: 1" />
                    <img :src="photo.image" style="max-height: 40px; aspect-ratio: 1" v-if="photo.image" />
                    <img src="/svg/camera.svg" style="max-height: 40px; aspect-ratio: 1" @click="clickPhoto(photo, state.refCamera)" />
                    <img src="/svg/gallery.svg" style="max-height: 40px; aspect-ratio: 1" @click="clickPhoto(photo, state.refGallery)" />
                    <ion-input v-model="photo.text" placeholder="Description"></ion-input>
                  </div>
                  <ion-reorder slot="end"></ion-reorder>
                </ion-item>
                <ion-item-options side="end">
                  <ion-item-option color="danger" @click="deletePhoto(i)">Delete</ion-item-option>
                </ion-item-options>
              </ion-item-sliding>
            </ion-reorder-group>
            <input type="file" accept="image/*" capture="environment" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refCamera = ref)" />
            <input type="file" accept="image/*" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refGallery = ref)" />
          </ion-list>
        </ion-list>

        <ion-item>
          <ion-back-button text="Précédent" icon="" default-href="/" fill="outline" v-if="currentStep > 1"></ion-back-button>
          <ion-button type="submit" style="margin-left: auto" v-if="currentStep !== 3">Suivant</ion-button>
          <div style="margin-left: auto; display: flex; gap: 4px" v-else>
            <ion-button type="submit" color="danger" @click.stop="next('remove')">Supprimé</ion-button>
            <ion-button type="submit" color="success">Sauvegardé</ion-button>
          </div>
        </ion-item>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from "vue"
// https://api.ppp38v2.cityway.fr/search/address?keywords=40+rue&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=
// https://api.ppp38v2.cityway.fr/journeyplanner/hubs/plantrips?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885
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
  currentSequence.value.photos.splice(index, 1)
}
function clickPhoto(photo, input) {
  state.currentPhoto = photo
  input.click()
}
function inputPhoto(event) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onload = () => (state.currentPhoto.image = reader.result)
  reader.readAsDataURL(file)
}
// Utils
const nexts = {
  async 1() {
    const request = {
      PointDep: ["Id", "PointType", "Number"].map((k) => state.from[k]).filter((v) => v).join("_"), // prettier-ignore
      PointArr: ["Id", "PointType", "Number"].map((k) => state.to[k]).filter((v) => v).join("_"), // prettier-ignore
      Date: new Date().toLocaleDateString("en-GB"),
      Hour: new Date().getHours(),
      Minute: new Date().getMinutes(),
    }
    const response = await fetch("/itinisere/fr/itineraires/4/JourneyPlanner/PartialResult", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
      body: new URLSearchParams({ request: JSON.stringify(request) }),
    })
    const data = await response.text()
    const html = new DOMParser().parseFromString(data, "text/html")
    const css = `<link href="https://static.PPP38v2.cityway.fr/Content/css/site-638562226680000000.css" rel="stylesheet" crossorigin="anonymous">
<style>
.JourneyPlanner { padding: 10px;height: 140px;overflow:hidden; }
.JourneyPlanner .trip-solutions .link-detail .type-trip { position: absolute;bottom: 5px; }
</style>`
    state.choices = $$(".panel-trip", html).map((el) => `${css}<div class="JourneyPlanner"><div class="trip-solutions">${el.outerHTML}</div></div>`)
    state.sequences = $$(".detail-trip", html).map((el) => {
      const sequence = []
      $$("td:nth-child(1) > .item-line", el).forEach((el, i) => {
        const stops = $$("ul li", el.parentElement.parentElement).map((el) => el.firstChild.textContent.trim())
        sequence.push({ transport: `Je marche vers l'arrêt n°${i + 1} ${stops[0]}`, photos: [] })
        sequence.push({ transport: `J'attend à l'arrêt n°${i + 1} ${stops[0]}`, photos: [] })
        sequence.push({ transport: `Je monte dans le ${el.innerText}`, stops, photos: [] })
      })
      sequence.push({ transport: `Je marche vers ma destination`, photos: [] })
      return sequence
    })
    $router.push({ query: { step: currentStep.value + 1 } })
  },
  async 2() {
    $router.push({ query: { step: currentStep.value + 1 } })
  },
  async 3(num) {
    if (typeof num === "number") {
      state.sequence = num
      $router.push({ query: { step: currentStep.value + 1 } })
      return
    }
    if (num === "remove") {
      $state.trips.splice($route.params.id - 1, 1)
      $router.push("/")
      return
    }
    $state.trips[$route.params.id - 1] = { from: state.from.text.split(' - ')[0], to: state.to.text.split(' - ')[0], sequences: currentChoice.value }
    $router.push("/")
  },
  async 4(num) {
    $router.push({ query: { step: currentStep.value - 1 } })
  },
}
async function next(...args) {
  const fn = nexts[currentStep.value]
  await fn(...args)
}

// A multi-step form starting with "from" and "to" address/location
// Then a number of steps
// For each step: a "type" switch and a "photo" upload
</script>
