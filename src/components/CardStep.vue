<template>
  <div class="flex min-w-[70vw] overflow-hidden rounded-3xl border border-black/10 bg-white p-5" :class="i === +$route.query.sequence! && j === +$route.query.photo! ? '!border-[#3880ff] !bg-[#3880ff22]' : ''" :data-sequence="i" :data-photo="j" @click.stop="$router.push({ query: { step: 4, sequence: i, photo: j } })">
    <div class="-m-5 mr-5 flex h-30 w-20 items-center justify-center overflow-hidden rounded-3xl rounded-r-none bg-black/1 ring ring-black/10">
      <div class="i-lucide/image-plus size-10 text-gray-500" v-if="!$state.photos[photo.id]"></div>
      <ion-img :src="$state.photos[photo.id]" v-else />
    </div>
    <div class="flex-1">
      <div v-if="photo.text">{{ photo.text }}</div>
      <ion-button size="small" class="mx-0 -mt-2 h-10 w-24" @click.stop="$router.push({ query: { step: 5, sequence: i, photo: j } })" v-else>Décrire l'action</ion-button>
    </div>
    <div class="i-lucide/ellipsis-vertical my-1 -mr-1 size-5" @click.stop="$router.push({ replace: true, query: { ...$route.query, sequence: i, photo: j, action: 1 } })"></div>
  </div>
</template>

<script setup lang="ts">
const { i, j } = defineProps(["i", "j"])
const trip = $state.trips[$route.params.id - 1] || {}
const sequence = trip.sequences[i]
const photo = sequence.photos[j]
</script>
