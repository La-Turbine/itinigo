# Itinigo

Projet Itinigo : accompagner la mobilité en TC des personnes en situation de handicap mental, cognitif ou psychique

## Nomenclature

```
Personas:
- Utilisateur: User
- Accompagnant: Helper

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

Composants:
- ListTrip
- CardTrip
- FormTrip
- CardItinerary #NOCHANGE
- ListStep
- CardStep
- Annotator
- Timeline
- FormAction
- CardHelp
- FormConfig

Composants Ionic:
- Router
- Top Bar / Back Button
- Forms (Label, Input, Autocomplete)
- Lists, Reorder #NOCHANGE
- Action Sheet (burger) #NOCHANGE
- Alerts (TODO)
- Toast (MAYBE)
- Buttons (TOREMOVE)
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
- [x] Refactor: Uniform "iOS" Design + Switch Bun + Update Latest
- [ ] Refactor: Reorganisation en composants + Switch Tailwind / Icons
- [ ] Feat: Recadrage d'une photo
- [ ] Feat: Flux Appareil Photo
- [ ] Design: Header
- [ ] Design: Trips - ListTrip
- [ ] Design: Trips - CardTrip ( ⋮ delete, reorder)
- [ ] Design: Trips - FormTrip (autocomplete, noir sur blanc)
- [ ] Design: Trip - ListStep (header, sequences)
- [ ] Design: Trip - CardStep
- [ ] Design: Trip - Timeline ( + before/after)
- [ ] Design: Travel - Notification
- [ ] Design: Travel - RAS?
- [ ] Design: Help - RAS?
- [ ] Design: Config - RAS!

Lot 3: Novembre / Décembre > Finitions + Améliorations

TODO:

- [ ] 5j Reorganiser (merger 4 pages en 2, rajouter 3 pages, créer 5 composants)
- [ ] 3j Ré-annoter / Recadrer / Changer
- [ ] 5j Feedback / Design
- [ ] 1j Passation du Code / Hébergement / Domain / Open Source
- [ ] 1j Correspondance multiple (ajouter une étape)
- [ ] 1j Notification si application en background (notification sonore, à définir)
- [ ] 2j Geolocalisation des photos, notification si l'utilisateur s'éloigne
- [ ] 1j Analyse API cityway
- Utile ? Export PDF
- Utile ? Mode offline amélioré
- Utile ? ne pas pouvoir mettre du texte dans une flèche

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
