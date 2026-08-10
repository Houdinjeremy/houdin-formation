/* ==========================================================================
   Houdin Formation — visionneuse 3D
   --------------------------------------------------------------------------
   Ce qui change par rapport à l'ancienne version : la mise en scène, pas la
   source. Le modèle n'est plus enfermé dans un cadre à bordure — il flotte sur
   le navy, tenu par une lumière et une ombre au sol, et l'iframe Sketchfab est
   appelée avec `transparent=1` pour que son fond disparaisse dans la page.

   Trois sources possibles par engin, dans cet ordre de priorité :
     1. `sketchfab` — un identifiant de modèle Sketchfab (iframe, fond transparent) ;
     2. `src`       — un fichier .glb déposé dans assets/models/ (auto-hébergé,
                      rendu par <model-viewer>, aucune dépendance tierce) ;
     3. aucune      — le schéma technique de la machine tient la place, et la
                      légende annonce « modèle 3D à venir ». Jamais un trou.

   POUR AJOUTER UN MODÈLE : remplir `sketchfab` (l'identifiant est le suffixe de
   l'URL du modèle) ou `src`, et renseigner `credit` si la licence l'exige.
   ========================================================================== */
(function(){
  "use strict";

  var VENDOR  = "assets/vendor/model-viewer.min.js";
  var MODELES = "assets/models/";

  /* L'ordre définit celui des onglets.
     Les modèles retenus autorisent tous l'usage commercial — trois en CC BY
     (attribution obligatoire), le gerbeur R485 sous licence Sketchfab Standard.
     Dans les deux cas le fichier reste chez son auteur : nous n'affichons que son
     lecteur, jamais une copie. D'où le champ `credit`, affiché sous la scène.
     Une licence **NC** (non commerciale) disqualifie un modèle : ce site vend. */
  var ENGINS = [
    {
      id:"r489", code:"R489", nom:"Chariot élévateur",
      schema:"chariot-frontal",
      sketchfab:"d40cae50e04145dd997cdca415cd72ad",
      note:"Frontal en porte-à-faux — le contrepoids tient la charge",
      credit:'Modèle&nbsp;3D <a href="https://sketchfab.com/3d-models/forklift-d40cae50e04145dd997cdca415cd72ad" target="_blank" rel="noopener noreferrer nofollow">Forklift</a> par <a href="https://sketchfab.com/mansta9" target="_blank" rel="noopener noreferrer nofollow">Ethian74</a> sur <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer nofollow">Sketchfab</a> — licence CC&nbsp;BY'
    },
    {
      id:"r486", code:"R486", nom:"PEMP",
      schema:"pemp-bras",
      sketchfab:"aa7ce85ae7194eb2921005ac74a58a78",
      note:"Bras articulé, groupe B — il franchit l'obstacle par-dessus",
      credit:'Modèle&nbsp;3D <a href="https://sketchfab.com/3d-models/boom-lift-articulating-aa7ce85ae7194eb2921005ac74a58a78" target="_blank" rel="noopener noreferrer nofollow">Boom Lift (Articulating)</a> par <a href="https://sketchfab.com/doty_aecom" target="_blank" rel="noopener noreferrer nofollow">doty_aecom</a> sur <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer nofollow">Sketchfab</a> — licence CC&nbsp;BY'
    },
    {
      id:"r482", code:"R482", nom:"Engin de chantier",
      schema:"pelle-b1",
      sketchfab:"0413fc9664f74a0b8bb2922c94524bb0",
      note:"Chargeuse sur pneus — prise de poste et angles morts",
      credit:'Modèle&nbsp;3D <a href="https://sketchfab.com/3d-models/loader-2025-0413fc9664f74a0b8bb2922c94524bb0" target="_blank" rel="noopener noreferrer nofollow">Loader 2025</a> par <a href="https://sketchfab.com/extreme3dsmodel" target="_blank" rel="noopener noreferrer nofollow">Extreme 3ds Model</a> sur <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer nofollow">Sketchfab</a> — licence CC&nbsp;BY'
    },
    {
      id:"r485", code:"R485", nom:"Gerbeur",
      schema:"gerbeur-accompagnant",
      sketchfab:"4e6b9c748be84c3aa53683b073c21807",
      note:"Conducteur accompagnant, catégorie 1 — mât et timon",
      credit:'Mod\u00e8le&nbsp;3D <a href="https://sketchfab.com/3d-models/heli-cbs-semi-electric-pallet-stacker-4e6b9c748be84c3aa53683b073c21807" target="_blank" rel="noopener noreferrer nofollow">HELI CBS Semi-electric pallet stacker</a> par <a href="https://sketchfab.com/kendenvert" target="_blank" rel="noopener noreferrer nofollow">kendenvert</a> sur <a href="https://sketchfab.com" target="_blank" rel="noopener noreferrer nofollow">Sketchfab</a> \u2014 licence Sketchfab Standard'
    }
  ];

  var scene   = document.getElementById("stage3dScene");
  var onglets = document.getElementById("stage3dTabs");
  var legende = document.getElementById("stage3dNote");
  var credit  = document.getElementById("stage3dCredit");
  if(!scene || !onglets) return;

  var vendorDemande = false, courant = null;

  function reduitMouvement(){
    return window.matchMedia &&
           window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function chargeVendor(){
    if(vendorDemande) return;
    vendorDemande = true;
    var s = document.createElement("script");
    s.type = "module"; s.src = VENDOR;
    document.head.appendChild(s);
  }

  /* `transparent=1` est la clé de la nouvelle mise en scène : sans lui l'iframe
     peint son propre fond et redevient une vignette rapportée sur la page.
     `dnt=1` coupe le suivi publicitaire du lecteur. */
  function urlSketchfab(uid){
    /* `autostart=1` est indispensable en iframe simple : sans lui le lecteur
       reste sur son écran de lancement et la scène paraît vide. L'ancienne
       version démarrait par l'API JS, d'où l'oubli facile. */
    return "https://sketchfab.com/models/" + uid + "/embed" +
           "?transparent=1&autostart=1&dnt=1&preload=1&ui_theme=dark" +
           "&ui_infos=0&ui_stop=0&ui_inspector=0&ui_hint=0&ui_ar=0" +
           "&ui_help=0&ui_settings=0&ui_vr=0&ui_fullscreen=0&ui_annotations=0" +
           "&autospin=" + (reduitMouvement() ? "0" : "0.2") +
           "&camera=0&scrollwheel=0";
  }

  /* ---------- construction d'une pièce ---------- */
  function peuple(engin){
    var bloc = document.createElement("div");
    bloc.className = "stage3d-piece";

    if(engin.sketchfab){
      var f = document.createElement("iframe");
      f.title = engin.nom + " — modèle 3D manipulable";
      f.setAttribute("allow", "autoplay; fullscreen; xr-spatial-tracking");
      f.setAttribute("allowfullscreen", "");
      f.setAttribute("loading", "lazy");
      f.src = urlSketchfab(engin.sketchfab);
      bloc.appendChild(f);
      bloc.classList.add("is-iframe");

    }else if(engin.src){
      var mv = document.createElement("model-viewer");
      mv.setAttribute("src", MODELES + engin.src);
      mv.setAttribute("alt", engin.nom + " — modèle 3D manipulable");
      mv.setAttribute("camera-controls", "");
      mv.setAttribute("touch-action", "pan-y");   /* la page reste scrollable au doigt */
      mv.setAttribute("shadow-intensity", "1.1");
      mv.setAttribute("shadow-softness", "0.9");
      mv.setAttribute("exposure", "1.05");
      mv.setAttribute("interaction-prompt", "none");
      mv.setAttribute("loading", "lazy");
      if(!reduitMouvement()) mv.setAttribute("auto-rotate", "");
      bloc.appendChild(mv);
      bloc.classList.add("is-modele");
      chargeVendor();

    }else{
      /* Repli : le schéma technique de la même machine. Cohérent avec le reste
         du site, et impossible à confondre avec une panne. */
      var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
      svg.setAttribute("data-schema", engin.schema);
      svg.setAttribute("viewBox", "0 0 340 300");
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", "Schéma technique — " + engin.nom);
      svg.classList.add("stage3d-schema");
      bloc.appendChild(svg);
      bloc.classList.add("is-schema");
    }
    return bloc;
  }

  /* ---------- bascule ---------- */
  function montre(engin){
    if(courant === engin.id) return;
    courant = engin.id;

    var ancien = scene.querySelector(".stage3d-piece");
    var neuf   = peuple(engin);
    neuf.classList.add("is-entrant");
    scene.appendChild(neuf);

    /* Le schéma se monte APRÈS insertion : le module dessine dans l'élément vivant. */
    if(window.HFSchemas) window.HFSchemas.rafraichir();

    requestAnimationFrame(function(){
      requestAnimationFrame(function(){ neuf.classList.remove("is-entrant"); });
    });

    if(ancien){
      ancien.classList.add("is-sortant");
      var fin = function(){ if(ancien.parentNode) ancien.parentNode.removeChild(ancien); };
      ancien.addEventListener("transitionend", fin, { once:true });
      setTimeout(fin, 600);                       /* filet de sécurité */
    }

    if(legende){
      var dispo = engin.sketchfab || engin.src;
      legende.textContent = engin.note + (dispo ? "" : " — modèle 3D à venir");
    }
    if(credit) credit.innerHTML = engin.credit || "";

    Array.prototype.forEach.call(onglets.children, function(b){
      var actif = b.getAttribute("data-engin") === engin.id;
      b.setAttribute("aria-selected", actif ? "true" : "false");
      b.tabIndex = actif ? 0 : -1;
    });
  }

  /* ---------- onglets ---------- */
  ENGINS.forEach(function(engin, i){
    var b = document.createElement("button");
    b.type = "button";
    b.setAttribute("role", "tab");
    b.setAttribute("data-engin", engin.id);
    b.setAttribute("aria-selected", i === 0 ? "true" : "false");
    b.tabIndex = i === 0 ? 0 : -1;
    b.innerHTML = '<span class="me-code">' + engin.code + '</span>' +
                  '<span class="me-nom">' + engin.nom + '</span>';
    b.addEventListener("click", function(){ montre(engin); });
    onglets.appendChild(b);
  });

  /* Navigation clavier attendue d'un tablist. */
  onglets.addEventListener("keydown", function(e){
    var idx = ENGINS.findIndex(function(m){ return m.id === courant; }), n = null;
    if(e.key === "ArrowRight") n = (idx + 1) % ENGINS.length;
    else if(e.key === "ArrowLeft") n = (idx - 1 + ENGINS.length) % ENGINS.length;
    else if(e.key === "Home") n = 0;
    else if(e.key === "End") n = ENGINS.length - 1;
    if(n === null) return;
    e.preventDefault();
    montre(ENGINS[n]);
    onglets.children[n].focus();
  });

  /* Rien n'est chargé au premier rendu : la scène n'est peuplée qu'à l'approche
     du viewport. Sans IntersectionObserver, on affiche tout de suite. */
  if("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ montre(ENGINS[0]); io.disconnect(); }
      });
    }, { rootMargin:"400px 0px" });
    io.observe(scene);
  }else{
    montre(ENGINS[0]);
  }
})();
