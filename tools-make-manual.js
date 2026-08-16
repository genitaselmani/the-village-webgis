// Gjeneron manualin e The Village WebGIS në dy formate nga i njëjti burim:
//   Manuali_i_perdorimit.pdf   — për shtyp dhe për t'u bashkangjitur punimit
//   manual.html                — ajo që hapet brenda aplikacionit (shfaqet saktë në çdo telefon)
//
//   node tools-make-manual.js <PDF> <HTML>
const PDFDocument = require("pdfkit");
const fs = require("fs");

const OUT_PDF = process.argv[2];
const OUT_HTML = process.argv[3];

/* ------------------------------ Përmbajtja ------------------------------ */

const META = [
    ["Universiteti", "Universiteti i Prishtinës — Fakulteti i Inxhinierisë së Ndërtimit"],
    ["Dega / Lënda", "Gjeodezi — WebGIS"],
    ["Profesori", "Prof. Asoc. Dr. Bashkim Idrizi"],
    ["Punoi", "Genita Selmani"]
];

const CONTENT = [
    { t: "h1", v: "Pamja e ndërfaqes" },
    { t: "table", head: ["Pjesa", "Çfarë përmban"], w: [30, 70], rows: [
        ["Paneli majtas", "Dy skeda: “Shtresat” (çfarë shfaqet në hartë) dhe “Bizneset” (lista e bizneseve)."],
        ["Shiriti i veglave", "Shtatë butona mbi hartë: ruajtje, shkarkim, matje, raportim, navigim, fshirje rruge, manual."],
        ["Lart-djathtas", "Shigjeta e veriut dhe butonat + / - për zmadhim."],
        ["Poshtë", "Koordinatat e kursorit (EPSG:9141) dhe shkalla aktuale e hartës."]
    ]},

    { t: "h1", v: "Veglat e hartës" },
    { t: "lead", v: "Shtatë butonat mbi hartë, sipas radhës nga majtas." },
    { t: "table", head: ["Vegla", "Për çfarë shërben", "Si përdoret"], w: [20, 33, 47], rows: [
        ["Ruaj foton", "Ruan pamjen e hartës si figurë PNG.",
            "Kliko një herë. Fotoja shkarkohet me shtresat që janë të ndezura."],
        ["Shkarko GeoJSON", "Merr të dhënat për punë në QGIS ose ArcGIS.",
            "Kliko një herë; skedari shkarkohet menjëherë."],
        ["Matja", "Mat distancë ose sipërfaqe mbi hartë.",
            "Kliko » zgjidh “Mat distancën” ose “Mat sipërfaqen” » kliko pikat në hartë. Rezultati del në një kuti; shenja × e fshin."],
        ["Raporto problem", "Shënon një problem në një pikë të caktuar.",
            "Kliko » kliko vendin në hartë » plotëso formularin » ruaj. Pika del e kuqe."],
        ["Navigim", "Vizaton rrugën deri te një biznes.",
            "Kliko » pastaj kliko biznesin. Del rruga me distancë dhe kohë ecjeje."],
        ["Hiq rrugën", "Pastron rrugën e vizatuar.", "Kliko një herë."],
        ["Manuali", "Hap këtë dokument.", "Kliko; mbyllet me × lart-djathtas."]
    ]},

    { t: "h1", v: "Paneli “Shtresat”" },
    { t: "lead", v: "Çdo shtresë ka një kuti zgjedhjeje: hiq shenjën dhe shtresa fshihet nga harta." },
    { t: "table", head: ["Shtresa", "Çfarë tregon"], w: [34, 66], rows: [
        ["Pika Informuese", "Pika “TI JE KËTU” — prej saj niset çdo llogaritje rruge."],
        ["Bizneset", "Të gjitha bizneset. Shigjeta hap kategoritë, që mund të fiken veç e veç."],
        ["Shërbimet e Transportit", "Stacioni i autobusëve, i trenit dhe stacionet e taksive."],
        ["Shërbimet e Emergjencës", "Spitali, stacioni policor, zjarrfikësit."],
        ["Institucionet Administrative", "Komuna, Gjykata themelore, Posta."],
        ["Kufiri / Parkingu / Rrugët", "Kufiri i kompleksit, sipërfaqet e parkimit, rrjeti rrugor."],
        ["Kufiret e Bizneseve", "Ndarja e brendshme e njësive afariste."],
        ["Hekurudha", "Linja hekurudhore pranë kompleksit."],
        ["Raportet e problemeve", "Pikat që keni raportuar. Butoni “Fshi të gjitha” i heq njëherësh."]
    ]},
    { t: "lead", v: "Kur ndizet një shtresë shërbimesh, harta zvogëlohet vetvetiu sa të duket edhe qendra edhe " +
        "pikat e asaj shtrese, dhe pikat e bizneseve fshihen përkohësisht. Kur fiket, gjithçka kthehet si më parë." },

    { t: "h1", v: "Paneli “Bizneset”" },
    { t: "table", head: ["Veprimi", "Si bëhet"], w: [30, 70], rows: [
        ["Gjej një biznes", "Shkruaj emrin te fusha “Kërko”. Mund të shkruash edhe kategorinë, p.sh. “gastronomi”."],
        ["Shiko listën", "Bizneset janë të grupuara sipas kategorisë, me emrin e kategorisë si titull."],
        ["Zgjidh një biznes", "Kliko emrin në listë — harta zmadhohet mbi të dhe e thekson."],
        ["Ndrysho pamjen", "Te “Personalizim” ndryshohen ngjyra, transparenca, forma dhe madhësia e simboleve."],
        ["Kthe si ishte", "Butoni “Rivendos standardet” kthen cilësimet fillestare."]
    ]},

    { t: "h1", v: "Klikimi mbi hartë" },
    { t: "table", head: ["Kur klikon mbi", "Çfarë ndodh"], w: [30, 70], rows: [
        ["Një biznes", "Hapet një dritare me logon, kategorinë dhe përshkrimin e shkurtër të biznesit."],
        ["Një stacion transporti", "Vizatohet rruga më e shkurtër këmbësore nga qendra, me distancë dhe kohë ecjeje."],
        ["Spital / polici / komunë", "E njëjta gjë — rruga deri tek ajo pikë."],
        ["Një raport të kuq", "Shfaqet përshkrimi i problemit dhe butoni për ta hequr."]
    ]},

    { t: "h1", v: "Si duken bizneset" },
    { t: "lead", v: "Simboli ndryshon sipas sa afër je, që harta të mbetet e lexueshme." },
    { t: "table", head: ["Kur je", "Bizneset duken si"], w: [30, 70], rows: [
        ["Larg (pamja fillestare)", "Pika me ngjyrën e kategorisë."],
        ["Mesatarisht afër", "Rreth me ngjyrën e kategorisë dhe logon brenda."],
        ["Shumë afër", "Vetëm logoja, e vendosur mbi objektin."]
    ]},

    { t: "h1", v: "Në telefon" },
    { t: "table", head: ["Veprimi", "Si bëhet"], w: [30, 70], rows: [
        ["Hap panelin", "Butoni i rrumbullakët poshtë-djathtas. Prek sërish ose jashtë tij për ta mbyllur."],
        ["Zmadho hartën", "Me dy gishta, ose me butonat + / -."],
        ["Shiko një biznes", "Prek biznesin — dritarja hapet pa e mbuluar hartën."]
    ]},

    { t: "h1", v: "Nëse diçka nuk shkon" },
    { t: "table", head: ["Problemi", "Zgjidhja"], w: [36, 64], rows: [
        ["Harta nuk shfaqet", "Kontrollo lidhjen me internetin."],
        ["Nuk shoh ndryshimet e reja", "Rifresko me Ctrl + R."],
        ["Bizneset nuk duken", "Sigurohu që shtresa “Bizneset” është e ndezur dhe se s’është fikur ndonjë kategori."],
        ["Bizneset u zhdukën papritur", "Ndoshta është ndezur një shtresë shërbimesh — fike atë."],
        ["Rruga nuk vizatohet", "Prit derisa harta të ngarkohet plotësisht dhe provo sërish."],
        ["Fotoja del e zbrazët", "Prit ngarkimin e plotë të hartës para se ta ruash."]
    ]}
];

