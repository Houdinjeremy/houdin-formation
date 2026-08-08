# Audit de design — différenciation concurrentielle

Réalisé le 2026-08-07 par un agent dédié (`design-reviewer`). Méthode : lecture intégrale
du CSS et des 5 pages, site servi en local et parcouru en 1568 px et 390 px, audit de
contraste exécuté dans le DOM, concurrents consultés en direct.

---

## Ce que fait réellement la concurrence

| Site | Codes observés |
|---|---|
| **AFTRAL** | Navy `#1B2A5A` + magenta `#E4003A`, sans géométrique arrondi, fond bleu-gris froid, filet rouge sous chaque titre, blocs pleins centrés. Photo réelle mais générique (semi-remorque + chariot). |
| **Paris Formation Sécurité** | Cyan institutionnel pâle, Roboto, **tout centré**, paragraphes courant sur 1 400 px, séparateurs en vagues, mention Qualiopi en tête, un seul bouton « CONTACTEZ NOUS ». |
| **FormaLogistics** | Bleu `#0B5FD0` + jaune, **photo de stock exacte du cliché** : deux hommes en gilet fluo autour d'un chariot, contre-jour doré. Murs de texte truffés de liens bleus (SEO), badge « Mon Compte Formation ». |
| **FormaForce** | Tente la différence (violet + jaune) mais retombe sur : photo détourée en cercle, dégradé lavande, listes à puces cochées, 4 boutons empilés sans hiérarchie. |

**Constat structurant.** La base de recommandations UI interrogée pour « B2B industrial
safety training » propose d'elle-même la palette `#0F172A` + accent `#0369A1` — c'est mot
pour mot le look AFTRAL. **Le navy + orange chaud + fond papier de Houdin est donc déjà
hors-cliché.** Ça ne se rediscute pas, ça se consolide.

**Le point aveugle le plus coûteux :** les 4 concurrents affichent tous Qualiopi, le
financement OPCO/France Travail, une durée chiffrée et un programme téléchargeable.
Houdin n'a rien de tout ça.

---

## Recommandations, par impact décroissant

### 1. Le héros ne montrait rien du métier — et il était illisible
Carré navy contenant le logo, zéro information. Sur mobile, `order:-1` le faisait passer
**au-dessus du h1**. Le chapô mesurait 2,64:1.
→ **Fait** (Phase 2) : remplacé par la plaque constructeur, `order` corrigé, contrastes repris.

### 2. L'orange n'était jamais lisible sur lui-même
Huit règles en échec AA, dont le bouton principal (blanc sur orange = 3,00:1).
La cause n'était pas l'orange (`--spark-500` sur navy = 5,98:1) mais son association
systématique au blanc.
→ **Fait** : texte navy sur les aplats orange. C'est aussi le vrai code de la
signalisation industrielle — gain d'identité autant que de conformité.

### 3. Cinq cartes dans une grille de trois : un trou permanent
→ **Fait** : grille de 6 colonnes, 3 cartes en `span 2` puis 2 en `span 3`.

### 4. Aucune preuve : ni Qualiopi, ni OPCO, ni durée, ni programme
« 5 recommandations couvertes » et « FR » ne sont pas des preuves, ce sont des
reformulations du menu.
→ **Partiellement fait** : barre de conformité typographique (NF C18-510, CNAM,
intra-entreprise). Le reste **dépend de données que seul le client détient**.

### 5. Le reveal-on-scroll produisait des écrans entièrement vides
→ **Fait** : déclenchement immédiat, .35 s, titres non animés, filet de sécurité 2 s.

### 6. `formations.html` : cinq sections identiques, aucune navigation
Plus de 3 500 px sans repère, alors que les ancres existent déjà.
→ **À faire** : barre de recommandations collante, façon index d'onglets.

### 7. Anton en capitales partout
Anton est une display d'affiche ; à 17 px en capitales elle perd en lisibilité au moment
où le texte devient fonctionnel. Le `line-height:.98` faisait aussi se percuter les accents.
→ **Partiellement fait** : `line-height` corrigé (défaut objectif). Le passage des h3 en
Inter 800 reste **à arbitrer** — c'est le point le plus subjectif du rapport.

### 8. Rythme vertical uniforme : 96 px partout
`.section-tight` existe mais n'est utilisé nulle part.
→ **À faire** : échelle fluide `clamp()`.

### 9. Dette : styles inline de grille
→ **Fait** : purgés, avec la rustine `!important` qu'ils avaient imposée.

---

## Synthèse en 3 axes

**Axe 1 · Faire parler la machine, pas l'organisme.** Les concurrents vendent tous un
*centre* : photos de stagiaires, logos de certification, blocs centrés. L'atout de Houdin
est inverse — un homme, un matériel, un site client. Le langage visuel doit venir de
l'objet technique. Aucune photo à acheter, un territoire que personne n'occupe.

**Axe 2 · Rendre l'orange lisible pour le rendre crédible.** Un site qui ne respecte pas
l'accessibilité pendant qu'il vend de la conformité réglementaire, c'est une incohérence
perceptible par un acheteur QSE.

**Axe 3 · Donner de la matière à instruire.** Sans financement, durée ni programme
opposable, un responsable QSE ne peut pas défendre la dépense en interne.
