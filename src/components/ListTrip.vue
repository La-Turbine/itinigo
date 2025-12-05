<template>
  <ion-list lines="none">
    <ion-reorder-group :disabled="!reorder" @ionItemReorder="reorderTrip($event)">
      <ion-item class="m-2" v-for="(trip, i) in $state.trips" :key="i">
        <card-trip :trip="trip" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)" />
        <ion-button class="h-8 m-1" color="danger" @click="deleteTrip(i)" v-if="$state.mode === 'helper'"><div class="text-xl i-ion/trash"></div></ion-button>
        <!-- <ion-reorder slot="end"></ion-reorder> -->
        <!-- <div class="i-ion/ellipsis-vertical" @pointerdown="console.log('actions')" v-show="!reorder"></div> -->
      </ion-item>
    </ion-reorder-group>
    <ion-button class="my-2.5 mx-5" expand="block" @click="addTrip" v-if="$state.mode === 'helper'">
      <div class="text-2xl i-ion/add mx-1 -my-1"></div>
      Créer un itinéraire
    </ion-button>
    <ion-button class="my-2.5 mx-5" expand="block" color="danger" @click="$router.push(`/config`)" v-if="$state.mode === 'helper'">
      <div class="text-xl i-ion/settings-sharp mx-1 -my-1"></div>
      Configurer l'application
    </ion-button>
  </ion-list>
</template>

<script setup lang="ts">
import { ref } from "vue"
const reorder = ref(false)
function reorderTrip(event: any) {
  console.log("Reorder event:", event)
}
async function deleteTrip(index: number) {
  const confirmed = await window.popup("Êtes-vous sûr de vouloir supprimer ce trajet ?", { title: "Confirmer la suppression", ok: "Supprimer", ko: "Annuler" })
  if (!confirmed) return
  $state.trips.splice(index, 1)
}
function addTrip() {
  // if (navigator.onLine === false) return window.popup("Vous devez être connecté à internet pour ajouter un trajet")
  $router.push(`/trip/${$state.trips.length + 1}`)
}
</script>
