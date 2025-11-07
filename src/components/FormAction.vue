<template>
  <div v-if="currentStep === 5">
    Choissisez une action:
    <div class="flex flex-col gap-2 px-5">
      <div class="flex items-center gap-2" @click="changeType(i)" v-for="i in 5" v-if="currentSequence.transport.startsWith(`Je marche`)">
        <div>{{ texts[i - 1].replace("[tram/bus]", currentSequence.type) }}</div>
        <img class="ml-auto" :src="`/img/${i}.svg`" />
      </div>
      <div
        class="flex items-center gap-2"
        :class="i === 3 && currentSequence.type.startsWith(`Bus`) && 'hidden'"
        @click="changeType(i + 5)"
        v-for="i in 5"
        v-if="currentSequence.transport.startsWith(`J'attend`)"
      >
        <div>{{ texts[i + 4].replace("[tram/bus]", currentSequence.type) }}</div>
        <img :src="`/img/${i + 5}.svg`" />
      </div>
      <div class="flex items-center gap-2" @click="changeType(11)" v-if="currentSequence.transport.startsWith(`Je monte`)">
        <div>{{ texts[10].replace("[tram/bus]", currentSequence.type) }}</div>
        <img :src="`/img/11.svg`" />
      </div>
      <div class="flex items-center gap-2" @click="changeType(3 + 5)" v-if="currentSequence.transport.startsWith(`Je monte`) && currentSequence.type.startsWith(`Bus`)">
        <div>{{ texts[3 + 4].replace("[tram/bus]", currentSequence.type) }}</div>
        <img :src="`/img/${3 + 5}.svg`" />
      </div>
      <div class="flex items-center gap-2" @click="changeType(12)" v-if="currentSequence.transport.startsWith(`Je monte`)">
        <div>{{ texts[11].replace("[tram/bus]", currentSequence.type) }}</div>
        <img :src="`/img/12.svg`" />
      </div>
    </div>
    <ion-button class="my-2.5 mx-5" expand="block" @click="$router.push({ query: { ...$route.query, step: 4 } })">Confirmer</ion-button>
    Souhaitez vous renommer l'action ?
    <ion-textarea class="flex-1 m-auto" fill="solid" :auto-grow="true" v-model="currentPhoto.text"></ion-textarea>
    <ion-button class="my-2.5 mx-5" expand="block" @click="$router.push({ query: { ...$route.query, step: 4 } })">Confirmer</ion-button>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])

const texts = [
  "Tournez à gauche",
  "Allez tout droit",
  "Tournez à droite",
  "Quand le feu piéton est vert, traversez le passage piéton",
  "Passage piéton sans feu, attention avant de traverser",
  "Vérifiez le nom de l'arrêt",
  "Vérifiez la direction",
  "Validez votre ticket",
  "Attendez à l'arrêt",
  "Quand le [tram/bus] arrive, vérifiez la direction",
  "Montez dans le [tram/bus]",
  "Descendez du [tram/bus]",
]

function changeType(type: number) {
  currentPhoto.value.type = type
  currentPhoto.value.text = texts[type - 1].replace("[tram/bus]", currentSequence.value.type)
}
</script>
