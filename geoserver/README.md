# Publikimi i shtresave si WMS / WFS

Kjo dosje përmban gjithçka duhet për t'i publikuar 10 shtresat e The Village si shërbime
OGC (WMS + WFS) përmes GeoServer-it në një server cloud me URL publike.

| Skedari | Roli |
|---|---|
| `thevillage.gpkg` | Të 10 shtresat në një GeoPackage (WGS84 / EPSG:4326) |
| `setup-server.sh` | **Ngritja e plotë me një komandë** — Docker, GeoServer, shtresat, portat, verifikimi |
| `docker-compose.yml` | GeoServer 2.25.3 me CORS të aktivizuar |
| `.env.example` | Shablloni i kredencialeve — kopjoje si `.env` |
| `publish-layers.sh` | Krijon workspace, datastore dhe të 10 shtresat përmes REST API |
| `epsg.properties` | EPSG:9141 (KOSOVAREF01), nëse GeoServer nuk e njeh |

---

## Pa server fare — nëse mjafton "t'i hapë profesori në QGIS"

Nuk të duhet as server e as llogari cloud nëse qëllimi është thjesht që dikush tjetër t'i
hapë shtresat në QGIS nga kudo. GeoPackage-u ndodhet tashmë në GitHub Pages, dhe QGIS-i
di t'i lexojë skedarët drejtpërdrejt nga interneti:

**Një adresë e vetme, të 10 shtresat.** Në QGIS: *Layer → Add Layer → Add Vector Layer*,
te **Source Type** zgjidh **Protocol: HTTP(S)**, dhe vendos:

```
/vsicurl/https://genitaselmani.github.io/the-village-webgis/geoserver/thevillage.gpkg
```

Ose një shtresë e vetme si GeoJSON, p.sh.:

```
https://genitaselmani.github.io/the-village-webgis/data/Bizniset.geojson
```

Kjo funksionon përgjithmonë, falas, pa asnjë kompjuter të ndezur, dhe jep gjeometrinë
**bashkë me atributet** — pra po aq sa jep WFS-ja në praktikë.

> **Kufizimi, ndershëm:** kjo nuk është protokolli WMS/WFS. Nuk ka GetCapabilities dhe
> nuk mund t'i filtrosh objektet nga serveri. Nëse detyra e kërkon shprehimisht publikimin
> si shërbime OGC, atëherë duhet GeoServer-i sipas hapave më poshtë.

Teknikisht funksionon sepse GitHub Pages i përgjigjet kërkesave me interval bajtash
(`Accept-Ranges: bytes`, HTTP 206) — pa këtë, GDAL nuk do ta lexonte dot GeoPackage-un
nga larg pa e shkarkuar të tërin.

---

> **Për Oracle Cloud (ARM):** ndiq [ORACLE-CLOUD.md](ORACLE-CLOUD.md) dhe përdor
> `docker-compose.arm64.yml` — imazhi zyrtar OSGeo është vetëm amd64.

## 1. Merr një server (vetëm nëse të duhen WMS/WFS të vërteta)

| Opsioni | Kostoja | Shënim |
|---|---|---|
| Oracle Cloud — Always Free | falas përgjithmonë | 4 CPU ARM + 24 GB RAM; mjaftueshëm me tepri |
| Hetzner / Contabo VPS | ~4–6 €/muaj | konfigurim më i thjeshtë |

Kërkesa minimale: **2 GB RAM**, Ubuntu 22.04+, portat **80**, **443** dhe **8080** të hapura.

## 2. Kopjo skedarët dhe nis gjithçka

Nga kompjuteri yt:

```bash
scp -r geoserver/ user@IP-E-SERVERIT:~/thevillage-geoserver
```

Në server, një komandë e vetme:

```bash
cd ~/thevillage-geoserver && sudo bash setup-server.sh
```

Instalon Docker-in, krijon fjalëkalimin, zgjedh imazhin sipas arkitekturës, nis GeoServer-in,
hap portën, publikon të 10 shtresat, vendos Proxy Base URL dhe në fund verifikon se sa shtresa
duken **pa fjalëkalim**. Idempotent — ekzekutoje sërish pa frikë.

## 3. Verifiko

Skripti e bën vetë këtë kontroll dhe i shtyp adresat në fund. Për ta parë me sy:

```
http://IP-E-SERVERIT:8080/geoserver/thevillage/wms?service=WMS&version=1.3.0&request=GetCapabilities
http://IP-E-SERVERIT:8080/geoserver/thevillage/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

---

## Si i hap dikush tjetër shtresat në QGIS

Personi tjetër nuk ka nevojë për fjalëkalim — shtresat janë të lexueshme anonimisht.
Mjafton t'i dërgosh njërën nga dy adresat e mësipërme (pa pjesën `?service=...`,
QGIS e shton vetë):

```
http://IP-E-SERVERIT:8080/geoserver/thevillage/wms
http://IP-E-SERVERIT:8080/geoserver/thevillage/wfs
```

**WMS — harta e vizatuar (e shpejtë, për pamje):**
1. `Layer → Add Layer → Add WMS/WMTS Layer…`
2. `New` → jep një emër (p.sh. *The Village*) → ngjit URL-në e WMS → `OK`
3. `Connect` → shfaqen të 10 shtresat → zgjidh dhe `Add`

**WFS — të dhënat vektoriale (me atribute, të përzgjedhshme):**
1. `Layer → Add Layer → Add WFS Layer…`
2. `New` → ngjit URL-në e WFS → `OK` → `Connect`
3. Zgjidh shtresat → `Add`

Me WFS-në personi merr gjeometrinë dhe atributet e vërteta (emrin e biznesit, kategorinë,
llojin e stacionit) dhe mund t'i filtrojë a t'i eksportojë. Me WMS merr vetëm pamjen.

Shtresat ofrohen në shumë sisteme referuese, përfshirë **EPSG:9141 (KOSOVAREF01 /
Balkans zone 7)** dhe EPSG:4326.

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
