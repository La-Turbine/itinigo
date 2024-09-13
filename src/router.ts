import { createRouter, createWebHistory } from "@ionic/vue-router"
import { RouteRecordRaw } from "vue-router"
import TripsPage from "./pages/1-Trips.vue"
import TripPage from "./pages/2-Trip.vue"
import TravelPage from "./pages/3-Travel.vue"
import HelpPage from "./pages/4-Help.vue"
import ConfigPage from "./pages/5-Config.vue"

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/trip" },
  { path: "/trip", name: "Trips", component: TripsPage },
  { path: "/trip/:id", name: "Trip", component: TripPage },
  { path: "/travel/:id", name: "Travel", component: TravelPage },
  { path: "/help", name: "Help", component: HelpPage },
  { path: "/config", name: "Config", component: ConfigPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
