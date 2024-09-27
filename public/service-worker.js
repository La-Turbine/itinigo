// Notification
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) return client.focus()
      }
      return clients.openWindow(event.notification.data.url)
    })
  )
})

// Background
let wakeLock = null
async function requestWakeLock() {
  try {
    wakeLock = await navigator.wakeLock.request('screen')
    wakeLock.addEventListener('release', () => console.log('Wake Lock was released'))
    console.log('Wake Lock is active')
  } catch (err) {
    console.error(`${err.name}, ${err.message}`)
  }
}
document.addEventListener('visibilitychange', () => {
  if (wakeLock !== null && document.visibilityState === 'visible') requestWakeLock()
})
requestWakeLock()
