# Ngritja në Oracle Cloud (Always Free)

Qëllimi: shërbimet WMS/WFS të jenë të arritshme nga kushdo, në çdo kohë, pa qenë
kompjuteri yt i ndezur.

---

## 1. Llogaria

Regjistrohu te [cloud.oracle.com](https://cloud.oracle.com) → *Start for free*.

- Kërkohet **kartë krediti** vetëm për verifikim identiteti; burimet Always Free nuk tarifohen.
- **Home Region zgjidhet një herë e përgjithmonë** dhe nuk ndryshohet më. Për Kosovën zgjidh
  një rajon të afërt evropian (Frankfurt, Amsterdam ose Zurich) — vonesa do të jetë më e vogël.

## 2. Krijo makinën virtuale

*Compute → Instances → Create Instance*

| Cilësimi | Vlera |
|---|---|
| Image | **Ubuntu 24.04** (ose 22.04) |
| Shape | **VM.Standard.A1.Flex** (Ampere, ARM) |
| OCPU / RAM | 2 OCPU / 12 GB (brenda kuotës falas; edhe 1/6 mjafton) |
| SSH keys | ruaj çelësin privat — pa të nuk hyn dot |

**Nëse del "Out of capacity":** është e zakonshme te makinat ARM. Provo një *Availability
Domain* tjetër, ul OCPU-të në 1, ose riprovo më vonë. Kalimi i llogarisë në *Pay As You Go*
(burimet Always Free mbeten falas) e rrit ndjeshëm mundësinë e krijimit.

## 3. Hap portën te Security List

Porti duhet hapur në **dy** vende. Atë brenda makinës (`iptables`) e bën vetë
`setup-server.sh` te hapi tjetër; këtë këtu duhet ta bësh ti nga paneli, sepse është
cilësim i rrjetit, jo i serverit:

*Networking → Virtual Cloud Networks → VCN-ja jote → Security Lists → Default → Add Ingress Rules*

| Source CIDR | Protokolli | Porti |
|---|---|---|
| `0.0.0.0/0` | TCP | `8080` |
| `0.0.0.0/0` | TCP | `80` dhe `443` (vetëm nëse më vonë shton HTTPS) |

Ky është hapi që harrohet më shpesh dhe bën që gjithçka të duket e prishur: serveri punon,
por asgjë nuk hapet nga jashtë.

## 4. Kopjo skedarët dhe nis gjithçka me një komandë

Nga kompjuteri yt:

```bash
scp -i çelesi.key -r geoserver/ ubuntu@IP-PUBLIKE:~/thevillage
```

Në server:

```bash
cd ~/thevillage && sudo bash setup-server.sh
```

Kaq. `setup-server.sh` i bën vetë të gjitha hapat që dikur ishin manualë:

| Hapi | Çfarë bën |
|---|---|
| Arkitektura | zgjedh `docker-compose.arm64.yml` te ARM, `docker-compose.yml` te amd64 |
| Docker | e instalon nëse mungon |
| Fjalëkalimi | krijon `.env` me fjalëkalim të rastësishëm 20-shkronjësh (nuk e mbishkruan nëse ekziston) |
| Portat | shton rregullin `iptables` brenda makinës dhe e ruan |
| GeoServer | e nis dhe pret derisa të përgjigjet (deri 5 min) |
| Shtresat | ekzekuton `publish-layers.sh` me shtegun e duhur të GeoPackage-ut |
| Proxy Base URL | e zbulon IP-në publike dhe e vendos pa i prishur settings-at e tjera |
| Verifikimi | numëron shtresat te GetCapabilities **pa fjalëkalim** — pra ashtu si i sheh një i huaj |

Në fund shtyp adresat e gata dhe fjalëkalimin e adminit. Skripti është idempotent —
mund ta ekzekutosh sërish pa frikë.

> Imazhi zyrtar OSGeo ndërtohet vetëm për amd64 dhe nuk niset në Ampere; prandaj te
> ARM përdoret `kartoza/geoserver`. Skripti e zgjedh vetë — s'ke pse ta mendosh.

## 5. Provo nga jashtë

```
http://IP-PUBLIKE:8080/geoserver/thevillage/wms?service=WMS&version=1.3.0&request=GetCapabilities
http://IP-PUBLIKE:8080/geoserver/thevillage/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

Këto adresa mund t'ia japësh profesorit për QGIS.

---

## Dy gjëra pa të cilat nuk duhet lënë online

**Fjalëkalimi.** Serveri do të jetë i hapur për krejt internetin. `setup-server.sh` e krijon
vetë një fjalëkalim të rastësishëm dhe e ruan te `.env` (me leje `600`), kështu që nuk mbetet
kurrë `geoserver`. Mos e ngarko `.env` në git — është te `.gitignore`.

**Proxy Base URL.** Pa të, në disa konfigurime GetCapabilities kthen URL-a të brendshme që
klienti nuk i arrin dot. Skripti e zbulon IP-në publike dhe e vendos vetë; ndryshoje sërish
nëse më vonë kalon në HTTPS me domen (*Settings → Global*).

*(Ki parasysh: mos e ndrysho këtë cilësim përmes REST me një trup të pjesshëm JSON — ai
zëvendëson krejt bllokun e settings-ave dhe fshin fusha si `charset`, çka nxjerr gabime te
të gjitha shtresat. Skripti prandaj i lexon settings-at të plota, ndryshon vetëm një fushë
dhe i kthen të plota.)*

## HTTPS (nevojitet vetëm nëse WebGIS-i do t'i thërrasë shërbimet)

Faqja në GitHub Pages është HTTPS dhe shfletuesi bllokon kërkesat drejt HTTP. Me një emër
domeni që tregon nga IP-ja publike, shto Caddy-n sipas seksionit përkatës te `README.md` —
certifikatën e merr vetë.
