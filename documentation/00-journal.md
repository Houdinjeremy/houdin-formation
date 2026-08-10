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

### Phase 3 — mouvement (2026-08-08)

Trois courbes et quatre durées posées en variables CSS (`--ease-out`,
`--ease-out-back`, `--ease-in-out` ; `--dur-fast/base/slow/reveal`). Toutes les
transitions du site sont recâblées dessus : plus une seule valeur en dur, plus
une seule courbe `linear`.

- **Entrée du héros** : cascade au chargement (accroche → titre → texte → CTA →
  plaque → lignes de plaque → puces), dernier élément posé à 1,06 s.
- **Plaque constructeur** : au survol, les lignes non pointées s'estompent et la
  ligne visée avance de 4 px, son repère passe à l'orange.
- **Reveals au défilement** : 560 ms sur `--ease-out`, décalage porté à 60 ms,
  et quatre variantes directionnelles (`data-reveal="left|right|scale|fade"`).
- **Barre de progression de lecture** : injectée par le script (pas dans les cinq
  pages), `scaleX` seul, masquée quand l'overlay mobile est ouvert, absente si la
  page est trop courte pour que la progression ait un sens.
- **Compteurs** : le bandeau de chiffres décompte à l'entrée dans le viewport,
  sortie cubique, 800 ms. Seules les valeurs numériques sont animées — « FR »
  reste « FR », le suffixe (`%`) est conservé.
- **Transitions de page** : View Transitions API en amélioration progressive, le
  header exclu du fondu pour ne pas clignoter d'une page à l'autre.

Le reset global `prefers-reduced-motion` ne couvrait pas les `animation-delay` :
un bloc dédié annule explicitement cascade, compteurs et barre de progression.

> ⚠️ **Les chiffres du bandeau ne sont pas arbitrés.** Le compteur anime « 25 ans
> d'expérience », chiffre contredit par LinkedIn (20 ans industrie + 8 ans
> formation). Animer un nombre, c'est y attirer l'œil : à trancher avant mise en
> ligne. Voir `04-questions-client.md`.

### Correctif au passage — chevauchement mobile

Sous 880 px, le texte du héros remontait **sous la pilule de navigation**. Le
header passe en `position:fixed` à ce palier, donc hors du flux, mais la remontée
`margin-top:-82px` du héros — qui n'a plus rien à compenser — restait appliquée :
la règle `.hero{ margin-top:-82px }` est déclarée plus bas dans la feuille que la
media query censée l'annuler, et une media query n'ajoute aucune spécificité.
Corrigé en préfixant le sélecteur par `body` (0,1,1 contre 0,1,0). Bug antérieur
à la Phase 3, présent sur les cinq pages.

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

**6. Une media query n'ajoute aucune spécificité.** Annuler une règle de base
depuis un `@media` ne marche que si le `@media` est déclaré **après** elle dans la
feuille. Sinon il faut monter en spécificité (`body .hero`) — jamais `!important`.

**7. Le rendu headless de Chrome fige l'horloge des animations.**
`--virtual-time-budget` n'avance ni les `requestAnimationFrame` ni les animations
CSS : toutes les captures reviennent au même instant, quel que soit le budget.
Pour vérifier un **état final**, capturer avec `--force-prefers-reduced-motion`.
Et `--window-size` ne change pas la largeur de mise en page — pour un vrai 390 px,
passer par l'enveloppe iframe décrite plus bas.

---

## Reste à faire

**Phase 3 — faite**, sauf l'arbitrage des chiffres du bandeau (voir ci-dessus).

**Depuis l'audit** : barre de recommandations collante sur `formations.html`, échelle
verticale fluide, arbitrage Anton vs Inter sur les h3.

**Bloqué sur le client** : voir `04-questions-client.md`.

---

## Reprise après redémarrage

Le serveur local ne survit pas à une extinction. Pour repartir :

```
cd ~/Documents/ClaudeCode/JeremyHoudin
python3 -m http.server 8099        # puis http://localhost:8099/
```

