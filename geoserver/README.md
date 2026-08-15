# Publikimi i shtresave si WMS / WFS

Kjo dosje përmban gjithçka duhet për t'i publikuar 10 shtresat e The Village si shërbime
OGC (WMS + WFS) përmes GeoServer-it në një server cloud me URL publike.

| Skedari | Roli |
|---|---|
| `thevillage.gpkg` | Të 10 shtresat në një GeoPackage (WGS84 / EPSG:4326) |
| `docker-compose.yml` | GeoServer 2.25.3 me CORS të aktivizuar |
| `.env.example` | Shablloni i kredencialeve — kopjoje si `.env` |
| `publish-layers.sh` | Krijon workspace, datastore dhe të 10 shtresat përmes REST API |
| `epsg.properties` | EPSG:9141 (KOSOVAREF01), nëse GeoServer nuk e njeh |

---

> **Për Oracle Cloud (ARM):** ndiq [ORACLE-CLOUD.md](ORACLE-CLOUD.md) dhe përdor
> `docker-compose.arm64.yml` — imazhi zyrtar OSGeo është vetëm amd64.

## 1. Merr një server

| Opsioni | Kostoja | Shënim |
|---|---|---|
| Oracle Cloud — Always Free | falas përgjithmonë | 4 CPU ARM + 24 GB RAM; mjaftueshëm me tepri |
| Hetzner / Contabo VPS | ~4–6 €/muaj | konfigurim më i thjeshtë |

Kërkesa minimale: **2 GB RAM**, Ubuntu 22.04+, portat **80**, **443** dhe **8080** të hapura.

## 2. Instalo Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER   # pastaj dil e hyr sërish
```

## 3. Kopjo skedarët dhe nise GeoServer-in

Nga kompjuteri yt:

```bash
scp -r geoserver/ user@IP-E-SERVERIT:~/thevillage-geoserver
```

Në server:

```bash
cd ~/thevillage-geoserver
cp .env.example .env
nano .env          # vendos një fjalëkalim të fortë
docker compose up -d
docker compose logs -f    # prit derisa të shfaqet "Server startup"
```

## 4. Publiko shtresat

```bash
GEOSERVER_URL=http://localhost:8080/geoserver \
GEOSERVER_USER=admin \
GEOSERVER_PASS='fjalekalimi-yt' \
bash publish-layers.sh
```

Skripti është idempotent — ri-ekzekutimi nuk prish asgjë.

## 5. Verifiko

```
http://IP-E-SERVERIT:8080/geoserver/thevillage/wms?service=WMS&version=1.3.0&request=GetCapabilities
http://IP-E-SERVERIT:8080/geoserver/thevillage/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

Provoji edhe në QGIS: `Layer → Add Layer → Add WMS/WMTS Layer` me të njëjtin URL.

---

## ⚠️ HTTPS është i domosdoshëm nëse WebGIS-i thërret shërbimet

Faqja në GitHub Pages shërbehet me **HTTPS**. Shfletuesi i **bllokon** kërkesat drejt një
serveri **HTTP** nga një faqe HTTPS (*mixed content*) — shërbimet do të duken "të vdekura"
edhe pse serveri punon. Për vetë-testim me QGIS kjo s'ka rëndësi; për WebGIS-in po.

Zgjidhja: një emër domeni + Caddy, që e merr certifikatën vetë:

```yaml
# shtoje te docker-compose.yml
  caddy:
    image: caddy:2
    restart: unless-stopped
    ports: ["80:80", "443:443"]
    volumes:
      - ./Caddyfile:/etc/caddy/Caddyfile
      - caddy_data:/data
volumes:
  caddy_data:
```

```
# Caddyfile
gis.domeni-yt.com {
    reverse_proxy geoserver:8080
}
```

Pastaj shërbimet arrihen në `https://gis.domeni-yt.com/geoserver/...`.

---

## Sistemi referues

Të dhënat ruhen në **EPSG:4326** (WGS84). GeoServer i riprojekton vetë në çdo CRS që kërkon
klienti, përfshirë **EPSG:9141 (KOSOVAREF01 / Balkans zone 7)** — mjafton ta shtosh te lista
e SRS-ve të lejuara për secilën shtresë.

Nëse te paneli i administrimit `9141` nuk gjendet fare (versionet e vjetra të GeoServer-it),
kopjo `epsg.properties` te `data_dir/user_projections/` dhe rinis kontejnerin.

## Stilet

Skedarët `.sld` në rrënjë të projektit (`rruget.sld`, `Parkingu.sld`, `hekurudha.sld`,
`pike_informuse.sld`, `Biznesetllogo.sld`, `Objektet_jasht.sld`) ngarkohen te
`Styles → Add a new style` dhe caktohen si stil parazgjedhës i shtresës përkatëse.

Tri shtresat e reja — transporti, emergjenca dhe institucionet — **nuk kanë ende SLD**;
pa të, GeoServer u vë një stil gri të parazgjedhur.
