# SmartCompta Exp 1.0.0 : installation sous Windows (hors ligne)

Logiciel de comptabilité SYSCOHADA révisé pour le Niger : saisie, import Excel, PDF, CSV et TXT, lettrage, paie (CNSS, ITS, FSSP), immobilisations, balance, bilan, exports Excel.
Aucune connexion internet n'est nécessaire. Les données restent sur l'ordinateur.

## Fichiers livrés

| Fichier | Rôle |
|---|---|
| `SmartCompta-Exp-Setup.exe` (0,8 Mo) | Installateur Windows : **méthode recommandée** |
| `SmartCompta-Exp.html` (2,9 Mo) | Version portable en un seul fichier (clé USB, dépannage) |
| `INSTALLATION.md` | Cette procédure |

## Configuration requise

- Windows 10 ou Windows 11, 64 bits.
- Microsoft Edge (installé d'origine sur Windows 10 et 11). Google Chrome convient aussi.
- 20 Mo d'espace disque, plus la place des données.
- Aucun droit d'administrateur : l'installation se fait pour l'utilisateur Windows connecté.

---

## Méthode 1 : installation avec Setup.exe (recommandée)

### Étape 1 : copier l'installateur
Copiez `SmartCompta-Exp-Setup.exe` sur l'ordinateur (clé USB, e-mail ou téléchargement), par exemple sur le Bureau.

### Étape 2 : lancer l'installateur
Double-cliquez sur `SmartCompta-Exp-Setup.exe`.

> **Avertissement « Windows a protégé votre ordinateur » (SmartScreen)**
> Il apparaît parce que l'installateur n'est pas signé par un certificat commercial. Cliquez sur **Informations complémentaires**, vérifiez que le nom du fichier est bien `SmartCompta-Exp-Setup.exe`, puis cliquez sur **Exécuter quand même**.
> Si l'antivirus bloque le fichier, ajoutez-le aux exceptions ou demandez-le à votre administrateur.

### Étape 3 : suivre l'assistant
1. Écran d'accueil : cliquez sur **Suivant**.
2. L'installation copie les fichiers dans `%LOCALAPPDATA%\SmartComptaExp\App` (quelques secondes).
3. Écran final : laissez cochée la case **Lancer SmartCompta Exp maintenant**, puis cliquez sur **Fermer**.

L'installation crée :
- un raccourci **SmartCompta Exp** sur le Bureau ;
- un dossier **SmartCompta Exp** dans le menu Démarrer, avec le désinstallateur ;
- une entrée dans **Paramètres → Applications**.

### Étape 4 : premier démarrage
SmartCompta Exp s'ouvre dans sa propre fenêtre, sans barre d'adresse.
1. Allez dans **Dossier** et renseignez la raison sociale, le NIF, le RCCM, le régime fiscal et les dates d'exercice. Cliquez sur **Enregistrer le dossier**.
2. Toujours dans **Dossier**, section **Sauvegarde automatique**, cliquez sur **Choisir le fichier de sauvegarde**. Choisissez un emplacement sûr : une clé USB, un disque externe ou un dossier synchronisé (OneDrive). Par exemple `D:\Sauvegardes\SmartCompta-MonEntreprise.json`. Chaque modification y sera recopiée automatiquement.
3. Allez dans **Paie → Paramètres** et vérifiez les taux (CNSS, ITS, FSSP, accidents du travail selon votre classe de risque).

### Étape 5 : utilisation quotidienne
- Ouvrez l'application par le raccourci du Bureau ou du menu Démarrer.
- Les données sont enregistrées automatiquement à chaque saisie : il n'y a pas de bouton « Enregistrer » global.
- Au redémarrage de Windows, la sauvegarde automatique peut passer **en pause** : Windows redemande votre accord pour écrire dans le fichier. Le tableau de bord l'indique. Cliquez sur **La reprendre**, puis sur **Autoriser**.

### Exports Excel
Journaux, grand livre, balance, livre de paie, état CNSS et ITS, tableau d'amortissement, modèles d'import : chaque bouton « Exporter en Excel » enregistre un fichier `.xlsx` dans le dossier **Téléchargements**.

---

## Méthode 2 : version portable (un seul fichier HTML)

1. Copiez `SmartCompta-Exp.html` dans un dossier fixe, par exemple `Documents\SmartCompta`.
2. Double-cliquez dessus : il s'ouvre dans Microsoft Edge (ou votre navigateur par défaut).
3. Ajoutez-le à vos favoris pour le retrouver.

Précautions propres à cette version :
- Les données sont rangées **dans le navigateur**, pour ce fichier précis. Ne déplacez et ne renommez plus le fichier, et n'effacez pas les données de navigation d'Edge.
- Activez la sauvegarde automatique (écran **Dossier**) dès la première utilisation.
- La version portable et la version installée ont **des données séparées**. Pour passer de l'une à l'autre, utilisez **Dossier → Télécharger une sauvegarde**, puis **Restaurer une sauvegarde**.

---

## Sauvegarder, restaurer, changer d'ordinateur

| Besoin | Procédure |
|---|---|
| Copie ponctuelle | **Dossier → Télécharger une sauvegarde** : un fichier `.json` arrive dans Téléchargements. |
| Protection continue | **Dossier → Sauvegarde automatique**, sur une clé USB ou un dossier synchronisé. |
| Nouvel ordinateur | Installez SmartCompta Exp, ouvrez **Dossier**, choisissez **Remplacer tout le dossier**, puis **Restaurer une sauvegarde** et sélectionnez le fichier `.json`. |
| Compléter un dossier | Choisissez **Ajouter ce qui manque** avant de restaurer : rien n'est effacé, rien n'est dupliqué. |

Les données de la version installée se trouvent dans `%LOCALAPPDATA%\SmartComptaExp\Profil`. Ne modifiez pas ce dossier à la main.

## Mettre à jour

Lancez simplement le nouveau `SmartCompta-Exp-Setup.exe`. Les données sont conservées. Par prudence, téléchargez une sauvegarde avant la mise à jour.

## Désinstaller

**Paramètres → Applications → SmartCompta Exp → Désinstaller**, ou **menu Démarrer → SmartCompta Exp → Désinstaller SmartCompta Exp**.
Le désinstallateur demande s'il faut supprimer les données comptables. La réponse par défaut est **Non** : les données sont conservées et retrouvées en cas de réinstallation.

## Dépannage

| Situation | Solution |
|---|---|
| Message « Microsoft Edge et Google Chrome sont introuvables » | Installez Microsoft Edge, puis relancez l'installateur. |
| L'application s'ouvre dans un onglet du navigateur au lieu d'une fenêtre | Edge n'a pas été trouvé à l'installation : réinstallez après avoir installé Edge. |
| « Sauvegarde automatique en pause » | Cliquez sur **La reprendre** (tableau de bord ou Dossier), puis sur **Autoriser**. |
| Clé USB de sauvegarde absente | La sauvegarde se met en pause. Rebranchez la clé et cliquez sur **Reprendre**, ou choisissez un autre fichier. |
| PDF scanné (image) non lu à l'import | Hors ligne, seuls les PDF contenant du texte sont lus. Demandez le document en Excel ou CSV, ou utilisez le modèle Excel du type d'import. |
| Assistant Claude absent | Il n'existe que dans la version en ligne, dans Claude. La version hors ligne n'utilise pas internet. |

## Composants intégrés

SheetJS 0.18.5 (Excel, licence Apache 2.0), PDF.js 3.11.174 (lecture des PDF, Apache 2.0), jsPDF 2.5.1 (bulletins PDF, MIT). Leurs licences sont dans `offline/vendor/`.
