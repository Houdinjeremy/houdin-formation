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

  // Vitrine 3D — embed Sketchfab dont la caméra suit le défilement.
  // Le script n'est chargé qu'à l'approche du viewport : rien ne pèse sur le
  // premier rendu, et le repli statique reste affiché si le chargement échoue.
  var frame3d = document.getElementById("viewer3d");
  if (frame3d && "IntersectionObserver" in window) {
    var MODEL_UID = "0413fc9664f74a0b8bb2922c94524bb0";
    var fallback = document.getElementById("viewerFallback");
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var started = false;

    var bindScrollCamera = function(api){
      api.getCameraLookAt(function(err, cam){
        if (err) return;
        var target = cam.target.slice();
        var px = cam.position[0] - target[0];
        var py = cam.position[1] - target[1];
        var pz = cam.position[2] - target[2];
        var radius = Math.sqrt(px*px + pz*pz) * 0.78;   // cadrage resserré
        var angle0 = Math.atan2(pz, px);
        var pending = false;

        var apply = function(){
          pending = false;
          var r = frame3d.getBoundingClientRect();
          // progression de la vitrine dans le viewport, bornée 0 → 1
          var p = 1 - (r.top + r.height) / (window.innerHeight + r.height);
          p = p < 0 ? 0 : (p > 1 ? 1 : p);
          var a = angle0 + p * Math.PI * 0.8;   // ~145° de rotation sur la traversée
          api.setCameraLookAt(
            [target[0] + radius * Math.cos(a),
             target[1] + py * (0.85 - p * 0.35),  // on descend vers le niveau du sol
             target[2] + radius * Math.sin(a)],
            target, 0
          );
        };

        document.addEventListener("scroll", function(){
          if (!pending) { pending = true; requestAnimationFrame(apply); }
        }, { passive:true });
        apply();
      });
    };

    var boot = function(){
      if (started) return;
      started = true;
      var s = document.createElement("script");
      s.src = "https://static.sketchfab.com/api/sketchfab-viewer-1.12.1.js";
      s.async = true;
      s.onerror = function(){
        if (fallback) fallback.querySelector("span").textContent = "Modèle 3D indisponible";
      };
      s.onload = function(){
        if (typeof Sketchfab === "undefined") return;
        new Sketchfab(frame3d).init(MODEL_UID, {
          autostart: 1,
          preload: 1,
          ui_infos: 0,
          ui_controls: 0,
          ui_stop: 0,
          transparent: 1,
          dnt: 1,                 // pas de pistage côté Sketchfab
          success: function(api){
            api.start();
            api.addEventListener("viewerready", function(){
              if (fallback) fallback.style.display = "none";
              if (!reduce) bindScrollCamera(api);
            });
          },
          error: function(){
            if (fallback) fallback.querySelector("span").textContent = "Modèle 3D indisponible";
          }
        });
      };
      document.head.appendChild(s);
    };

    // L'observer doit être retenu par une variable : créé à la volée, il peut
    // être collecté avant d'avoir déclenché.
    var io3d = new IntersectionObserver(function(entries){
      entries.forEach(function(e){
        if (e.isIntersecting) { boot(); io3d.disconnect(); }
      });
    }, { rootMargin: "300px 0px" });
    io3d.observe(frame3d);
  }

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
