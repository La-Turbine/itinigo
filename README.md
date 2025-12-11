# Itinigo

Projet Itinigo : accompagner la mobilité en TC des personnes en situation de handicap mental, cognitif ou psychique

## Structure

```
# Personas:
- Utilisateur: User
- Accompagnant: Helper

# Pages:
Page 1 - Trips: Liste des trajets
Page 2 - Trip: Création d'un trajet
  - Step 1 - Départ / Arrivée / Date / Heure
  - Step 2 - Choix d'un itiniraire (itinisere)
  - Step 3 - Liste des étapes (liste)
  - Step 4 - Edition d'une étape (photo + timeline)
  - Step 5 - Edition d'une étape (action)
Page 3 - Travel: Visualisation d'un trajet
Page 4 - Help
Page 5 - Config

# Composants:
- ListTrip (Page 1)
- ListStep (Step 3)
- CardTrip (Page 1)
- CardStep (Step 3+4)
- FormTrip (Step 1+2)
- FormPhoto (Step 4) = PhotoStream OU PhotoAnnotator + Timeline
- FormAction (Step 5)
- PhotoStream (Step 4)
- PhotoAnnotator (Step 4) #HARDCHANGE

# Composants potentiels:
- CardItinerary (Step 2) #NOCHANGE
- Travel (Page 3)
- CardHelp (Page 4)
- FormConfig (Page 5)
- TopBar

# Composants Ionic:
- Top Bar / Back Button
- Forms (Label, Input, Autocomplete)
- Lists, Reorder #NOCHANGE
- Action Sheet (burger) #NOCHANGE
- Alerts (TODO)
- Toast (MAYBE)
- Buttons, Icons (TOREMOVE)

# Functions:
## Utilities
- `homework(place)` - Returns formatted place name (home/work emoji)
- `triptitle(trip)` - Returns formatted trip title with from/to locations
- `retryPosition()` - Retries position watching with interval
- `watchPosition()` - Watches user's geolocation
- `notify(message, title?)` - Shows notification
- `push(message, title)` - Sends push notification via service worker
- `sms(message, number)` - Sends SMS via Twilio API
- swipe
- next / back
## 1-Trips.vue
- `addTrip()` - Adds a new trip
- `deleteTrip(index)` - Deletes a trip from the list
- `changeMode()` - Toggles between helper/user mode
## 2-Trip.vue
- `onSearch(event)` - Searches for addresses from API
- `onSelect(item)` - Selects an address item
- `onFocus(direction)` - Sets focus on from/to input
- `onBlur(direction)` - Removes focus from input
- `addPhoto(sequenceIndex, photoIndex)` - Adds a new photo to a sequence
- `deletePhoto(sequence, index)` - Deletes a photo from sequence
- `takePhoto()` - Captures photo from stream
- `changeType(type)` - Changes photo action type
- `reorderPhoto(sequence, event)` - Reorders photos in a sequence
- `annotatePhoto({ blob, snapshot })` - Handles annotated photo
## 3-Travel.vue
- `gogo()` - Starts the trip guidance
- `adjustFontSize(el, size?)` - Adjusts element font size
- `progressBetweenStops(currentPos, stops)` - Calculates progress between stops
- `haversineDistance(point1, point2)` - Calculates distance between two coordinates
- `confetti()` - Triggers confetti animation on trip completion
## 4-Help.vue
- `help()` - Shows help card
- `map()` - Opens Google Maps with destination
- `call()` - Initiates call to contact
## 5-Config.vue
- `requestInstall()` - Requests PWA installation
- `requestNotification()` - Requests notification permission
- `requestLocalisation()` - Requests geolocation permission
- `onExport()` - Exports app data as JSON
- `onImport()` - Imports app data from JSON file
- `reset()` - Resets the entire application
- `downloadManual()` - Downloads manual PDF
```

## 2025

Il y aura 3 lots qui correspondent à 5j de dev, 3j d'analyse, de review et de marge

Lot 1: Août / Septembre > Réorganisation

