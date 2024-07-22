<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-back-button default-href="/"></ion-back-button>
        </ion-buttons>
        <ion-title>Trajet {{ $route.params.id }}</ion-title>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <form @submit.prevent="next">
        <ion-list v-if="+$route.params.step < 2">
          <ion-item>
            <ion-input label="Nom" v-model="state.name"></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Départ" v-model="state.from" required></ion-input>
          </ion-item>
          <ion-item>
            <ion-input label="Arrivé" v-model="state.to" required></ion-input>
            <!-- autocomplete="street-address" -->
          </ion-item>
        </ion-list>

        <ion-list v-if="+$route.params.step === 2">
          <ion-item>
            <ion-input v-model="state.photos" type="file" accept="image/jpeg" required></ion-input>
          </ion-item>
        </ion-list>

        <ion-item style="margin-left: auto">
          <ion-back-button text="Précédent" icon="" default-href="/" fill="outline" v-if="+$route.params.step > 1"></ion-back-button>
          <ion-button type="submit" @click="$router.push({ params: { step: +($route.params.step || 1) + 1 } })">Suivant</ion-button>
        </ion-item>
      </form>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonBackButton } from "@ionic/vue"
import { ref } from "vue"
const state = ref({
  name: "",
  from: "",
  to: "",
  steps: [],
  photos: [],
})
function next() {
  if (step.value < lastStep) return step.value++
  return console.log("Submit", state.value)
}

// A multi-step form starting with "from" and "to" address/location
// Then a number of steps
// For each step: a "type" switch and a "photo" upload
</script>
