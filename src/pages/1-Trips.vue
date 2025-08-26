<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Trajets</ion-title>
        <ion-buttons slot="end">
          <ion-button @click="changeMode">
            <ion-icon :icon="$state.mode === 'helper' ? settings : walk"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <ion-list>
        <div style="position: relative" v-for="(trip, i) in $state.trips">
          <ion-button style="position: absolute; top: -14px; right: -2px; width: 20px; height: 20px" color="danger" @click="deleteTrip(i)" v-if="$state.mode === 'helper'">
            <ion-icon slot="icon-only" :icon="trash"></ion-icon>
          </ion-button>
          <card style="margin: 20px" :trip="trip" @click="$router.push($state.mode === 'helper' ? `/trip/${i + 1}?step=3` : `/travel/${i + 1}`)" />
        </div>
        <ion-button style="margin: 10px 20px" expand="block" @click="addTrip" v-if="$state.mode === 'helper'">Ajouter un trajet</ion-button>
        <ion-button style="margin: 10px 20px" expand="block" fill="outline" @click="$router.push(`/config`)" v-if="$state.mode === 'helper'">CONFIG</ion-button>
      </ion-list>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { settings, walk, trash } from "ionicons/icons"
function deleteTrip(index) {
  if (!confirm("Voulez-vous vraiment supprimer ce trajet ?")) return
  $state.trips.splice(index, 1)
}
function changeMode() {
  if ($state.mode === "user" && !confirm("Voulez-vous passer en mode édition ?")) return
  $state.mode = $state.mode === "helper" ? "user" : "helper"
}
function addTrip() {
  if (navigator.onLine === false) return alert("Vous devez être connecté à internet pour ajouter un trajet")
  $router.push(`/trip/${$state.trips.length + 1}`)
}
</script>
