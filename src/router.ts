import { createRouter, createWebHistory } from "@ionic/vue-router"
import { RouteRecordRaw } from "vue-router"
import TripsPage from "./pages/1-Trips.vue"
import TripPage from "./pages/2-Trip.vue"

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/trips" },
  { path: "/trips", name: "Trip", component: TripsPage },
  { path: "/trip/:id", name: "Trips", component: TripPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