/* --------------------------------- PDF ---------------------------------- */

function buildPdf() {
    const M = 52;
    const C = { ink: "#1a1a1a", muted: "#5f6b76", accent: "#0f2847", rule: "#dde3e9", zebra: "#fafbfc" };
    const doc = new PDFDocument({
        size: "A4", bufferPages: true,
        margins: { top: M, bottom: M + 16, left: M, right: M },
        info: {
            Title: "Manuali i përdorimit — The Village WebGIS",
            Author: "Genita Selmani",
            Subject: "Udhëzues për funksionet e WebGIS-it të qendrës tregtare The Village, Ferizaj"
        }
    });
    doc.pipe(fs.createWriteStream(OUT_PDF));

    const W = doc.page.width - M * 2;
    const bottom = () => doc.page.height - M - 24;
    const room = (h) => { if (doc.y + h > bottom()) doc.addPage(); };

    // Kopertina
    doc.save().rect(0, 0, doc.page.width, 160).fill(C.accent).restore();
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(23)
       .text("Manuali i përdorimit", M, 56, { width: W });
    doc.fillColor("#bfd0e4").font("Helvetica").fontSize(12)
       .text("WebGIS — The Village Shopping & Fun, Ferizaj", M, 90, { width: W });

    doc.y = 188;
    META.concat([["Adresa", "https://genitaselmani.github.io/the-village-webgis/"]]).forEach(function (r) {
        const y0 = doc.y;
        doc.fillColor(C.muted).font("Helvetica-Bold").fontSize(8.2).text(r[0], M, y0, { width: 105 });
        doc.fillColor(C.ink).font("Helvetica").fontSize(8.8).text(r[1], M + 112, y0, { width: W - 112 });
        doc.y = y0 + 16;
    });
    doc.moveDown(1);

    function h1(t) {
        room(52);
        doc.moveDown(0.55);
        doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(14).text(t, { width: W });
        const y = doc.y + 4;
        doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.4).strokeColor(C.accent).stroke();
        doc.moveDown(0.55);
    }
    function lead(t) {
        room(24);
        doc.fillColor(C.muted).font("Helvetica").fontSize(9).text(t, { width: W, lineGap: 1.8 });
        doc.moveDown(0.4);
    }
    function table(head, wPct, rows) {
        const cols = wPct.map(function (p) { return Math.round(W * p / 100); });
        const headH = 19;
        function header() {
            const y0 = doc.y;
            doc.save().rect(M, y0, W, headH).fill(C.accent).restore();
            let x = M;
            head.forEach(function (hd, i) {
                doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.2)
                   .text(hd, x + 7, y0 + 5.5, { width: cols[i] - 12, lineBreak: false });
                x += cols[i];
            });
            doc.y = y0 + headH;
        }
        room(headH + 32);
        header();
        rows.forEach(function (r, i) {
            let h = 0;
            r.forEach(function (cell, ci) {
                doc.font(ci === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8.4);
                h = Math.max(h, doc.heightOfString(String(cell), { width: cols[ci] - 14, lineGap: 1.4 }));
            });
            const rowH = h + 11;
            if (doc.y + rowH > bottom()) { doc.addPage(); header(); }
            const ry = doc.y;
            if (i % 2 === 0) doc.save().rect(M, ry, W, rowH).fill(C.zebra).restore();
            let x = M;
            r.forEach(function (cell, ci) {
                doc.fillColor(ci === 0 ? C.accent : C.ink)
                   .font(ci === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8.4)
                   .text(String(cell), x + 7, ry + 5.5, { width: cols[ci] - 14, lineGap: 1.4 });
                x += cols[ci];
            });
            doc.y = ry + rowH;
            doc.moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(0.5).strokeColor(C.rule).stroke();
        });
        doc.moveDown(0.65);
    }

    CONTENT.forEach(function (b) {
        if (b.t === "h1") h1(b.v);
        else if (b.t === "lead") lead(b.v);
        else if (b.t === "table") table(b.head, b.w, b.rows);
    });

    const range = doc.bufferedPageRange();
    for (let i = 1; i < range.count; i++) {
        doc.switchToPage(range.start + i);
        const keep = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;
        const y = doc.page.height - M + 8;
        doc.fillColor(C.muted).font("Helvetica").fontSize(7.6)
           .text("The Village WebGIS — Manuali i përdorimit", M, y, { width: W / 2, lineBreak: false });
        doc.fillColor(C.muted).font("Helvetica").fontSize(7.6)
           .text(String(i + 1), M + W / 2, y, { width: W / 2, align: "right", lineBreak: false });
        doc.page.margins.bottom = keep;
    }
    doc.end();
}