État au 2026-08-08 : dépôt git propre, trois commits, phases 1 à 3 livrées.
Le prochain sujet dépend des réponses du client (`05-message-client.md`).

---

## Méthode de vérification

`resize_window` ne change pas le viewport dans cet environnement. Pour tester le mobile :
servir une page enveloppe sur un **second port** contenant
`<iframe src="http://localhost:8099/index.html" style="width:390px;height:844px;border:0">`,
et piloter depuis la page extérieure. Après toute modification CSS, **rechargement dur
obligatoire** (`cmd+shift+r`) : le serveur python n'envoie aucun en-tête de cache.

---

## Mise en ligne — état au 2026-08-09

**Hébergement : Vercel**, projet `houdin-formation-demo`, espace `houdin-formation`
(compte `jeremy-7120`, actuellement en **essai Pro** — noter l'échéance : à la fin
de l'essai, la protection par mot de passe disparaît et l'usage commercial n'est
plus couvert par le plan gratuit).

Adresse de secours, à ne jamais rediriger : `houdin-formation-demo.vercel.app`.

### DNS — les quatre domaines sont chez IONOS, en enregistrements A

`houdin-formation.fr` (principal), `.com`, `.store`, `.info` — chacun avec `@` et
`www` vers **76.76.21.21**.

**Les serveurs de noms restent chez IONOS, et doivent y rester.** Vercel propose
régulièrement de les reprendre (bandeau orange « Update the nameservers »,
pastilles « DNS Change Recommended ») : il faut refuser. Les quatre domaines
portent des enregistrements `MX` vers `mx00/mx01.ionos.fr`, plus SPF, DKIM et
DMARC. Une bascule des serveurs de noms couperait la messagerie du client, sans
message d'erreur.

### Deux pièges rencontrés, pour ne pas les redécouvrir

**L'enregistrement `AAAA`.** Chaque zone IONOS en contenait un vers le parking
IPv6. Changer le `A` sans le supprimer laisse tous les visiteurs en IPv6 — la
majorité des connexions fibre — sur la page IONOS. En pratique le problème se
règle seul : modifier le `A` déclenche un écran « Arrêt du service en cours » qui
désactive d'office les trois enregistrements « Default Site » (`A`, `AAAA`,
`TXT _dep_ws_mutex`). Les enregistrements « Mail » ne sont pas touchés.

**Le nom d'hôte n'est pas modifiable.** Pour ajouter `www`, il faut passer par
« Ajouter un enregistrement » ; le crayon d'une ligne existante ne permet que de
changer la valeur.

### Vérification — deux faux négatifs à connaître

1. **Le cache DNS de macOS** sert longtemps l'ancienne IP IONOS : `curl` tombe
   alors sur un `404 nginx` qui ressemble à une panne. Tester avec
   `curl --resolve <nom>:443:76.76.21.21`, ou depuis un téléphone en 4G.
   Purger : `sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder`.
2. **La protection anti-robot de Vercel** se déclenche sur des sondes répétées et
   renvoie un `403` avec l'en-tête `x-vercel-mitigated: challenge` et un corps
   « Vercel Security Checkpoint ». Ce n'est ni le mot de passe ni un défaut de
   configuration. Espacer les tests et utiliser un `User-Agent` de navigateur.

### Reste à faire

**Les sept redirections vers `houdin-formation.fr`**, dans le projet →
Settings → Domains → Edit sur chaque ligne → *Redirect to* → 308 Permanent.
Aujourd'hui les six domaines servent le même site en parallèle : c'est du contenu
dupliqué. Sans conséquence tant que le `noindex` est actif, bloquant le jour de
la mise en ligne.

**Protection par mot de passe** : Settings → Deployment Protection. Disponible
pendant l'essai Pro.

**Ne pas diffuser l'adresse** au-delà du client : sept mentions légales encore
marquées « à compléter », « 25 ans d'expérience » et « France métropolitaine »
non tranchés, et les catégories CACES corrigées mais dont personne n'a confirmé
lesquelles sont réellement couvertes.

## Schémas techniques animés — 2026-08-09

