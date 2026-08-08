# Journal de projet — site Houdin Formation

**Client :** Jérémy Houdin — Houdin Jeremy E.I, formateur indépendant CACES® (R482, R485,
R486, R489) et habilitation électrique BT. Siège à Gisors, entreprise fondée en 2023.

**Stack réel :** HTML / CSS / JS **vanilla**. Aucun framework, aucun npm, aucun
`package.json`, aucune étape de build. Les fichiers sont servis tels quels.
⚠️ Plusieurs briefs ont été rédigés en supposant Next.js/React — c'est faux, et cette
hypothèse invalide toute recommandation qui en découle (shadcn/ui, Framer Motion, React
Three Fiber, `npm install`).

---

## Arborescence

```
JeremyHoudin/
├── index.html, formations.html, a-propos.html, blog.html, contact.html
├── css/style.css          — design system complet (variables en tête de fichier)
├── js/main.js             — nav, reveal, formulaire mailto, vitrine 3D
├── assets/img/            — logo, favicon
├── documentation/         — ce dossier
├── .claude/agents/        — agents spécialisés (design-reviewer, motion-3d-designer, resource-finder)
├── sauvegarde/            — ancienne version (nom avec espace finale)
└── sauvegarde-avant-refonte-20260807-1436/
```

---

## Direction artistique arrêtée

Validée par le graphiste le 2026-08-07, contre une référence Dribbble (hero de la fintech
**Nickel**) : **« sombre premium + objet technique »**.

- Fond de scène poussé au quasi-noir `--navy-990:#060E18`, une seule lumière rasante douce
- Barre de navigation flottante en pilule translucide
- Titre Anton surdimensionné, deux CTA côte à côte
- **L'objet héros est la plaque constructeur en CSS** — plaque rivetée d'identification
  machine listant les 5 recommandations et leurs catégories, reprenant la géométrie du
  logo (coin supérieur gauche chanfreiné)

**Écarté délibérément :** le rendu 3D en héros et la photo pleine largeur. L'audit a
établi que la photo de caristes en gilet fluo est le cliché exact du secteur, et qu'une
scène 3D ferait lire le site comme une SaaS plutôt que comme une expertise terrain.

### Palette

| Token | Valeur | Usage |
|---|---|---|
| `--navy-990` | `#060E18` | fond de scène (héros, vitrine) |
| `--navy-950` → `--navy-600` | `#0A1826` → `#2C577F` | échelle navy |
| `--spark-500` | `#EE7111` | accent, aplats |
| `--spark-700` | `#A2490B` | orange **en texte** sur fond clair |
| `--on-spark` | `#0A1826` | texte sur aplat orange — **jamais de blanc** |
| `--dark-body` | `#C4CDD6` | corps de texte sur navy |
| `--ink-faint` | `#616C77` | libellés secondaires (calé pour passer AA sur `--paper`) |
| `--paper` | `#F5F2EA` | fond clair |

Typo : **Anton** (titres capitales) · **Inter** (corps) · **IBM Plex Mono** (repères).

---

## Travaux réalisés le 2026-08-07

### Lot correctif (validé par le graphiste)
- **Contrastes** : audit dans le DOM, **0 échec AA** sur les 5 pages, en 1300 px et 390 px.
  Le bouton principal passe en navy sur orange (5,98:1 au lieu de 3,00:1) — c'est aussi le
  vrai code de la signalisation industrielle.
- `--ink-faint` corrigé (`#8A94A0` = 3,08:1 → `#616C77`) : à lui seul, 21 échecs sur
  `formations.html`.
- `h1` `line-height` .98 → 1.06 : les accents des capitales se percutaient entre les lignes.
- Reveal-on-scroll retimé (déclenchement immédiat, .35 s, titres non animés, filet 2 s).
- Dette des styles inline de grille purgée, avec la rustine `!important` qu'elle imposait.

### Phase 2 — fondations
Barre flottante en pilule avec rétraction au défilement, menu mobile en overlay plein
écran, héros quasi-noir avec plaque constructeur, barre de conformité typographique,
grille de cartes asymétrique en 6 colonnes.

### Vitrine 3D
Embed Sketchfab du modèle « Loader 2025 » (Extreme 3ds Model), chargé en différé à
l'approche du viewport, caméra pilotée au défilement (~145° de rotation), espace réservé
par `aspect-ratio`, repli statique, `prefers-reduced-motion` respecté, attribution affichée.

> **Licence** : ce modèle est en consultation seule (`isDownloadable: false`, aucune
> licence publique déclarée). Il n'est **pas** téléchargé — seul l'embed autorisé par
> l'auteur est utilisé. Pour s'affranchir de Sketchfab, il faudra un modèle CC BY hébergé
> en propre, ou l'achat d'une licence.

---

## Pièges techniques du projet — à ne pas réintroduire

**1. Ne jamais poser d'`overflow` sur `<html>`.** Les deux valeurs cassent quelque chose,
silencieusement :
- `overflow-x:hidden` fait de `<html>` un conteneur de défilement → neutralise tout
  `position:sticky` (le header n'a jamais collé pendant des mois).
- `overflow-x:clip` se propage au viewport → tue `scrollTo`/`scrollBy`, **tous les
  événements scroll et tous les IntersectionObserver**. Symptôme trompeur : `window.scrollY`
  renvoie une valeur défilée mais `scrollBy` est sans effet.

Forme correcte : `html{ max-width:100% }` + `body{ max-width:100%; overflow-x:clip }`.

**2. Toute section sombre doit porter la classe `.on-dark`.** Oubliée quatre fois
(`.hero`, `.showcase-3d`) → texte sombre sur fond sombre, boutons invisibles.

**3. Le verrou de défilement casse le sticky.** `body{overflow:hidden}` à l'ouverture de
l'overlay mobile faisait remonter le header hors de l'écran, emportant le burger : menu
plein écran sans moyen d'en sortir. D'où `position:fixed` sur le header sous 880 px.

**4. Jamais de `grid-template-columns` en style inline.** Aucune media query ne peut
l'annuler. `grep -n 'style="[^"]*grid-template' *.html` doit rester vide.

**5. `IntersectionObserver` doit être stocké dans une variable**, sinon il peut être
collecté avant de se déclencher.

---

## Reste à faire

**Phase 3 — animations** (non commencée) : micro-interactions, compteurs animés (bloqués
par les chiffres réels), barre de progression de lecture, transitions de page via View
Transitions API.

**Depuis l'audit** : barre de recommandations collante sur `formations.html`, échelle
verticale fluide, arbitrage Anton vs Inter sur les h3.

**Bloqué sur le client** : voir `04-questions-client.md`.

---

## Méthode de vérification

`resize_window` ne change pas le viewport dans cet environnement. Pour tester le mobile :
servir une page enveloppe sur un **second port** contenant
`<iframe src="http://localhost:8099/index.html" style="width:390px;height:844px;border:0">`,
et piloter depuis la page extérieure. Après toute modification CSS, **rechargement dur
obligatoire** (`cmd+shift+r`) : le serveur python n'envoie aucun en-tête de cache.