- [x] Merge du formulaire en 4 étapes, en 2 étapes
- [x] Ajout de 3 pages pour la création, édition d'une étape
- [x] Feat: Ré-annotation / Changement d'une photo
- [x] Feat: Timeline - navigation en dessous d'une photo (Swipe + Auto-scroll)
- [x] Fix: Suppression d'une photo (puis d'une autre)
- [x] Fix: Back button / Button "OK", "Preview" / Heure dans le formulaire

Lot 2: Octobre / Novembre > Design

- [x] Tech: Open-Source sur [github](https://github.com/La-Turbine/Itinigo) + README + LICENCE
- [x] Tech: Re-setup Vercel + Domain itinigo.fr
- [x] Fix: Burger sur edition d'une étape
- [x] Fix: Annotation sur photo sans nom
- [x] Refactor: Uniform "iOS" Design + Switch Bun + Update Latest + Switch Tailwind / Icons
- [x] Refactor: Rework en composants + Rework des fonctions + Fix Typescript + Cleanup Code
- [x] Feat: Recadrage d'une photo
- [x] Feat: Flux Appareil Photo
- [x] Design: Notification
- [x] Design: FormTrip (autocomplete, noir sur blanc)

Lot 3: Novembre / Décembre > Finitions + Améliorations

- [x] Design: Page 1 - Header (+ theme black/blue)
- [x] Design: Page 1 - ListTrip (+ buttons)
- [x] Design: Page 1 - CardTrip
- [x] Design: Page 2.1 - FormTrip
- [x] Design: Page 2.3 - CardStep
- [x] Design: Page 2.4 - Timeline ( + before/after, > validate at the end)
- [x] Design: Page 2.5 - FormAction
- [ ] Design: Travel - RAS?
- [ ] Design: Help - RAS?
- [ ] Design: Page 2.3 - PhotoAnnotator
- [ ] Design: Feedback + Finishing Touches
- [x] Design: Page 5 - Config
- [ ] BONUS: améliorer les montées de version (message + forcé la maj)

## ICEBOX / BACKLOG

- [x] 5j Reorganiser (merger 4 pages en 2, rajouter 3 pages, créer 5 composants)
- [x] 3j Ré-annoter / Recadrer / Changer
- [ ] 5j Feedback / Design
- [x] 1j Passation du Code / Hébergement / Domain / Open Source
- [ ] 1j Correspondance multiple (ajouter une étape)
- [ ] 1j Notification si application en background (notification sonore, à définir)
- [ ] 2j Geolocalisation des photos, notification si l'utilisateur s'éloigne
- [ ] 1j Analyse API cityway
- Config > lister la taille actuelle des données
- Optimisation de la taille des images/trajets (https://www.youtube.com/watch?v=O8uazkirvVo)
- Utile ? Export PDF (avec metadata JSON dedans)
- Utile ? Mode offline amélioré

## 2024

Lot 1: Août - Dévelopement 1ère partie (sur 3) du prototype "Mon Intinigo".

- Mise en place technique
- Utilisateur & Aidant: Page de liste des trajets
- Utilisateur: Suivi du trajet
- Aidant: Formulaire de création du trajet (2 première sections + photos)
- Déploiement & Démonstration

Lot 2: Septembre - Dévelopement 2ème partie (sur 3) du prototype "Mon Intinigo".

- Annotation photos
- Séquence en Tram & Bus, avec suivi et notification
- Carte d'Aide / Lien Map / Appel / SMS
- Configuration
- Design initial (max 1j)

Lot 3: Octobre/Novembre - Développement 3ème partie (sur 3) du prototype "Mon Intinigo".

- Annotation conditionnelle et ré-annotation des photos
- Spécificités Bus
- Maintien de l'éveil de l'application en arrière plan
- Finitions Design
- Corrections Bugs

## STEPS

01 ^ - Marchez tout droit jusqu’à la rue Ampère
02 < - Tournez à gauche aprés la borne rouge
03 ^ - Avancez tout droit rue Ampère
04 ^ - Continuez tout droit le long des potelets
05 ^ - Continuez tout droit jusqu’au passage piéton
06 = - Traversez quand le feu est vert
07 ^ - Continuez tout droit cours Berriat
08 < - Continuez jusqu’au passage piéton sans feu
09 ≠ - Passage piéton sans feu - Attention avant de traverser
10 ≠ - Traversez jusqu’au quai et tournez à droite
11 ^ - Continuez tout droit jusqu’à l’arrêt Berriat - Le Magasin

12 - Vous êtes à l’arrêt, vérifiez le nom de l’arrêt
13 - Vérifiez la direction de l’arrêt
14 - Repèrez la borne et validez votre titre de transport
15 - Attendez jusqu’à ce que le tram A arrive
16 - Le tram arrive, vérifiez la direction du tram

17 - Montez dans le tram
.. - Suivez l’avancée du tram
.. - Préparez-vous à descendre au prochain arrêt (+ Notification)
18 - Descendez du tram A et restez sur le même quai

19 - Restez sur le même quai et vérifiez le nom de l’arrêt
20 - Vérifiez la direction de l’arrêt
21 - Validez votre titre de transport
22 - Attendez le tram B
23 - Vérifiez la direction du tram B quand il arrive

24 - Montez dans le tram B
.. - Suivez l’avancée du tram
.. - Préparez-vous à descendre au prochain arrêt (+ Notification)
25 - Descendez du tram B et restez sur le même quai

26 ^ - Vérifier le nom de l’arrêt où vous êtes descendu
27 ^ - Avancez jusqu’au bout du quai en direction du musée
28 ^ - Avancez tout droit le long du quai en direction du musée
29 = - Traversez quand le feu est vert
30 = - Traversez quand le feu est vert
31 = - Traversez quand le feu est vert
32 ^ - Avancez en direction de la sculpture
33 > - Avancez vers les escaliers et l’entrée du musée
34 ^ - Vous êtes arrivé au musée, félicitations !

```js
const url = `https://www.itinisere.fr/fr/itineraires/4/JourneyPlanner/result?Date=28%2F07%2F2024&TypeDate=68&Hour=13&Minute=45&Algorithm=Fastest&TypeTrip=PlanTrip&ListModes=Bus%7CCoach%7CMetro%7CTram%7CTod%7CTgv%7CTer%7CTrain%7CPlane&ListPartners=14%7C28%7C24%7C30%7C15%7C5%7C2%7C22%7C18%7C29%7C6%7C8%7C31%7C3%7C13%7C12%7C26%7C27%7C7%7C17&CarDistance=100&CarLeave=0&BikeDistance=10&BikeLeave=0&BikeSpeed=15&BikeSecure=2&WalkDistance=2000&WalkSpeed=4&DurationVia=30&PointDep=152084_3_40&NumDep=40&LatDep=45.1867420708696&LngDep=5.71237108565983&PointArr=2002289_4&LatArr=45.187492048825&LngArr=5.73744659885#form`
if (window.location.href !== url) window.location.href = url
window.$ = (selector, context = document) => context.querySelector(selector)
window.$$ = (selector, context = document) => [...context.querySelectorAll(selector)]
$$(".panel-trip").map((el) => {
  return {
    from: $(".hours b", el).textContent.trim(),
    to: $(".hours b:nth-of-type(2)", el).textContent.trim(),
    duration: $(".duration", el).textContent.trim(),
    modes: $$(".modes li [title]", el)
      .map((el) => el.title)
      .join(" + "),
    // type: $(".type-trip", el).textContent.trim(),
    // ecology: "CO₂ " + $$(".ecology .green", el).length,
  }
})
$$(".detail-trip")
```

## NOTES

Pour le debug sur ANDROID, activé le "Developer Mode", activé le "USB Debugging" et autorisé lors de la connection USB. Puis aller dans "chrome://inspect/#devices".

Pour démarrer le simulateur d'iphone: `open -a Simulator`

Pour générer les icones: `npx @vite-pwa/assets-generator  --preset minimal-2023 public/favicon.svg`

https://css-tricks.com/vitepwa-plugin-offline-service-worker/#adding-your-own-service-worker-content
