import { createRouter, createWebHistory } from "@ionic/vue-router"
import { RouteRecordRaw } from "vue-router"
import TripsPage from "../views/1-Trips.vue"
import TripPage from "../views/2-Trip.vue"

const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/home" },
  { path: "/home", name: "Home", component: TripsPage },
  { path: "/trajet/:id/:step?", name: "Trajet", component: TripPage },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router
