# Skills issus d'ECC

Source : https://github.com/affaan-m/ECC (commit `d2ef268`, licence MIT — voir `ECC-LICENSE`).

Seuls les skills utiles à ce dépôt (Remix + Vite + React + TypeScript, Vitest, API Anthropic) ont été copiés.
Aucun hook, agent, script ni serveur MCP d'ECC n'a été importé.

| Skill | Usage |
|---|---|
| typescript-patterns | Typage strict, unions discriminées, génériques |
| react-patterns | Hooks, Suspense, error boundaries, composition |
| react-performance | Rendus inutiles, taille du bundle, waterfalls |
| react-testing | Testing Library + Vitest, MSW |
| vite-patterns | `vite.config.ts`, variables d'env, build |
| error-handling | Erreurs typées, retries, messages utilisateur |
| api-design | Conception des routes API |
| prompt-caching-strategy | Cache de prompts pour réduire le coût des appels LLM |
| tdd-workflow | Tests d'abord (adapté : `pnpm test`, sans le script ECC) |
| verification-loop | Build, types, lint, tests, diff avant une PR |
| accessibility | WCAG 2.2 AA |
| git-workflow | Branches, commits, rebase/merge |

Modification locale : l'étape 0 de `tdd-workflow` appelait un script ECC absent ici ; elle a été remplacée par les commandes pnpm du projet.
