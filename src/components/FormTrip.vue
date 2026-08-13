<template>
  <div class="flex h-full flex-col" v-if="currentStep < 3">
    <ion-list lines="none" inset>
      <ion-item @click="onClick('from')">
        <ion-label position="stacked">
          <div class="p-2 text-xs font-bold uppercase">Départ</div>
          <ion-label class="rounded-2xl border border-gray-300 bg-white p-3">
            <h2>{{ state.from.text.split(" - ")[0] }}&nbsp;</h2>
            <p>{{ state.from.text.split(" - ")[1] }}&nbsp;</p>
          </ion-label>
        </ion-label>
      </ion-item>
      <ion-item @click="onClick('to')">
        <ion-label position="stacked">
          <div class="p-2 text-xs font-bold uppercase">Arrivée</div>
          <ion-label class="rounded-2xl border border-gray-300 bg-white p-3">
            <h2>{{ state.to.text.split(" - ")[0] }}&nbsp;</h2>
            <p>{{ state.to.text.split(" - ")[1] }}&nbsp;</p>
          </ion-label>
        </ion-label>
      </ion-item>
      <ion-item>
        <ion-label position="stacked" lines="none">
          <div class="p-2 text-xs font-bold uppercase">Date</div>
          <ion-input v-model="state.date" type="datetime-local"></ion-input>
        </ion-label>
      </ion-item>
      <ion-button class="mx-5 my-2.5" expand="block" @click="next(1)" :disabled="!state.from.text || !state.to.text">
        <div class="i-lucide/search mr-2 size-5"></div>
        <div>Trouver un itinéraire</div>
      </ion-button>
    </ion-list>

    <ion-modal :is-open="!!focused" @willDismiss="focused = ''" :initial-breakpoint="0.75" :breakpoints="[0.75]" :can-dismiss="true">
      <ion-content class="ion-padding">
        <ion-searchbar ref="searchbar" v-model="search" @ionInput="onSearch" :placeholder="`Rechercher ${{ from: 'Départ', to: 'Arrivée' }[focused] ?? ''}`"></ion-searchbar>
        <ion-list>
          <ion-item @click="onSelect(item)" v-for="item in items">
            <ion-label>
              <h2>{{ item.text.split(" - ")[0] }}</h2>
              <p>{{ item.text.split(" - ")[1] }}</p>
            </ion-label>
          </ion-item>
        </ion-list>
      </ion-content>
    </ion-modal>

    <div class="flex-1 overflow-auto rounded-t-3xl bg-white p-6 text-center text-balance text-gray-400">
      <div v-if="currentStep === 1 && loading">Recherche des itinéraires…</div>
      <div v-else-if="currentStep === 1">Les résultats de la recherche apparaîtront ici sous forme de liste.</div>
      <div v-else-if="!state.choices.length">Aucun itinéraire en transport en commun n’a été trouvé.</div>
      <div v-else class="cursor-pointer text-left" @click.stop.prevent="next(2, (state.choice = i))" v-for="(choice, i) in state.choices" :key="i">
        <card-trip :trip="choice" :delete="false" class="mb-4" />
      </div>
    </div>
  </div>
</template>

<script setup>
// APIs : Métromobilité (Grenoble), sans clé, reverse-engineerées depuis mobilites-m.fr
//   Autocomplete : GET  https://data.mobilites-m.fr/api/find/json?query=&types=&epci=All
//   Trajet (OTP) : POST https://otp.mobilites-m.fr/otp/gtfs/v1  (GraphQL, schéma : /graphiql)
import { ref, reactive, computed } from "vue"

const FIND_URL = "https://data.mobilites-m.fr/api/find/json"
const FIND_TYPES = "clusters,lieux,rue,parking,citiz,pointCov"
const OTP_URL = "https://otp.mobilites-m.fr/otp/gtfs/v1"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))

// Initialize state with existing trip data or defaults
const state = reactive({
  from: { text: currentTrip.value.from?.text || "" },
  to: { text: currentTrip.value.to?.text || "" },
  date: new Date().toLocaleString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
  choices: [],
  sequences: [],
  choice: 0,
})

// Search functionality
const searchbar = ref(null)
const search = ref("")
const focused = ref("")
const loading = ref(false)
const items = ref([])

async function onSearch(event) {
  const query = search.value
  if (!query) return (items.value = [])
  try {
    const response = await fetch(`${FIND_URL}?query=${encodeURIComponent(query)}&types=${FIND_TYPES}&epci=All`)
    const data = await response.json()
    items.value = (data.features || []).map((f) => {
      const p = f.properties
      const [lng, lat] = f.geometry.coordinates
      const name = p.LIBELLE || p.name || "" // POI/rue : LIBELLE ; arrêt : name
      const place = p.COMMUNE || p.city || ""
      return { ...p, lat, lng, text: `${name} - ${place}`.trim() }
    })
  } catch (error) {
    console.error("Search error:", error)
  }
}

