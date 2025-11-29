<template>
  <div class="p-4" v-if="currentStep === 5">
    <ion-list>
      <ion-list-header>
        <ion-label>Choissisez une action</ion-label>
      </ion-list-header>
      <ion-radio-group v-model="currentType">
        <ion-item v-for="i in 5" v-if="currentSequence.transport.startsWith(`Je marche`)">
          <ion-radio :value="i">
            <div class="flex gap-2 items-center">
              <img class="ml-auto" :src="`/img/${i}.svg`" />
              <div>{{ texts[i - 1].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item :class="i === 3 && currentSequence.type.startsWith(`Bus`) && 'hidden'" @click="changeType(i + 5)" v-for="i in 5" v-if="currentSequence.transport.startsWith(`J'attend`)">
          <ion-radio :value="i + 5">
            <div class="flex gap-2 items-center">
              <img :src="`/img/${i + 5}.svg`" />
              <div>{{ texts[i + 4].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`)">
          <ion-radio value="11">
            <div class="flex gap-2 items-center">
              <img :src="`/img/11.svg`" />
              <div>{{ texts[10].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`) && currentSequence.type.startsWith(`Bus`)">
          <ion-radio value="8">
            <div class="flex gap-2 items-center">
              <img :src="`/img/${3 + 5}.svg`" />
              <div>{{ texts[3 + 4].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`)">
          <ion-radio value="12">
            <div class="flex gap-2 items-center">
              <img :src="`/img/12.svg`" />
              <div>{{ texts[11].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item>
          <ion-radio value="0">
            <div class="flex gap-2 items-center">
              <img :src="`/img/0.svg`" />
              <div>Autre type d'action</div>
            </div>
          </ion-radio>
        </ion-item>
      </ion-radio-group>
      <ion-button class="my-2.5 mx-5" expand="block" @click="confirmType">Confirmer</ion-button>
    </ion-list>

    <ion-list>
      <ion-list-header>
        <ion-label>Souhaitez vous renommer l'action ?</ion-label>
      </ion-list-header>
      <ion-item>
        <ion-textarea class="flex-1 m-auto" fill="solid" :auto-grow="true" v-model="currentText"></ion-textarea>
      </ion-item>
      <ion-button class="my-2.5 mx-5" expand="block" @click="confirmType">Confirmer</ion-button>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])
const currentType = ref(currentPhoto.value.type || -1)
const currentText = ref(currentPhoto.value.text || "")

watch(currentType, () => {
  currentText.value = texts[currentType.value - 1].replace("[tram/bus]", currentSequence.value.type)
})

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

function confirmType() {
  if (currentType.value !== -1) {
    currentPhoto.value.type = currentType.value
    currentPhoto.value.text = currentText.value
  }
  $router.push({ query: { ...$route.query, step: 4 } })
}
</script>
