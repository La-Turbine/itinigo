<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Trajets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="$state.mode = $state.mode === 'helper' ? 'user' : 'helper'">
            <ion-icon :icon="$state.mode === 'helper' ? accessibility : walk"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <ion-item v-for="(trip, i) in $state.trips" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)">{{ trip.from }} - {{ trip.to }}</ion-item>
        <ion-item @click="$router.push(`/trip/${$state.trips.length + 1}`)" v-if="$state.mode === 'helper'">
          <ion-icon :icon="add"></ion-icon>
          <ion-label>Ajouter un trajet</ion-label>
        </ion-item>
        <ion-item color="danger" @click="reset" v-if="$state.mode === 'helper'">
          <ion-label>RESET</ion-label>
        </ion-item>
      </ion-list>
    </ion-content>
    <!-- <div style="height: 500px; width: 500px">
      <wc-tldraw v-bind="attr"></wc-tldraw>
    </div> -->
  </ion-page>
</template>

<script setup lang="ts">
import { accessibility, walk, add } from "ionicons/icons"
// const image = { src: "", width: 100, height: 100, type: "image/png" }
// const attr = { image, xxx: "onDoneFN" }
// window.onDoneFN = (data) => console.log(data)
async function reset() {
  if (!confirm("Are you sure you want to reset?")) return
  await idb.clear()
  location.reload()
}
</script>
