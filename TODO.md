# Mon Itinigo

Figma Aidant: https://www.figma.com/design/Xj4Ir5jPl7wvXCbNAu6cAA/Mon-Itinigo---Maquette-V2?node-id=2627-1099

- [x] - Liste des trajets
- [x] - Formulaire 1 - De > À
- [x] - Formulaire 2 - Itinisère Selection API
- [x] - Formulaire 3 - Séquences
- [x] - Formulaire 4 - Séquence (Marche + Attente + Transport)
- [x] - Ecran de configuration

Figma Utilisateur: https://www.figma.com/design/Xj4Ir5jPl7wvXCbNAu6cAA/Mon-Itinigo---Maquette-V2?node-id=2576-1125

- [x] - Liste des trajets
- [x] - Choix du trajet, Vérification, C'est Parti
- [x] - Suivi du trajet (Photo + Texte + Bouton Suivant)
- [x] - Carte d'aide / Google Maps / Appel / SMS

---

Lot 1: Août

> 1j+ > setup / tech / contrat / planning
> 1j > formulaire trajet / photos
> 1j+ > itinisere API + carte choix
> 1j > suivi trajet

Lot 2: Septembre

> 1j+ > annotations photos
> 1j+ > séquences (marche, attente, transport) avec notifications avant l'arrivée
> 1j > aide / maps / appel / sms
> 1j > configuration
> 1j > design

- [x] Text Auto
- [x] avant dernier arrêt (pulsation)
- [x] à 10% (notification)
- [x] à 90% (écran suivant)
- [x] Page "C'est parti"
- [x] Page "Vous êtes arrivé", confetti et bouton de retour
- [x] Timer 1h30 appli en background pour reset
- [x] Configuration - Maison / Travail / Installation PWA / Numéro Version
- [x] Arrivée en mode aidant sur la page config quand pas de trajet / theme_color #f6f7f7
- [x] Passe Design ensemble
- [x] Carte d'aide
- [-] Géoloc

Lot 3: Octobre

> 3j > design + feedback
> 1j > geolocalisation (l'utilisateur s'éloigne)
> 1j+ > export PDF / Print
> 1j > export / import
> 1j > tech avancés (mode PWA, mode offline, vercel toolbar, rapport d'accessibilité)
> ...

- [ ] Annotation conditionnelle + ajouter un picto
- [ ] Ré-annoter
- [ ] Comportement spécifique pour le BUS (appuie sur le bouton, notification avant)
- [ ] BugFix Android Olivier (Notification)
- [x] BugFix Iphone (il faut installer l'appli, depuis Safari) / RAS

= 15j
= 10000€, répartit sur Août / Septembre / Octobre

Le code vous appartient.
Le design ne sera pas "pixel perfect" mais sera selon moi "au delà des maquettes".
Une des fonctionnalités peut être significativement plus longue que prévue, si c'est le cas, à vous de voir si on réduis ou augmente le scope et le budget du lot.
Chaque Lot est payable en fin du mois, avec possibilité de stopper le projet à la fin de chaque lot.
Il y aura une démo à la fin de chaque lot et en cours de dev si besoin.

---

- Helper: Configuration
  - Photos Aidant + Utilisateur
  - Règles Notifications (Son / Vibration / SMS)
  - Affichage Texte (ON / OFF)
  - Carte d'aide (Texte + Numéros de téléphone pour Appel + SMS)
  - Aide Utilisation App
  - Export PDF
- User: Liste des trajets
- User: Suivre un trajet
  - Feature 3: Attendre + Notification?
  - Feature 4: Liste des arrêts + Notification + Geolocalisation?
- User: Aide / Appel + SMS

## NOTES

Pour le debug sur ANDROID, activé le "Developer Mode", activé le "USB Debugging" et autorisé lors de la connection USB. Puis aller dans "chrome://inspect/#devices".

Pour générer les icones: `npx @vite-pwa/assets-generator  --preset minimal-2023 public/favicon.svg`

https://css-tricks.com/vitepwa-plugin-offline-service-worker/#adding-your-own-service-worker-content
