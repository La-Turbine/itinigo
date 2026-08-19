<template>
  <div class="relative h-full w-full touch-none overflow-hidden" ref="frameRef" @pointerdown="onDown" @pointermove="onMove" @pointerup="onUp" @pointercancel="onUp" @wheel.prevent="onWheel">
    <video v-show="!gallery" ref="videoRef" autoplay playsinline muted class="h-full w-full object-cover"></video>
    <canvas v-show="gallery" ref="previewRef" class="absolute top-0 left-0 max-w-none select-none" :style="imageStyle"></canvas>
    <canvas ref="canvasRef" class="hidden"></canvas>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue"

const frameRef = ref<HTMLDivElement | null>(null)
const videoRef = ref<HTMLVideoElement | null>(null)
const previewRef = ref<HTMLCanvasElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)
const gallery = ref(false)
const scale = ref(1)
const ox = ref(0)
const oy = ref(0)
const imageStyle = computed(() => ({
  width: `${naturalW * scale.value}px`,
  height: `${naturalH * scale.value}px`,
  transform: `translate(${ox.value}px, ${oy.value}px)`,
}))

let stream: MediaStream | null = null
let bitmap: ImageBitmap | null = null
let naturalW = 0
let naturalH = 0
const pointers = new Map<number, { x: number; y: number }>()
let pinch: { dist: number; scale: number; cx: number; cy: number; ox: number; oy: number } | null = null

const startCamera = async () => {
  if (gallery.value) return
  const result = await navigator.permissions.query({ name: "camera" })
  if (result.state === "denied") return console.warn("Camera access denied by user")

  if (!videoRef.value) return
  try {
    // NOTE: specifying width=4096 and height=3072 here will not work on iOS
    stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment", width: { ideal: 4096 / 2 }, height: { ideal: 3072 / 2 } },
      audio: false,
    })
    videoRef.value.srcObject = stream
  } catch (err) {
    console.error("Error accessing camera:", err)
  }
}

const stopCamera = () => {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop())
    stream = null
  }
  if (videoRef.value) videoRef.value.srcObject = null
}

function minScale() {
  const frame = frameRef.value
  if (!frame || !naturalW || !naturalH) return 1
  return Math.max(frame.clientWidth / naturalW, frame.clientHeight / naturalH)
}

function clampOffset() {
  const frame = frameRef.value
  if (!frame) return
  const s = scale.value
  const maxX = 0
  const maxY = 0
  const minX = frame.clientWidth - naturalW * s
  const minY = frame.clientHeight - naturalH * s
  ox.value = Math.min(maxX, Math.max(minX, ox.value))
  oy.value = Math.min(maxY, Math.max(minY, oy.value))
}

function fitCover() {
  const s = minScale()
  scale.value = s
  const frame = frameRef.value
  if (!frame) return
  ox.value = (frame.clientWidth - naturalW * s) / 2
  oy.value = (frame.clientHeight - naturalH * s) / 2
}

function zoomAt(next: number, cx: number, cy: number) {
  const s0 = scale.value
  const s1 = Math.max(minScale(), Math.min(minScale() * 4, next))
  ox.value = cx - ((cx - ox.value) * s1) / s0
  oy.value = cy - ((cy - oy.value) * s1) / s0
  scale.value = s1
  clampOffset()
}

function localPoint(e: PointerEvent | WheelEvent) {
  const frame = frameRef.value!
  const r = frame.getBoundingClientRect()
  return { x: e.clientX - r.left, y: e.clientY - r.top }
}

function onDown(e: PointerEvent) {
  if (!gallery.value) return
  ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()]
    const p = localPoint(e)
    pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), scale: scale.value, cx: p.x, cy: p.y, ox: ox.value, oy: oy.value }
  }
}

function onMove(e: PointerEvent) {
  if (!gallery.value || !pointers.has(e.pointerId)) return
  const prev = pointers.get(e.pointerId)!
  pointers.set(e.pointerId, { x: e.clientX, y: e.clientY })
  if (pointers.size === 2 && pinch) {
    const [a, b] = [...pointers.values()]
    const dist = Math.hypot(a.x - b.x, a.y - b.y)
    if (pinch.dist < 1) return
    const mid = { x: (a.x + b.x) / 2, y: (b.y + a.y) / 2 }
    const frame = frameRef.value!.getBoundingClientRect()
    zoomAt(pinch.scale * (dist / pinch.dist), mid.x - frame.left, mid.y - frame.top)
    return
  }
  if (pointers.size === 1) {
    ox.value += e.clientX - prev.x
    oy.value += e.clientY - prev.y
    clampOffset()
  }
}

function onUp(e: PointerEvent) {
  pointers.delete(e.pointerId)
  if (pointers.size < 2) pinch = null
}

function onWheel(e: WheelEvent) {
  if (!gallery.value) return
  const p = localPoint(e)
  zoomAt(scale.value * (e.deltaY < 0 ? 1.08 : 1 / 1.08), p.x, p.y)
}

const capturePhoto = (): Promise<Blob | null> => {
  return new Promise((resolve) => {
    const canvas = canvasRef.value
    const frame = frameRef.value
    if (!canvas || !frame) {
      resolve(null)
      return
    }

    const displayAspectRatio = frame.clientWidth / frame.clientHeight
    let sourceX = 0
    let sourceY = 0
    let sourceWidth = 0
    let sourceHeight = 0
    let source: CanvasImageSource | null = null

    if (gallery.value && bitmap) {
      source = bitmap
      sourceX = -ox.value / scale.value
      sourceY = -oy.value / scale.value
      sourceWidth = frame.clientWidth / scale.value
      sourceHeight = frame.clientHeight / scale.value
    } else if (videoRef.value) {
      const video = videoRef.value
      source = video
      sourceWidth = video.videoWidth
      sourceHeight = video.videoHeight
      const videoAspectRatio = video.videoWidth / video.videoHeight
      if (videoAspectRatio > displayAspectRatio) {
        sourceWidth = video.videoHeight * displayAspectRatio
        sourceX = (video.videoWidth - sourceWidth) / 2
      } else {
        sourceHeight = video.videoWidth / displayAspectRatio
        sourceY = (video.videoHeight - sourceHeight) / 2
      }
    }

    if (!source) {
      resolve(null)
      return
    }

    canvas.width = 4096
    canvas.height = 4096 / displayAspectRatio
    const ctx = canvas.getContext("2d")
    if (!ctx) {
      resolve(null)
      return
    }
    ctx.drawImage(source, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, canvas.width, canvas.height)
    canvas.toBlob((blob) => resolve(blob), "image/jpeg", 1.0)
  })
}

async function loadGallery(file: File) {
  stopCamera()
  bitmap?.close()
  bitmap = await createImageBitmap(file, { imageOrientation: "from-image" })
  naturalW = bitmap.width
  naturalH = bitmap.height
  gallery.value = true
  const preview = previewRef.value
  if (preview) {
    preview.width = naturalW
    preview.height = naturalH
    preview.getContext("2d")?.drawImage(bitmap, 0, 0)
  }
  fitCover()
}

function cancelGallery() {
  bitmap?.close()
  bitmap = null
  gallery.value = false
  startCamera()
}

onMounted(() => {
  startCamera()
})

onUnmounted(() => {
  stopCamera()
  bitmap?.close()
})

defineExpose({
  capturePhoto,
  loadGallery,
  cancelGallery,
  gallery,
})
</script>
