# Guide d'installation de REA sous Windows

**Outil :** REA – Reverse Engineer Anything (paquet npm `rea-agents`, version 6.5.0, licence MIT)
**Public :** consultants et auditeurs de Smart Consulting / Smart Expertise
**Durée estimée :** 20 à 30 minutes (hors Ghidra)
**Sources officielles :** https://github.com/morluto/rea · https://rea.tools · https://www.npmjs.com/package/rea-agents

> **Avertissement.** Ne téléchargez REA que depuis les trois sources officielles ci-dessus. Un dépôt au nom
> proche ou une copie du README ne garantit pas l'authenticité du logiciel.

---

## 1. Prérequis

| Élément | Exigence | Vérification |
|---|---|---|
| Système | Windows 10 ou 11, 64 bits | Paramètres > Système > Informations |
| Droits | Compte pouvant installer des logiciels | — |
| Node.js | Version 22.19 ou plus, ou 24.11 ou plus (LTS recommandée) | `node -v` |
| Espace disque | Environ 500 Mo (2 Go avec Ghidra) | — |
| Agent IA (facultatif) | Claude Desktop, Claude Code, Cursor, etc. | — |
| Ghidra (facultatif) | Version 12.1.x et Java JDK 21, pour l'analyse des fichiers `.exe` et `.dll` | — |

---

## 2. Étape 1 : installer Node.js

1. Ouvrez https://nodejs.org et téléchargez la version **LTS** (fichier `.msi`).
2. Lancez l'installateur et acceptez les options par défaut.
   *Écran attendu : « Node.js Setup Wizard ». Cochez « Add to PATH » (cochée par défaut).*
3. Fermez puis rouvrez **PowerShell** (menu Démarrer > tapez « PowerShell »).
4. Vérifiez l'installation :

   ```powershell
   node -v
   npm -v
   ```

   *Résultat attendu : par exemple `v24.11.0` et `11.x.x`. Si la commande est inconnue, redémarrez le PC.*

---

## 3. Étape 2 : relier REA à votre agent IA

Dans PowerShell :

```powershell
npx rea-agents setup
```

Déroulement :

1. **Choix des agents** : une liste à cocher s'affiche (Claude Desktop, Claude Code, Cursor…).
   Utilisez les flèches et la barre d'espace pour cocher, puis appuyez sur Entrée.
2. **Hopper** : REA propose d'installer Hopper (logiciel d'analyse native). Sous Windows, répondez **Non**
   et utilisez Ghidra (étape 5).
3. **Récapitulatif** : REA affiche les fichiers qu'il va modifier. Une **sauvegarde** de votre configuration
   est créée automatiquement. Relisez puis validez.
4. **Redémarrez** votre agent IA (fermez complètement Claude Desktop, puis rouvrez-le).

Variante non interactive, pour Claude Desktop uniquement :

```powershell
npx rea-agents setup --client claude_desktop --yes
```

Valeurs possibles pour `--client` : `claude_code`, `claude_desktop`, `codex`, `cursor`, `gemini_cli`,
`windsurf`, `devin`, `opencode`, `antigravity`.

---

## 4. Étape 3 : installer la commande `rea` dans le terminal

```powershell
npm install --global rea-agents
rea --version
rea doctor
```

*Résultat attendu de `rea --version` : `6.5.0` ou plus récent.*

`rea doctor` affiche un bilan. Interprétation :

| Ligne | Signification | Action |
|---|---|---|
| `node: ok: true` | Node.js compatible | Aucune |
| `hopper / ghidra / ida: missing_analysis_engine` | Aucun moteur d'analyse native | Normal si vous n'analysez que du JavaScript. Sinon, voir l'étape 5 |
| `healthy: false` | Au moins un composant facultatif manque | Pas bloquant pour l'analyse JavaScript |

---

## 5. Étape 4 (facultative) : Ghidra pour l'analyse des exécutables Windows

