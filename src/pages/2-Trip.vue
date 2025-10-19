<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/" @pointerdown.stop="back" @click.stop></ion-back-button>
        </ion-buttons>
        <ion-button @click.stop="$router.push({ query: { ...$route.query, step: 5 } })" v-if="currentStep === 4 && !currentPhoto.text">Nommer l'action</ion-button>
        <div style="font-size: 80%; font-weight: 500; white-space: pre-line; text-align: center" v-else-if="currentStep > 3">{{ currentPhoto.text }}</div>
        <div style="font-size: 80%; font-weight: 500; white-space: pre-line; text-align: center" v-else>{{ triptitle(currentTrip) }}</div>
        <ion-buttons style="zoom: 1.5" slot="end" v-if="currentStep === 3">
          <ion-button style="margin-right: -4px" @click="reorder = false" v-if="reorder">OK</ion-button>
          <ion-icon style="margin-right: 4px" :icon="eye" @click="actions[0].handler()" v-if="!reorder"></ion-icon>
        </ion-buttons>
        <ion-buttons style="zoom: 1.5" slot="end" v-if="currentStep > 3">
          <ion-icon id="actionsTop" :icon="ellipsisVertical"></ion-icon>
          <ion-action-sheet trigger="actionsTop" :buttons="actions.filter((v) => v.text !== 'Déplacer')"></ion-action-sheet>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-action-sheet :isOpen="$route.query.action" @didDismiss="$router.replace({ query: { ...$route.query, action: undefined } })" :buttons="actions"></ion-action-sheet>
    <ion-content>
      <ion-list v-if="currentStep < 3">
        <ion-item>
          <ion-input label="Départ" :value="state.from.text" @ionInput="onSearch" @ionFocus="onFocus('from')" @ionBlur="onBlur('from')" required></ion-input>
        </ion-item>
        <ion-item button detail="false" @click="onSelect(item)" v-for="item in items" v-if="focused === 'from'">{{ item.text }}</ion-item>
        <ion-item>
          <ion-input label="Arrivée" :value="state.to.text" @ionInput="onSearch" @ionFocus="onFocus('to')" @ionBlur="onBlur('to')" required></ion-input>
        </ion-item>
        <ion-item>
          <ion-input label="Date" v-model="state.date" type="datetime-local"></ion-input>
        </ion-item>
        <ion-item button detail="false" @click="onSelect(item)" v-for="item in items" v-if="focused === 'to'">{{ item.text }}</ion-item>
        <ion-button style="margin: 10px 20px" expand="block" @click="next(1)">Suivant</ion-button>
      </ion-list>

      <div v-if="currentStep === 2">
        <div style="cursor: pointer" @click.stop.prevent="next(2, (state.choice = i))" v-for="(trip, i) in state.choices">
          <iframe :srcdoc="trip" style="width: 100%; height: 140px; border: 0; pointer-events: none"></iframe>
        </div>
      </div>

      <div v-if="currentStep === 3">
        <div style="margin: 20px">
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
        <div style="padding: 20px; border-bottom: 1px solid #00000040"></div>
        <ion-list lines="none" v-for="(sequence, i) in currentTrip.sequences">
          <ion-item style="font-weight: bold; margin: 20px">{{ sequence.transport }}</ion-item>
          <div style="margin: -15px 20px 15px" v-if="sequence.stops">
            <div style="font-weight: bold">{{ sequence.stops.length }} arrêts</div>
            <div v-for="stop in sequence.stops">{{ stop.text }}</div>
          </div>
          <ion-list lines="none">
            <ion-reorder-group :disabled="!reorder" @ionItemReorder="reorderPhoto(sequence, $event)">
              <ion-item v-for="(photo, j) in sequence.photos" :key="photo">
                <div style="width: 100%; display: flex; gap: 8px; padding: 4px" @click="$router.push({ query: { step: 4, sequence: i, photo: j } })">
                  <img style="max-height: 40px; margin: auto 0" :src="`/img/${photo.type}.svg`" />
                  <div style="flex: 1; margin: auto" v-if="photo.text">{{ photo.text }}</div>
                  <ion-button style="margin: auto auto auto 0" @click.stop="$router.push({ query: { step: 5, sequence: i, photo: j } })" v-else>Nommer l'action</ion-button>
                  <ion-img :src="$state.photos[photo.id] || '/img/gallery.svg'" style="max-width: 115px; height: 115px" />
                </div>
                <ion-reorder slot="end"></ion-reorder>
                <ion-icon @pointerdown="$router.replace({ query: { ...$route.query, sequence: i, photo: j, action: 1 } })" :icon="ellipsisVertical" v-show="!reorder"></ion-icon>
              </ion-item>
            </ion-reorder-group>
          </ion-list>
          <ion-button style="margin: 10px 20px" expand="block" @click="addPhoto(i, sequence.photos.length)">Ajouter une étape</ion-button>
          <div style="padding: 20px; border-bottom: 1px solid #00000040" v-if="i !== currentTrip.sequences.length - 1"></div>
        </ion-list>
      </div>

      <template v-if="currentStep === 4">
        <div style="display: flex; flex-direction: column; height: 100%; overflow: hidden">
          <div style="position: relative; display: flex; height: 80%" @click="clickPhoto()" @touchstart="onTouchStart" @touchmove="onTouchMove" @touchend="onTouchEnd">
            <template v-if="!photo">
              <button class="DoneButton" style="position: absolute; left: 0" @click.stop="clickPhoto(true)" v-if="$state.photos[currentPhoto.id]">Changer</button>
              <img
                style="max-width: 100%; max-height: 100%; object-fit: cover; margin: auto; user-select: none; pointer-events: none"
                :src="$state.photos[currentPhoto.id] || '/img/gallery.svg'"
                :style="cardStyle"
              />
            </template>
            <tldraw-annotator :url="$state.photos[`${photo}:snapshot`] || $state.photos[photo]" @done="annotatePhoto" v-else />
          </div>
          <div style="display: flex; height: 20%; gap: 10px; padding: 10px; background: #f6f7f7; border-top: 1px solid rgba(0, 0, 0, 0.2); overflow: auto">
            <template v-for="(sequence, i) in currentTrip.sequences">
              <div
                style="padding: 10px; border: 1px solid rgba(0, 0, 0, 0.2); min-width: 60vw; display: flex"
                :style="i === +$route.query.sequence && j === +$route.query.photo ? 'border-color: #3880ff;background: #3880ff22' : ''"
                :data-sequence="i"
                :data-photo="j"
                v-for="(photo, j) in sequence.photos"
                @click.stop="$router.push({ query: { step: 4, sequence: i, photo: j } })"
              >
                <ion-img :src="$state.photos[photo.id] || '/img/gallery.svg'" style="max-width: 115px; height: 115px" />
                <div style="flex: 1; margin: auto; padding-left: 8px" v-if="photo.text">{{ photo.text }}</div>
                <ion-button style="margin: auto auto auto 0; padding-left: 8px" @click.stop="$router.push({ query: { step: 5, sequence: i, photo: j } })" v-else>Nommer l'action</ion-button>
                <ion-icon @click.stop="$router.replace({ query: { ...$route.query, sequence: i, photo: j, action: 1 } })" :icon="ellipsisVertical"></ion-icon>
              </div>
            </template>
          </div>
        </div>
        <!-- <input type="file" accept="image/*;capture" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refInput = ref)" /> -->
        <input type="file" accept="image/*" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refGallery = ref)" />
        <input type="file" accept="image/*" capture="environment" style="display: none" @change="inputPhoto" :ref="(ref) => (state.refCamera = ref)" />
      </template>

      <div v-if="currentStep === 5">
        Choissisez une action:
        <div style="display: flex; flex-direction: column; gap: 8px; padding: 0 20px">
          <div style="display: flex; align-items: center; gap: 8px" @click="changeType(i)" v-for="i in 5" v-if="currentSequence.transport.startsWith(`Je marche`)">
            <div>{{ texts[i - 1].replace("[tram/bus]", currentSequence.type) }}</div>
            <img style="margin-left: auto" :src="`/img/${i}.svg`" />
          </div>
          <div
            style="display: flex; align-items: center; gap: 8px"
            :style="i === 3 && currentSequence.type.startsWith(`Bus`) && 'display: none'"
            @click="changeType(i + 5)"
            v-for="i in 5"
            v-if="currentSequence.transport.startsWith(`J'attend`)"
          >
            <div>{{ texts[i + 4].replace("[tram/bus]", currentSequence.type) }}</div>
            <img :src="`/img/${i + 5}.svg`" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px" @click="changeType(11)" v-if="currentSequence.transport.startsWith(`Je monte`)">
            <div>{{ texts[10].replace("[tram/bus]", currentSequence.type) }}</div>
            <img :src="`/img/11.svg`" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px" @click="changeType(3 + 5)" v-if="currentSequence.transport.startsWith(`Je monte`) && currentSequence.type.startsWith(`Bus`)">
            <div>{{ texts[3 + 4].replace("[tram/bus]", currentSequence.type) }}</div>
            <img :src="`/img/${3 + 5}.svg`" />
          </div>
          <div style="display: flex; align-items: center; gap: 8px" @click="changeType(12)" v-if="currentSequence.transport.startsWith(`Je monte`)">
            <div>{{ texts[11].replace("[tram/bus]", currentSequence.type) }}</div>
            <img :src="`/img/12.svg`" />
          </div>
        </div>
        <ion-button style="margin: 10px 20px" expand="block" @click="$router.push({ query: { ...$route.query, step: 3 } })">Confirmer</ion-button>
        Souhaitez vous renommer l'action ?
        <ion-textarea style="flex: 1; margin: auto" fill="solid" :auto-grow="true" v-model="currentPhoto.text"></ion-textarea>
        <ion-button style="margin: 10px 20px" expand="block" @click="$router.push({ query: { ...$route.query, step: 3 } })">Confirmer</ion-button>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ellipsisVertical, eye } from "ionicons/icons"
