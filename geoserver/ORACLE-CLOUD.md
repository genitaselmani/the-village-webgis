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

## 3. Hap portat — në DY vende

Ky është hapi që harrohet më shpesh dhe bën që gjithçka të duket e prishur.

**a) Security List e rrjetit virtual**

*Networking → Virtual Cloud Networks → VCN-ja jote → Security Lists → Default → Add Ingress Rules*

| Source CIDR | Protokolli | Porti |
|---|---|---|
| `0.0.0.0/0` | TCP | `8080` |
| `0.0.0.0/0` | TCP | `80` dhe `443` (për HTTPS më vonë) |

**b) Muri i zjarrit brenda vetë makinës**

Imazhet Ubuntu të Oracle-it vijnë me rregulla `iptables` që bllokojnë gjithçka përveç SSH-së.
Edhe pasi ta hapësh Security List-in, porti mbetet i mbyllur derisa të ekzekutosh:

```bash
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 8080 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 4. Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
exit          # dil dhe hyr sërish që grupi të aktivizohet
```

## 5. Kopjo skedarët dhe nis GeoServer-in

Nga kompjuteri yt:

```bash
scp -i çelesi.key -r geoserver/ ubuntu@IP-PUBLIKE:~/thevillage
```

Në server:

```bash
cd ~/thevillage
cp .env.example .env
nano .env                 # vendos fjalëkalim të fortë
docker compose -f docker-compose.arm64.yml up -d
docker compose -f docker-compose.arm64.yml logs -f
```

> Përdor **`docker-compose.arm64.yml`**, jo `docker-compose.yml`. Imazhi zyrtar OSGeo
> ndërtohet vetëm për amd64 dhe nuk niset në Ampere; varianti ARM përdor `kartoza/geoserver`.

## 6. Publiko shtresat

```bash
GEOSERVER_URL=http://localhost:8080/geoserver \
GEOSERVER_USER=admin \
GEOSERVER_PASS='fjalekalimi-yt' \
GPKG_PATH=/opt/geoserver/data_dir/data/thevillage.gpkg \
bash publish-layers.sh
```

## 7. Provo nga jashtë

```
http://IP-PUBLIKE:8080/geoserver/thevillage/wms?service=WMS&version=1.3.0&request=GetCapabilities
http://IP-PUBLIKE:8080/geoserver/thevillage/wfs?service=WFS&version=2.0.0&request=GetCapabilities
```

Këto adresa mund t'ia japësh profesorit për QGIS.

---

## Dy gjëra pa të cilat nuk duhet lënë online

**Fjalëkalimi.** Serveri do të jetë i hapur për krejt internetin. Ndërroje fjalëkalimin e
administratorit te `.env` para nisjes së parë, dhe mos e lër kurrë `geoserver`.

**Proxy Base URL.** Te *Settings → Global* vendos adresën publike, p.sh.
`http://IP-PUBLIKE:8080/geoserver`. Pa të, në disa konfigurime GetCapabilities kthen URL-a
të brendshme që klienti nuk i arrin dot. Ndryshoje sërish nëse më vonë kalon në HTTPS me domen.

*(Ki parasysh: mos e ndrysho këtë cilësim përmes REST me një trup të pjesshëm JSON — ai
zëvendëson krejt bllokun e settings-ave dhe fshin fusha si `charset`, çka nxjerr gabime te
të gjitha shtresat. Përdor panelin web.)*

## HTTPS (nevojitet vetëm nëse WebGIS-i do t'i thërrasë shërbimet)

Faqja në GitHub Pages është HTTPS dhe shfletuesi bllokon kërkesat drejt HTTP. Me një emër
domeni që tregon nga IP-ja publike, shto Caddy-n sipas seksionit përkatës te `README.md` —
certifikatën e merr vetë.
