// Gjeneron manualin e përdorimit të The Village WebGIS si PDF.
// Stil: i shkurtër dhe praktik — çdo funksion me "për çfarë shërben" dhe "si përdoret".
const PDFDocument = require("pdfkit");
const fs = require("fs");

const OUT = process.argv[2];
const M = 52;
const C = { ink: "#1a1a1a", muted: "#5f6b76", accent: "#0f2847", rule: "#dde3e9", zebra: "#fafbfc" };

const doc = new PDFDocument({
    size: "A4",
    bufferPages: true,
    margins: { top: M, bottom: M + 16, left: M, right: M },
    info: {
        Title: "Manuali i përdorimit — The Village WebGIS",
        Author: "Genita Selmani",
        Subject: "Udhëzues i shkurtër për funksionet e WebGIS-it të qendrës tregtare The Village, Ferizaj"
    }
});
doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width - M * 2;
const bottom = () => doc.page.height - M - 24;
const room = (h) => { if (doc.y + h > bottom()) doc.addPage(); };

function h1(t) {
    room(56);
    doc.moveDown(0.6);
    doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(14).text(t, { width: W });
    const y = doc.y + 4;
    doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.4).strokeColor(C.accent).stroke();
    doc.moveDown(0.6);
}

function lead(t) {
    room(26);
    doc.fillColor(C.muted).font("Helvetica").fontSize(9).text(t, { width: W, lineGap: 1.8 });
    doc.moveDown(0.45);
}

/** Tabelë me kolona të konfigurueshme. cols = [{w, head, bold}] */
function table(cols, rows) {
    const headH = 19;
    function header() {
        const y0 = doc.y;
        doc.save().rect(M, y0, W, headH).fill(C.accent).restore();
        let x = M;
        cols.forEach(function (c) {
            doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8.2)
               .text(c.head, x + 7, y0 + 5.5, { width: c.w - 12, lineBreak: false });
            x += c.w;
        });
        doc.y = y0 + headH;
    }
    room(headH + 34);
    header();

    rows.forEach(function (r, i) {
        let h = 0;
        cols.forEach(function (c, ci) {
            doc.font(ci === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8.4);
            h = Math.max(h, doc.heightOfString(String(r[ci]), { width: c.w - 14, lineGap: 1.4 }));
        });
        const rowH = h + 11;
        if (doc.y + rowH > bottom()) { doc.addPage(); header(); }
        const ry = doc.y;
        if (i % 2 === 0) doc.save().rect(M, ry, W, rowH).fill(C.zebra).restore();
        let x = M;
        cols.forEach(function (c, ci) {
            doc.fillColor(ci === 0 ? C.accent : C.ink)
               .font(ci === 0 ? "Helvetica-Bold" : "Helvetica").fontSize(8.4)
               .text(String(r[ci]), x + 7, ry + 5.5, { width: c.w - 14, lineGap: 1.4 });
            x += c.w;
        });
        doc.y = ry + rowH;
        doc.moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(0.5).strokeColor(C.rule).stroke();
    });
    doc.moveDown(0.7);
}

/* ---------------------------------- Kopertina --------------------------------- */

doc.save().rect(0, 0, doc.page.width, 168).fill(C.accent).restore();
doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(24)
   .text("Manuali i përdorimit", M, 58, { width: W });
doc.fillColor("#bfd0e4").font("Helvetica").fontSize(12.5)
   .text("WebGIS — The Village Shopping & Fun, Ferizaj", M, 94, { width: W });

doc.y = 196;
doc.fillColor(C.muted).font("Helvetica").fontSize(8.6);
[
    ["Universiteti", "Universiteti i Prishtinës — Fakulteti i Inxhinierisë së Ndërtimit"],
    ["Dega / Lënda", "Gjeodezi — WebGIS"],
    ["Profesori", "Prof. Asoc. Dr. Bashkim Idrizi"],
    ["Punoi", "Genita Selmani"],
    ["Adresa", "https://genitaselmani.github.io/the-village-webgis/"]
].forEach(function (r) {
    const y0 = doc.y;
    doc.fillColor(C.muted).font("Helvetica-Bold").fontSize(8.2).text(r[0], M, y0, { width: 105 });
    doc.fillColor(C.ink).font("Helvetica").fontSize(8.8).text(r[1], M + 112, y0, { width: W - 112 });
    doc.y = y0 + 16;
});

doc.moveDown(1);
h1("Pamja e ndërfaqes");
table(
    [{ w: 108, head: "Pjesa" }, { w: W - 108, head: "Çfarë përmban" }],
    [
        ["Paneli majtas", "Dy skeda: “Shtresat” (çfarë shfaqet në hartë) dhe “Bizneset” (lista e bizneseve)."],
        ["Shiriti i veglave", "Shtatë butona mbi hartë: ruajtje, shkarkim, matje, raportim, navigim, fshirje rruge, manual."],
        ["Lart-djathtas", "Shigjeta e veriut dhe butonat + / - për zmadhim."],
        ["Poshtë", "Koordinatat e kursorit (EPSG:9141) dhe shkalla aktuale e hartës."]
    ]
);

/* ------------------------------- Veglat e hartës ------------------------------ */

doc.addPage();
h1("Veglat e hartës");
lead("Shtatë butonat mbi hartë, sipas radhës nga majtas.");
table(
    [{ w: 96, head: "Vegla" }, { w: 168, head: "Për çfarë shërben" }, { w: W - 264, head: "Si përdoret" }],
    [
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
        ["Manuali", "Hap këtë dokument.", "Kliko; hapet në skedë të re."]
    ]
);

/* --------------------------------- Shtresat ---------------------------------- */