function onSelect(item) {
  state[focused.value] = item
  search.value = ""
  focused.value = ""
  items.value = []
}

function onClick(direction) {
  focused.value = direction
  setTimeout(() => searchbar.value?.$el.setFocus(), 300)
}

// OpenTripPlanner : calcul d'itinéraires (transport en commun + marche)
const PLAN_QUERY = `query Plan($from: InputCoordinates!, $to: InputCoordinates!, $date: String!, $time: String!) {
  plan(from: $from, to: $to, date: $date, time: $time, numItineraries: 5, transportModes: [{ mode: TRANSIT }, { mode: WALK }]) {
    itineraries {
      duration
      legs {
        mode
        route { shortName }
        from { name lat lon }
        to { name lat lon }
        intermediateStops { name lat lon }
        legGeometry { points }
      }
    }
  }
}`

// OTP préfixe les arrêts par la commune ("Grenoble, Victor Hugo") -> on l'enlève
const cleanStop = (s) => ({ text: (s.name || "").replace(/^[^,]+,\s*/, ""), lat: s.lat, lng: s.lon })

// Construit la séquence d'étapes (forme consommée par ListStep/CardTrip/FormAction)
function toSequence(itinerary) {
  const sequence = []
  const transitLegs = itinerary.legs.filter((l) => l.mode === "TRAM" || l.mode === "BUS")
  transitLegs.forEach((leg, i) => {
    const isTram = leg.mode === "TRAM"
    const type = `${isTram ? "Tram" : "Bus"} ${leg.route?.shortName || ""}`.trim()
    const stops = [leg.from, ...(leg.intermediateStops || []), leg.to].map(cleanStop)
    const num = i + 1
    const wait = [
      { type: 6, text: `Vérifiez le nom de l'arrêt` },
      { type: 7, text: `Vérifiez la direction` },
      { type: 8, text: `Validez votre ticket` },
      { type: 9, text: `Attendez à l'arrêt` },
      { type: 10, text: `Quand le ${type} arrive, vérifiez la direction` },
    ]
    if (!isTram) wait.splice(3, 1) // bus : pas d'étape "Attendez à l'arrêt"
    const tram = [
      { type: 11, text: `Montez dans le ${type}`, id: "TRAMIN" },
      { type: 12, text: `Descendez du ${type}`, id: "TRAMOUT" },
    ]
    const bus = [
      { type: 11, text: `Montez dans le ${type}`, id: "BUSIN" },
      { type: 8, text: "Validez votre ticket", id: "BUSVALID" },
      { type: 12, text: `Descendez du ${type}`, id: "BUSOUT" },
    ]
    sequence.push({ transport: `Je marche vers l’arrêt :\n${stops[0].text}`, num, type, photos: [] })
    sequence.push({ transport: `J'attends à l’arrêt :\n${stops[0].text}`, num, type, photos: wait })
    sequence.push({ transport: `Je monte dans le ${type}`, num, type, stops, shape: leg.legGeometry?.points, photos: isTram ? tram : bus })
  })
  const duration = `${Math.round(itinerary.duration / 60)} min`
  sequence.push({ transport: `Je marche vers ma destination`, duration, photos: [{ type: -1, text: "Vous êtes arrivé !" }] })
  return sequence
}

// Navigation logic
const nexts = {
  async 1() {
    loading.value = true
    state.choices = []
    try {
      const when = new Date(state.date)
      const variables = {
        from: { lat: state.from.lat, lon: state.from.lng },
        to: { lat: state.to.lat, lon: state.to.lng },
        date: when.toLocaleDateString("en-CA"), // YYYY-MM-DD
        time: when.toLocaleTimeString("en-GB"), // HH:MM:SS
      }
      const response = await fetch(OTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: PLAN_QUERY, variables }),
      })
      const { data } = await response.json()
      const itineraries = (data?.plan?.itineraries || []).filter((it) => it.legs.some((l) => l.mode === "TRAM" || l.mode === "BUS"))
      const from = { text: state.from.text.split(" - ")[0], lat: state.from.lat, lng: state.from.lng }
      const to = { text: state.to.text.split(" - ")[0], lat: state.to.lat, lng: state.to.lng }
      state.sequences = itineraries.map(toSequence)
      // chaque "choix" est un trip complet -> réutilise <card-trip> pour l'aperçu
      state.choices = state.sequences.map((sequences) => ({ from, to, duration: sequences.at(-1).duration, sequences }))
    } catch (error) {
      console.error("Plan error:", error)
    } finally {
      loading.value = false
    }
    window.formTrip = $route.params.id
    $router.push({ query: { step: 2 } })
  },
  async 2() {
    $state.trips[$route.params.id - 1] = state.choices[state.choice]
    $router.push({ query: { step: 3 } })
  },
}

async function next(step, ...args) {
  const fn = nexts[step]
  await fn(...args)
}
</script>