import { ref, reactive, computed, watch } from "vue"
// https://api.ppp38v2.cityway.fr/search/address?keywords=40+rue&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=
// https://api.ppp38v2.cityway.fr/journeyplanner/hubs/plantrips?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885
const photo = ref(null)
let currentTrip = $state.trips[$route.params.id - 1] || {}
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.sequences[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])
const state = reactive({
  from: { text: currentTrip.from || "" },
  to: { text: currentTrip.to || "" },
  date: new Date().toLocaleString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
  choices: [],
  choice: 0,
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
// Step 1: Search for "from" and "to" address/location
// Then 2: Choose an itinerary
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
  "Quand le [tram/bus] arrive, vérifiez la direction",
  "Montez dans le [tram/bus]",
  "Descendez du [tram/bus]",
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
// Step 3: List photos
function reorderPhoto(sequence, event) {
  event.detail.complete(sequence.photos)
}
function sumStep(sequence, photo, travel = false) {
  if (travel) return currentTrip.sequences.slice(0, sequence).reduce((acc, v) => acc + v.photos.length + !!v.stops, 0) + photo + 1
  return currentTrip.sequences.slice(0, sequence).reduce((acc, v) => acc + v.photos.length, 0) + photo
}
function addPhoto(sequenceIndex, photoIndex) {
  const sequence = currentTrip.sequences[sequenceIndex]
  // const type = sequence.transport.startsWith(`Je marche`) ? 1 : sequence.transport.startsWith(`J'attend`) ? 6 : 11
  // const photo = { type, text: texts[type - 1].replace("[tram/bus]", sequence.type) }
  const photo = { type: 0, text: "" }
  sequence.photos.splice(photoIndex, 0, photo)
  $router.push({ query: { step: 4, sequence: sequenceIndex, photo: photoIndex } })
  // setTimeout(clickPhoto, 50)
}
function deletePhoto(sequence, index) {
  // if (!confirm("Voulez-vous vraiment supprimer cette photo ?")) return
  idb.del(sequence.photos[index].id)
  sequence.photos.splice(index, 1)
  prevStep()
}
function changeType(type) {
  currentPhoto.value.type = type
  // if (currentPhoto.value.text && !texts.includes(currentPhoto.value.text)) return
  currentPhoto.value.text = texts[type - 1].replace("[tram/bus]", currentSequence.value.type)
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
const nexts = {
  async 1() {
    const request = {
      PointDep: ["Id", "PointType", "Number"].map((k) => state.from[k]).filter((v) => v).join("_"), // prettier-ignore
      LatDep: state.from.Latitude,
      LngDep: state.from.Longitude,
      PointArr: ["Id", "PointType", "Number"].map((k) => state.to[k]).filter((v) => v).join("_"), // prettier-ignore
      LatArr: state.to.Latitude,
      LngArr: state.to.Longitude,
      Date: new Date(state.date).toLocaleDateString("en-GB"),
      Hour: new Date(state.date).getHours(),
      Minute: new Date(state.date).getMinutes(),
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
    const link = $$("link", new DOMParser().parseFromString(await (await fetch("https://www.itinisere.fr/")).text(), "text/html")).find((el) => el.href.includes("/css/site")).outerHTML
    const css = `${link.replace(/^\//, "https://static.PPP38v2.cityway.fr/")}
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
        const wait = [
          { type: 6, text: texts[5].replace("[tram/bus]", type) }, // TODO: add [stop] placeholder + replace
          { type: 7, text: texts[6].replace("[tram/bus]", type) }, // TODO: add [direction] placeholder + replace
          { type: 8, text: texts[7].replace("[tram/bus]", type) },
          { type: 9, text: texts[8].replace("[tram/bus]", type) },
          { type: 10, text: texts[9].replace("[tram/bus]", type) },
        ]
        if (el.innerText.length !== 1) wait.splice(3, 1) // remove "Validez votre ticket" for bus
        const tram = [
          { type: 11, text: `Montez dans le ${type}`, id: "TRAMIN" },
          { type: 12, text: `Descendez du ${type}`, id: "TRAMOUT" },
        ]
        const bus = [
          { type: 11, text: `Montez dans le ${type}`, id: "BUSIN" },
          { type: 8, text: "Validez votre ticket", id: "BUSVALID" },
          { type: 12, text: `Descendez du ${type}`, id: "BUSOUT" },
        ]
        const num = i + 1
        sequence.push({ transport: `Je marche vers l'arrêt n°${num} ${stops[0].text}`, num, type, photos: [] })
        sequence.push({ transport: `J'attends à l'arrêt n°${num} ${stops[0].text}`, num, type, photos: wait })
        sequence.push({ transport: `Je monte dans le ${type}`, num, type, stops, photos: el.innerText.length === 1 ? tram : bus })
      })
      sequence.push({ transport: `Je marche vers ma destination`, photos: [{ type: 2, text: "Vous êtes arrivé !" }] })
      return sequence
    })
    $router.push({ query: { step: 2 } })
  },
  async 2() {
    const from = { text: state.from.text.split(" - ")[0], lat: state.from.Latitude, lng: state.from.Longitude }
    const to = { text: state.to.text.split(" - ")[0], lat: state.to.Latitude, lng: state.to.Longitude }
    currentTrip = $state.trips[$route.params.id - 1] = { from, to, sequences: state.sequences[state.choice] }
    $router.push({ query: { step: 3 } })
  },
}
async function next(step, ...args) {
  const fn = nexts[step]
  await fn(...args)
}
function back() {
  if ($route.query.step === "1") return $router.push("/")
  if ($route.query.step === "2") return $router.push({ query: { step: 1 } })
  if ($route.query.step === "3" && state.sequences) return $router.push({ query: { step: 2 } })
  if ($route.query.step === "3") return $router.push("/")
  if ($route.query.step === "4") return $router.push({ query: { step: 3 } })
  $router.go(-1)
}
//
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
