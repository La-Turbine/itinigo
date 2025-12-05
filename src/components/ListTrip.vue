<template>
  <ion-list lines="none" inset>
    <ion-label class="text-3xl font-bold">Mes itinéraires</ion-label>
    <card-trip :trip="trip" :delete="$state.mode === 'helper'" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)" v-for="(trip, i) in $state.trips" :key="i" />
    <ion-button expand="block" @click="addTrip" v-if="$state.mode === 'helper'">
      <div class="text-2xl i-ion/add mx-1 -my-1"></div>
      Créer un itinéraire
    </ion-button>
    <ion-button expand="block" color="danger" @click="$router.push(`/config`)" v-if="$state.mode === 'helper'">
      <div class="text-xl i-ion/settings-sharp mx-1 -my-1"></div>
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
