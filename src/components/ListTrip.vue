<template>
  <ion-list lines="none" inset>
    <ion-label class="text-3xl font-bold">Mes itinéraires</ion-label>
    <card-trip :trip="trip" :delete="$state.mode === 'helper'" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)" v-for="(trip, i) in $state.trips" :key="i" />
    <ion-button class="mx-5" expand="block" @click="addTrip" v-if="$state.mode === 'helper'">
      <div class="i-lucide/plus mx-1 -my-1 text-2xl"></div>
      Créer un itinéraire
    </ion-button>
    <ion-button class="mx-5" expand="block" color="warning" @click="$router.push(`/config`)" v-if="$state.mode === 'helper'">
      <div class="i-lucide/settings mx-1 -my-1 text-xl"></div>
      Configurer l'application
    </ion-button>
  </ion-list>
</template>

<script setup lang="ts">
function addTrip() {
  // if (navigator.onLine === false) return window.popup("Vous devez être connecté à internet pour ajouter un trajet")
  $router.push(`/trip/${$state.trips.length + 1}`)
}
</script>
