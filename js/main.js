(function(){
  "use strict";

  // Burger / mobile nav
  var burger = document.getElementById("burgerBtn");
  var mobileNav = document.getElementById("mobileNav");
  if (burger && mobileNav) {
    var setNav = function(open){
      mobileNav.classList.toggle("is-open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      // L'overlay couvre l'écran : on gèle le défilement de la page dessous.
      document.body.style.overflow = open ? "hidden" : "";
      document.body.classList.toggle("nav-is-open", open);
    };
    burger.addEventListener("click", function(){
      setNav(!mobileNav.classList.contains("is-open"));
    });
    mobileNav.querySelectorAll("a").forEach(function(a){
      a.addEventListener("click", function(){ setNav(false); });
    });
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
    var onScroll = function(){
      header.classList.toggle("is-scrolled", window.scrollY > 24);
    };
    document.addEventListener("scroll", onScroll, { passive:true });
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

  // Footer year
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Contact form -> mailto (no backend available)
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function(e){
      e.preventDefault();
      var data = new FormData(form);
      var name = (data.get("name") || "").toString();
      var email = (data.get("email") || "").toString();
      var phone = (data.get("phone") || "").toString();
      var formation = (data.get("formation") || "").toString();
      var message = (data.get("message") || "").toString();

      var subject = "Demande de formation — " + (formation || name || "site web");
      var body =
        "Nom : " + name + "\n" +
        "Email : " + email + "\n" +
        "Téléphone : " + phone + "\n" +
        "Formation concernée : " + formation + "\n\n" +
        message;

      window.location.href =
        "mailto:jeremyhoudin95@gmail.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(body);
    });
  }
})();