h1("Paneli “Shtresat”");
lead("Çdo shtresë ka një kuti zgjedhjeje: hiq shenjën dhe shtresa fshihet nga harta.");
table(
    [{ w: 150, head: "Shtresa" }, { w: W - 150, head: "Çfarë tregon" }],
    [
        ["Pika Informuese", "Pika “TI JE KËTU” — prej saj niset çdo llogaritje rruge."],
        ["Bizneset", "Të gjitha bizneset. Shigjeta hap kategoritë, që mund të fiken veç e veç."],
        ["Shërbimet e Transportit", "Stacioni i autobusëve, i trenit dhe stacionet e taksive."],
        ["Shërbimet e Emergjencës", "Spitali, stacioni policor, zjarrfikësit."],
        ["Institucionet Administrative", "Komuna, Gjykata themelore, Posta."],
        ["Kufiri / Parkingu / Rrugët", "Kufiri i kompleksit, sipërfaqet e parkimit, rrjeti rrugor."],
        ["Kufiret e Bizneseve", "Ndarja e brendshme e njësive afariste."],
        ["Hekurudha", "Linja hekurudhore pranë kompleksit."],
        ["Raportet e problemeve", "Pikat që keni raportuar. Butoni “Fshi të gjitha” i heq njëherësh."]
    ]
);
lead("Kur ndizet një shtresë shërbimesh, harta zvogëlohet vetvetiu sa të duket edhe qendra edhe pikat e asaj " +
     "shtrese, dhe pikat e bizneseve fshihen përkohësisht. Kur fiket, gjithçka kthehet si më parë.");

/* --------------------------------- Bizneset ---------------------------------- */

doc.addPage();
h1("Paneli “Bizneset”");
table(
    [{ w: 150, head: "Veprimi" }, { w: W - 150, head: "Si bëhet" }],
    [
        ["Gjej një biznes", "Shkruaj emrin te fusha “Kërko”. Mund të shkruash edhe kategorinë, p.sh. “gastronomi”."],
        ["Shiko listën", "Bizneset janë të grupuara sipas kategorisë, me emrin e kategorisë si titull."],
        ["Zgjidh një biznes", "Kliko emrin në listë — harta zmadhohet mbi të dhe e thekson."],
        ["Ndrysho pamjen", "Te “Personalizim” ndryshohen ngjyra, transparenca, forma dhe madhësia e simboleve."],
        ["Kthe si ishte", "Butoni “Rivendos standardet” kthen cilësimet fillestare."]
    ]
);

/* ------------------------------ Klikimi në hartë ------------------------------ */

h1("Klikimi mbi hartë");
table(
    [{ w: 150, head: "Kur klikon mbi" }, { w: W - 150, head: "Çfarë ndodh" }],
    [
        ["Një biznes", "Hapet një dritare me logon, kategorinë dhe përshkrimin e shkurtër të biznesit."],
        ["Një stacion transporti", "Vizatohet rruga më e shkurtër këmbësore nga qendra, me distancë dhe kohë ecjeje."],
        ["Spital / polici / komunë", "E njëjta gjë — rruga deri tek ajo pikë."],
        ["Një raport të kuq", "Shfaqet përshkrimi i problemit dhe butoni për ta hequr."]
    ]
);

/* -------------------------------- Simbolizimi -------------------------------- */

h1("Si duken bizneset");
lead("Simboli ndryshon sipas sa afër je, që harta të mbetet e lexueshme.");
table(
    [{ w: 150, head: "Kur je" }, { w: W - 150, head: "Bizneset duken si" }],
    [
        ["Larg (pamja fillestare)", "Pika me ngjyrën e kategorisë."],
        ["Mesatarisht afër", "Rreth me ngjyrën e kategorisë dhe logon brenda."],
        ["Shumë afër", "Vetëm logoja, e vendosur mbi objektin."]
    ]
);

/* ---------------------------------- Telefoni --------------------------------- */

h1("Në telefon");
table(
    [{ w: 150, head: "Veprimi" }, { w: W - 150, head: "Si bëhet" }],
    [
        ["Hap panelin", "Butoni i rrumbullakët poshtë-djathtas. Prek sërish ose jashtë tij për ta mbyllur."],
        ["Zmadho hartën", "Me dy gishta, ose me butonat + / -."],
        ["Shiko një biznes", "Prek biznesin — dritarja hapet pa e mbuluar hartën."]
    ]
);

/* ------------------------------ Nëse diçka nuk shkon ------------------------- */

h1("Nëse diçka nuk shkon");
table(
    [{ w: 178, head: "Problemi" }, { w: W - 178, head: "Zgjidhja" }],
    [
        ["Harta nuk shfaqet", "Kontrollo lidhjen me internetin."],
        ["Nuk shoh ndryshimet e reja", "Rifresko me Ctrl + R."],
        ["Bizneset nuk duken", "Sigurohu që shtresa “Bizneset” është e ndezur dhe se s’është fikur ndonjë kategori."],
        ["Bizneset u zhdukën papritur", "Ndoshta është ndezur një shtresë shërbimesh — fike atë."],
        ["Rruga nuk vizatohet", "Prit derisa harta të ngarkohet plotësisht dhe provo sërish."],
        ["Fotoja del e zbrazët", "Prit ngarkimin e plotë të hartës para se ta ruash."]
    ]
);

/* ------------------------- Numërimi i faqeve (fundi) ------------------------- */

const range = doc.bufferedPageRange();
for (let i = 1; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    // Teksti bie nën margjinën e poshtme; pa e hequr atë përkohësisht, pdfkit
    // e quan faqen të mbushur dhe shton një faqe bosh për secilin fund faqeje.
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
