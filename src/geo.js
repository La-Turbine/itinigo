// Progression le long d'un tracé de ligne (abscisse curviligne), au lieu de distances à vol d'oiseau entre arrêts.
// La position GPS est projetée sur la polyligne du leg (legGeometry OTP) ; la progression ne peut jamais reculer.

// Format "encoded polyline" Google/OTP, précision 1e-5
export function decodePolyline(encoded) {
  const points = []
  let index = 0
  let lat = 0
  let lng = 0
  while (index < encoded.length) {
    for (const axis of ["lat", "lng"]) {
      let shift = 0
      let result = 0
      let byte
      do {
        byte = encoded.charCodeAt(index++) - 63
        result |= (byte & 0x1f) << shift
        shift += 5
      } while (byte >= 0x20)
      const delta = result & 1 ? ~(result >> 1) : result >> 1
      if (axis === "lat") lat += delta
      else lng += delta
    }
    points.push({ lat: lat / 1e5, lng: lng / 1e5 })
  }
  return points
}

export function haversineDistance(point1, point2) {
  const R = 6371e3
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(point2.lat - point1.lat)
  const dLon = toRad(point2.lng - point1.lng)
  const lat1 = toRad(point1.lat)
  const lat2 = toRad(point2.lat)
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Projection d'un point sur un segment [a, b], en mètres (projection équirectangulaire locale)
function pointToSegment(p, a, b) {
  const kx = 111320 * Math.cos((a.lat * Math.PI) / 180)
  const ky = 111320
  const px = (p.lng - a.lng) * kx
  const py = (p.lat - a.lat) * ky
  const bx = (b.lng - a.lng) * kx
  const by = (b.lat - a.lat) * ky
  const len2 = bx * bx + by * by
  const t = len2 ? Math.min(Math.max((px * bx + py * by) / len2, 0), 1) : 0
  const dx = px - t * bx
  const dy = py - t * by
  return { t, dist: Math.sqrt(dx * dx + dy * dy) }
}

const BACK_WINDOW = 150 // m : fenêtre de re-projection en arrière tolérée (bruit GPS)
const FOLD_PENALTY = 0.1 // pénalise les candidats éloignés le long du tracé (lignes qui se replient)

// stops: [{lat, lng}], encodedShape: legGeometry.points (string) ou null, pathOverride: points décodés (tests)
// Retourne une fonction (position) => { number, percentage, distance } à état : la progression est monotone.
export function createProgressTracker(stops, encodedShape, pathOverride) {
  const path = pathOverride || (encodedShape ? decodePolyline(encodedShape) : stops.map((s) => ({ lat: s.lat, lng: s.lng })))
  const abscissa = [0]
  for (let i = 1; i < path.length; i++) abscissa.push(abscissa[i - 1] + haversineDistance(path[i - 1], path[i]))

  // Projette pos sur le tracé, au plus tôt à (ref - window), au plus proche de ref le long du tracé
  function project(pos, ref, window) {
    let best = { abscissa: Math.max(ref, 0), score: Infinity }
    for (let i = 0; i < path.length - 1; i++) {
      if (abscissa[i + 1] < ref - window) continue
      const { t, dist } = pointToSegment(pos, path[i], path[i + 1])
      const a = Math.max(abscissa[i] + t * (abscissa[i + 1] - abscissa[i]), ref - window)
      const score = dist + FOLD_PENALTY * Math.abs(a - ref)
      if (score < best.score) best = { abscissa: a, score }
    }
    return best.abscissa
  }

  // Abscisse de chaque arrêt sur le tracé, forcée croissante
  const stopAbscissa = []
  let acc = 0
  for (const stop of stops) {
    acc = Math.max(project(stop, acc, 0), acc)
    stopAbscissa.push(acc)
  }

  let last = 0
  return function progress(pos) {
    if (stops.length < 2 || path.length < 2) return { number: 0, percentage: 0, distance: 0 }
    last = Math.max(last, project(pos, last, BACK_WINDOW))
    let number = 0
    while (number < stops.length - 2 && last >= stopAbscissa[number + 1]) number++
    const span = stopAbscissa[number + 1] - stopAbscissa[number] || 1
    const percentage = Math.min(Math.max((last - stopAbscissa[number]) / span, 0), 1)
    return { number, percentage, distance: Math.max(stopAbscissa[number + 1] - last, 0) }
  }
}
