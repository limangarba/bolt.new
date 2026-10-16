# Rapport d'analyse REA : projet `bolt.new`

**Date :** 16/10/2026
**Outil :** REA 6.5.0, commande `rea analyze-javascript-application` (analyse statique)
**Cible :** dépôt `limangarba/bolt.new`, branche `ccr-d5a6229b-vfffa2` (projet appartenant au demandeur)
**Identifiant de preuve REA :** `ev_77f32c8cfc63a54c4fdbf844769f6228069abe9e454d49c2ab1a22ed69b9e087`
**Empreinte SHA-256 de l'artefact :** `20bfa86a62cb4c54533e9960ee1c157202a956f2a5d6509a2c3594186faa95b5`

---

## 1. Méthode

REA a lu le code comme du texte inerte : aucun code n'a été exécuté. Il a reconstruit le graphe des modules,
des imports, des points d'accès réseau et des stockages locaux. Le résultat brut (environ 30 Mo de JSON) n'est
pas versionné ; il se régénère avec :

```bash
rea analyze-javascript-application /chemin/vers/bolt.new --json > rea-bolt.json
```

## 2. Chiffres clés

| Indicateur | Valeur |
|---|---|
| Fichiers pertinents | 99 |
| Fichiers JavaScript/TypeScript analysés | 97 |
| Échec d'analyse syntaxique | 1 (`tsconfig.json`, format JSON avec commentaires) |
| Nœuds d'arborescence syntaxique visités | 28 537 |
| Nœuds du graphe d'application | 969 (863 modules, 97 fichiers sources) |
| Relations | 1 110 (764 imports, 198 inclusions, 144 exports) |
| Dépendances externes distinctes | 71 |
| Composants Electron (fenêtres, IPC, preload) | 0 : ce n'est pas une application Electron |

## 3. Architecture reconstruite

- **Cadre applicatif :** Remix (`@remix-run/react`, `@remix-run/cloudflare`), déployé sur Cloudflare (`wrangler`).
- **Interface :** React (32 imports), animations `framer-motion`, composants Radix UI, styles UnoCSS.
- **État applicatif :** `nanostores` (23 imports cumulés).
- **Éditeur de code intégré :** CodeMirror (langages Python, C++, JSON, Sass…), coloration `shiki`.
- **Exécution dans le navigateur :** `@webcontainer/api` et terminal `@xterm/xterm`.
- **IA :** bibliothèque `ai` (Vercel AI SDK) ; clé `ANTHROPIC_API_KEY` lue côté serveur
  (`app/lib/.server/llm/api-key.ts`).

## 4. Flux de données relevés

| Type | Élément | Localisation |
|---|---|---|
| Point d'accès réseau | `/api/enhancer` | appel `fetch` dans `app/lib/hooks/usePromptEnhancer.ts` |
| Stockage local | IndexedDB `boltHistory` (historique des conversations) | `app/lib/persistence/db.ts` |
| Stockage local | `localStorage` (thème `bolt_theme`) | `app/lib/stores/theme.ts`, `app/root.tsx` |

**Contrôle manuel :** les routes serveur sont `app/routes/api.chat.ts` et `app/routes/api.enhancer.ts`.
REA n'a relevé que `/api/enhancer` (appel direct à `fetch` dans `app/lib/hooks/usePromptEnhancer.ts`).
L'URL `/api/chat` est bien écrite en clair, mais comme option `api` du hook `useChat`
(`app/components/chat/Chat.client.tsx:79`) : REA ne la reconnaît pas comme un appel réseau. Cela illustre la règle rappelée par REA :
*l'absence d'un fait dans le graphe ne prouve pas son absence dans le code.*

## 5. Observations de sécurité et de contrôle interne

1. **Clé d'API protégée côté serveur :** la clé Anthropic n'est lue que dans `.server/`, jamais dans le code
   du navigateur. Point conforme.
2. **Historique stocké en clair dans le navigateur (IndexedDB) :** toute personne ayant accès au poste peut
   lire les conversations. À signaler aux utilisateurs si des données sensibles (paie, fiscalité) y sont saisies.
3. **Pas d'authentification visible** devant `/api/chat` et `/api/enhancer` : en cas de déploiement public,
   n'importe qui peut consommer le crédit d'API. Recommandation : ajouter un contrôle d'accès ou une limite
   de débit (Cloudflare Access ou rate limiting).

## 6. Limites déclarées par REA

- Analyse statique uniquement ; le code n'a pas été exécuté.
- Les liaisons CommonJS/ESM ne sont résolues qu'à l'intérieur du projet.
- La couverture du graphe est partielle ; les faits manquants restent « inconnus » et non « absents ».
- Les chemins dynamiques ou obscurcis peuvent rester non résolus.

## 7. Suivi des corrections (16/10/2026)

| Point | Correction | Fichiers |
|---|---|---|
| API sans contrôle d'accès | Authentification HTTP Basic obligatoire (`BOLT_ACCESS_PASSWORD`, `BOLT_ACCESS_USER`) sur les API et les pages ; refus (503) tant qu'aucun mot de passe n'est configuré, hors développement local | `app/lib/.server/security.ts`, `app/lib/.server/api-guard.ts`, `functions/[[path]].ts`, routes `api.*` |
| Consommation abusive du crédit d'API | Limite de requêtes par adresse IP (20/min par défaut, réglable avec `BOLT_RATE_LIMIT` et `BOLT_RATE_WINDOW_SECONDS`), réponse 429 | mêmes fichiers |
| Historique en clair dans le navigateur | Atténuation : bouton « Delete all chats », durée de conservation `VITE_HISTORY_RETENTION_DAYS`, désactivation possible avec `VITE_DISABLE_PERSISTENCE` | `app/lib/persistence/*`, `app/components/sidebar/Menu.client.tsx` |

Le stockage local n'est pas chiffré : sans phrase secrète saisie par l'utilisateur, la clé de chiffrement
resterait dans le même navigateur et n'apporterait pas de protection réelle.
