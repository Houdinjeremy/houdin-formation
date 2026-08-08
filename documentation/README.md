# Documentation — site Houdin Formation

Archive de travail au 2026-08-07.

| Fichier | Contenu |
|---|---|
| [`00-journal.md`](00-journal.md) | **À lire en premier.** Stack réel, direction artistique arrêtée, palette, travaux réalisés, pièges techniques du projet, reste à faire. |
| [`01-audit-design.md`](01-audit-design.md) | Audit de différenciation concurrentielle : ce que font AFTRAL, Paris Formation Sécurité, FormaLogistics, FormaForce, et les 9 recommandations classées par impact. |
| [`02-recherche-linkedin.md`](02-recherche-linkedin.md) | Relevé des deux profils du client. Contient la découverte d'une **activité entière absente du site** (batteries industrielles) et deux écarts factuels à trancher. |
| [`03-modele-uml.md`](03-modele-uml.md) | Diagramme de classes de l'architecture **cible** (Mermaid). Le site actuel n'a ni base de données ni backend. |
| [`04-questions-client.md`](04-questions-client.md) | **Liste des informations à obtenir de Jérémy Houdin.** Plusieurs chantiers sont bloqués dessus, dont deux à risque juridique. |
| [`transcription/conversation.md`](transcription/conversation.md) | Transcription lisible de la session (995 messages, captures et raisonnement interne omis). |
| `transcription/session-brute.jsonl.gz` | Transcription brute complète, compressée (7 Mo). |

## Rappels critiques

- **Le stack est vanilla**, pas Next.js/React. Toute recommandation supposant npm, shadcn,
  Framer Motion ou React Three Fiber est hors sujet sur ce projet.
- **Ne jamais poser d'`overflow` sur `<html>`** — voir le journal, deux bugs silencieux
  documentés.
- **Rien ne s'affiche sans donnée confirmée par le client** : ni Qualiopi, ni taux de
  réussite, ni logo client. Voir `04-questions-client.md`.

## Sauvegardes du code

- `sauvegarde-avant-refonte-20260807-1436/` — état juste avant la Phase 2
- `sauvegarde/` — version antérieure (dossier au nom comportant une espace finale)

Le projet **n'est pas sous git**. C'est la principale fragilité de l'organisation
actuelle : un `git init` est vivement recommandé avant la Phase 3.
