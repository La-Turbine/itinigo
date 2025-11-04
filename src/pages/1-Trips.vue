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
async function changeMode() {
  if ($state.mode === "user" && !(await window.popup("Voulez-vous passer en mode édition ?", { ok: "Oui", ko: "Non" }))) return
  $state.mode = $state.mode === "helper" ? "user" : "helper"
}
</script>
