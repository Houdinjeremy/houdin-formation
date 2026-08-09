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
