# Habitudes — application mobile (Expo)

Application de suivi d'habitudes pour iPhone et Android, construite avec Expo SDK 58.

## Fonctionnalités

- Ajouter une habitude : nom, icône, couleur
- Cocher l'habitude du jour d'un geste (retour haptique)
- Cocher ou décocher les 6 jours précédents dans la frise de la semaine
- Série en cours (🔥 jours d'affilée) ; elle n'est pas perdue tant que la journée n'est pas finie
- Barre de progression du jour (x/y habitudes réalisées)
- Appui long sur une carte pour la supprimer (avec confirmation)
- Rappel quotidien par notification, réglable par habitude (🔔 sur la carte ou à la création)
- Données enregistrées sur le téléphone (AsyncStorage), sans compte ni serveur

## Lancer l'application

```bash
cd mobile
npm install
npx expo start
```

Scannez le QR code avec **Expo Go** (App Store / Play Store). Toutes les dépendances sont incluses dans Expo Go : pas besoin de build natif pour tester.

## Rappels

- Notifications **locales**, programmées sur le téléphone : aucun serveur, aucun compte.
- Elles fonctionnent dans Expo Go sur iPhone et Android (seules les notifications push à distance en sont exclues sur Android).
- L'autorisation est demandée au moment où l'on active le premier rappel. En cas de refus, l'app propose d'ouvrir les réglages.
- Le rappel est quotidien et sonne même si l'habitude est déjà cochée ce jour-là.
- Non disponible dans la version web.

## Structure

```
App.tsx                         Écran principal (liste, progression, ajout, suppression)
src/types.ts                    Modèle de données Habit
src/dates.ts                    Jours en heure locale, calcul des séries
src/storage.ts                  Lecture / écriture AsyncStorage
src/notifications.ts            Autorisation, canal Android, programmation des rappels
src/components/ReminderPicker.tsx Interrupteur + réglage heure/minutes
src/components/ReminderModal.tsx  Modification du rappel d'une habitude
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
