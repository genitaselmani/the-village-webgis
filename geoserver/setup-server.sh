#!/usr/bin/env bash
# Ngritja e plotë e GeoServer-it në një server të freskët Ubuntu, me një komandë të vetme.
#
# Bën gjithçka: instalon Docker-in, krijon fjalëkalimin, nis GeoServer-in me imazhin e
# duhur për arkitekturën e serverit, hap portat, publikon të 10 shtresat dhe verifikon
# që WMS-ja e WFS-ja përgjigjen vërtet.
#
#   sudo bash setup-server.sh
#
# Idempotent: ekzekutoje sa herë të duash — nuk e prish konfigurimin ekzistues.

set -euo pipefail

cd "$(dirname "$0")"

PORT=8080
say() { printf '\n\033[1m==> %s\033[0m\n' "$*"; }
warn() { printf '\033[33m    %s\033[0m\n' "$*"; }

[ "$(id -u)" -eq 0 ] || { echo "Ekzekutoje me sudo: sudo bash setup-server.sh" >&2; exit 1; }
[ -f thevillage.gpkg ] || { echo "thevillage.gpkg mungon te kjo dosje." >&2; exit 1; }

# ---------------------------------------------------------------- 1. Arkitektura
# Imazhi zyrtar OSGeo ndërtohet vetëm për amd64. Serverat falas të Oracle-it janë
# Ampere (ARM64) dhe kërkojnë kartoza/geoserver, i cili e mban data_dir-in te një
# shteg tjetër — prandaj edhe GPKG_PATH ndryshon sipas arkitekturës.
case "$(uname -m)" in
    aarch64|arm64)
        COMPOSE_FILE=docker-compose.arm64.yml
        GPKG_IN_CONTAINER=/opt/geoserver/data_dir/data/thevillage.gpkg
        ARCH_NAME="ARM64 (kartoza/geoserver)"
        ;;
    x86_64|amd64)
        COMPOSE_FILE=docker-compose.yml
        GPKG_IN_CONTAINER=/opt/geoserver_data/data/thevillage.gpkg
        ARCH_NAME="amd64 (docker.osgeo.org/geoserver)"
        ;;
    *)
        echo "Arkitekturë e panjohur: $(uname -m)" >&2; exit 1 ;;
esac
say "Arkitektura: $ARCH_NAME"

# ---------------------------------------------------------------- 2. Docker
if command -v docker >/dev/null 2>&1; then
    say "Docker ekziston — po kapërcehet instalimi"
else
    say "Po instalohet Docker"
    curl -fsSL https://get.docker.com | sh
fi
systemctl enable --now docker >/dev/null 2>&1 || true

# ---------------------------------------------------------------- 3. Fjalëkalimi
if [ -f .env ]; then
    say "Skedari .env ekziston — fjalëkalimi ruhet i pandryshuar"
else
    say "Po krijohet .env me fjalëkalim të rastësishëm"
    PASS="$(head -c 18 /dev/urandom | base64 | tr -d '/+=' | head -c 20)"
    printf 'GEOSERVER_ADMIN_USER=admin\nGEOSERVER_ADMIN_PASSWORD=%s\n' "$PASS" > .env
    chmod 600 .env
fi
# shellcheck disable=SC1091
set -a; . ./.env; set +a
GS_PASS="$GEOSERVER_ADMIN_PASSWORD"

# ---------------------------------------------------------------- 4. Portat
# Imazhet Ubuntu të Oracle Cloud-it vijnë me rregulla iptables që bllokojnë gjithçka
# përveç SSH-së. Pa këtë hap porti duket i hapur te paneli, por mbetet i mbyllur.
say "Po hapet porti $PORT te muri i zjarrit i makinës"
if command -v iptables >/dev/null 2>&1; then
    if ! iptables -C INPUT -p tcp --dport "$PORT" -j ACCEPT 2>/dev/null; then
        iptables -I INPUT 6 -m state --state NEW -p tcp --dport "$PORT" -j ACCEPT 2>/dev/null \
            || iptables -I INPUT -p tcp --dport "$PORT" -j ACCEPT
    fi
    command -v netfilter-persistent >/dev/null 2>&1 && netfilter-persistent save >/dev/null 2>&1 || true
fi
command -v ufw >/dev/null 2>&1 && ufw allow "$PORT"/tcp >/dev/null 2>&1 || true
warn "Kujdes: portin $PORT duhet ta hapësh EDHE te Security List i VCN-së në panelin e Oracle-it."

# ---------------------------------------------------------------- 5. Nisja
say "Po niset GeoServer-i ($COMPOSE_FILE)"
docker compose -f "$COMPOSE_FILE" up -d

