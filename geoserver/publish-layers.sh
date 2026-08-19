#!/usr/bin/env bash
# Publikon të gjitha shtresat e The Village në GeoServer përmes REST API.
# Idempotent: mund ta ekzekutosh sa herë të duash pa e prishur konfigurimin ekzistues.
#
# Përdorimi:
#   GEOSERVER_URL=http://IP-JOTE:8080/geoserver \
#   GEOSERVER_USER=admin GEOSERVER_PASS=fjalekalimi \
#   ./publish-layers.sh

set -euo pipefail

GS_URL="${GEOSERVER_URL:-http://localhost:8080/geoserver}"
GS_USER="${GEOSERVER_USER:-admin}"
GS_PASS="${GEOSERVER_PASS:?Vendos GEOSERVER_PASS}"

WORKSPACE="thevillage"
NAMESPACE="https://genitaselmani.github.io/the-village-webgis"
STORE="thevillage_gpkg"
# Shtegu i GeoPackage-ut ASHTU SIÇ E SHEH GEOSERVER-i (jo si e sheh ky skript).
#   Docker  → /opt/geoserver_data/data/thevillage.gpkg  (parazgjedhje)
#   Windows → GPKG_PATH='C:/rruga/e/plote/thevillage.gpkg'
# KUJDES: përdor GJITHMONË vija të pjerrëta përpara (/). Backslash-et e Windows-it
# janë sekuenca ikjeje në JSON dhe shtegu arrin i gëlltitur te GeoServer-i.
GPKG_PATH="${GPKG_PATH:-file:///opt/geoserver_data/data/thevillage.gpkg}"
GPKG_PATH="${GPKG_PATH//\\//}"

LAYERS=(
  Kufiri_village
  Parkingu
  Rruget
  RailLines_FR
  Bizneset_ndara
  Bizniset
  Pike_informuse
  Sherbimet_e_transportit
  Sherbimet_e_emergjences
  Institucionet_administrative
)

curl_gs() { curl -sS -u "$GS_USER:$GS_PASS" "$@"; }

# Kthen kodin HTTP pa e shtypur trupin — për të dalluar "ekziston" nga "nuk ekziston".
http_code() { curl -sS -o /dev/null -w "%{http_code}" -u "$GS_USER:$GS_PASS" "$@"; }

# Si curl_gs, por ndalon me mesazh nëse GeoServer-i e refuzon kërkesën. Pa këtë,
# një shteg i gabuar kalon në heshtje dhe shtresat duken "të publikuara" kur s'janë.
post_or_fail() {
  local desc="$1"; shift
  local body code
  body=$(curl -sS -w $'\n%{http_code}' -u "$GS_USER:$GS_PASS" "$@")
  code="${body##*$'\n'}"
  if [ "$code" -ge 400 ] 2>/dev/null; then
    echo "  GABIM te $desc (HTTP $code):" >&2
    echo "${body%$'\n'*}" | head -3 >&2
    exit 1
  fi
}

echo "==> GeoServer: $GS_URL"

# 1) Workspace
if [ "$(http_code "$GS_URL/rest/workspaces/$WORKSPACE")" = "200" ]; then
  echo "  workspace '$WORKSPACE' ekziston"
else
  curl_gs -X POST -H "Content-Type: application/json" \
    -d "{\"workspace\":{\"name\":\"$WORKSPACE\"}}" \
    "$GS_URL/rest/workspaces" >/dev/null
  echo "  workspace '$WORKSPACE' u krijua"
fi

# Namespace-i i lidhur me workspace-in (URI-ja që del në GetCapabilities).
curl_gs -X PUT -H "Content-Type: application/json" \
  -d "{\"namespace\":{\"prefix\":\"$WORKSPACE\",\"uri\":\"$NAMESPACE\"}}" \
  "$GS_URL/rest/namespaces/$WORKSPACE" >/dev/null || true

# 2) Datastore mbi GeoPackage
if [ "$(http_code "$GS_URL/rest/workspaces/$WORKSPACE/datastores/$STORE")" = "200" ]; then
  echo "  datastore '$STORE' ekziston"
else
  post_or_fail "krijimin e datastore-it" -X POST -H "Content-Type: application/json" -d "{
    \"dataStore\": {
      \"name\": \"$STORE\",
      \"connectionParameters\": {
        \"entry\": [
          {\"@key\":\"database\",\"\$\":\"$GPKG_PATH\"},
          {\"@key\":\"dbtype\",\"\$\":\"geopkg\"}
        ]
      }
    }
  }" "$GS_URL/rest/workspaces/$WORKSPACE/datastores"
  echo "  datastore '$STORE' u krijua"
fi

