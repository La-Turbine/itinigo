<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-title>Trajets</ion-title>
        <ion-buttons slot="end" @click="changeMode">
          <div class="text-xl" :class="$state.mode === 'helper' ? 'i-ion/settings' : 'i-ion/walk'"></div>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>
    <ion-content>
      <list-trip />
    </ion-content>
  </ion-page>
</template>

<script setup>
function changeMode() {
  if ($state.mode === "user" && !confirm("Voulez-vous passer en mode édition ?")) return
  $state.mode = $state.mode === "helper" ? "user" : "helper"
}
</script>
