/* ==========================================================================
   Houdin Formation — schémas techniques animés
   --------------------------------------------------------------------------
   Chaque machine est CALCULÉE, pas dessinée : c'est ce qui garantit qu'un
   professionnel n'y verra rien de faux. Les contraintes réelles sont tenues —
   barres de ciseaux à longueur fixe, plancher de PEMP asservi à l'horizontale,
   mât rétractable qui translate avant de lever.

   Usage :  <svg data-schema="pemp-ciseaux" viewBox="0 0 340 300"></svg>
   Le module génère tout le contenu SVG, y compris le décor et les cotes.

   Échelle commune : ÉCHELLE px par mètre, sol à SOL. Les cotes réglementaires
   (1,20 m / 2,50 m) sont donc à leur vraie place, pas approximatives.
   ========================================================================== */
(function(){
  "use strict";

  var NS = "http://www.w3.org/2000/svg";
  var SOL = 280;          /* ligne de sol, en unités viewBox */
  var ECHELLE = 46;       /* pixels par mètre */

  var COL = {
    struct : "#C4CDD6",
    fort   : "#FFFFFF",
    axe    : "#EE7111",
    decor  : "rgba(255,255,255,.28)",
    faible : "rgba(255,255,255,.12)",
    cote   : "#8FA0B2"
  };

  function y(m){ return SOL - m * ECHELLE; }

  function el(tag, attrs){
    var n = document.createElementNS(NS, tag);
    for(var k in attrs){ if(attrs[k] !== undefined) n.setAttribute(k, attrs[k]); }
    return n;
  }
  function g(parent, attrs){ var n = el("g", attrs); parent.appendChild(n); return n; }
  function clear(n){ while(n.firstChild) n.removeChild(n.firstChild); }

  function line(p, x1,y1,x2,y2, o){
    o = o || {};
    p.appendChild(el("line",{x1:x1,y1:y1,x2:x2,y2:y2,
      stroke:o.stroke||COL.struct, "stroke-width":o.w||2.4,
      "stroke-linecap":o.cap||"round", "stroke-dasharray":o.dash, opacity:o.op}));
  }
  function path(p, d, o){
    o = o || {};
    p.appendChild(el("path",{d:d, fill:o.fill||"none",
      stroke:o.stroke||COL.struct, "stroke-width":o.w||2.4,
      "stroke-linejoin":"round", "stroke-linecap":o.cap||"round",
      "stroke-dasharray":o.dash, opacity:o.op}));
  }
  function rect(p, x,yy,w,h, o){
    o = o || {};
    p.appendChild(el("rect",{x:x,y:yy,width:w,height:h,rx:o.r||4,
      fill:o.fill||"rgba(196,205,214,.13)", stroke:o.stroke||COL.struct,
      "stroke-width":o.w||2.4, opacity:o.op}));
  }
  function roue(p, cx, cy, r){
    p.appendChild(el("circle",{cx:cx,cy:cy,r:r,
      fill:"rgba(6,14,24,.9)", stroke:COL.struct, "stroke-width":2.4}));
  }
  function axe(p, cx, cy, r){
    p.appendChild(el("circle",{cx:cx,cy:cy,r:r||3.6,
      fill:"#060E18", stroke:COL.axe, "stroke-width":2}));
  }
  function texte(p, x, yy, s, o){
    o = o || {};
    var t = el("text",{x:x,y:yy,fill:o.fill||COL.cote,
      "font-family":"IBM Plex Mono, monospace","font-size":o.size||9.5,
      "letter-spacing":.8,"text-anchor":o.anchor||"middle"});
    t.textContent = s;
    p.appendChild(t);
  }

  /* ---------- décor ---------- */
  function sol(p, x1, x2){ line(p, x1||12, SOL, x2||328, SOL, {stroke:COL.decor, w:1.5}); }

  function facade(p, x){
    line(p, x, 26, x, SOL, {stroke:"rgba(255,255,255,.16)", w:1.5});
    for(var i=0;i<7;i++){
      line(p, x, 50+i*36, x+24, 36+i*36, {stroke:"rgba(255,255,255,.09)", w:1});
    }
  }

  /* Cote réglementaire : la hauteur qui fait basculer d'une catégorie à l'autre. */
  function cote(p, hm, label, x1, x2){
    var yy = y(hm);
    line(p, x1, yy, x2, yy, {stroke:COL.axe, w:1, dash:"3 4", op:.55, cap:"butt"});
    texte(p, x2+3, yy+3.4, label, {anchor:"start", size:9});
  }

  /* ---------- opérateur (silhouette au trait, 1,75 m) ---------- */
  function operateur(p, x, baseY, opts){
    opts = opts || {};
    var H = opts.H || 1.75 * ECHELLE, tete = baseY - H, r = H*0.055;
    var col = opts.stroke || COL.fort, w = 2.2;
    p.appendChild(el("circle",{cx:x, cy:tete + r, r:r, fill:"none", stroke:col, "stroke-width":w}));
    var epaule = tete + H*0.19, hanche = tete + H*0.55;
    line(p, x, tete + 2*r, x, hanche, {stroke:col, w:w});
    /* jambes */
    line(p, x, hanche, x - H*0.10, baseY, {stroke:col, w:w});
    line(p, x, hanche, x + H*0.10, baseY, {stroke:col, w:w});
    /* bras : tendu vers le timon, ou le long du corps */
    if(opts.bras){
      line(p, x, epaule, opts.bras.x, opts.bras.y, {stroke:col, w:w});
    }else{
      line(p, x, epaule, x + H*0.11, hanche + H*0.04, {stroke:col, w:w});
    }
  }

  /* ==========================================================================
     1 & 2 — PEMP (R486)
     ========================================================================== */

  /* Ciseaux : barres à longueur fixe. En montant, la hauteur d'un niveau
     augmente donc l'écartement se resserre : W = √(L² − h²). Ce resserrement
     est la signature visuelle d'un ciseaux — c'est ce qu'un rendu approximatif
     rate systématiquement. */
  var SC = { L:62, niveaux:4, cx:170, base:234, hMin:13, hMax:42, plancher:124, garde:40 };

  function ciseauxAt(t){
    var h = SC.hMin + t*(SC.hMax - SC.hMin);
    return { h:h, W:Math.sqrt(Math.max(SC.L*SC.L - h*h, 0)), haut: SC.base - SC.niveaux*h };
  }

  var pempCiseaux = {
    trace: function(t){ return { x: SC.cx + SC.plancher/2, y: ciseauxAt(t).haut }; },
    decor: function(p){ facade(p, 288); sol(p, 12, 284); },
    dessine: function(p, t){
      var s = ciseauxAt(t), xl = SC.cx - s.W/2, xr = SC.cx + s.W/2;
      var m = g(p);
      for(var i=0;i<SC.niveaux;i++){
        var yb = SC.base - i*s.h, yt = yb - s.h;
        line(m, xl,yb,xr,yt,{w:3.2}); line(m, xr,yb,xl,yt,{w:3.2});
        axe(m, SC.cx, yb - s.h/2);
      }
      var hw = SC.plancher/2, yy = s.haut;
      path(m, "M"+(SC.cx-hw)+" "+yy+" H"+(SC.cx+hw), {stroke:COL.fort, w:3});
      path(m, "M"+(SC.cx-hw)+" "+yy+" V"+(yy-SC.garde)+" H"+(SC.cx+hw)+" V"+yy, {stroke:COL.fort, w:3});
      path(m, "M"+(SC.cx-hw)+" "+(yy-SC.garde/2)+" H"+(SC.cx+hw), {stroke:COL.fort, w:1.6, op:.65});
      rect(m, 88, 234, 164, 30, {r:5});
      roue(m, 118, 268, 13); roue(m, 222, 268, 13);
    }
  };

  /* Bras articulé : cinématique directe à deux segments. Le panier est
     redessiné horizontal à chaque image — sur une PEMP le plancher est
     asservi, il ne bascule jamais avec le bras. */
  var BM = { px:150, py:230, L1:88, L2:78, a0:8, a1:58, b0:170, b1:14 };

  function brasAt(t){
    var A = (BM.a0 + t*(BM.a1-BM.a0)) * Math.PI/180,
        B = (BM.b0 + t*(BM.b1-BM.b0)) * Math.PI/180;
    var p1 = { x: BM.px + BM.L1*Math.cos(A), y: BM.py - BM.L1*Math.sin(A) };
    return { p0:{x:BM.px,y:BM.py}, p1:p1,
             p2:{ x: p1.x + BM.L2*Math.cos(B), y: p1.y - BM.L2*Math.sin(B) } };
  }

  var pempBras = {
    trace: function(t){ return brasAt(t).p2; },
    decor: function(p){
      sol(p);
      rect(p, 248, 188, 26, 92, {fill:"rgba(255,255,255,.06)", stroke:COL.decor, w:1.5, r:0});
      texte(p, 261, 298, "OBSTACLE");
    },
    dessine: function(p, t){
      var s = brasAt(t), m = g(p);
      line(m, s.p0.x,s.p0.y,s.p1.x,s.p1.y,{w:6});
      line(m, s.p1.x,s.p1.y,s.p2.x,s.p2.y,{w:5});
      axe(m, s.p0.x, s.p0.y, 5); axe(m, s.p1.x, s.p1.y, 5);
      var w=34, h=22, x=s.p2.x-w/2, yy=s.p2.y;
      path(m, "M"+x+" "+yy+" h"+w, {stroke:COL.fort, w:3});
      path(m, "M"+x+" "+yy+" v"+(-h)+" h"+w+" v"+h, {stroke:COL.fort, w:3});
      path(m, "M"+x+" "+(yy-h/2)+" h"+w, {stroke:COL.fort, w:1.6, op:.65});
      rect(m, 62, 238, 132, 28, {r:5});
      rect(m, 128, 222, 44, 18, {fill:"rgba(196,205,214,.18)", w:2.2});
      roue(m, 90, 266, 15); roue(m, 168, 266, 15);
    }
  };

  /* ==========================================================================
     3 & 4 — GERBEURS : le discriminant n'est pas la levée, c'est l'opérateur.
     Même geste, même hauteur — mais accompagnant ⇒ R485, porté ⇒ R489 1B.
     ========================================================================== */

  var GB = { cx:178, mat:212, hMin:0.15, hMax:2.45, roue:9 };

  function gerbeurBase(p, m, porte){
    var chassisH = 34, base = SOL - GB.roue*2;
    rect(m, GB.cx-46, base-chassisH, 78, chassisH, {r:4});
    roue(m, GB.cx-32, SOL-GB.roue, GB.roue);
    roue(m, GB.cx+14, SOL-GB.roue, GB.roue);
    /* mât : deux rails jusqu'à 2,60 m */
    line(m, GB.mat-5, base-chassisH, GB.mat-5, y(2.6), {w:3});
    line(m, GB.mat+5, base-chassisH, GB.mat+5, y(2.6), {w:3});
    line(m, GB.mat-5, y(2.6), GB.mat+5, y(2.6), {w:2.4});
    /* roues stabilisatrices sous les longerons */
    roue(m, GB.mat+2, SOL-6, 6);
    return base - chassisH;
  }

  function fourches(m, hm){
    var yy = y(hm);
    line(m, GB.mat, yy, GB.mat+46, yy, {stroke:COL.fort, w:3.4});
    line(m, GB.mat, yy-14, GB.mat, yy, {stroke:COL.fort, w:3});
    axe(m, GB.mat, yy, 3.2);
  }

  function gerbeur(porte){
    return {
      trace: function(t){ return { x: GB.mat+46, y: y(GB.hMin + t*(GB.hMax-GB.hMin)) }; },
      decor: function(p){
        sol(p);
        cote(p, 1.20, "1,20 m", 96, 286);
        cote(p, 2.50, "2,50 m", 96, 286);
      },
      dessine: function(p, t){
        var m = g(p), hm = GB.hMin + t*(GB.hMax-GB.hMin);
        var haut = gerbeurBase(p, m, porte);
        fourches(m, hm);
        if(porte){
          /* plateforme repliable + console : l'opérateur est PORTÉ */
          var px = GB.cx-86, py = SOL - GB.roue*2 - 12;
          rect(m, px, py, 40, 8, {fill:"rgba(238,113,17,.18)", stroke:COL.axe, w:2.4, r:2});
          line(m, px+4, py, px+4, py-52, {w:2.6});
          line(m, px+4, py-52, px+22, py-52, {w:2.6});
          operateur(m, px+20, py, {});
          texte(m, px+20, SOL+16, "PORTÉ", {fill:COL.axe, size:9});
        }else{
          /* timon de conduite : l'opérateur MARCHE à côté */
          var tx = GB.cx-46, ty = haut+6, bx = tx-42, by = ty-30;
          line(m, tx, ty, bx, by, {w:3.2});
          line(m, bx-9, by-5, bx+9, by+5, {w:3, stroke:COL.axe});
          operateur(m, bx-26, SOL, {bras:{x:bx-4, y:by+2}});
          texte(m, bx-26, SOL+16, "ACCOMPAGNANT", {fill:COL.axe, size:9});
        }
      }
    };
  }

  /* ==========================================================================
     5 & 6 — CHARIOTS PORTÉS (R489) : frontal en porte-à-faux vs mât rétractable.
     Le rétractable TRANSLATE son mât avant de lever — c'est ce mouvement, et
     lui seul, qui justifie une catégorie distincte.
     ========================================================================== */

  var CH = {
    gauche:96, droite:186, haut:236, bas:262,   /* châssis */
    mat:190, matHaut:2.75,                       /* mât, au ras du châssis */
    hMin:0.12, hMax:2.55, course:40
  };

  /* Conducteur assis sous le protège-conducteur — pas debout : sur un chariot
     porté c'est la position réelle, et elle distingue l'engin d'un gerbeur. */
  function operateurAssis(m, x, assise){
    var col = COL.fort, w = 2.2;
    m.appendChild(el("circle",{cx:x-5, cy:assise-40, r:6, fill:"none",
      stroke:col, "stroke-width":w}));
    line(m, x-3, assise-33, x, assise-4, {stroke:col, w:w});   /* buste */
    line(m, x, assise-4, x+19, assise-2, {stroke:col, w:w});   /* cuisse */
    line(m, x+19, assise-2, x+21, assise+18, {stroke:col, w:w});/* tibia */
    line(m, x-2, assise-28, x+15, assise-18, {stroke:col, w:w});/* bras au volant */
  }

  function chariotCorps(m){
    rect(m, CH.gauche, CH.haut, CH.droite-CH.gauche, CH.bas-CH.haut, {r:4});
    /* protège-conducteur */
    line(m, CH.gauche+8,  CH.haut, CH.gauche+8,  172, {w:2.6});
    line(m, CH.droite-6,  CH.haut, CH.droite-6,  172, {w:2.6});
    line(m, CH.gauche+4,  172,     CH.droite-2,  172, {w:3});
    /* siège + dossier */
    path(m, "M"+(CH.gauche+14)+" "+CH.haut+" v-8 h24", {w:2.4});
    path(m, "M"+(CH.gauche+14)+" "+(CH.haut-8)+" v-22", {w:2.4});
    operateurAssis(m, CH.gauche+30, CH.haut-8);
    roue(m, CH.gauche+20, SOL-11, 11);
    roue(m, CH.droite-16, SOL-11, 11);
  }

  function matEtFourches(m, xm, hm){
    line(m, xm-5, CH.bas, xm-5, y(CH.matHaut), {w:3});
    line(m, xm+5, CH.bas, xm+5, y(CH.matHaut), {w:3});
    line(m, xm-5, y(CH.matHaut), xm+5, y(CH.matHaut), {w:2.4});
    var yy = y(hm);
    line(m, xm, yy, xm+46, yy, {stroke:COL.fort, w:3.4});
    line(m, xm, yy-14, xm, yy, {stroke:COL.fort, w:3});
    axe(m, xm, yy, 3.2);
  }

  var chariotFrontal = {
    trace: function(t){ return { x: CH.mat+46, y: y(CH.hMin + t*(CH.hMax-CH.hMin)) }; },
    decor: function(p){ sol(p, 60, 300); cote(p, 1.20, "1,20 m", 124, 274); },
    dessine: function(p, t){
      var m = g(p);
      /* contrepoids : c'est lui qui tient l'équilibre en porte-à-faux */
      rect(m, CH.gauche-18, CH.haut+6, 20, CH.bas-CH.haut-6,
           {fill:"rgba(196,205,214,.22)", r:3, w:2.4});
      texte(m, CH.gauche+8, SOL+20, "CONTREPOIDS", {size:8});
      chariotCorps(m);
      matEtFourches(m, CH.mat, CH.hMin + t*(CH.hMax-CH.hMin));
    }
  };

  /* Mât rétractable : le mât avance sur les longerons (phase 1) PUIS lève
     (phase 2). La charge revient entre les roues — pas de porte-à-faux, donc
     pas de contrepoids, et une allée bien plus étroite. */
  function retractableAt(t){
    return {
      dx: Math.min(1, t/0.42) * CH.course,
      h : CH.hMin + Math.max(0, (t-0.42)/0.58) * (CH.hMax-CH.hMin)
    };
  }

  var chariotRetractable = {
    trace: function(t){ var s = retractableAt(t); return { x: CH.mat+s.dx+46, y: y(s.h) }; },
    decor: function(p){ sol(p, 60, 300); cote(p, 1.20, "1,20 m", 124, 274); },
    dessine: function(p, t){
      var m = g(p), s = retractableAt(t);
      chariotCorps(m);
      /* longerons : les bras au sol sur lesquels le mât coulisse */
      line(m, CH.droite-20, SOL-7, CH.mat+CH.course+22, SOL-7, {w:3.4, op:.85});
      roue(m, CH.mat+CH.course+16, SOL-6, 6);
      matEtFourches(m, CH.mat + s.dx, s.h);
      line(m, CH.mat, SOL+9, CH.mat+CH.course, SOL+9,
           {stroke:COL.axe, w:1.4, dash:"3 4", cap:"butt", op:.85});
      texte(m, CH.mat+CH.course/2, SOL+20, "TRANSLATION", {fill:COL.axe, size:8});
    }
  };

  /* ==========================================================================
     7 & 8 — PELLES (R482) : ici le discriminant n'est ni la forme ni le geste,
     c'est la MASSE. Sous 4,5 t l'engin bascule en catégorie A quelle que soit
     sa fonction. Les deux machines font donc exactement le même cycle, à la
     même échelle, avec la même silhouette humaine en référence — seule la
     taille change, et c'est tout le propos.
     ========================================================================== */
  var E482 = 20;                      /* px par mètre, échelle propre au R482 */
  var CYCLE = [                       /* attaque au sol → godet chargé → vidage */
    { a:12, b:-60, c:-75 },
    { a:64, b:-15, c: 25 }
  ];

  function pelle(k){
    var xg = 66, tL = 89*k, tH = 24*k;
    var tourelleH = 28*k, cabineH = 24*k;
    var solTourelle = SOL - tH;
    var P0 = { x: xg + 0.8*tL, y: solTourelle - 20*k };
    var L1 = 100*k, L2 = 52*k, L3 = 26*k;

    function pose(t){
      var A = (CYCLE[0].a + t*(CYCLE[1].a-CYCLE[0].a)) * Math.PI/180,
          B = (CYCLE[0].b + t*(CYCLE[1].b-CYCLE[0].b)) * Math.PI/180,
          C = (CYCLE[0].c + t*(CYCLE[1].c-CYCLE[0].c)) * Math.PI/180;
      var p1 = { x: P0.x + L1*Math.cos(A), y: P0.y - L1*Math.sin(A) };
      var p2 = { x: p1.x + L2*Math.cos(B), y: p1.y - L2*Math.sin(B) };
      return { p1:p1, p2:p2, p3:{ x: p2.x + L3*Math.cos(C), y: p2.y - L3*Math.sin(C) } };
    }

    return {
      trace: function(t){ return pose(t).p3; },
      decor: function(p){
        sol(p, 40, 336);
        /* Silhouette d'échelle : elle ne change pas d'une carte à l'autre.
           C'est elle qui rend la différence de gabarit lisible. */
        operateur(p, 312, SOL, { H: 1.75*E482, stroke:"rgba(255,255,255,.45)" });
        texte(p, 312, SOL+16, "1,75 m", { size:8 });
      },
      dessine: function(p, t){
        var m = g(p), s = pose(t);
        /* chenilles */
        rect(m, xg, solTourelle, tL, tH, { r:tH/2 });
        roue(m, xg + tL*0.18, SOL - tH/2, tH*0.3);
        roue(m, xg + tL*0.82, SOL - tH/2, tH*0.3);
        /* tourelle + cabine */
        rect(m, xg + tL*0.08, solTourelle - tourelleH, tL*0.84, tourelleH, { r:3 });
        rect(m, xg + tL*0.14, solTourelle - tourelleH - cabineH, tL*0.34, cabineH,
             { r:3, fill:"rgba(196,205,214,.2)" });
        /* flèche · balancier */
        line(m, P0.x, P0.y, s.p1.x, s.p1.y, { w:6*k });
        line(m, s.p1.x, s.p1.y, s.p2.x, s.p2.y, { w:5*k });
        /* godet : quadrilatère effilé, ouverture tournée vers l'avant du cycle */
        var dx = s.p3.x - s.p2.x, dy = s.p3.y - s.p2.y,
            d  = Math.hypot(dx, dy) || 1,
            nx = -dy/d, ny = dx/d, ev = 11*k;
        path(m, "M"+s.p2.x+" "+s.p2.y+
                " L"+(s.p2.x+nx*ev)+" "+(s.p2.y+ny*ev)+
                " L"+(s.p3.x+nx*ev*0.45)+" "+(s.p3.y+ny*ev*0.45)+
                " L"+s.p3.x+" "+s.p3.y+" Z",
             { stroke:COL.fort, w:2.6*k, fill:"rgba(255,255,255,.16)" });
        axe(m, P0.x, P0.y, 4*k); axe(m, s.p1.x, s.p1.y, 4*k); axe(m, s.p2.x, s.p2.y, 3.4*k);
      }
    };
  }

  /* ==========================================================================
     9 & 10 — HABILITATION ÉLECTRIQUE BT (NF C18-510)
     Il n'y a pas de machine à représenter : ce que la formation enseigne, c'est
     une géométrie (jusqu'où ai-je le droit d'aller) et une grammaire (que dit
     mon titre). Les deux se dessinent.
     ========================================================================== */

  /* --- Zones d'environnement. L'écart d'échelle entre la DLI (50 m) et la
     DLVR (0,30 m) est de 1 à 166 : impossible à tracer linéairement. On pose
     donc une rupture d'échelle explicite, convention de dessin technique — la
     tricher en silence serait la seule vraie faute. --- */
  var BT = { dli:120, dli2:170, dlvr:258, piece:290, x0:34, x1:272, rupture:145 };

  function btZone(x){ return x < BT.dli ? 0 : (x < BT.dlvr ? 1 : 4); }

  var zonesBT = {
    decor: function(p){
      rect(p, BT.piece, 172, 30, SOL-172, { fill:"rgba(238,113,17,.16)",
        stroke:COL.axe, w:2.4, r:3 });
      path(p, "M"+(BT.piece+17)+" 198 l-9 20 h9 l-8 20", { stroke:COL.axe, w:2.4 });

      line(p, 16, SOL, BT.piece, SOL, { stroke:COL.decor, w:1.5 });
      /* rupture d'échelle : de 50 m a 0,30 m le rapport est de 1 a 166 */
      path(p, "M"+(BT.rupture-14)+" "+SOL+" l7 -9 l7 18 l7 -9",
           { stroke:COL.decor, w:1.5, cap:"butt" });

      [[BT.dli,"DLI \u00b7 50 m"], [BT.dlvr,"DLVR \u00b7 0,30 m"]].forEach(function(d){
        line(p, d[0], 180, d[0], SOL, { stroke:"rgba(255,255,255,.3)", w:1,
          dash:"3 4", cap:"butt" });
        texte(p, d[0], 172, d[1], { size:8.5 });
      });

      texte(p, 68,  SOL+16, "ZONE 0", { size:8.5 });
      texte(p, 195, SOL+16, "ZONE 1", { size:8.5 });
      texte(p, 274, SOL+32, "ZONE 4", { size:8.5 });
    },
    dessine: function(p, t){
      var m = g(p), x = BT.x0 + t*(BT.x1-BT.x0), z = btZone(x);
      var bandes = { 0:[16,BT.dli], 1:[BT.dli,BT.dlvr], 4:[BT.dlvr,BT.piece] };
      var b = bandes[z];
      rect(m, b[0], 204, b[1]-b[0], SOL-204,
           { fill:"rgba(238,113,17,.14)", stroke:"none", w:0, r:2 });
      operateur(m, x, SOL, { H:66 });
      texte(m, x, 196,
            z === 0 ? "hors zone" : (z === 1 ? "voisinage simple" : "voisinage renforc\u00e9"),
            { fill:COL.axe, size:9 });
    }
  };

  /* --- Symbolique du titre : chaque caractère répond à une question
     différente. C'est la confusion n°1 des stagiaires, et elle se dissipe dès
     qu'on sépare les trois colonnes. --- */
  var TITRES = [
    { s:"B0",  r:["Basse tension","Non électricien","—"] },
    { s:"B1V", r:["Basse tension","Exécutant","Au voisinage"] },
    { s:"B2V", r:["Basse tension","Chargé travaux","Au voisinage"] },
    { s:"BR",  r:["Basse tension","Intervention BT","—"] }
  ];

  var symboleBT = {
    decor: function(p){
      texte(p, 170, 62, "CE QUE DIT VOTRE TITRE", { size:9 });
      [[92,"1 · DOMAINE"],[170,"2 · RÔLE"],[248,"3 · ATTRIBUT"]].forEach(function(c){
        texte(p, c[0], 218, c[1], { size:8 });
      });
      line(p, 34, 196, 306, 196, { stroke:"rgba(255,255,255,.14)", w:1, cap:"butt" });
    },
    dessine: function(p, t){
      var m = g(p);
      var T = TITRES[Math.min(TITRES.length-1, Math.floor(t * TITRES.length))];
      var lettres = T.s.split(""), COLS = [76, 170, 264];

      /* Chaque caract\u00e8re est pos\u00e9 SUR sa colonne plut\u00f4t qu'en cha\u00eene centr\u00e9e :
         \u00ab B0 \u00bb n'a que deux caract\u00e8res, et le 3e rep\u00e8re doit rester vide. */
      COLS.forEach(function(cx, i){
        var actif = i < lettres.length;
        if(actif){
          var gros = el("text",{ x:cx, y:150, fill:COL.fort, "text-anchor":"middle",
            "font-family":"Anton, Arial Black, sans-serif", "font-size":70 });
          gros.textContent = lettres[i];
          m.appendChild(gros);
        }
        line(m, cx-32, 196, cx+32, 196,
             { stroke: actif ? COL.axe : "rgba(255,255,255,.12)", w:2.4, cap:"butt" });
        var lg = el("text",{ x:cx, y:242, "text-anchor":"middle",
          fill: actif ? "#E4E9EE" : "#5C6975",
          "font-family":"IBM Plex Mono, monospace", "font-size":8.5 });
        lg.textContent = actif ? T.r[i] : "\u2014";
        m.appendChild(lg);
      });
    }
  };

  /* Cadrage : chaque machine n'occupe pas la même hauteur utile. Un viewBox
     commun laisserait un tiers de vide au-dessus des chariots. */
  var VUE = {
    "pemp-ciseaux"        : "0 14 340 294",
    "pemp-bras"           : "0 95 340 212",
    "gerbeur-accompagnant": "0 148 340 162",
    "gerbeur-porte"       : "0 148 340 162",
    "chariot-frontal"     : "62 146 254 162",
    "chariot-retractable" : "62 146 254 162",
    "pelle-b1"            : "40 128 306 172",
    "pelle-compacte"      : "40 128 306 172",
    "bt-zones"            : "10 140 330 190",
    "bt-symbole"          : "10 56 330 190"
  };

  /* ---------- registre ---------- */
  var MECA = {
    "pemp-ciseaux"        : pempCiseaux,
    "pemp-bras"           : pempBras,
    "gerbeur-accompagnant": gerbeur(false),
    "gerbeur-porte"       : gerbeur(true),
    "chariot-frontal"     : chariotFrontal,
    "chariot-retractable" : chariotRetractable,
    "pelle-b1"            : pelle(1),
    "pelle-compacte"      : pelle(0.55),
    "bt-zones"            : zonesBT,
    "bt-symbole"          : symboleBT
  };

  /* ---------- animation ---------- */
  function courbe(ms){
    var periode = 5600, pause = 0.16, p = (ms % periode)/periode;
    var u = (p < 0.5) ? p/0.5 : 1 - (p-0.5)/0.5;
    u = Math.min(1, Math.max(0, (u - pause)/(1 - 2*pause)));
    return u*u*(3-2*u);                /* smoothstep : départ et arrivée amortis */
  }

  /* `vues` est au niveau du module et la boucle ne démarre qu'une fois : un
     schéma injecté après coup (visionneuse 3D) rejoint le rendu existant au
     lieu d'ouvrir une seconde boucle d'animation. */
  var vues = [], boucleLancee = false;

  /* Un schéma hors de l'écran n'a aucune raison d'être redessiné. Sans ce
     filtre, les dix mécanismes de la page formations tournent soixante fois
     par seconde tant que l'onglet reste ouvert, y compris pendant qu'on lit
     le bas de page. On suit donc ce qui est réellement visible, et la boucle
     se met en sommeil quand plus rien ne l'est. */
  var visibles = null, io = null;

  function observeur(){
    if(io || typeof IntersectionObserver !== "function") return io;
    visibles = [];
    io = new IntersectionObserver(function(entrees){
      entrees.forEach(function(e){
        var i = visibles.indexOf(e.target);
        if(e.isIntersecting){ if(i < 0) visibles.push(e.target); }
        else if(i >= 0){ visibles.splice(i, 1); }
      });
      relance();
    }, { rootMargin:"200px 0px" });
    return io;
  }

  function estVisible(svg){
    return !io || visibles.indexOf(svg) >= 0;
  }

  function monte(svg){
    var nom = svg.getAttribute("data-schema"), meca = MECA[nom];
    if(!meca || svg.hasAttribute("data-schema-monte")) return null;
    svg.setAttribute("data-schema-monte", "");
    if(VUE[nom]) svg.setAttribute("viewBox", VUE[nom]);

    var gDecor = g(svg), gTrace = g(svg), gMeca = g(svg), gTraceHaut = g(svg);
    meca.decor(gDecor);

    /* Trajectoire précalculée : c'est elle qui rend la catégorie évidente.
       Tracée par-dessus le mécanisme pour rester lisible. */
    if(meca.trace){
      var d = "", N = 48;
      for(var i=0;i<=N;i++){
        var pt = meca.trace(i/N);
        d += (i ? " L" : "M") + pt.x.toFixed(1) + " " + pt.y.toFixed(1);
      }
      (meca === pempCiseaux ? gTraceHaut : gTrace).appendChild(el("path",{
        d:d, fill:"none", stroke:COL.axe, "stroke-width":1.8, "stroke-dasharray":"5 5"
      }));
    }

    var vue = { meca:meca, cible:gMeca, svg:svg };
    vues.push(vue);
    if(observeur()) io.observe(svg);
    return vue;
  }

  function rendu(t, tout){
    for(var i = vues.length - 1; i >= 0; i--){
      var v = vues[i];
      /* un schéma retiré du DOM (changement de modèle) sort du rendu */
      if(!v.svg.isConnected){
        vues.splice(i, 1);
        if(io) io.unobserve(v.svg);
        continue;
      }
      if(!tout && !estVisible(v.svg)) continue;
      clear(v.cible); v.meca.dessine(v.cible, t);
    }
  }

  function demarre(){
    var reduit = window.matchMedia &&
                 window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var fige = new URLSearchParams(location.search).get("t");

    if(reduit || fige !== null){
      /* Image figée : on dessine tout, y compris hors écran, puisqu'il n'y
         aura pas de seconde passe au défilement. */
      rendu(fige === null ? 1 : Math.min(1, Math.max(0, parseFloat(fige) || 0)), true);
      return;
    }
    if(boucleLancee) return;
    boucleLancee = true;
    relance();
  }

  var t0 = null, enCours = false;

  /* La phase se lit sur l'horloge du navigateur, pas sur un compteur de
     frames : une mise en sommeil ne décale donc pas l'animation, elle
     reprend là où elle en serait restée. */
  function frame(ts){
    if(t0 === null) t0 = ts;
    rendu(courbe(ts - t0));
    if(io && !visibles.length){ enCours = false; return; }
    requestAnimationFrame(frame);
  }

  function relance(){
    if(!boucleLancee || enCours) return;
    if(io && !visibles.length) return;
    enCours = true;
    requestAnimationFrame(frame);
  }

  /* Rescanne le document : sert au premier chargement comme après injection. */
  function rafraichir(){
    var svgs = document.querySelectorAll("svg[data-schema]:not([data-schema-monte])");
    if(!svgs.length && !vues.length) return;
    Array.prototype.forEach.call(svgs, monte);
    demarre();
  }

  window.HFSchemas = { rafraichir: rafraichir, monte: monte };

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", rafraichir);
  }else{ rafraichir(); }
})();
