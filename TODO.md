# Mon Itinigo

Figma Aidant: https://www.figma.com/design/Xj4Ir5jPl7wvXCbNAu6cAA/Mon-Itinigo---Maquette-V2?node-id=2627-1099

- KO - Login / Sign Up > Dans la page de configuration, pas de compte car tout est local
- OK - Liste des trajets
- OK - Formulaire 1 - De > À
- OK - Formulaire 2 - Itinisère Selection API
- OK - Formulaire 3 - Séquences
- OK - Formulaire 4 - Séquence (Marche + Attente + Transport)
- OK - Ecran de configuration

Figma Utilisateur: https://www.figma.com/design/Xj4Ir5jPl7wvXCbNAu6cAA/Mon-Itinigo---Maquette-V2?node-id=2576-1125

- OK - Liste des trajets
- OK - Choix du trajet, Vérification, C'est Parti
- OK - Suivi du trajet (Photo + Texte + Bouton Suivant)
- OK - Carte d'aide
- OK - Google Maps
- OK - Appel / SMS

---

Lot 1: Août
1j+ > setup / tech / contrat / planning
1j > formulaire trajet / photos
1j+ > itinisere API + carte choix
1j > suivi trajet

Lot 2: Septembre
1j+ > annotations photos
1j+ > séquences (marche, attente, transport) avec notifications avant l'arrivée
1j > aide / maps / appel / sms
1j > configuration
1j > design

Lot 3: Octobre
3j > design + feedback
1j > geolocalisation (l'utilisateur s'éloigne)
1j+ > export PDF / Print
1j > export / import
1j > tech avancés (mode PWA, mode offline, vercel toolbar, rapport d'accessibilité)
...

= 15j
= 10000€, répartit sur Août / Septembre / Octobre

Le code vous appartient.
Le design ne sera pas "pixel perfect" mais sera selon moi "au delà des maquettes".
Une des fonctionnalités peut être significativement plus longue que prévue, si c'est le cas, à vous de voir si on réduis ou augmente le scope et le budget du lot.
Chaque Lot est payable en fin du mois, avec possibilité de stopper le projet à la fin de chaque lot.
Il y aura une démo à la fin de chaque lot et en cours de dev si besoin.

---

- Helper: Liste des trajets
- Helper: Formulaire 1 - De > À
- Helper: Formulaire 2 - API Itinisere + Selection
- Helper: Formulaire 3 - Séquences
- Helper: Formulaire 4 - Séquence (Marche + Attente + Transport)
  - Feature 1: Upload Photo
  - Feature 2: Annotations Photo (direction + angle + obstacles + repères)
- Helper: Phase de Marche
  - Tout droit
  - Tourner
  - Passage piéton
  - Passage piéton + Feu tri-colore
- Helper: Phase d'attente
  - Arrêt
  - Direction
  - Valider le ticket (Valider à l'extérieur TRAM)
  - Attendre
  - Vérification
- Helper: Phase de Bus/Tram
  - Monter
  - Valider le ticket (Valider à l'extérieur BUS)
  - Liste des arrêts
  - Descendre
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