Deux commits : `3ba0fd7` (bac à sable + correctifs rapides) et `722f618`
(schémas + refonte de la page formations). **Local, non poussé** — `origin/main`
est en retard de 2 commits, et pousser déclenche la mise en ligne.

### Le dossier `design/`

Copie de travail complète du site (`*.html`, `css/`, `js/`, `assets/`) où toutes
les modifications sont faites avant d'être reportées à la racine. L'isolement est
structurel : `scripts/build-demo.sh` ne copie que `css/`, `js/`, `assets/` et
`*.html` **de la racine** — il ne voit jamais `design/`.

`design/demo-schemas.html` est la page d'atelier qui montre les dix mécanismes
d'affilée. Elle reste **volontairement hors de la racine** : le script de
publication copie tous les `*.html`, elle partirait donc en ligne alors qu'aucune
navigation n'y mène.

### `js/schemas.js` — dix mécanismes calculés

Un `<svg data-schema="pemp-ciseaux">` vide suffit : le module génère le décor,
les cotes, le mécanisme et la trajectoire. Échelle commune `ECHELLE = 46 px/m`,
sol à `y = 280`, donc les cotes réglementaires (1,20 m / 2,50 m) sont à leur
place réelle.

Les mécanismes sont **calculés, pas dessinés** — c'est ce qui garantit qu'un
professionnel n'y verra rien de faux :

- **ciseaux** : barres à longueur fixe, donc `W = √(L² − h²)`. Le resserrement en
  montant est la signature visuelle d'un ciseaux, et c'est ce qu'un rendu
  approximatif rate ;
- **PEMP à bras** : cinématique directe à deux segments, panier redessiné
  horizontal à chaque image (le plancher est asservi sur une vraie machine) ;
- **mât rétractable** : translation en phase 1, levée en phase 2 — la trajectoire
  dessine un L, ce qui rend la catégorie 5 évidente ;
- **pelles R482** : même cycle, même échelle, **même silhouette de 1,75 m** dans
  les deux cartes. Seul le gabarit change, et c'est le propos : sous 4,5 t
  l'engin bascule en catégorie A quelle que soit sa fonction ;
- **zones BT** : entre la DLI (50 m) et la DLVR (0,30 m) le rapport est de 1 à
  166. Le schéma porte une **rupture d'échelle explicite** plutôt que de fausser
  les distances en silence ;
- **symbolique BT** : chaque caractère est posé **sur sa colonne** et non en
  chaîne centrée — « B0 » n'en a que deux, le troisième repère reste vide.

Coût total : **8,4 Ko compressés**, aucune dépendance, aucune requête réseau.
`?t=0.62` fige les mécanismes à un instant donné (captures, relecture).
`prefers-reduced-motion` figé en position déployée.

### Page formations — ce qui a changé

Les quatre `value-card` blancs par recommandation → une `.reco-plate` à chanfrein
portant une `.reco-specs` (matrice `dl` en mono). Index collant `.reco-index` en
haut. **Un seul** bouton plein sur la page (R489, la plus demandée) au lieu de
cinq identiques. Classes `section-grid` et `reco-detail` supprimées : aucune
règle CSS ne les ciblait depuis l'origine.

### Pièges rencontrés — à ne pas réintroduire

1. **`.schema-strip` avait besoin d'un `color:#fff` explicite.** Sans lui, les
   `<h3>` des cartes héritaient de l'encre sombre de la section claire et
   disparaissaient sur le navy. Même famille que les oublis de `.on-dark` déjà
   documentés : *tout bloc sombre posé dans une section claire doit redéclarer sa
   couleur de texte*.
2. **`gap` sur une grille `dl` brise le filet pointillé.** Chaque cellule porte
   son propre `border-top` ; avec une gouttière, le trait se coupe au milieu. La
   respiration doit passer par le `padding` du `<dt>`.
3. **`scroll-margin-top` doit suivre l'index collant** : passé de 110 à 158 px,
   sinon les ancres `#r482`… atterrissent sous la barre.