# 3) Shtresat
for layer in "${LAYERS[@]}"; do
  if [ "$(http_code "$GS_URL/rest/workspaces/$WORKSPACE/datastores/$STORE/featuretypes/$layer")" = "200" ]; then
    echo "  shtresa '$layer' ekziston"
    continue
  fi
  # srs=EPSG:4326 me reprojectionPolicy FORCE_DECLARED: të dhënat janë në WGS84,
  # ndërsa GeoServer i riprojekton vetë në çdo CRS që kërkon klienti (edhe në 9141).
  post_or_fail "publikimin e shtresës '$layer'" -X POST -H "Content-Type: application/json" -d "{
    \"featureType\": {
      \"name\": \"$layer\",
      \"nativeName\": \"$layer\",
      \"srs\": \"EPSG:4326\",
      \"projectionPolicy\": \"FORCE_DECLARED\",
      \"enabled\": true
    }
  }" "$GS_URL/rest/workspaces/$WORKSPACE/datastores/$STORE/featuretypes"
  echo "  shtresa '$layer' u publikua"
done

# 4) Stilet
# Pa këto GeoServer-i i vizaton të gjitha shtresat me stilin gri të parazgjedhur, çka do të
# thotë se WMS-ja nuk do t'i ngjante aspak hartës në WebGIS. Skedarët .sld janë të njëjtët
# që përdor QGIS-i te projekti origjinal.
#
# Emri i skedarit → shtresa së cilës i caktohet si stil parazgjedhës.
# Shënim: Biznesetllogo.sld nuk përdoret këtu. Ai mbështetet te variabla ${logo_path} e
# QGIS-it, të cilën GeoServer-i nuk e njeh — pikat do të dilnin bosh. Në vend të tij përdoret
# bizniset_kategori.sld, që i ngjyros bizneset sipas fushës 'Kategoria' me pikërisht ngjyrat
# e legjendës së WebGIS-it.
STYLE_FILES=(
  "rruget.sld:Rruget"
  "Parkingu.sld:Parkingu"
  "hekurudha.sld:RailLines_FR"
  "pike_informuse.sld:Pike_informuse"
  "bizniset_kategori.sld:Bizniset"
)

STYLE_DIR="$(dirname "$0")/styles"
if [ -d "$STYLE_DIR" ]; then
  echo ""
  echo "==> Stilet"
  for entry in "${STYLE_FILES[@]}"; do
    file="${entry%%:*}"; target="${entry##*:}"
    path="$STYLE_DIR/$file"
    [ -f "$path" ] || { echo "  '$file' mungon — kapërcehet"; continue; }
    style="${file%.sld}"

    # SLD 1.1 (Symbology Encoding) do content-type të vetin; 1.0 do tjetrin. Provohen të dy.
    if [ "$(http_code "$GS_URL/rest/workspaces/$WORKSPACE/styles/$style")" = "200" ]; then
      curl_gs -X PUT -H "Content-Type: application/vnd.ogc.se+xml" --data-binary "@$path" \
        "$GS_URL/rest/workspaces/$WORKSPACE/styles/$style" >/dev/null 2>&1 ||
      curl_gs -X PUT -H "Content-Type: application/vnd.ogc.sld+xml" --data-binary "@$path" \
        "$GS_URL/rest/workspaces/$WORKSPACE/styles/$style" >/dev/null
      echo "  stili '$style' u përditësua"
    else
      curl_gs -X POST -H "Content-Type: application/vnd.ogc.se+xml" --data-binary "@$path" \
        "$GS_URL/rest/workspaces/$WORKSPACE/styles?name=$style" >/dev/null 2>&1 ||
      curl_gs -X POST -H "Content-Type: application/vnd.ogc.sld+xml" --data-binary "@$path" \
        "$GS_URL/rest/workspaces/$WORKSPACE/styles?name=$style" >/dev/null
      echo "  stili '$style' u ngarkua"
    fi

    # Caktimi si stil parazgjedhës i shtresës. Këtu PUT-i i pjesshëm është i sigurt:
    # ndryshon vetëm defaultStyle dhe s'prek pjesën tjetër të konfigurimit të shtresës.
    curl_gs -X PUT -H "Content-Type: application/json" \
      -d "{\"layer\":{\"defaultStyle\":{\"name\":\"$WORKSPACE:$style\"}}}" \
      "$GS_URL/rest/layers/$WORKSPACE:$target" >/dev/null
    echo "    → caktuar si parazgjedhje për '$target'"
  done
  echo "  (Kufiri_village, Bizneset_ndara dhe tri shtresat e shërbimeve nuk kanë .sld — mbeten me stilin gri)"
fi

echo ""
echo "==> Gati. Endpoint-et:"
echo "  WMS  GetCapabilities: $GS_URL/$WORKSPACE/wms?service=WMS&version=1.3.0&request=GetCapabilities"
echo "  WFS  GetCapabilities: $GS_URL/$WORKSPACE/wfs?service=WFS&version=2.0.0&request=GetCapabilities"
