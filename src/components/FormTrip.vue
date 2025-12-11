<template>
  <div class="flex min-h-full flex-col" v-if="currentStep < 3">
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

    <div class="flex-1 rounded-t-3xl bg-white p-6 text-center text-balance text-gray-400">
      <div v-if="currentStep === 1">Les résultats de la recherche apparaîtront ici sous forme de liste.</div>
      <div v-else class="cursor-pointer" @click.stop.prevent="next(2, (state.choice = i))" v-for="(trip, i) in state.choices">
        <iframe :srcdoc="trip" class="pointer-events-none m-auto h-40 w-full border-0"></iframe>
      </div>
    </div>
  </div>
</template>

<script setup>
// https://api.ppp38v2.cityway.fr/search/address?keywords=40+rue&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=
// https://api.ppp38v2.cityway.fr/journeyplanner/hubs/plantrips?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner?KeywordDep=40+RUE+ABB%C3%89+GR%C3%89GOIRE+-+38000+GRENOBLE+Adresse&PointDep=152084_3_40&NumDep=40&KeywordArr=HOTEL+DE+VILLE+-+38000+GRENOBLE+Arr%C3%AAt&PointArr=2002289_4&KeywordVia=&PointVia=&NumVia=&DurationVia=30&Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Submit=True&TypeTrip=PlanTrip&Algorithm=Fastest&WalkDistance=2000&WalkSpeed=4&Modes=Bus&Modes=Coach&Modes=Metro&Modes=Tram&Modes=Tod&Modes=Tgv&Modes=Ter&Modes=Train&Modes=Plane&Partners=14&Partners=28&Partners=24&Partners=30&Partners=15&Partners=5&Partners=2&Partners=22&Partners=18&Partners=29&Partners=6&Partners=8&Partners=31&Partners=3&Partners=13&Partners=12&Partners=26&Partners=27&Partners=7&Partners=17&BikeDistance=10&BikeSecure=2&BikeLeave=0&BikeSpeed=15&CarDistance=100&CarLeave=0
// https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885
import { ref, reactive, computed } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))

// Initialize state with existing trip data or defaults
const state = reactive({
  from: { text: currentTrip.value.from?.text || "" },
  to: { text: currentTrip.value.to?.text || "" },
  date: new Date().toLocaleString("sv-SE", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }),
  choices: [],
  choice: 0,
})

// Search functionality
const searchbar = ref(null)
const search = ref("")
const focused = ref("")
const items = ref([])

async function onSearch(event) {
  const query = search.value
  if (!query) return (items.value = [])
  try {
    const response = await fetch(`https://api.ppp38v2.cityway.fr/search/address?keywords=${query}&maxitems=10&pointtypes=&categories=&LocalityIds=&OperatorIds=`)
    const data = await response.json()
    items.value = data.Data.map((item) => {
      item.text = `${item.Number ?? ""} ${item.Name} - ${item.PostalCode} ${item.Locality?.Name} ${item.Categories?.[0]?.Name ?? ""}`.trim()
      return item
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

// Navigation logic
const nexts = {
  async 1() {
    const request = {
      PointDep: ["Id", "PointType", "Number"]
        .map((k) => state.from[k])
        .filter((v) => v)
        .join("_"),
      LatDep: state.from.Latitude,
      LngDep: state.from.Longitude,
      PointArr: ["Id", "PointType", "Number"]
        .map((k) => state.to[k])
        .filter((v) => v)
        .join("_"),
      LatArr: state.to.Latitude,
      LngArr: state.to.Longitude,
      Date: new Date(state.date).toLocaleDateString("en-GB"),
      Hour: new Date(state.date).getHours(),
      Minute: new Date(state.date).getMinutes(),
      IgnoreDisruptions: true,
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
      .flatMap((text) => JSON.parse(/\[[^;]]*\]/.exec(text)[0]))
    const link = $$("link", new DOMParser().parseFromString(await (await fetch("https://www.itinisere.fr/")).text(), "text/html")).find((el) => el.href.includes("/css/site")).outerHTML
    const css = `${link.replace(`href="/`, `href="https://static.PPP38v2.cityway.fr/`)}
<style>
.JourneyPlanner { margin: auto 20px;height: 160px;display: flex; }
.JourneyPlanner .trip-solutions { margin: auto; }
.JourneyPlanner .trip-solutions .link-detail { margin: 0;border: 1px solid #80808033; }
.JourneyPlanner .trip-solutions .link-detail .type-trip { position: absolute;bottom: 5px; }
</style>`
    state.choices = $$(".panel-trip", html).map((el) => `${css}<div class="JourneyPlanner"><div class="trip-solutions">${el.outerHTML}</div></div>`)
    state.sequences = $$(".detail-trip", html).map((el) => {
      const sequence = []
      const texts = ["Tournez à gauche", "Allez tout droit", "Tournez à droite", "Quand le feu piéton est vert, traversez le passage piéton", "Passage piéton sans feu, attention avant de traverser", "Vérifiez le nom de l'arrêt", "Vérifiez la direction", "Validez votre ticket", "Attendez à l'arrêt", "Quand le [tram/bus] arrive, vérifiez la direction", "Montez dans le [tram/bus]", "Descendez du [tram/bus]"]
      $$("td:nth-child(1) > .item-line", el).forEach((el, i) => {
        function extract(text) {
          const node = nodes.find((node) => node.Name === text)
          return { text, lat: node?.Latitude, lng: node?.Longitude }
        }
        const before = extract($(".details span", el.parentElement.parentElement.previousElementSibling).firstChild.textContent.trim())
        const intermediary = $$("ul li", el.parentElement.parentElement).map((el) => {
          const { lat, lng } = $("[data-lat]", el)?.dataset ?? {}
          return { text: el.firstChild.textContent.trim(), lat: +lat, lng: +lng }
        })
        const after = extract($(".details span", el.parentElement.parentElement.nextElementSibling).firstChild.textContent.trim())
        const stops = [before, ...intermediary, after].filter((v) => v)
        const type = el.innerText.length === 1 ? `Tram ${el.innerText}` : `Bus ${el.innerText}`
        const wait = [
          { type: 6, text: texts[5].replace("[tram/bus]", type) },
          { type: 7, text: texts[6].replace("[tram/bus]", type) },
          { type: 8, text: texts[7].replace("[tram/bus]", type) },
          { type: 9, text: texts[8].replace("[tram/bus]", type) },
          { type: 10, text: texts[9].replace("[tram/bus]", type) },
        ]
        if (el.innerText.length !== 1) wait.splice(3, 1)
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
      const duration = $(".duration span", el.parentElement.parentElement).textContent.trim()
      sequence.push({ transport: `Je marche vers ma destination`, duration, photos: [{ type: 2, text: "Vous êtes arrivé !" }] })
      return sequence
    })
    window.formTrip = $route.params.id
    $router.push({ query: { step: 2 } })
  },
  async 2() {
    const from = { text: state.from.text.split(" - ")[0], lat: state.from.Latitude, lng: state.from.Longitude }
    const to = { text: state.to.text.split(" - ")[0], lat: state.to.Latitude, lng: state.to.Longitude }
    const duration = state.sequences[state.choice].at(-1).duration
    $state.trips[$route.params.id - 1] = { from, to, duration, sequences: state.sequences[state.choice] }
    $router.push({ query: { step: 3 } })
  },
}

async function next(step, ...args) {
  const fn = nexts[step]
  await fn(...args)
}
</script>
