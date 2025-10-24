<template>
  <ion-list lines="none">
    <ion-reorder-group :disabled="!reorder" @ionItemReorder="reorderTrip($event)">
      <ion-item class="m-2" v-for="(trip, i) in $state.trips" :key="i">
        <card-trip :trip="trip" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)" />
        <ion-button class="h-8 m-1" color="danger" @click="deleteTrip(i)"><div class="text-xl i-ion/trash"></div></ion-button>
        <!-- <ion-reorder slot="end"></ion-reorder> -->
        <!-- <div class="i-ion/ellipsis-vertical" @pointerdown="console.log('actions')" v-show="!reorder"></div> -->
      </ion-item>
    </ion-reorder-group>
    <ion-button class="my-2.5 mx-5" expand="block" @click="addTrip" v-if="$state.mode === 'helper'">Ajouter un trajet</ion-button>
    <ion-button class="my-2.5 mx-5" expand="block" color="danger" @click="$router.push(`/config`)" v-if="$state.mode === 'helper'">Configurer l'application</ion-button>
  </ion-list>
</template>

<script setup lang="ts">
import { ref } from "vue"
const reorder = ref(false)
function reorderTrip(event: any) {
  console.log("Reorder event:", event)
}
function deleteTrip(index: number) {
  if (!confirm("Voulez-vous vraiment supprimer ce trajet ?")) return
  $state.trips.splice(index, 1)
}
function addTrip() {
  if (navigator.onLine === false) return alert("Vous devez être connecté à internet pour ajouter un trajet")
  $router.push(`/trip/${$state.trips.length + 1}`)
}
</script>
