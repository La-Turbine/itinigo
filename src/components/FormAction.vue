<template>
  <div v-if="currentStep === 5">
    <ion-list lines="none" inset>
      <ion-label class="text-xs font-bold uppercase">Actions suggerées</ion-label>
      <ion-radio-group v-model="currentType">
        <ion-item v-for="i in 5" v-if="currentSequence.transport.startsWith(`Je marche`)">
          <ion-radio :value="i">
            <div class="flex items-center gap-2">
              <div class="m-2 ml-0 shrink-0 text-2xl" :class="icons[i - 1]"></div>
              <div class="font-bold text-wrap">{{ texts[i - 1].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item :class="i === 3 && currentSequence.type.startsWith(`Bus`) && 'hidden'" v-for="i in 5" v-if="currentSequence.transport.startsWith(`J'attend`)">
          <ion-radio :value="i + 5">
            <div class="flex items-center gap-2">
              <div class="m-2 ml-0 shrink-0 text-2xl" :class="icons[i + 4]"></div>
              <div class="font-bold text-wrap">{{ texts[i + 4].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`)">
          <ion-radio value="11">
            <div class="flex items-center gap-2">
              <div class="m-2 ml-0 shrink-0 text-2xl" :class="icons[10]"></div>
              <div class="font-bold text-wrap">{{ texts[10].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`) && currentSequence.type.startsWith(`Bus`)">
          <ion-radio value="8">
            <div class="flex items-center gap-2">
              <div class="m-2 ml-0 shrink-0 text-2xl" :class="icons[7]"></div>
              <div class="font-bold text-wrap">{{ texts[7].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
        <ion-item v-if="currentSequence.transport.startsWith(`Je monte`)">
          <ion-radio value="12">
            <div class="flex items-center gap-2">
              <div class="m-2 ml-0 shrink-0 text-2xl" :class="icons[11]"></div>
              <div class="font-bold text-wrap">{{ texts[11].replace("[tram/bus]", currentSequence.type) }}</div>
            </div>
          </ion-radio>
        </ion-item>
      </ion-radio-group>
    </ion-list>

    <ion-list lines="none" inset>
      <ion-label class="text-xs font-bold uppercase">Action Libre</ion-label>
      <ion-item>
        <ion-textarea class="m-auto flex-1" fill="solid" :auto-grow="true" v-model="currentText"></ion-textarea>
      </ion-item>
      <ion-button class="mx-5 my-2.5" expand="block" @click="confirmType">
        <div class="i-lucide/save mr-2 size-5"></div>
        Enregistrer l'action
      </ion-button>
    </ion-list>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"

const currentTrip = computed(() => $state.trips[$route.params.id - 1] || {})
const currentStep = computed(() => +($route.query.step || 1))
const currentSequence = computed(() => currentTrip.value.sequences?.[+$route.query.sequence])
const currentPhoto = computed(() => currentSequence.value?.photos[+$route.query.photo])
const currentType = ref(currentPhoto.value?.type || -1)
const currentText = ref(currentPhoto.value?.text || "")

watch(currentPhoto, () => {
  currentType.value = currentPhoto.value?.type || -1
  currentText.value = currentPhoto.value?.text || ""
})
watch(currentType, () => {
  currentText.value = texts[currentType.value - 1]?.replace("[tram/bus]", currentSequence.value.type)
})

const texts = ["Tournez à gauche", "Allez tout droit", "Tournez à droite", "Quand le feu piéton est vert, traversez le passage piéton", "Passage piéton sans feu, attention avant de traverser", "Vérifiez le nom de l'arrêt", "Vérifiez la direction", "Validez votre ticket", "Attendez à l'arrêt", "Quand le [tram/bus] arrive, vérifiez la direction", "Montez dans le [tram/bus]", "Descendez du [tram/bus]"]
const icons = ["i-lucide/arrow-left", "i-lucide/arrow-up", "i-lucide/arrow-right", "i-lucide/footprints", "i-lucide/triangle-alert", "i-lucide/map-pin", "i-lucide/signpost", "i-lucide/ticket", "i-lucide/clock", "i-lucide/bus-front", "i-lucide/log-in", "i-lucide/log-out"]

function confirmType() {
  if (currentType.value !== -1) {
    currentPhoto.value.type = currentType.value
    currentPhoto.value.text = currentText.value
  }
  $router.push({ query: { ...$route.query, step: 4 } })
}
</script>