4. **Capture headless et `data-reveal`** : avec une ancre (`#bt`) ou une fenêtre
   trop courte, l'`IntersectionObserver` ne déclenche pas et la capture revient
   vide (~5 Ko). Capturer sans ancre, fenêtre assez haute pour que tout soit dans
   le viewport — ou neutraliser `data-reveal` dans une page de test.
5. **`timeout` n'existe pas sur ce macOS** (exit 127) ; et Chrome headless ne rend
   pas la main après l'écriture du fichier — le lancer en arrière-plan puis
   scruter l'existence du PNG.

### Documents produits

- `documentation/Houdin-Formation-Correctifs-Design-2026-08-09.pdf` — les six
  correctifs rapides, avec la liste des informations légales à obtenir.
- Artifact interactif (dix mécanismes animés) :
  https://claude.ai/code/artifact/30b98288-d5c8-4dd0-99ac-3c8aa1031e0f

### Reste à faire

- **Ne pas pousser** avant d'avoir tranché : les cinq mentions légales
  obligatoires manquent toujours (SIRET, adresse complète, TVA, n° de déclaration
  d'activité, référent handicap à confirmer).
- Le tableau de catégories fourni par le client était en **nomenclature R389,
  abrogée depuis le 1ᵉʳ janvier 2020** — rien n'en a été repris ; le site publie
  bien du R489. À signaler au client, c'est son propre domaine d'expertise.
- Modèles 3D Meshy : en attente des exports GLB. Le « residential electrical
  panel » est écarté (mauvais registre, et CC BY d'un tiers).
- Vidéos LinkedIn : demander les fichiers originaux au client plutôt que de
  tenter une récupération (LinkedIn renvoie un HTTP 999 à tout accès automatisé).

## Visionneuse 3D remise en scène — 2026-08-09 (fin de journée)

Travail **dans `design/` uniquement** — la racine et la production n'ont pas bougé
depuis le commit `4084ef8`, qui est en ligne sur GitHub mais **pas déployé sur
Vercel** (le déploiement a été bloqué côté permissions, voir plus bas).

### Ce qui a été fait

Le modèle Sketchfab est **conservé** ; seule sa mise en scène change. L'erreur de
départ a été de le supprimer purement et simplement — corrigé, avec restauration
du crédit d'auteur et des deux mentions légales qui en dépendent.

- **`js/viewer3d.js`** (nouveau) — visionneuse à onglets. Trois sources possibles
  par engin, dans l'ordre : `sketchfab` (identifiant de modèle), `src` (fichier
  `.glb` dans `assets/models/`, rendu par `<model-viewer>` auto-hébergé), ou rien
  → le schéma technique de la machine tient la place et la légende annonce
  « modèle 3D à venir ». Jamais un trou, jamais un message d'erreur.
- **Mise en scène `.stage3d`** — plus de cadre à bordure. L'engin flotte sur le
  navy, tenu par une lumière rasante (`.stage3d-glow`) et une ombre au sol
  (`.stage3d-floor`). C'est `transparent=1` sur l'URL Sketchfab qui rend l'effet
  possible : sans lui l'iframe peint son fond et redevient une vignette.
- **`js/schemas.js`** — expose désormais `window.HFSchemas.rafraichir()`. `vues`
  est passé au niveau du module et la boucle rAF ne démarre qu'une fois : un
  schéma injecté après coup rejoint le rendu au lieu d'ouvrir une 2ᵉ boucle. Un
  schéma retiré du DOM sort du rendu (test `isConnected`).
- **`js/main.js`** — 87 lignes de chargement Sketchfab retirées, remplacées par
  le module dédié.
- **`assets/vendor/model-viewer.min.js`** (933 Ko, 250 Ko gzip) — vendoré, pas
  de gestionnaire de paquets sur ce projet. **Il n'est téléchargé par le
  navigateur que si un `src` .glb est effectivement renseigné** ; aujourd'hui
  aucun ne l'est, la page ne charge donc rien de plus qu'avant.

### Modèles Sketchfab retenus — tous vérifiés en CC BY

| Onglet | Modèle | Auteur | UID |
|---|---|---|---|
| R489 | Forklift (animé : fourches, roues) | Ethian74 | `d40cae50e04145dd997cdca415cd72ad` |
| R486 | Boom Lift (Articulating) | doty_aecom | `aa7ce85ae7194eb2921005ac74a58a78` |
| R482 | Loader 2025 (celui d'origine) | Extreme 3ds Model | `0413fc9664f74a0b8bb2922c94524bb0` |

CC BY = usage commercial permis **mais attribution obligatoire** : le crédit
s'affiche sous la scène et change avec l'onglet. Ne pas le retirer.

**R485 sans modèle, volontairement.** Les résultats de recherche renvoyaient soit
des transpalettes sans mât — qui relèvent de la R489 catégorie 1A et non de la
R485 —, soit des machines sans rapport (*stacker crane*, *reach stacker*
portuaire, *stacker reclaimer*). Un candidat était en **CC BY-NC**, disqualifiant
sur un site commercial. Le schéma technique vaut mieux qu'une machine de la
mauvaise catégorie sur le site d'un formateur-testeur. C'est le meilleur candidat
pour un modèle Meshy : un gerbeur à timon est une géométrie simple.

### Pièges rencontrés

1. **`autostart=1` est indispensable en iframe Sketchfab simple.** Sans lui le
   lecteur reste sur son écran de lancement et la scène paraît vide. L'ancienne
   implémentation démarrait par l'API JS (`api.start()`), d'où l'oubli facile.
2. **`scrollwheel=0`** pour que la molette continue de faire défiler la page au
   lieu d'être capturée par le viewer.
3. **Le WebGL Sketchfab ne se vérifie pas en capture headless** — trois
   tentatives revenues vides, y compris avec `--use-gl=swiftshader` et
   `--virtual-time-budget`. Le rendu 3D doit être contrôlé dans un vrai
   navigateur, point.
4. **`ui_watermark=0` n'est honoré que sur les comptes Sketchfab Pro** : le
   filigrane reste sur un compte gratuit, c'est leur licence.

### Reste à faire

- **Contrôler les trois onglets dans un vrai navigateur** : fond transparent,
  engin qui flotte, et surtout la géométrie du chariot R489 (mât, tablier,
  fourches, contrepoids) à l'œil d'un professionnel.
- **Trouver ou générer un gerbeur R485** à mât et timon.
- **Reporter `design/` vers la racine** une fois validé (voir la méthode plus
  haut : copier les fichiers modifiés, `demo-schemas.html` reste hors racine).
- **Déployer** : `git push` seul ne met PAS le site à jour — `dist/` est
  gitignoré alors que `vercel.json` déclare `outputDirectory: dist`. Il faut
  `bash scripts/build-demo.sh` puis `vercel deploy --prod`. Cette dernière
  commande a été refusée par le garde-fou de Claude Code : la lancer soi-même
  avec `! vercel deploy --prod --yes`, ou ajouter une règle de permission.
- Toujours **4 mentions légales obligatoires manquantes** (SIRET, adresse
  complète, TVA, n° de déclaration d'activité).

## 2026-08-10 — La transparence du lecteur 3D, tranchée par l'expérience

La question traînait depuis la refonte de la visionneuse : le modèle flotte-t-il
vraiment sur le navy, ou l'iframe peint-elle son propre fond ? Mes captures sans
interface ne pouvaient pas répondre — sans WebGL, le lecteur affiche un écran
d'erreur gris qui ressemble exactement à ce qu'on cherche à exclure.

**Le protocole qui a tranché.** Poser l'iframe seule sur un fond magenta vif,
dans une page de test, et regarder ce qui passe au travers. Le magenta n'existe
nulle part dans la charte : aucune confusion possible avec un fond du lecteur.

**Résultat, deux constats opposés.**

`transparent=1` fonctionne. Le magenta traverse de bord à bord. La mise en scène
sans cadre tient, et le cadre grisâtre aperçu sur les captures précédentes était
l'écran d'erreur WebGL du navigateur sans interface, rien d'autre.

`ui_infos=0` ne fonctionne pas, ni `ui_fullscreen=0`. Le bandeau titre + auteur
en haut à gauche, le bouton de partage en haut à droite et le bouton plein écran
en bas à droite restent affichés. Ces réglages sont réservés aux comptes
Sketchfab payants ; sur un compte gratuit, l'attribution est imposée. Aucun CSS
ne peut les masquer : l'iframe vient d'une autre origine, la page n'a aucune
prise sur son contenu.

**Ce qu'on en fait.** On compose avec. Les faire disparaître supposerait
d'auto-héberger les fichiers .glb et de passer par `<model-viewer>` — la licence
CC BY des trois premiers modèles le permettrait, mais pas celle du gerbeur R485
(Sketchfab Standard : redistribution du fichier interdite). On perdrait donc un
engin sur quatre pour gagner trois pastilles d'interface. Le compte n'y est pas.

La ligne de crédit sous la scène reste nécessaire malgré le bandeau : celui-ci
donne le titre et l'auteur, mais jamais la licence, que l'attribution CC BY exige.

**Le piège à retenir.** Un paramètre d'URL accepté sans erreur n'est pas un
paramètre appliqué. Sketchfab ignore silencieusement ceux qui dépassent le plan
tarifaire du compte — pas de message, pas d'avertissement dans la console. La
seule vérification qui vaille est visuelle, sur un fond qu'on ne peut pas
confondre.

## 2026-08-10 — Passe UI/UX : ce que mesurer change au diagnostic

Journée en cinq temps : modèle 3D du gerbeur R485, partage social et données
structurées, accessibilité, retrait des signatures génériques, refonte de la page
Formations. Tout est en ligne.

**Le fil conducteur : mesurer avant de juger.** Trois fois, la mesure a contredit
l'impression, dans les deux sens.

- J'ai cru voir un débordement horizontal en mobile sur une capture. Faux :
  `scrollWidth = 390` pour un viewport de 390. Chrome sans interface rend la page
  à environ 800 px puis recadre — l'image montre une mise en page desktop
  tronquée. La mesure se fait en chargeant la page dans un cadre à la bonne
  largeur, jamais à l'œil sur une capture.
- Le client a trouvé le bloc BT trop long. Vrai, et l'écart était de 40 % :
  899 / 882 / 922 / 918 px pour les quatre formations, 1293 pour la BT. Cause
  structurelle et non graphique : elle est la seule dont les cartes portent un
  paragraphe sous le schéma.
- J'ai voulu vérifier si l'iframe Sketchfab était bien transparente. Réponse par
  un fond magenta vif : le magenta traverse, `transparent=1` fonctionne. Mais le
  bandeau titre + auteur, le partage et le plein écran restent affichés malgré
  `ui_infos=0` : ces réglages sont réservés aux comptes payants. **Un paramètre
  d'URL accepté n'est pas un paramètre appliqué.**

**La cohérence graphique ne se perd pas dans la feuille de style, elle se perd
dans les `style=""`.** Soixante-huit attributs semés au fil des pages, dont un
même texte d'accompagnement écrit en 14, 14.5, 15.5, 16 et 16.5 px. Tant que la
taille d'un titre se décide dans le HTML, aucune règle ne tient. Six classes de
rôle les remplacent.

**Deux corrections de mes propres décisions**, notées parce qu'elles se
ressemblent : j'ai uniformisé les cinq boutons de formation en secondaire (juste
sur l'uniformité, faux sur le niveau — ils sont maintenant tous primaires), et
j'ai bien fait de garder les classes `.schema-*` que l'audit ponytail donnait
pour mortes : elles servent `design/demo-schemas.html`.

**Piège de la refonte Formations.** La transformation des sections par script
laissait un `</div>` manquant par section : la colonne de droite se faisait
absorber par celle de gauche et tout s'empilait, sans que le CSS soit en cause.
Contrôle d'équilibre des balises avant toute capture, désormais.

**Reste à faire.** Les 4 mentions légales obligatoires (SIRET, adresse, TVA,
numéro de déclaration d'activité) que seul le client peut fournir. Le `noindex`
et le `robots.txt` bloquant, qui tombent le jour de la vraie mise en ligne — ce
jour-là, penser à faire sortir `sitemap.xml` vers ce qui est déployé, car
`build-demo.sh` ne le copie pas. Et la photo de la page À propos, toujours
remplacée par le picto.

## 2026-08-10 (suite) — Ce que le déploiement faisait vraiment

Deuxième moitié de journée : pied de page, navigation, menu mobile, mentions
légales. Et une découverte qui invalide plusieurs certitudes des jours passés.

**Vercel publie la RACINE, pas `dist/`.** Vérifié en interrogeant le site lui-même :
`houdin-formation.fr/design/` et `/design02/` répondaient **200**. Malgré
`outputDirectory: dist` dans `vercel.json`, le déploiement est déclenché par le
push GitHub, et `dist/` étant gitignoré, il n'existe pas côté Vercel : le réglage
pointe vers un dossier absent et Vercel se rabat sur la racine.

Trois conséquences, toutes contraires à ce que je croyais et répétais :
- `build-demo.sh` n'a **jamais** protégé la production. Ni le `noindex`, ni le
  `robots.txt`, ni l'exclusion de `demo-schemas.html`. Il reste utile pour
  fabriquer une archive à envoyer, rien de plus.
- le seul blocage d'indexation réel est l'en-tête `X-Robots-Tag` de
  `vercel.json`. Il fonctionne, mais n'empêche pas l'accès direct par URL.
- `git push` suffit à déployer ; `vercel deploy --prod` faisait double emploi.

`design/`, `design02/` et `dist/` sont désormais dans `.vercelignore`, avec le
constat écrit en tête du fichier — rien dans la configuration ne le laisse deviner.

**Mentions légales complètes.** SIRET 824 790 240 00025, TVA FR 60 824 790 240,
NDA 32600427860, siège 11 rue du Belloy, 60240 Boubiers. Vérifiées avant
inscription plutôt que recopiées : la clé de Luhn du SIRET est valide, et la clé
de TVA française se déduit du SIREN — elle tombe juste. Une contradiction levée
au passage : le site annonçait Gisors (27140), dans l'Eure, quand la note du
client donne un code postal de l'Oise. Question posée avant correction.

**Trois pièges CSS, tous silencieux :**
- `padding` en raccourci sur un élément portant aussi `.wrap` écrase le
  `padding-inline` de celui-ci. Le pied de page collait au bord gauche sous
  1120 px — invisible au-dessus, où la marge vient du centrage. `padding-block`
  ne touche que le vertical.
- `scroll-snap-type` sur une barre défilante aligne le premier élément sur le
  bord du conteneur en auto-défilant, ce qui **annule exactement le padding**.
- un sélecteur d'enfant direct (`.mobile-nav > a`) cesse de s'appliquer dès
  qu'on enveloppe l'élément visé — le lien perd sa fonte sans erreur.

Et un piège de sélecteur de frères : `.sommaire + .reco-block` ne s'appliquait
pas parce que le rail s'intercalait entre les deux. En position fixe, sa place
dans le flux est indifférente à l'affichage mais rompt l'adjacence.

**Navigation refondue.** La barre collante « Aller à » est supprimée : 60 px de
hauteur permanents pour un usage unique. Remplacée par un sommaire en tête de
page (cinq colonnes, une icône par engin) et un rail en marge qui signale la
section lue sans coûter un pixel. Un panneau déroulant à la manière d'Apple
s'ouvre au survol de « Nos formations », avec un voile qui floute la page —
`backdrop-filter` sur un voile, et non `background:rgba()` sur le panneau : la
première traite ce qui est derrière, la seconde laisse voir au travers.

**Menu mobile** ancré en haut (il était centré, avec 200 px de vide de chaque
côté), catégories dépliables au chevron, et mise au point sur le choix en cours.

**Reste à faire.** Le `noindex` et l'en-tête `X-Robots-Tag` : plus rien ne s'y
oppose maintenant que les mentions légales sont complètes, c'est une décision du
client. `sitemap.xml` est déjà servi en ligne. Et `design02/`, la piste « langage
Apple », n'a que deux pages sur sept.