GS_LOCAL="http://localhost:$PORT/geoserver"
say "Po pritet që GeoServer-i të përgjigjet (deri në 5 minuta)"
for i in $(seq 1 60); do
    code=$(curl -s -o /dev/null -w '%{http_code}' -u "admin:$GS_PASS" "$GS_LOCAL/rest/about/version.json" || true)
    if [ "$code" = "200" ]; then echo "    gati pas ~$((i*5))s"; break; fi
    [ "$i" = "60" ] && { echo "GeoServer-i nuk u ngrit. Shiko: docker compose -f $COMPOSE_FILE logs" >&2; exit 1; }
    sleep 5
done

# ---------------------------------------------------------------- 6. Shtresat
say "Po publikohen shtresat"
GEOSERVER_URL="$GS_LOCAL" \
GEOSERVER_USER=admin \
GEOSERVER_PASS="$GS_PASS" \
GPKG_PATH="file://$GPKG_IN_CONTAINER" \
bash publish-layers.sh

# ---------------------------------------------------------------- 7. Proxy Base URL
# Pa të, GetCapabilities kthen adresa të brendshme (localhost) që klienti nuk i arrin.
# Settings-at lexohen të plota, ndryshohet vetëm një fushë dhe kthehen të plota:
# një PUT me trup të pjesshëm i fshin fushat e tjera (p.sh. charset) dhe i prish
# të gjitha shtresat me NullPointerException.
PUBLIC_IP="$(curl -s --max-time 10 https://api.ipify.org || true)"
if [ -n "$PUBLIC_IP" ] && command -v python3 >/dev/null 2>&1; then
    say "Po vendoset Proxy Base URL → http://$PUBLIC_IP:$PORT/geoserver"
    if curl -sf -u "admin:$GS_PASS" "$GS_LOCAL/rest/settings.json" -o /tmp/gs-settings.json; then
        PUBLIC_IP="$PUBLIC_IP" PORT="$PORT" python3 - <<'PY'
import json, os
p = "/tmp/gs-settings.json"
with open(p) as f:
    s = json.load(f)
s["global"]["settings"]["proxyBaseUrl"] = "http://%s:%s/geoserver" % (os.environ["PUBLIC_IP"], os.environ["PORT"])
s["global"]["settings"].setdefault("charset", "UTF-8")
s["global"]["settings"].setdefault("numDecimals", 8)
with open(p, "w") as f:
    json.dump(s, f)
PY
        curl -sf -u "admin:$GS_PASS" -X PUT -H "Content-Type: application/json" \
            -d @/tmp/gs-settings.json "$GS_LOCAL/rest/settings" >/dev/null \
            && echo "    u vendos" || warn "nuk u vendos — vendose me dorë te Settings » Global"
        rm -f /tmp/gs-settings.json
    fi
else
    warn "IP-ja publike nuk u zbulua — vendose Proxy Base URL me dorë te Settings » Global"
fi

# ---------------------------------------------------------------- 8. Verifikimi
say "Verifikim"
WMS="$GS_LOCAL/thevillage/wms?service=WMS&version=1.3.0&request=GetCapabilities"
WFS="$GS_LOCAL/thevillage/wfs?service=WFS&version=2.0.0&request=GetCapabilities"

# Pa -u: kështu provohet pikërisht ajo që sheh një i huaj, pa fjalëkalim.
n_wms=$(curl -s "$WMS" | grep -c '<Name>thevillage:' || true)
n_wfs=$(curl -s "$WFS" | grep -c '<Name>thevillage:' || true)
echo "    WMS: $n_wms shtresa të dukshme pa fjalëkalim"
echo "    WFS: $n_wfs shtresa të dukshme pa fjalëkalim"

if [ "$n_wms" -lt 10 ] || [ "$n_wfs" -lt 10 ]; then
    warn "Priteshin 10 shtresa. Shiko: docker compose -f $COMPOSE_FILE logs --tail 50"
fi

cat <<EOF

────────────────────────────────────────────────────────────────
 GATI. Adresat për QGIS (jepja kujtdo — nuk duhet fjalëkalim):

   WMS   http://${PUBLIC_IP:-IP-E-SERVERIT}:$PORT/geoserver/thevillage/wms
   WFS   http://${PUBLIC_IP:-IP-E-SERVERIT}:$PORT/geoserver/thevillage/wfs

 Paneli i administrimit (vetëm për ty):
   http://${PUBLIC_IP:-IP-E-SERVERIT}:$PORT/geoserver
   përdoruesi: admin
   fjalëkalimi: $GS_PASS   (ruhet te .env)

 Nëse adresat nuk hapen nga jashtë, mungon rregulli te Security List
 i VCN-së: Networking » Virtual Cloud Networks » VCN » Security Lists
 » Default » Add Ingress Rules → 0.0.0.0/0, TCP, porti $PORT.
────────────────────────────────────────────────────────────────
EOF
