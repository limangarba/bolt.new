# Habitudes — suivi d'habitudes (Expo, iOS + Android)

Application Expo (SDK 58, Expo Router, TypeScript) fonctionnant sur iPhone, Android et web.

## Fonctionnalités
- Création / modification / suppression d'habitudes (nom, icône, couleur, jours de la semaine)
- Écran « Aujourd'hui » : cocher l'habitude du jour, barre de progression, 7 derniers jours cliquables (rattrapage)
- Série en cours, record, taux de réussite sur 30 jours, calendrier de 8 semaines
- Données stockées localement (AsyncStorage), thème clair/sombre automatique, retour haptique
- Rappels par notification : heure au choix par habitude, envoyés chaque jour planifié (iOS et Android)

## Lancer
```bash
cd mobile
npm install
npx expo start      # scanner le QR code avec Expo Go (iPhone ou Android)
```
Vérifications : `npx tsc --noEmit` · `npx expo lint`

## Structure
- `src/app/` — routes (`(tabs)/index`, `(tabs)/stats`, `habit-form`)
- `src/lib/` — dates, calcul des séries, stockage, thème
- `src/components/` — `HabitCard`
