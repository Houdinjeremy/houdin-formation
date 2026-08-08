#!/bin/bash
# Prépare dist/ : la démo à publier sur Cloudflare Pages.
#
# Pourquoi un dossier séparé plutôt que publier la racine :
#   1. la racine contient documentation/, .claude/, les sauvegardes et .git —
#      rien de tout ça n'a à se retrouver en ligne ;
#   2. le blocage d'indexation est injecté ICI, jamais dans les sources. Le jour
#      de la vraie mise en ligne, on publie les sources telles quelles et le
#      noindex disparaît de lui-même : rien à penser à retirer.
set -euo pipefail
cd "$(dirname "$0")/.."

rm -rf dist && mkdir -p dist
cp -R css js assets dist/
cp *.html dist/

# 1. Balise noindex, insérée juste après la déclaration d'encodage.
for f in dist/*.html; do
  /usr/bin/sed -i '' \
    's|<meta charset="UTF-8">|<meta charset="UTF-8">\
<meta name="robots" content="noindex, nofollow">|' "$f"
done

# 2. robots.txt — pour les robots qui lisent le fichier avant les pages.
printf 'User-agent: *\nDisallow: /\n' > dist/robots.txt

# 3. En-tête HTTP — la seule des trois protections qui couvre AUSSI les images
#    et les PDF, que la balise <meta> ne peut pas atteindre.
cat > dist/_headers <<'HDR'
/*
  X-Robots-Tag: noindex, nofollow
HDR

# 4. Purge des images qu'aucune page n'appelle. `cp -R assets` prend le dossier
#    entier, or l'ancien picto n'est plus référencé nulle part depuis le
#    changement de logo : inutile de le mettre en ligne.
for img in dist/assets/img/*; do
  name=$(basename "$img")
  if ! grep -rq "$name" dist/*.html dist/css dist/js; then
    rm "$img"; echo "purgé (non référencé) : $name"
  fi
done

# 5. Archive, pour un dépôt manuel (Netlify Drop, envoi au client, sauvegarde).
rm -f houdin-formation-demo.zip
( cd dist && zip -rq ../houdin-formation-demo.zip . -x ".DS_Store" )

echo "dist/ prêt — $(find dist -type f | wc -l | tr -d ' ') fichiers, $(du -sh dist | cut -f1)"
grep -L 'noindex' dist/*.html && echo "⚠ page sans noindex ci-dessus" || echo "noindex présent sur les 5 pages"
# Alerte sur les mentions légales incomplètes. On ne bloque pas la publication
# — une démo doit pouvoir partir — mais rien ne doit sortir en ligne sans que
# ce décompte ait été lu et assumé.
TODO=$(grep -o 'class="todo"' dist/*.html | wc -l | tr -d ' ')
if [ "$TODO" -gt 0 ]; then
  echo "⚠  $TODO information(s) légale(s) manquante(s) — visibles en orange sur le site :"
  grep -l 'class="todo"' dist/*.html | sed 's|^|     |'
fi

echo "archive : houdin-formation-demo.zip ($(du -h houdin-formation-demo.zip | cut -f1))"
