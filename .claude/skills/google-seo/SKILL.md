---
name: google-seo
description: >-
  Checklist SEO fondée sur le SEO Starter Guide officiel de Google Search
  Central, appliquée au site houdin-formation.fr. À utiliser avant toute mise
  en ligne d'une page ou d'un changement de structure (nouvelle page, refonte
  de titres/meta, réorganisation d'URLs), ou quand on demande un « audit SEO
  Google », une « checklist avant publication », si le site est « prêt pour
  l'indexation ». Fait aussi office de garde-fou contre les pratiques que
  Google identifie explicitement comme inutiles ou nuisibles.
metadata:
  source: https://developers.google.com/search/docs/fundamentals/seo-starter-guide
  fetched: 2026-08-11
---

# google-seo — SEO Starter Guide appliqué à houdin-formation.fr

Ce skill traduit le guide officiel de Google Search Central en checklist
actionnable pour ce projet précis : site vitrine HTML/CSS/JS vanilla, hébergé
sur Vercel (déploiement automatique sur push vers `origin/main`, sans étape de
build), neuf pages à la racine. Avant de l'utiliser, relire
`documentation/00-journal.md` (état courant) et `documentation/03-seo-briefs.md`
(plan de contenu déjà arbitré) — ne pas reproposer ce qui y est déjà tranché.

Un principe gouverne tout le reste : **rien ne garantit un classement.** Ce
skill vérifie l'éligibilité et la qualité, jamais une promesse de position.

---

## 1. Le site est-il indexable ? (prérequis absolu)

Avant tout travail de contenu, vérifier qu'aucun obstacle technique n'empêche
Google d'indexer :

- **`robots.txt`** — vérifier qu'aucun `Disallow` ne bloque une page qu'on
  veut voir indexée. État de référence : `User-agent: *` / `Allow: /`.
- **En-tête `X-Robots-Tag`** — chercher dans `vercel.json` un en-tête
  `noindex` qui bloquerait silencieusement tout le site sans que
  `robots.txt` ne le montre. Piège déjà rencontré sur ce projet (voir
  journal, 2026-08-09 → 2026-08-10) : une démonstration protégée par
  `noindex` peut rester en place bien après la mise en ligne réelle.
- **`sitemap.xml`** — chaque page destinée à Google doit y figurer, avec une
  URL qui répond en 200 (pas de redirection, pas de 404). Une page créée
  mais pas ajoutée au sitemap n'est pas pour autant invisible (Google peut
  la trouver par lien), mais elle part avec un désavantage de découverte —
  c'est un signal, pas une obligation.
- **Recherche `site:houdin-formation.fr`** — le test le plus simple : si une
  page n'y apparaît pas après quelques semaines, chercher un obstacle
  technique avant de soupçonner un problème de contenu.
- **Search Console — Inspection d'URL** — pour voir la page exactement comme
  Google la voit (rendu après JavaScript compris). Utile en particulier pour
  les pages avec `data-reveal` / `IntersectionObserver` : vérifier que le
  contenu qui s'anime au défilement n'est pas absent du rendu si aucun CSS
  ni JS n'est bloqué (ce n'est pas le cas ici, tout est servi en HTTP normal,
  mais à recontrôler si le site change d'hébergeur ou de manière de servir
  les assets).

## 2. Organisation du site

- **URLs descriptives** — `formation-caces-ile-de-france.html` est un bon
  exemple (des mots utiles, pas un identifiant). Continuer sur ce modèle pour
  toute nouvelle page : le nom de fichier doit dire de quoi parle la page.
- **Pas de duplication de contenu** — le brief 1 le formule déjà bien : une
  page géographique parle d'*où* et *comment*, `formations.html` parle de
  *quoi*. Si une nouvelle page redit ce qu'une autre dit déjà, Google n'en
  retient qu'une — autant choisir laquelle plutôt que le laisser trancher.
  Vérifier via `<link rel="canonical">` que chaque page a un canonique
  cohérent (déjà en place sur les neuf pages).
- **Peu de pages ici (moins de dix)** — les recommandations sur le
  découpage en répertoires par volume ne s'appliquent pas à ce site ; ne pas
  sur-ingénierer une arborescence pour neuf fichiers à la racine.

## 3. Contenu : ce qui compte vraiment

C'est, de l'aveu même de Google, ce qui influence le plus le classement —
avant toute optimisation technique. Pour une nouvelle page ou un article :

- **Lisible et bien organisé** : paragraphes courts, titres `<h2>` qui
  structurent la lecture, pas de faute d'orthographe ni de coquille (rappel
  du piège « un iers » du 2026-08-10 : vérifier dans le fichier, jamais sur
  un rendu extrait).
- **Unique** : rédigé à partir de ce que Jérémy Houdin sait réellement du
  sujet, jamais recopié ou reformulé depuis un concurrent.
- **À jour** : si une page cite une réglementation ou une catégorie CACES®,
  vérifier qu'elle est toujours en vigueur (déjà un point de vigilance
  documenté : R389/R386 abrogées, remplacées par R489/R486).
- **Utile et fiable, pensé pour le lecteur** — pas pour l'algorithme. Un
  responsable QSE qui lit la page doit en ressortir avec une réponse, pas
  avec l'impression d'avoir lu un texte optimisé.
- **Anticiper le vocabulaire du lecteur**, pas seulement le sien : un
  QSE peut chercher « formation cariste » plutôt que « CACES R489 ». Pas
  besoin de lister toutes les variantes dans le texte — Google comprend les
  synonymes — mais vérifier que le champ lexical courant du secteur apparaît
  quelque part sur la page, naturellement.

