# Itinigo

- [ ] Comportement spécifique pour le BUS (appuie sur le bouton, notification avant)
- [ ] BugFix Iphone (Notification)
- [ ] BugFix Android Olivier (Notification)

- [ ] Application en background (notification + gps)
- [ ] SMS d'aide

- [ ] Ré-annoter
- [ ] Passation Code / Hébergement / Domain
- ~~Geolocalisation, l'utilisateur s'éloigne~~
- ~~Export PDF~~
- ~~Mode offline~~
- ~~Vercel toolbar / rapport d'accessibilité~~

## NOTES

Pour le debug sur ANDROID, activé le "Developer Mode", activé le "USB Debugging" et autorisé lors de la connection USB. Puis aller dans "chrome://inspect/#devices".

Pour démarrer le simulateur d'iphone: `open -a Simulator`

Pour générer les icones: `npx @vite-pwa/assets-generator  --preset minimal-2023 public/favicon.svg`

https://css-tricks.com/vitepwa-plugin-offline-service-worker/#adding-your-own-service-worker-content
