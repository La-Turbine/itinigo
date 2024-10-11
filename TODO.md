# Mon Itinigo

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

Lot 3: Octobre

> 3j > design + feedback
> 1j > geolocalisation (l'utilisateur s'éloigne)
> 1j+ > export PDF / Print
> 1j > export / import
> 1j > tech avancés (mode PWA, mode offline, vercel toolbar, rapport d'accessibilité)
> ...

Lot 3:

- [ ] slide droite/gauche
- [ ] Annotation conditionnelle + ajouter un picto + picto rond plein/rond vide
- [ ] Ré-annoter
- [ ] Comportement spécifique pour le BUS (appuie sur le bouton, notification avant)
- [ ] Application en background (notification + gps)
- [ ] Ré-ouvrir après kill
- [ ] Timer 1h30 pour revenir à l'écran d'acceuil
- [ ] BugFix Android Olivier (Notification)
- [ ] BugFix Iphone (Notification)
- ~~SMS~~
- ~~Export PDF~~

## NOTES

Pour le debug sur ANDROID, activé le "Developer Mode", activé le "USB Debugging" et autorisé lors de la connection USB. Puis aller dans "chrome://inspect/#devices".

Pour générer les icones: `npx @vite-pwa/assets-generator  --preset minimal-2023 public/favicon.svg`

https://css-tricks.com/vitepwa-plugin-offline-service-worker/#adding-your-own-service-worker-content
