// Tests de src/geo.js — exécutable sans dépendance : node tests/geo.test.mjs
import { decodePolyline, createProgressTracker } from "../src/geo.js"

let failures = 0
function assert(cond, label) {
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`)
  if (!cond) failures++
}

// Coordonnées locales en mètres -> lat/lng (Grenoble)
const LAT0 = 45.18,
  LNG0 = 5.72
const M_PER_DEG_LAT = 111320
const M_PER_DEG_LNG = 111320 * Math.cos((LAT0 * Math.PI) / 180)
const pt = (x, y) => ({ lat: LAT0 + y / M_PER_DEG_LAT, lng: LNG0 + x / M_PER_DEG_LNG })

// --- decodePolyline : vecteur de test officiel Google ---
{
  const pts = decodePolyline("_p~iF~ps|U_ulLnnqC_mqNvxq`@")
  assert(pts.length === 3, "decodePolyline: 3 points")
  assert(Math.abs(pts[0].lat - 38.5) < 1e-9 && Math.abs(pts[0].lng - -120.2) < 1e-9, "decodePolyline: point 1")
  assert(Math.abs(pts[2].lat - 43.252) < 1e-9 && Math.abs(pts[2].lng - -126.453) < 1e-9, "decodePolyline: point 3")
}

// --- Scénario 1 : ligne en U, GPS parfait, shape = tracé réel ---
{
  const stops = [pt(0, 0), pt(300, 0), pt(300, 200), pt(0, 200)]
  const path = []
  for (let x = 0; x <= 300; x += 20) path.push(pt(x, 0))
  for (let y = 20; y <= 200; y += 20) path.push(pt(300, y))
  for (let x = 280; x >= 0; x -= 20) path.push(pt(x, 200))
  const track = createProgressTracker(stops, null, path) // shape fournie décodée pour le test
  let prevNumber = -1,
    prevAbs = -1,
    regressions = 0
  let out
  for (const p of path) {
    out = track(p)
    const abs = out.number + out.percentage
    if (abs < prevAbs - 1e-9) regressions++
    prevAbs = abs
    prevNumber = out.number
  }
  assert(regressions === 0, `U-line + shape: aucune régression (${regressions})`)
  assert(out.number === 2 && out.percentage > 0.99, `U-line + shape: arrivée détectée (seg ${out.number} @ ${(out.percentage * 100).toFixed(0)}%)`)
}

// --- Scénario 1b : ligne en U, SANS shape (fallback anciens trajets = cordes entre arrêts) ---
{
  const stops = [pt(0, 0), pt(300, 0), pt(300, 200), pt(0, 200)]
  const path = []
  for (let x = 0; x <= 300; x += 20) path.push(pt(x, 0))
  for (let y = 20; y <= 200; y += 20) path.push(pt(300, y))
  for (let x = 280; x >= 0; x -= 20) path.push(pt(x, 200))
  const track = createProgressTracker(stops, null)
  let prevAbs = -1,
    regressions = 0,
    out
  for (const p of path) {
    out = track(p)
    const abs = out.number + out.percentage
    if (abs < prevAbs - 1e-9) regressions++
    prevAbs = abs
  }
  assert(regressions === 0, `U-line fallback sans shape: aucune régression (${regressions})`)
  assert(out.number === 2 && out.percentage > 0.99, `U-line fallback: arrivée détectée (seg ${out.number} @ ${(out.percentage * 100).toFixed(0)}%)`)
}

// --- Scénario 2 : segment en arc (500m de route pour 300m à vol d'oiseau) ---
{
  const stops2 = [pt(0, 0), pt(300, 0), pt(600, 0)]
  const arc = []
  for (let t = 0; t <= 1.001; t += 0.05) arc.push(pt(300 * t, 200 * Math.sin(Math.PI * t)))
  for (let x = 320; x <= 600; x += 40) arc.push(pt(x, 0))
  const track = createProgressTracker(stops2, null, arc)
  const mids = []
  for (const p of arc) {
    const out = track(p)
    mids.push(out)
  }
  // au sommet de l'arc (t=0.5, index 10) : la moitié du chemin est parcourue -> ~50%, pas ~83%
  const track2 = createProgressTracker(stops2, null, arc)
  let atMid
  for (let i = 0; i <= 10; i++) atMid = track2(arc[i])
  assert(atMid.number === 0 && atMid.percentage > 0.4 && atMid.percentage < 0.6, `arc: à mi-parcours réel, ~50% affiché (${(atMid.percentage * 100).toFixed(0)}%)`)
}

// --- Scénario 3 : véhicule ARRÊTÉ à l'arrêt S1, bruit GPS 30m -> affichage stable ---
{
  const stops2 = [pt(0, 0), pt(300, 0), pt(600, 0)]
  const path = []
  for (let x = 0; x <= 600; x += 20) path.push(pt(x, 0))
  const track = createProgressTracker(stops2, null, path)
  // amener le véhicule jusqu'à S1
  for (let x = 0; x <= 300; x += 20) track(pt(x, 0))
  let seed = 42
  const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
  const gauss = () => (rand() + rand() + rand() + rand() - 2) * 1.7
  const seen = []
  for (let i = 0; i < 50; i++) seen.push(track(pt(300 + 30 * gauss(), 30 * gauss())))
  const abscissas = seen.map((o) => o.number + o.percentage)
  const monotone = abscissas.every((v, i) => i === 0 || v >= abscissas[i - 1] - 1e-9)
  const drift = abscissas.at(-1) - abscissas[0]
  assert(monotone, "bruit 30m à l'arrêt: affichage jamais en recul")
  assert(drift < 0.25, `bruit 30m à l'arrêt: dérive avant bornée (${(drift * 100).toFixed(0)}% de segment)`)
}

// --- Scénario 4 : repli serré (branches parallèles à 60m), le bruit ne fait pas sauter sur la branche retour ---
{
  const stops = [pt(0, 0), pt(400, 0), pt(400, 60), pt(0, 60)]
  const path = []
  for (let x = 0; x <= 400; x += 20) path.push(pt(x, 0))
  path.push(pt(400, 30))
  for (let x = 400; x >= 0; x -= 20) path.push(pt(x, 60))
  const track = createProgressTracker(stops, null, path)
  // véhicule à mi-chemin du premier segment, fixes bruités tirés VERS la branche retour (+40m nord)
  track(pt(0, 0))
  track(pt(100, 0))
  const out1 = track(pt(200, 0))
  const out2 = track(pt(210, 40)) // fix aberrant vers la branche parallèle
  const out3 = track(pt(220, 0))
  assert(out2.number === 0, `repli 60m: fix bruité reste sur l'aller (seg ${out2.number})`)
  assert(out3.number === 0 && out3.percentage < 0.7, `repli 60m: reprise normale (seg ${out3.number} @ ${(out3.percentage * 100).toFixed(0)}%)`)
}

// --- Robustesse : entrées dégénérées ---
{
  const t1 = createProgressTracker([pt(0, 0), pt(100, 0)], null)
  const o1 = t1(pt(50, 0))
  assert(o1.number === 0 && o1.percentage > 0.4 && o1.percentage < 0.6, "2 arrêts seulement: OK")
  const t2 = createProgressTracker([pt(0, 0)], null)
  const o2 = t2(pt(0, 0))
  assert(o2.number === 0 && o2.percentage === 0, "1 seul arrêt: ne crashe pas")
}

console.log(failures ? `\n${failures} échec(s)` : "\nTous les tests passent")
process.exit(failures ? 1 : 0)
