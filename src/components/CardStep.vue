<template>
  <div class="p-2.5 bg-white rounded-[20px] border border-black/15 min-w-[60vw] flex overflow-hidden" :class="i === +$route.query.sequence! && j === +$route.query.photo! ? '!border-[#3880ff] !bg-[#3880ff22]' : ''" :data-sequence="i" :data-photo="j" @click.stop="$router.push({ query: { step: 4, sequence: i, photo: j } })">
    <ion-img :src="$state.photos[photo.id] || '/img/gallery.svg'" class="max-w-[115px] h-[115px]" />
    <div class="flex-1 my-auto pl-2" v-if="photo.text">{{ photo.text }}</div>
    <ion-button size="small" class="my-auto ml-0 mr-auto pl-2" @click.stop="$router.push({ query: { step: 5, sequence: i, photo: j } })" v-else>Nommer l'action</ion-button>
    <div class="i-ion/ellipsis-vertical" @click.stop="$router.push({ replace: true, query: { ...$route.query, sequence: i, photo: j, action: 1 } })"></div>
  </div>
</template>

<script setup lang="ts">
const { i, j } = defineProps(["i", "j"])
const trip = $state.trips[$route.params.id - 1] || {}
const sequence = trip.sequences[i]
const photo = sequence.photos[j]
</script>