1. Installez **Java JDK 21** (par exemple Eclipse Temurin : https://adoptium.net).
2. Téléchargez **Ghidra 12.1.x** sur https://github.com/NationalSecurityAgency/ghidra/releases.
3. Décompressez l'archive, par exemple dans `C:\Outils\ghidra_12.1`.
4. Déclarez la variable d'environnement (PowerShell) :

   ```powershell
   setx GHIDRA_INSTALL_DIR "C:\Outils\ghidra_12.1"
   ```

5. Fermez puis rouvrez PowerShell, et relancez `rea doctor` : la ligne `ghidra` doit passer à `ok: true`.

---

## 6. Étape 5 : premier test

**En ligne de commande**, sur une application Electron installée sur votre poste
(dossier `resources` contenant `app.asar`) :

```powershell
rea analyze-javascript-application "C:\Chemin\vers\application\resources\app.asar" --json > resultat.json
```

**Depuis l'agent IA** (Claude Desktop), formulez par exemple :

> Avec REA, analyse l'application située dans `C:\...\app.asar` : explique son architecture,
> les données qu'elle stocke localement et les serveurs qu'elle contacte. Montre les preuves.

---

## 7. Maintenance

| Opération | Commande |
|---|---|
| Mettre à jour REA | `rea update` |
| Rafraîchir l'intégration agent | Relancer `npx rea-agents setup` |
| Diagnostic | `rea doctor` |
| Aide | `rea --help` |
| Désinstaller la commande | `npm uninstall --global rea-agents` |

---

## 8. Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| `node` n'est pas reconnu | PATH non actualisé | Rouvrir PowerShell ou redémarrer le PC |
| `npx` bloqué par la stratégie d'exécution | Politique PowerShell restrictive | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Erreur `EACCES` ou `EPERM` | Droits insuffisants | Ouvrir PowerShell en administrateur |
| REA n'apparaît pas dans Claude Desktop | Agent non redémarré | Quitter Claude Desktop depuis la zone de notification, puis rouvrir |
| `Unsupported agent integration` | Mauvaise valeur `--client` | Utiliser les valeurs du §3 (avec tiret bas, par ex. `claude_desktop`) |
| Antivirus qui bloque des fichiers analysés | Échantillons suspects | Travailler dans une machine virtuelle dédiée |

---

## 9. Cadre juridique et déontologique (Niger)

Avant toute analyse :

1. **Autorisation écrite** du propriétaire du logiciel ou du système (lettre de mission ou avenant précisant
   le périmètre de l'audit).
2. **Vérification de la licence** du logiciel analysé : de nombreux contrats interdisent la rétro-ingénierie.
3. **Loi n° 2019-33 du 3 juillet 2019 portant répression de la cybercriminalité au Niger** : l'accès ou le
   maintien frauduleux dans un système informatique et l'atteinte aux données sont sanctionnés.
4. **Protection des données personnelles** (loi n° 2017-28 du 3 mai 2017, modifiée) : les données de paie
   ou de clients rencontrées pendant l'analyse doivent rester confidentielles.
5. **Exclusions fixées par REA lui-même** (`DISCLAIMER.md`) : pas de contournement de DRM ou de licence,
   pas de contournement d'authentification, pas de copie de logiciel propriétaire.

**Usages légitimes pour le cabinet :** audit de sécurité mandaté d'un logiciel de paie ou de comptabilité,
analyse d'une pièce jointe suspecte (fausse facture), contrôle interne sur les flux de données d'une
application métier, supports de formation en cybersécurité financière.

### Modèle de clause d'autorisation (à insérer dans la lettre de mission)

> Le Client autorise expressément Smart Consulting à procéder, dans le cadre de la présente mission, à
> l'analyse technique (y compris par rétro-ingénierie statique) du logiciel [NOM / VERSION], installé sur
> [POSTE / SERVEUR], aux seules fins de [OBJET : évaluation de la sécurité / du contrôle interne]. Le Client
> déclare disposer des droits nécessaires pour accorder cette autorisation au regard de la licence du
> logiciel. Les résultats sont confidentiels et ne seront communiqués qu'au Client.
>
> Fait à ………, le ………  Signature du Client : ………
