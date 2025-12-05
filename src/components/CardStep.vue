<template>
  <div class="flex min-w-[70vw] p-5 bg-white rounded-3xl border border-black/10 overflow-hidden" :class="i === +$route.query.sequence! && j === +$route.query.photo! ? '!border-[#3880ff] !bg-[#3880ff22]' : ''" :data-sequence="i" :data-photo="j" @click.stop="$router.push({ query: { step: 4, sequence: i, photo: j } })">
    <div class="-m-5 mr-5 size-30 rounded-3xl ring ring-black/10 flex items-center justify-center overflow-hidden bg-black/1">
      <div class="i-lucide/image-plus size-10 text-gray-500" v-if="!$state.photos[photo.id]"></div>
      <ion-img :src="$state.photos[photo.id]" v-else />
    </div>
    <div class="flex-1">
      <div v-if="photo.text">{{ photo.text }}</div>
      <ion-button size="small" class="mx-0 -mt-2 h-10 w-24" @click.stop="$router.push({ query: { step: 5, sequence: i, photo: j } })" v-else>Nommer l'action</ion-button>
    </div>
    <div class="i-lucide/ellipsis-vertical size-5 my-1 -mx-1" @click.stop="$router.push({ replace: true, query: { ...$route.query, sequence: i, photo: j, action: 1 } })"></div>
  </div>
</template>

<script setup lang="ts">
const { i, j } = defineProps(["i", "j"])
const trip = $state.trips[$route.params.id - 1] || {}
const sequence = trip.sequences[i]
const photo = sequence.photos[j]
</script>