/* --------------------------------- HTML --------------------------------- */

function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function buildHtml() {
    let body = "";
    CONTENT.forEach(function (b) {
        if (b.t === "h1") body += "<h2>" + esc(b.v) + "</h2>\n";
        else if (b.t === "lead") body += "<p class=\"lead\">" + esc(b.v) + "</p>\n";
        else if (b.t === "table") {
            body += "<table>\n<thead><tr>" +
                b.head.map(function (h, i) { return '<th style="width:' + b.w[i] + '%">' + esc(h) + "</th>"; }).join("") +
                "</tr></thead>\n<tbody>\n";
            b.rows.forEach(function (r) {
                body += "<tr>" + r.map(function (c, i) {
                    return i === 0 ? "<th scope=\"row\">" + esc(c) + "</th>" : "<td>" + esc(c) + "</td>";
                }).join("") + "</tr>\n";
            });
            body += "</tbody>\n</table>\n";
        }
    });

    const meta = META.map(function (r) {
        return "<div><dt>" + esc(r[0]) + "</dt><dd>" + esc(r[1]) + "</dd></div>";
    }).join("");

    return `<!doctype html>
<html lang="sq">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>Manuali i përdorimit — The Village WebGIS</title>
<style>
  :root { --ink:#1a1a1a; --muted:#5f6b76; --accent:#0f2847; --rule:#dde3e9; }
  * { box-sizing: border-box; }
  body {
    margin: 0;
    padding: 0 16px 56px;
    font: 15px/1.55 "Inter", system-ui, -apple-system, "Segoe UI", sans-serif;
    color: var(--ink);
    background: #fff;
    -webkit-text-size-adjust: 100%;
  }
  .wrap { max-width: 820px; margin: 0 auto; }
  header.cover {
    margin: 0 -16px 24px;
    padding: 28px 16px 22px;
    background: var(--accent);
    color: #fff;
  }
  .cover h1 { margin: 0 0 6px; font-size: 23px; line-height: 1.2; }
  .cover p { margin: 0; color: #bfd0e4; font-size: 14px; }
  dl.meta { display: grid; gap: 6px; margin: 0 0 28px; font-size: 13px; }
  dl.meta > div { display: grid; grid-template-columns: 116px 1fr; gap: 10px; }
  dl.meta dt { margin: 0; font-weight: 600; color: var(--muted); }
  dl.meta dd { margin: 0; }
  h2 {
    margin: 30px 0 12px;
    padding-bottom: 6px;
    font-size: 17px;
    color: var(--accent);
    border-bottom: 2px solid var(--accent);
  }
  p.lead { margin: 0 0 14px; color: var(--muted); font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 0 0 20px; font-size: 13.5px; }
  thead th {
    background: var(--accent); color: #fff; text-align: left;
    padding: 8px 10px; font-size: 12.5px; font-weight: 700;
  }
  tbody th, tbody td {
    padding: 9px 10px; vertical-align: top;
    border-bottom: 1px solid var(--rule);
  }
  tbody th { text-align: left; color: var(--accent); font-weight: 700; }
  tbody tr:nth-child(odd) { background: #fafbfc; }
  .pdf-link { margin: 32px 0 0; font-size: 13px; color: var(--muted); }
  .pdf-link a { color: var(--accent); }

  /* Në telefon tabelat kthehen në blloqe — pa rrëshqitje anash. */
  @media (max-width: 560px) {
    table, thead, tbody, tr, th, td { display: block; width: 100% !important; }
    thead { display: none; }
    tbody tr {
      margin: 0 0 12px; padding: 10px 12px;
      border: 1px solid var(--rule); border-radius: 10px; background: #fafbfc;
    }
    tbody th, tbody td { border: 0; padding: 2px 0; }
    tbody th { font-size: 14.5px; margin-bottom: 4px; }
    tbody td { color: #33404b; }
    tbody td + td { margin-top: 6px; padding-top: 6px; border-top: 1px dashed var(--rule); }
  }
</style>
</head>
<body>
<div class="wrap">
  <header class="cover">
    <h1>Manuali i përdorimit</h1>
    <p>WebGIS — The Village Shopping &amp; Fun, Ferizaj</p>
  </header>
  <dl class="meta">${meta}</dl>
${body}  <p class="pdf-link">Për shtyp: <a href="Manuali_i_perdorimit.pdf" target="_blank" rel="noopener">shkarko manualin si PDF</a>.</p>
</div>
</body>
</html>
`;
}

buildPdf();
fs.writeFileSync(OUT_HTML, buildHtml(), "utf8");
console.log("U shkruan:", OUT_PDF, "dhe", OUT_HTML);