## 4. Titres et extraits (ce qui s'affiche dans les résultats)

- **`<title>`** : unique par page, clair, qui décrit vraiment le contenu.
  Peut inclure le nom du site et un repère utile (ici : la ville, Gisors,
  ou la recommandation CACES® concernée). Convention déjà en place sur ce
  site : `Sujet de la page | Houdin Formation`.
- **Meta description** : 150–160 caractères visés (Google la tronque
  au-delà, sans clic perdu pour autant — c'est un extrait, pas une balise de
  classement). Vérifier qu'elle est unique par page et résume vraiment ce
  qu'on y trouve, pas un copier-coller de la meta de l'accueil.
- **Contrôle rapide sur tout le site** :
  ```bash
  for f in *.html; do
    echo "== $f =="
    grep -o '<title>[^<]*</title>' "$f"
    grep -o 'name="description" content="[^"]*"' "$f"
  done
  ```

## 5. Images

- `alt` descriptif sur chaque image porteuse de sens (déjà vérifié : aucune
  image sans `alt` sur les neuf pages au 2026-08-10 — recontrôler à chaque
  ajout).
- Image placée près du texte qui lui donne son contexte : Google associe les
  deux pour comprendre l'image.
- Les SVG purement décoratifs (icônes, motifs) doivent porter
  `aria-hidden="true"` — pas une exigence SEO au sens strict, mais Google
  traite le contenu comme un utilisateur de lecteur d'écran le perçoit, et
  un SVG décoratif annoncé comme porteur de sens brouille le signal.

## 6. Liens

- **Texte de lien descriptif** : jamais « cliquez ici », toujours ce que la
  page cible apporte. Exemple déjà en place :
  « Voir l'offre Île-de-France → » plutôt que « en savoir plus ».
- **Maillage interne** : chaque page importante doit être atteignable par un
  lien depuis au moins une autre page du site — c'est ainsi que Google (et
  un visiteur) la découvre. Vérifier qu'aucune page n'est orpheline :
  ```bash
  for f in *.html; do echo "$f"; done | while read p; do
    grep -rl "href=\"$p\"" *.html > /dev/null || echo "ORPHELINE : $p"
  done
  ```
- **Liens sortants** : si un lien pointe vers un site externe dont on ne
  garantit pas le contenu, ajouter `rel="nofollow"` ou `rel="noopener
  noreferrer"` selon le cas (le second est une exigence de sécurité, pas de
  SEO — les deux sont déjà utilisés séparément sur ce site, ne pas les
  confondre).

## 7. Ce que Google dit explicitement de ne PAS prioriser

Section volontairement à rebours des réflexes habituels — c'est le guide
officiel qui le dit, pas une opinion :

| Ne pas faire / ne pas craindre | Pourquoi |
|---|---|
| Balise meta keywords | Google Search ne l'utilise pas du tout |
| Bourrage de mots-clés | Contre les règles anti-spam de Google, en plus d'être une mauvaise expérience de lecture |
| Optimiser le nom de domaine ou l'URL pour des mots-clés | Effet quasi nul sur le classement, au-delà de l'affichage en fil d'Ariane |
| Viser une longueur de contenu minimale ou maximale | Aucune longueur magique ; ce qui compte est la variété naturelle du vocabulaire |
| S'angoisser du contenu dupliqué | Ce n'est pas une pénalité — juste une inefficacité que Google résout en général tout seul |
| Ordre strict des balises `<h2>`/`<h3>` | Sans effet sur le classement (mais respecter l'ordre reste utile pour les lecteurs d'écran) |
| Croire que l'E-E-A-T est un facteur de classement direct | **Ce n'en est pas un**, selon Google lui-même — c'est un cadre de qualité, pas un signal algorithmique isolé |

Utilité pratique pour ce projet : si une prochaine session propose de
« bourrer » les pages de variantes de « formation CACES » ou de retravailler
un `<h2>` uniquement pour un ordre sémantique parfait sans bénéfice de
lecture, ce n'est pas du temps SEO bien investi — le signaler.

## 8. Checklist avant mise en ligne (« bon déroulement »)

À dérouler avant de pousser vers `origin/main` (rappel : le push déploie
immédiatement, il n'y a pas d'étape de staging sur ce projet) :

1. `robots.txt` et l'absence de `X-Robots-Tag: noindex` dans `vercel.json`
   confirmés.
2. La nouvelle page est ajoutée à `sitemap.xml` avec une `<lastmod>` à jour
   — sauf si elle est délibérément tenue à l'écart le temps qu'une info
   manquante arrive (cas déjà pratiqué sur ce projet : voir la page
   Île-de-France avant l'écriture de la section Financement).
3. Titre et meta description uniques, cohérents avec le contenu réel de la
   page — pas un copier-coller d'une autre page.
4. Au moins un lien interne entrant vers la nouvelle page (pas de page
   orpheline).
5. Toutes les images portent un `alt` pertinent ; les SVG décoratifs sont en
   `aria-hidden`.
6. Aucune affirmation commerciale ou réglementaire non vérifiée (Qualiopi,
   catégories couvertes, chiffres) — cf. `documentation/04-questions-client.md`.
7. JSON-LD valide (`python3 -c "import json; json.loads(open('page.html')...)"`
   ou un validateur en ligne) si la page en porte un.
8. Après mise en ligne : soumettre l'URL à l'inspection Search Console pour
   accélérer la découverte plutôt que d'attendre le prochain passage naturel
   du robot.

Ce skill ne remplace pas un jugement éditorial — il élimine les erreurs
techniques et les pièges déjà rencontrés sur ce projet avant qu'ils ne
coûtent une visite d'indexation.
