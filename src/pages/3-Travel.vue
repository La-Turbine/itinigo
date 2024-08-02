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
    <ion-content>Trajet à suivre...</ion-content>
  </ion-page>
</template>

<script setup lang="ts">
//
</script>
