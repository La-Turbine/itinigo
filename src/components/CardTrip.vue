<template>
  <div class="flex w-full min-h-[70px] p-2.5 bg-gray-100 rounded-lg border border-black/15" v-if="trip">
    <div class="w-2/5 m-auto font-medium text-center text-balance">{{ homework(trip.from?.text ?? "") }}</div>
    <svg class="w-1/5" viewBox="0 0 100 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="12" x2="90" y2="12" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      <path d="M90 4L98 12L90 20" stroke="#334155" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </svg>
    <div class="w-2/5 m-auto font-medium text-center text-balance">{{ homework(trip.to?.text ?? "") }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ trip: any }>()
</script>
