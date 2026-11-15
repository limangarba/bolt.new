# Habitudes — application mobile (Expo)

Application de suivi d'habitudes pour iPhone et Android, construite avec Expo SDK 58.

## Fonctionnalités

- Ajouter une habitude : nom, icône, couleur
- Cocher l'habitude du jour d'un geste (retour haptique)
- Cocher ou décocher les 6 jours précédents dans la frise de la semaine
- Série en cours (🔥 jours d'affilée) ; elle n'est pas perdue tant que la journée n'est pas finie
- Barre de progression du jour (x/y habitudes réalisées)
- Appui long sur une carte pour la supprimer (avec confirmation)
- Données enregistrées sur le téléphone (AsyncStorage), sans compte ni serveur

## Lancer l'application

```bash
cd mobile
npm install
npx expo start
```

Scannez le QR code avec **Expo Go** (App Store / Play Store). Toutes les dépendances sont incluses dans Expo Go : pas besoin de build natif pour tester.

## Structure

```
App.tsx                         Écran principal (liste, progression, ajout, suppression)
src/types.ts                    Modèle de données Habit
src/dates.ts                    Jours en heure locale, calcul des séries
src/storage.ts                  Lecture / écriture AsyncStorage
src/theme.ts                    Couleurs, icônes proposées
src/components/HabitCard.tsx    Carte d'une habitude + frise 7 jours
src/components/AddHabitModal.tsx Fenêtre d'ajout
```

## Publier sur les stores

```bash
npx eas-cli@latest build --platform all
npx eas-cli@latest submit
```

Identifiants d'application : `com.smartexpertise.habitudes` (à modifier dans `app.json` si besoin).
