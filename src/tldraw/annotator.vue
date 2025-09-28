<template>
  <div style="height: 100%; width: 100%" v-html="html" ref="tldraw"></div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue"
const props = defineProps<{ url: string }>()
const emits = defineEmits(["done"])
const tldraw = ref(null as HTMLDivElement | null)
const container = ref({ width: window.innerWidth, height: window.innerHeight })
const photo = ref(null)
watch(
  props,
  () => {
    const { url } = props
    if (!url) return
    const type = url.match(/^data:(.*?);base64/)?.[1] || ""
    if (!type) {
      const snapshot = JSON.parse(url)
      return photo.value = snapshot
    }
    const image = new Image()
    image.onload = () => {
      photo.value = { src: url, width: image.width, height: image.height, type }
    }
    image.src = url
  },
  { immediate: true }
)
const html = computed(() => {
  if (!photo.value) return ""
  const screen = container.value
  const image = { ...photo.value }
  const scale = Math.min(screen.width / image.width, screen.height / image.height)
  image.width = image.width * scale
  image.height = image.height * scale
  const attr = { image, "on-done": "onDone" }
  const attrStr = Object.entries(attr)
    .map(([k, v]) => `${k}='${typeof v === "string" ? v : JSON.stringify(v)}'`)
    .join(" ")
  return `<wc-tldraw ${attrStr}></wc-tldraw>`
})
function until(fn: () => boolean) {
  const id = setInterval(() => {
    if (fn()) clearInterval(id)
  }, 100)
}
until(() => {
  if (!tldraw.value || !tldraw.value.clientWidth || !tldraw.value.clientHeight) return false
  container.value = { width: tldraw.value.clientWidth, height: tldraw.value.clientHeight }
  return true
})
window.onDone = (e) => emits("done", e)
</script>
