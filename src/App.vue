<template>
  <ion-app>
    <ion-router-outlet :key="$route.name" />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet } from "@ionic/vue"
import { useRoute, useRouter } from "vue-router"
window.$route = useRoute()
window.$router = useRouter()
</script>
