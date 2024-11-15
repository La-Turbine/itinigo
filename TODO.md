# Itinigo

- [x] BugFix Iphone (Notification)
- [x] BugFix Android Olivier (Notification)
- [x] Comportement spécifique pour le BUS (appuie sur le bouton, notification avant)
- [x] SMS d'aide
- [ ] Application en background (notification + gps)

BONUS:

- [ ] photo bus + bouton valider tram/bus
- [ ] mettre automatiquement les photos montée / descendre
- [ ] mettre automatiquement la dernière étapes "Bravo, vous êtes arrivée à destination !"
- [ ] afficher la flèche de direction
- [ ] ne pas pouvoir mettre du texte dans une flèche
- [ ] Ré-annoter
- [ ] Passation du Code / Hébergement / Domain
- ~~Geolocalisation, l'utilisateur s'éloigne~~
- ~~Export PDF~~
- ~~Mode offline~~
- ~~Vercel toolbar / rapport d'accessibilité~~

## NOTES

Pour le debug sur ANDROID, activé le "Developer Mode", activé le "USB Debugging" et autorisé lors de la connection USB. Puis aller dans "chrome://inspect/#devices".

Pour démarrer le simulateur d'iphone: `open -a Simulator`

Pour générer les icones: `npx @vite-pwa/assets-generator  --preset minimal-2023 public/favicon.svg`

https://css-tricks.com/vitepwa-plugin-offline-service-worker/#adding-your-own-service-worker-content
