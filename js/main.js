(function(){
  "use strict";

  // Burger / mobile nav
  var burger = document.getElementById("burgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    /* L'overlay est opaque, mais la tabulation continuait derrière lui : après
       le dernier lien du menu, le focus repartait dans la page masquée, sur des
       éléments invisibles. On neutralise tout ce qui n'est pas le menu, en
       remontant de frère en frère jusqu'au body. `inert` retire d'un coup le
       focus, le pointeur et la restitution aux lecteurs d'écran. */
    var gelerFond = function(open){
      var noeud = mobileNav;
      while (noeud && noeud !== document.body) {
        var parent = noeud.parentNode;
        if (!parent) break;
        Array.prototype.forEach.call(parent.children, function(frere){
          if (frere === noeud) return;
          if (open) {
            // Ne jamais retirer un inert que l'on n'a pas posé soi-même.
            if (!frere.hasAttribute("inert")) {
              frere.setAttribute("inert", "");
              frere.setAttribute("data-inert-menu", "");
            }
          } else if (frere.hasAttribute("data-inert-menu")) {
            frere.removeAttribute("inert");
            frere.removeAttribute("data-inert-menu");
          }
        });
        noeud = parent;
      }
    };

    var setNav = function(open){
      mobileNav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      // Le libellé décrit l'action à venir, il doit donc suivre l'état.
      burger.setAttribute("aria-label", open ? "Fermer le menu" : "Ouvrir le menu");
      // L'overlay couvre l'écran : on gèle le défilement de la page dessous.
      document.body.style.overflow = open ? "hidden" : "";
      document.body.classList.toggle("nav-is-open", open);
      gelerFond(open);
    };
    burger.addEventListener("click", function(){
      setNav(!mobileNav.classList.contains("is-open"));
    });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setNav(false); });
    });
    /* Dépliage des catégories dans le menu mobile. Le chevron seul les ouvre :
       le lien « Nos formations » continue de mener à la page, sans quoi il
       faudrait choisir entre naviguer et déplier. */
    var chevron = mobileNav.querySelector(".mn-toggle");
    if (chevron) {
      chevron.addEventListener("click", function(){
        var ouvert = mobileNav.classList.toggle("reco-open");
        chevron.setAttribute("aria-expanded", ouvert ? "true" : "false");
        chevron.setAttribute("aria-label", ouvert ? "Masquer les catégories"
                                                  : "Afficher les catégories");
      });
      /* Le menu se rouvre toujours replié : on ne reprend pas une navigation
         dans l'état où on l'avait laissée trois pages plus tôt. */
      burger.addEventListener("click", function(){
        mobileNav.classList.remove("reco-open");
        chevron.setAttribute("aria-expanded", "false");
      });
    }

    // Échap ferme l'overlay, et le focus revient au bouton.
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && mobileNav.classList.contains("is-open")) {
        setNav(false);
        burger.focus();
      }
    });
  }

  // Sticky header shadow on scroll
  var header = document.getElementById("siteHeader");
  if (header) {
    var enAttente = false;
    var onScroll = function(){
      enAttente = false;
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    /* Même regroupement par frame que la barre de lecture et la parallaxe plus
       bas : le header est collant et flouté, un recalcul de style par événement
       de défilement se paie à chaque frame. */
    document.addEventListener("scroll", function(){
      if (!enAttente) { enAttente = true; requestAnimationFrame(onScroll); }
    }, { passive:true });
    onScroll();
  }

  // Reveal on scroll
  var revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach(function(el){
      // Ne pas écraser les --i posés dans le HTML : l'ancien "i % 8" numérotait
      // tous les éléments de la page, l'escalier de délais n'avait aucun rapport
      // avec l'ordre visuel des cartes.
      if (!el.style.getPropertyValue("--i")) el.style.setProperty("--i", 0);
      io.observe(el);
    });
    // Filet de sécurité : rien ne doit rester invisible passé 2 s.
    setTimeout(function(){
      document.querySelectorAll("[data-reveal]:not(.is-visible)")
              .forEach(function(el){ el.classList.add("is-visible"); });
    }, 2000);
  } else {
    revealEls.forEach(function(el){ el.classList.add("is-visible"); });
  }

  // ----- Phase 3 : mouvement -----
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Barre de progression de lecture.
  // Injectée ici plutôt que dans les cinq pages HTML, et seulement si la page
  // est assez longue pour que la notion de progression ait un sens.
  (function(){
    if (reduceMotion.matches) return;
    var docH = function(){ return document.documentElement.scrollHeight - window.innerHeight; };
    if (docH() < window.innerHeight * 0.6) return;

    var bar = document.createElement("div");
    bar.className = "read-progress";
    bar.setAttribute("aria-hidden", "true");   // information purement décorative
    bar.appendChild(document.createElement("span"));
    document.body.appendChild(bar);

    var fill = bar.firstChild, pending = false;
    var apply = function(){
      pending = false;
      var max = docH();
      var p = max > 0 ? window.scrollY / max : 0;
      p = p < 0 ? 0 : (p > 1 ? 1 : p);
      fill.style.setProperty("--p", p.toFixed(4));
      bar.classList.toggle("is-active", window.scrollY > 40);
    };
    document.addEventListener("scroll", function(){
      if (!pending) { pending = true; requestAnimationFrame(apply); }
    }, { passive:true });
    window.addEventListener("resize", apply, { passive:true });
    apply();
  })();

  // Compteurs du bandeau de chiffres.
  // On ne touche qu'aux valeurs numériques : « FR » reste « FR ».
  // Le suffixe (%, +, ...) est conservé tel quel.
  (function(){
    var nums = document.querySelectorAll(".stat-num");
    if (!nums.length || !("IntersectionObserver" in window) || reduceMotion.matches) return;

    var animate = function(el, target, suffix){
      var t0 = null, dur = 800;   // plafond fixé pour les révélations
      var step = function(ts){
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);   // sortie cubique — jamais linéaire
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    var ioNum = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (!e.isIntersecting) return;
        var el = e.target;
        ioNum.unobserve(el);
        var raw = el.textContent.trim();
        var m = raw.match(/^(\d+)(\D*)$/);
        if (!m) return;
        var target = parseInt(m[1], 10);
        if (target < 2) return;   // compter jusqu'à 1 n'anime rien
        // `.stat-num` est un bloc qui occupe déjà toute la colonne : le
        // décompte ne provoque aucun réajustement de la grille.
        el.textContent = "0" + m[2];
        animate(el, target, m[2]);
      });
    }, { threshold: 0.6 });

    nums.forEach(function(el){ ioNum.observe(el); });
  })();

  // Champ de parallaxe.
  // Une seule variable CSS (`--sy`) mise à jour par image ; c'est la feuille de
  // style qui répartit le mouvement entre les objets. Les positions sont tirées
  // d'un générateur à graine fixe : elles sont pseudo-aléatoires mais
  // identiques d'un chargement à l'autre — un fond qui se recompose à chaque
  // visite se remarque, et pas en bien.
  (function(){
    var sections = document.querySelectorAll(".hero, .page-hero, .showcase-3d");
    if (!sections.length) return;

    var seed = 20260808;
    var rnd = function(){            // générateur congruentiel linéaire
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    sections.forEach(function(section){
      if (section.querySelector(".parallax-field")) return;
      var field = document.createElement("div");
      field.className = "parallax-field";
      field.setAttribute("aria-hidden", "true");

      for (var i = 0; i < 7; i++) {
        var el = document.createElement("div");
        var spark = i % 4 === 3;               // une étincelle sur quatre
        el.className = "px-shape " + (spark ? "px-spark"
                                            : "px-plate" + (i % 3 ? "" : " solid"));
        var size = spark ? 12 + rnd() * 16 : 60 + rnd() * 150;
        // Répartition stratifiée plutôt que purement aléatoire : chaque objet
        // occupe sa propre bande verticale, sinon le tirage les agglutine et
        // laisse des zones vides. Et on écarte l'axe central, là où vit le
        // texte — une étincelle isolée sous un bouton se lit comme un défaut
        // d'affichage, pas comme un parti pris.
        var band = (i + rnd() * 0.85) / 7;          // 0 → 1, une bande par objet
        var side = i % 2 ? 60 + rnd() * 36 : rnd() * 26;   // gauche / droite
        el.style.cssText =
          "--x:" + side.toFixed(1) + "%;" +
          "--y:" + (band * 104 - 6).toFixed(1) + "%;" +
          "--s:" + size.toFixed(0) + "px;" +
          "--o:" + (spark ? .30 + rnd() * .35 : .20 + rnd() * .35).toFixed(2) + ";" +
          "--r:" + (rnd() * 24 - 12).toFixed(1) + "deg;" +
          // Coefficient de dérive : plus l'objet est petit, plus il file vite.
          // C'est l'écart entre les coefficients qui fabrique la profondeur.
          "--k:" + (spark ? .10 + rnd() * .14 : .03 + rnd() * .09).toFixed(3) + ";";
        field.appendChild(el);
      }
      section.insertBefore(field, section.firstChild);
    });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    var root = document.documentElement, pending = false;
    var apply = function(){
      pending = false;
      root.style.setProperty("--sy", Math.round(window.scrollY));
    };
    document.addEventListener("scroll", function(){
      if (!pending) { pending = true; requestAnimationFrame(apply); }
    }, { passive:true });
    apply();
  })();

  /* Formation en cours de lecture, signalée dans la barre d'accès direct.
     Le seuil haut correspond aux deux barres empilées (en-tête + index) : sans
     lui, une section serait dite « active » alors qu'elle est cachée derrière. */
  (function(){
    var barre = document.querySelector(".rail");
    if (!barre || !("IntersectionObserver" in window)) return;

    /* Le rail ne paraît qu'une fois le sommaire dépassé : tant qu'on est en
       tête de page, il ferait double emploi avec lui. */
    var sommaire = document.querySelector(".sommaire");
    if (sommaire) {
      var jauge = new IntersectionObserver(function(e){
        document.body.classList.toggle("rail-on", !e[0].isIntersecting);
      }, { rootMargin: "-40% 0px 0px 0px" });
      jauge.observe(sommaire);
    } else {
      document.body.classList.add("rail-on");
    }
    var liens = {};
    barre.querySelectorAll("a[href^='#']").forEach(function(a){
      liens[a.getAttribute("href").slice(1)] = a;
    });
    var sections = document.querySelectorAll(".reco-block[id]");
    if (!sections.length) return;

    var vues = {};
    var io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){ vues[e.target.id] = e.isIntersecting; });
      var courant = null;
      sections.forEach(function(s){ if (!courant && vues[s.id]) courant = s.id; });
      for (var id in liens) {
        if (id === courant) liens[id].setAttribute("aria-current", "true");
        else liens[id].removeAttribute("aria-current");
      }
    }, { rootMargin: "-150px 0px -55% 0px" });

    sections.forEach(function(s){ io.observe(s); });
  })();


  /* ---------- panneau « Nos formations » ----------
     Injecté par script plutôt qu'écrit dans les sept pages : une seule
     définition, aucune copie à tenir à jour. Sans JavaScript, le lien mène
     simplement à la page des formations, ce qui reste le comportement juste. */
  (function(){
    var lien = document.querySelector('.main-nav a[href="formations.html"]');
    if (!lien || window.matchMedia("(max-width: 980px)").matches) return;

    var hote = document.createElement("div");
    hote.className = "nav-drop";
    lien.parentNode.insertBefore(hote, lien);
    hote.appendChild(lien);

    var panneau = document.createElement("div");
    panneau.className = "megamenu";
    panneau.id = "megaFormations";
    panneau.innerHTML =
      '<div class="mm-grid">' +
        '<a href="formation-caces-r489.html">' +
          '<svg class="mm-icon" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 26h4l4-4h4"/><rect x="16" y="16" width="6" height="6"/><path d="M25 8v18M29 8v18M25 8h4"/></svg>' +
          '<span class="mm-texte"><span class="mm-code">R489</span>' +
          '<span class="mm-nom">Chariots élévateurs</span></span>' +
          '<span class="mm-note">Conducteur porté, catégories 1A à 7</span>' +
        '</a>' +
        '<a href="formation-caces-r482.html">' +
          '<svg class="mm-icon" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 26h8M8 26V14M8 14l14-6M22 8l6 4-5 3"/></svg>' +
          '<span class="mm-texte"><span class="mm-code">R482</span>' +
          '<span class="mm-nom">Engins de chantier</span></span>' +
          '<span class="mm-note">11 catégories, du compact au porte-engins</span>' +
        '</a>' +
        '<a href="formation-caces-r485.html">' +
          '<svg class="mm-icon" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="18" width="8" height="8"/><rect x="6" y="10" width="8" height="6"/><path d="M22 26V10M22 10l-4 4M22 10l4 4"/></svg>' +
          '<span class="mm-texte"><span class="mm-code">R485</span>' +
          '<span class="mm-nom">Chariots gerbeurs</span></span>' +
          '<span class="mm-note">Conducteur accompagnant, catégories 1 et 2</span>' +
        '</a>' +
        '<a href="formation-caces-r486.html">' +
          '<svg class="mm-icon" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 12h20M9 12v10M23 12v10M14 28h4"/><path d="M16 4v6M16 4l-4 4M16 4l4 4"/></svg>' +
          '<span class="mm-texte"><span class="mm-code">R486</span>' +
          '<span class="mm-nom">PEMP / nacelles</span></span>' +
          '<span class="mm-note">Groupes A et B, travail en hauteur</span>' +
        '</a>' +
        '<a href="formation-habilitation-electrique.html">' +
          '<svg class="mm-icon" aria-hidden="true" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M18 4 8 18h7l-1 10 10-14h-7l1-10z"/></svg>' +
          '<span class="mm-texte"><span class="mm-code">BT</span>' +
          '<span class="mm-nom">Habilitation électrique</span></span>' +
          '<span class="mm-note">Basse tension, norme NF C18-510</span>' +
        '</a>' +
      '</div>' +
      '<div class="mm-pied">' +
        '<span>Formation, évaluation et test, en intra-entreprise sur votre matériel.</span>' +
        '<a href="formations.html">Voir toutes les formations →</a>' +
      '</div>';
    hote.appendChild(panneau);

    lien.setAttribute("aria-expanded", "false");
    lien.setAttribute("aria-controls", "megaFormations");

    /* Le voile qui floute la page. Créé une seule fois, réutilisé ensuite ;
       un clic dessus referme le menu, comme on referme en cliquant à côté. */
    var voile = document.createElement("div");
    voile.className = "mm-voile";
    document.body.appendChild(voile);

    var minuteur = null;
    var ouvrir = function(){
      clearTimeout(minuteur);
      hote.classList.add("is-open");
      document.body.classList.add("mm-open");
      lien.setAttribute("aria-expanded", "true");
    };
    /* Fermeture retardée : la souris doit pouvoir quitter le lien pour
       atteindre le panneau sans que tout disparaisse en chemin. */
    var fermer = function(delai){
      clearTimeout(minuteur);
      minuteur = setTimeout(function(){
        hote.classList.remove("is-open");
        document.body.classList.remove("mm-open");
        lien.setAttribute("aria-expanded", "false");
      }, delai === undefined ? 180 : delai);
    };

    voile.addEventListener("click", function(){ fermer(0); });
    hote.addEventListener("mouseenter", ouvrir);
    hote.addEventListener("mouseleave", function(){ fermer(); });
    lien.addEventListener("focus", ouvrir);
    hote.addEventListener("focusin", ouvrir);
    hote.addEventListener("focusout", function(e){
      if (!hote.contains(e.relatedTarget)) fermer(0);
    });
    document.addEventListener("keydown", function(e){
      if (e.key === "Escape" && hote.classList.contains("is-open")) {
        fermer(0); lien.focus();
      }
    });
  })();

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form -> Web3Forms (envoi réel, sans backend à héberger)
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString();
      var formation = (data.get("formation") || "").toString();

      var note = document.getElementById("formStatus");
      if (!note) {
        note = document.createElement("p");
        note.id = "formStatus";
        note.className = "form-status";
        note.setAttribute("role", "status");     // annoncé par les lecteurs d'écran
        form.appendChild(note);
      }

      var bouton = form.querySelector('button[type="submit"]');
      var libelle = bouton ? bouton.innerHTML : "";
      if (bouton) {
        bouton.disabled = true;
        bouton.innerHTML = "<span>Envoi en cours…</span>";
      }

      data.set("subject", "Demande de formation — " + (formation || name || "site web"));

      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: data
      })
        .then(function(r){ return r.json(); })
        .then(function(result){
          if (result.success) {
            note.innerHTML = "Message envoyé. Réponse sous 48h à l'adresse indiquée.";
            form.reset();
          } else {
            note.innerHTML =
              "L'envoi a échoué : écrivez directement à " +
              '<a href="mailto:jeremy@houdin-formation.com">jeremy@houdin-formation.com</a>.';
          }
          note.classList.add("is-on");
        })
        .catch(function(){
          note.innerHTML =
            "L'envoi a échoué (connexion indisponible) : écrivez directement à " +
            '<a href="mailto:jeremy@houdin-formation.com">jeremy@houdin-formation.com</a>.';
          note.classList.add("is-on");
        })
        .finally(function(){
          if (bouton) {
            bouton.disabled = false;
            bouton.innerHTML = libelle;
          }
        });
    });
  }

  /* ==================================================================
     BANDEAU DE RÉFÉRENCES — source unique pour tout le site.

     Le bandeau figure sur dix pages. Plutôt que d'y recopier deux cents
     lignes de plaques identiques, chaque page ne porte que sa coquille et
     son titre ; le rail est monté ici, à partir de la seule liste qui
     suit. Un logo change, une ligne change, les dix pages suivent.

     L'INTERRUPTEUR, C'EST LA LISTE. Tant que REFERENCES est vide, aucune
     coquille ne s'ouvre : les sections restent `hidden`, exactement comme
     si elles n'existaient pas. Le jour où les logos arrivent, il suffit de
     remplir ce tableau — rien d'autre à toucher, sur aucune page.

     Format attendu par entrée :
       { nom: "Nom de l'entreprise", logo: "assets/img/references/xxx.svg" }
     Le nom n'est pas décoratif : il devient l'alternative textuelle de
     l'image, et c'est lui qui porte l'information pour un lecteur d'écran.
     ================================================================== */
  var REFERENCES = [];

  // Nombre de plaques affichées tant qu'aucun logo n'est fourni.
  var GABARITS = 8;

  // Une plaque vide : le picto neutre, deux barres qui figurent un nom, et le
  // numéro d'emplacement. Sans ce numéro, huit plaques rigoureusement
  // identiques ne laisseraient rien voir du défilement.
  function plaqueGabarit(rang){
    var d = document.createElement("div");
    d.className = "refs-plaque refs-plaque--vide";
    d.innerHTML =
      '<svg viewBox="0 0 32 32" width="30" height="30" aria-hidden="true">' +
      '<circle cx="16" cy="16" r="14" fill="none" stroke="currentColor" stroke-width="2"/>' +
      '<path d="M10 20.5l4.5-7 3.5 5 3-3.5" fill="none" stroke="currentColor" ' +
      'stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' +
      '<span class="refs-mots"><i></i><i></i></span>' +
      '<span class="refs-num">' + (rang < 10 ? "0" + rang : rang) + "</span>";
    return d;
  }

  function monteBandeauReferences(){
    var coquilles = document.querySelectorAll("[data-bandeau-references]");
    if (!coquilles.length) return;

    // Deux états, un seul composant. Sans logo, la bande s'affiche en gabarit ;
    // dès que REFERENCES est rempli, elle passe aux vraies images sans qu'une
    // seule page ait à être retouchée.
    var vide = !REFERENCES.length;

    Array.prototype.forEach.call(coquilles, function(section){
      var hote = section.querySelector("[data-refs-rail]");
      if (!hote) return;

      // Deux séries rigoureusement identiques : la piste fait deux fois la
      // largeur du cadre, et la translation de -50 % ramène la seconde là
      // où commençait la première. Sans ce doublon, la boucle sauterait.
      // La seconde est masquée aux lecteurs d'écran, sans quoi chaque
      // référence serait annoncée deux fois.
      var rail = document.createElement("div");
      rail.className = "refs-rail";
      rail.setAttribute("data-reveal", "");
      // En gabarit, le rail entier est masqué aux lecteurs d'écran : des
      // plaques sans nom n'ont rien à leur annoncer. L'attribut tombe de
      // lui-même dès que les vrais logos, eux, portent une information.
      if (vide) rail.setAttribute("aria-hidden", "true");

      var piste = document.createElement("div");
      piste.className = "refs-piste";

      [false, true].forEach(function(doublon){
        var serie = document.createElement("ul");
        serie.className = "refs-serie";
        if (doublon) serie.setAttribute("aria-hidden", "true");

        if (vide) {
          for (var i = 1; i <= GABARITS; i++) {
            var creneau = document.createElement("li");
            creneau.className = "refs-item";
            creneau.appendChild(plaqueGabarit(i));
            serie.appendChild(creneau);
          }
        } else {
          REFERENCES.forEach(function(ref){
            var item = document.createElement("li");
            item.className = "refs-item";

            var plaque = document.createElement("div");
            plaque.className = "refs-plaque";

            // Pas de loading="lazy" ici : la moitié des plaques est hors cadre
            // horizontalement, et un navigateur ne déclenche pas toujours le
            // chargement différé d'une image qui n'est décalée que sur l'axe X.
            // Elles arriveraient vides au moment où le défilement les amène.
            // Ce sont des logos, quelques kilo-octets chacun.
            var img = document.createElement("img");
            img.src = ref.logo;
            img.alt = doublon ? "" : ref.nom;
            img.decoding = "async";

            plaque.appendChild(img);
            item.appendChild(plaque);
            serie.appendChild(item);
          });
        }

        piste.appendChild(serie);
      });

      rail.appendChild(piste);
      hote.appendChild(rail);

      // Arrêt du défilement. Le survol suspend déjà la piste, mais il ne
      // répond ni au clavier ni au doigt : WCAG 2.2.2 demande un mécanisme
      // d'arrêt pour tout mouvement automatique de plus de cinq secondes.
      // Sous prefers-reduced-motion la piste ne bouge pas : le bouton n'a
      // alors plus d'objet, la feuille le masque.
      var barre = document.createElement("div");
      barre.className = "wrap refs-barre";

      // En gabarit, la mention dit franchement ce que sont ces plaques. Elle
      // disparaît d'elle-même avec les vrais logos, qui se passent de légende.
      if (vide) {
        var note = document.createElement("p");
        note.className = "refs-note";
        note.textContent = "Emplacements en attente des logos clients";
        barre.appendChild(note);
      }

      var bouton = document.createElement("button");
      bouton.type = "button";
      bouton.className = "refs-pause";
      bouton.setAttribute("aria-pressed", "false");
      bouton.innerHTML =
        '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">' +
        '<rect x="6" y="5" width="4" height="14" rx="1"/>' +
        '<rect x="14" y="5" width="4" height="14" rx="1"/></svg>' +
        "<span>Mettre en pause</span>";

      bouton.addEventListener("click", function(){
        var fige = piste.getAttribute("data-fige") === "1";
        piste.setAttribute("data-fige", fige ? "0" : "1");
        bouton.setAttribute("aria-pressed", fige ? "false" : "true");
        var libelle = bouton.querySelector("span");
        if (libelle) libelle.textContent = fige ? "Mettre en pause" : "Relancer";
      });

      barre.appendChild(bouton);
      hote.appendChild(barre);

      // La coquille n'est démasquée qu'une fois son contenu en place : la
      // hauteur est déjà réservée par la feuille, rien ne se décale.
      section.removeAttribute("hidden");
    });
  }

  monteBandeauReferences();
})();
