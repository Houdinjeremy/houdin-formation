/* ==========================================================================
   Houdin Formation — piste design02
   Le strict nécessaire : une apparition au défilement, et l'année du pied de
   page. Tout le reste est fait par la feuille de style.
   ========================================================================== */
(function(){
  "use strict";

  var reduit = window.matchMedia &&
               window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Apparition au défilement. `once` : un élément vu reste vu — rejouer
     l'animation au retour en arrière donne l'impression que la page n'est
     jamais stabilisée. */
  var cibles = document.querySelectorAll("[data-appear]");

  /* Pas de sortie anticipée ici : le repère de défilement et l'année du pied de
     page ne dépendent pas des apparitions, et une page sans `data-appear` les
     perdrait en silence. */
  if (cibles.length) {
  if (reduit || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(cibles, function(el){ el.classList.add("seen"); });
  } else {
    var io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        if (!e.isIntersecting) return;
        e.target.classList.add("seen");
        io.unobserve(e.target);
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.08 });

    Array.prototype.forEach.call(cibles, function(el){ io.observe(el); });

    /* Ce qui occupe déjà l'écran au chargement ne doit pas attendre un
       défilement pour exister. */
    requestAnimationFrame(function(){
      Array.prototype.forEach.call(cibles, function(el){
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("seen"); io.unobserve(el);
        }
      });
    });
  }
  }

  /* Le repère « Découvrir » s'efface au premier défilement : il a rempli son
     office, le garder deviendrait du décor. */
  var cue = document.querySelector(".scroll-cue");
  if (cue) {
    var effacer = function(){
      if (window.scrollY > 40) {
        document.body.classList.add("is-scrolled");
        window.removeEventListener("scroll", effacer);
      }
    };
    window.addEventListener("scroll", effacer, { passive:true });
    effacer();
  }

  var an = document.getElementById("year");
  if (an) an.textContent = new Date().getFullYear();
})();
