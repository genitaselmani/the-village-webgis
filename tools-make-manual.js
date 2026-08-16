// Gjeneron manualin e përdorimit të The Village WebGIS si PDF.
const PDFDocument = require("pdfkit");
const fs = require("fs");

const OUT = process.argv[2];
const M = 56;                 // margjina
const C = { ink: "#1a1a1a", muted: "#5f6b76", accent: "#0f2847", rule: "#d7dde3", soft: "#f2f5f8" };

const doc = new PDFDocument({
    size: "A4",
    bufferPages: true,   // nevojitet për numërimin e faqeve në fund
    margins: { top: M, bottom: M + 18, left: M, right: M },
    info: {
        Title: "Manuali i përdorimit — The Village WebGIS",
        Author: "Genita Selmani",
        Subject: "Udhëzues për përdorimin e WebGIS-it të qendrës tregtare The Village, Ferizaj",
        Keywords: "WebGIS, GIS, The Village, Ferizaj, Leaflet, manual"
    }
});
doc.pipe(fs.createWriteStream(OUT));

const W = doc.page.width - M * 2;
const bottomLimit = () => doc.page.height - M - 26;

function room(h) {
    if (doc.y + h > bottomLimit()) doc.addPage();
}

function h1(t) {
    room(64);
    doc.moveDown(0.7);
    doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(16).text(t, { width: W });
    const y = doc.y + 5;
    doc.moveTo(M, y).lineTo(M + W, y).lineWidth(1.6).strokeColor(C.accent).stroke();
    doc.moveDown(0.75);
}

function h2(t) {
    room(46);
    doc.moveDown(0.45);
    doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(11.5).text(t, { width: W });
    doc.moveDown(0.28);
}

function p(t) {
    room(30);
    doc.fillColor(C.ink).font("Helvetica").fontSize(9.8).text(t, { width: W, align: "justify", lineGap: 2.2 });
    doc.moveDown(0.42);
}

function note(t) {
    room(46);
    const pad = 9;
    const hgt = doc.heightOfString(t, { width: W - pad * 2 - 4, lineGap: 2 }) + pad * 2;
    room(hgt + 8);
    const y0 = doc.y;
    doc.save().rect(M, y0, W, hgt).fill(C.soft).restore();
    doc.save().rect(M, y0, 3, hgt).fill(C.accent).restore();
    doc.fillColor(C.ink).font("Helvetica-Oblique").fontSize(9.2)
       .text(t, M + pad + 4, y0 + pad, { width: W - pad * 2 - 4, lineGap: 2 });
    doc.y = y0 + hgt;
    doc.moveDown(0.55);
}

// Listë me pika
function bullets(items) {
    items.forEach(function (it) {
        room(24);
        const y0 = doc.y;
        doc.fillColor(C.accent).font("Helvetica-Bold").fontSize(9.8).text("•", M + 4, y0, { width: 10 });
        doc.fillColor(C.ink).font("Helvetica").fontSize(9.8)
           .text(it, M + 18, y0, { width: W - 18, lineGap: 2 });
        doc.moveDown(0.22);
    });
    doc.moveDown(0.3);
}

// Tabelë dy-kolonëshe (veçori → përshkrim)
function table(rows, col1Header, col2Header) {
    const c1 = 148, c2 = W - c1;
    room(40);
    // koka
    let y0 = doc.y;
    doc.save().rect(M, y0, W, 20).fill(C.accent).restore();
    doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
       .text(col1Header, M + 8, y0 + 6, { width: c1 - 12 })
       .text(col2Header, M + c1 + 8, y0 + 6, { width: c2 - 16 });
    doc.y = y0 + 20;

    rows.forEach(function (r, i) {
        const txtH = Math.max(
            doc.heightOfString(r[0], { width: c1 - 16, lineGap: 1.5 }),
            doc.heightOfString(r[1], { width: c2 - 16, lineGap: 1.5 })
        );
        const rowH = txtH + 12;
        if (doc.y + rowH > bottomLimit()) {
            doc.addPage();
            y0 = doc.y;
            doc.save().rect(M, y0, W, 20).fill(C.accent).restore();
            doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(9)
               .text(col1Header, M + 8, y0 + 6, { width: c1 - 12 })
               .text(col2Header, M + c1 + 8, y0 + 6, { width: c2 - 16 });
            doc.y = y0 + 20;
        }
        const ry = doc.y;
        if (i % 2 === 0) doc.save().rect(M, ry, W, rowH).fill("#fafbfc").restore();
        doc.fillColor(C.ink).font("Helvetica-Bold").fontSize(8.8)
           .text(r[0], M + 8, ry + 6, { width: c1 - 16, lineGap: 1.5 });
        doc.fillColor(C.ink).font("Helvetica").fontSize(8.8)
           .text(r[1], M + c1 + 8, ry + 6, { width: c2 - 16, lineGap: 1.5 });
        doc.y = ry + rowH;
        doc.moveTo(M, doc.y).lineTo(M + W, doc.y).lineWidth(0.5).strokeColor(C.rule).stroke();
    });
    doc.moveDown(0.8);
}

/* ---------------------------------- Kopertina --------------------------------- */

doc.save().rect(0, 0, doc.page.width, 232).fill(C.accent).restore();
doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(27)
   .text("Manuali i përdorimit", M, 84, { width: W });
doc.fillColor("#c9d6e6").font("Helvetica").fontSize(15)
   .text("WebGIS — Qendra tregtare “The Village Shopping & Fun”, Ferizaj", M, 124, { width: W });
doc.fillColor("#9fb3cc").font("Helvetica").fontSize(10)
   .text("Udhëzues i plotë për të gjitha funksionet e aplikacionit", M, 168, { width: W });

doc.y = 268;
doc.fillColor(C.muted).font("Helvetica").fontSize(9.5);
[
    ["Universiteti", "Universiteti i Prishtinës — Fakulteti i Inxhinierisë së Ndërtimit"],
    ["Dega", "Gjeodezi"],
    ["Lënda", "WebGIS"],
    ["Profesori", "Prof. Asoc. Dr. Bashkim Idrizi"],
    ["Punoi", "Genita Selmani"],
    ["Adresa e aplikacionit", "https://genitaselmani.github.io/the-village-webgis/"]
].forEach(function (r) {
    const y0 = doc.y;
    doc.fillColor(C.muted).font("Helvetica-Bold").fontSize(9).text(r[0], M, y0, { width: 130 });
    doc.fillColor(C.ink).font("Helvetica").fontSize(9.5).text(r[1], M + 138, y0, { width: W - 138 });
    doc.y = y0 + 19;
});

doc.moveDown(1.4);
note("Ky manual përshkruan çdo funksion të aplikacionit: lëvizjen në hartë, shtresat, kërkimin e bizneseve, " +
     "matjet, navigimin, raportimin e problemeve dhe përdorimin në telefon.");

/* --------------------------------- Përmbajtja -------------------------------- */

doc.addPage();
h1("Përmbajtja");
[
    "1. Çfarë është ky WebGIS",
    "2. Pamja e ndërfaqes",
    "3. Lëvizja dhe zmadhimi i hartës",
    "4. Paneli “Shtresat”",
    "5. Paneli “Bizneset”",
    "6. Klikimi mbi objektet e hartës",
    "7. Veglat e hartës",
    "8. Simbolizimi sipas shkallës",
    "9. Përdorimi në telefon",
    "10. Sistemi referues dhe shkalla",
    "11. Zgjidhja e problemeve"
].forEach(function (t) {
    doc.fillColor(C.ink).font("Helvetica").fontSize(10.5).text(t, { width: W, lineGap: 6 });
});

/* ------------------------------------ 1 ------------------------------------- */

h1("1. Çfarë është ky WebGIS");
p("Aplikacioni është një hartë interaktive e qendrës tregtare “The Village Shopping & Fun” në Ferizaj. " +
  "Ai tregon pozitën e secilit biznes brenda kompleksit, ndërtesat, parkingjet, rrugët dhe hekurudhën, " +
  "si dhe shërbimet e rëndësishme përreth: stacionet e transportit, shërbimet e emergjencës dhe " +
  "institucionet administrative.");
p("Aplikacioni punon plotësisht në shfletues, pa pasur nevojë për instalim. Të dhënat ruhen si skedarë " +
  "GeoJSON dhe ngarkohen direkt nga faqja, prandaj harta hapet edhe pa ndonjë server të veçantë.");
bullets([
    "Gjen shpejt një biznes sipas emrit ose kategorisë.",
    "Sheh rrugën më të shkurtër nga qendra deri te stacionet dhe institucionet.",
    "Mat distanca dhe sipërfaqe drejtpërdrejt mbi hartë.",
    "Ruan hartën si fotografi ose shkarkon të dhënat si GeoJSON.",
    "Raporton një problem duke e shënuar mbi hartë."
]);

/* ------------------------------------ 2 ------------------------------------- */

h1("2. Pamja e ndërfaqes");
p("Ndërfaqja ndahet në katër pjesë kryesore:");
table([
    ["Koka (lart)", "Emri i qendrës tregtare dhe të dhënat akademike të punimit."],
    ["Paneli (majtas)", "Dy skeda: “Shtresat” për kontrollin e shtresave dhe “Bizneset” për listën e bizneseve."],
    ["Harta (në mes)", "Hapësira kryesore e punës. Mbi të ndodhen veglat, shigjeta e veriut dhe butonat e zmadhimit."],
    ["Fundi (poshtë)", "Koordinatat e kursorit në sistemin EPSG:9141 dhe shkalla aktuale e hartës."]
], "Pjesa", "Përmbajtja");
note("Në telefon paneli nuk qëndron i hapur. Ai hapet me butonin e rrumbullakët poshtë-djathtas dhe mbyllet " +
     "duke e prekur sërish ose duke prekur jashtë tij.");

/* ------------------------------------ 3 ------------------------------------- */

h1("3. Lëvizja dhe zmadhimi i hartës");
h2("Lëvizja");
p("Harta lëvizet duke e tërhequr me miun (ose me gisht në telefon). Kur hapet aplikacioni, pamja vendoset " +
  "automatikisht mbi qendrën tregtare, e centruar në pjesën e dukshme të hartës.");
h2("Zmadhimi me shkallë fikse");
p("Zmadhimi nuk është i lirë: harta kalon vetëm nëpër shkallë të rrumbullakëta kartografike. Kjo do të thotë " +
  "se shkalla e shfaqur në fund është gjithmonë një vlerë e saktë, e përdorshme për raportim.");
table([
    ["1:4 000", "Pamja fillestare — shihet krejt kompleksi."],
    ["1:2 000", "Një hap më afër."],
    ["1:1 000", "Bizneset shfaqen me logo brenda një rrethi me ngjyrën e kategorisë."],
    ["1:500", "Logot shfaqen të plota mbi objektin përkatës."],
    ["1:250", "Detaje edhe më të mëdha."],
    ["1:125", "Zmadhimi maksimal."]
], "Shkalla", "Çfarë shihet");
p("Zmadhimi bëhet me butonat + dhe − lart-djathtas, me rrotën e miut (një rrotullim = një shkallë), me " +
  "klikim të dyfishtë, ose me dy gishta në telefon. Nëse ndonjë veprim e nxjerr hartën jashtë kësaj rrjete, " +
  "ajo kthehet vetvetiu te shkalla më e afërt.");
note("Zvogëlimi nën 1:4 000 lejohet vetëm kur ndizet një nga shtresat e shërbimeve, sepse ato ndodhen jashtë " +
     "kompleksit dhe duhet më shumë hapësirë për t’u parë.");

/* ------------------------------------ 4 ------------------------------------- */

h1("4. Paneli “Shtresat”");
p("Kjo skedë përmban legjendën dhe kontrollin e të gjitha shtresave. Çdo shtresë ka një kuti zgjedhjeje: " +
  "kur hiqet shenja, shtresa fshihet nga harta.");
h2("Kërkimi te shtresat");
p("Fusha “Kërko” në krye filtron listën e shtresave sipas emrit, e dobishme kur lista është e gjatë.");
h2("Shtresat e disponueshme");
table([
    ["Pika Informuese", "Pika “TI JE KËTU”, prej nga niset çdo llogaritje rruge."],
    ["Bizneset", "Të gjitha bizneset. Hapet me shigjetën për të parë kategoritë veç e veç."],
    ["Shërbimet e Transportit", "Stacioni i autobusëve, i trenit dhe stacionet e taksive."],
    ["Shërbimet e Emergjencës", "Spitali i përgjithshëm, stacioni policor dhe zjarrfikësit."],
    ["Institucionet Administrative", "Komuna e Ferizajit, Gjykata themelore dhe Posta."],
    ["Kufiri", "Kufiri i jashtëm i kompleksit."],
    ["Parkingu", "Sipërfaqet e parkimit."],
    ["Rrugët", "Rrjeti rrugor, i përdorur edhe për llogaritjen e rrugëve."],
    ["Kufiret e Bizneseve", "Ndarja e brendshme e njësive afariste."],
    ["Hekurudha", "Linja hekurudhore pranë kompleksit."],
    ["Raportet e problemeve", "Pikat e raportuara nga ju."]
], "Shtresa", "Përshkrimi");

h2("Kategoritë e bizneseve");
p("Te rreshti “Bizneset”, shigjeta në të djathtë hap nën-kategoritë: Aksesorë dhe kozmetikë, Elektronikë, " +
  "Gastronomi, Market, Modë, Shërbime dhe Amvisëri. Secila mund të fiket veçmas, kështu që në hartë " +
  "mbeten vetëm llojet që ju interesojnë. Ngjyra pranë emrit është e njëjta që përdoret në hartë.");

h2("Shtresat e shërbimeve");
p("Tri shtresat e shërbimeve janë të fikura kur hapet aplikacioni, sepse ndodhen jashtë kompleksit. " +
  "Kur ndizet njëra prej tyre, ndodhin tri gjëra automatikisht:");
bullets([
    "Harta zvogëlohet sa duhet që të shihen njëkohësisht të gjitha pikat e asaj shtrese bashkë me qendrën tregtare.",
    "Pikat e bizneseve fshihen përkohësisht, sepse në atë shkallë do të ishin të palexueshme.",
    "Kur fiket shtresa e fundit, harta kthehet te pamja fillestare dhe bizneset rishfaqen."
]);
p("Nëse ndizni disa shtresa njëkohësisht, zvogëlimi llogaritet që të nxërë të gjitha bashkë. Edhe këto " +
  "shtresa kanë nën-kategori që mund të fiken veç e veç.");

h2("Raportet e problemeve");
p("Kjo shtresë tregon pikat që keni raportuar vetë. Ato ruhen vetëm në shfletuesin tuaj — askush tjetër " +
  "nuk i sheh. Përveç fshehjes me kutinë e zgjedhjes, butoni “Fshi të gjitha” i heq përfundimisht. " +
  "Ai shfaqet vetëm kur ekziston së paku një raport.");

/* ------------------------------------ 5 ------------------------------------- */

h1("5. Paneli “Bizneset”");
p("Kjo skedë përmban listën e plotë të bizneseve të kompleksit, të grupuara sipas kategorisë. Emri i " +
  "kategorisë shfaqet si titull dhe poshtë tij renditen bizneset përkatëse sipas alfabetit.");
h2("Kërkimi");
p("Fusha “Kërko” filtron listën ndërsa shkruani. Kërkimi përfshin edhe kategorinë, prandaj p.sh. duke " +
  "shkruar “gastronomi” shfaqen të gjitha lokalet ushqimore.");
h2("Zgjedhja e një biznesi");
p("Klikimi mbi një biznes në listë e thekson atë në hartë dhe e zmadhon pamjen mbi të. E njëjta gjë " +
  "ndodh edhe në kahun e kundërt: klikimi mbi biznesin në hartë e zgjedh kartën përkatëse në listë.");
h2("Personalizimi i pamjes");
p("Seksioni “Personalizim — theksimi i biznesit në hartë” lejon ndryshimin e mënyrës si duket biznesi i " +
  "zgjedhur dhe si duken pikat e bizneseve.");
table([
    ["Ngjyra e mbushjes / kufirit", "Ngjyrat me të cilat theksohet objekti i zgjedhur."],
    ["Transparenca e mbushjes", "Sa e tejdukshme është mbushja mbi hartë."],
    ["Stili dhe gjerësia e vijës", "Vijë e plotë, me viza ose me pika, dhe trashësia e saj."],
    ["Forma e pikës", "Rreth, katror, romb, trekëndësh ose yll."],
    ["Madhësia e pikës", "Përmasa e simbolit të biznesit në hartë."],
    ["Ngjyra kur mungon kategoria", "Ngjyra rezervë për bizneset pa kategori të përcaktuar."]
], "Cilësimi", "Çfarë ndryshon");
note("Butoni “Rivendos standardet” i kthen të gjitha cilësimet në vlerat fillestare. Zgjedhjet ruhen në " +
     "shfletuesin tuaj, prandaj mbeten edhe pas mbylljes së faqes.");

/* ------------------------------------ 6 ------------------------------------- */

h1("6. Klikimi mbi objektet e hartës");
h2("Klikimi mbi një biznes");
p("Kur klikoni mbi një biznes, hapet një dritare e vogël me logon e tij, kategorinë dhe një përshkrim të " +
  "shkurtër. Njëkohësisht biznesi theksohet në hartë dhe zgjidhet në listën e panelit.");
h2("Klikimi mbi një stacion ose institucion");
p("Kur klikoni mbi një pikë të shërbimeve, aplikacioni llogarit dhe vizaton rrugën më të shkurtër këmbësore " +
  "nga qendra tregtare deri tek ajo pikë. Në dritaren që hapet shfaqen distanca në metra dhe koha e " +
  "përafërt e ecjes. Ngjyra e vijës përputhet me ngjyrën e asaj shtrese.");
note("Rruga e vizatuar mbetet në hartë derisa ta hiqni me butonin përkatës te veglat, ose derisa të fikni " +
     "shtresën e asaj pike.");

/* ------------------------------------ 7 ------------------------------------- */

h1("7. Veglat e hartës");
p("Mbi hartë ndodhet një shirit me gjashtë butona:");
table([
    ["Ruaj hartën si foto", "Ruan pamjen aktuale të hartës si fotografi PNG, bashkë me të gjitha shtresat e ndezura."],
    ["Shkarko GeoJSON", "Shkarkon të dhënat e shtresave në formatin GeoJSON, të përdorshme në QGIS ose ArcGIS."],
    ["Vegla e matjes", "Hap menynë me dy mundësi: matje distance ose matje sipërfaqeje."],
    ["Raporto problem", "Aktivizon regjimin e raportimit të një problemi mbi hartë."],
    ["Navigim", "Aktivizon regjimin e navigimit deri te një biznes i zgjedhur."],
    ["Hiq rrugën", "Fshin nga harta rrugën e vizatuar."]
], "Vegla", "Funksioni");

h2("Matja e distancës dhe e sipërfaqes");
p("Pasi zgjidhet lloji i matjes, klikoni pikat mbi hartë. Për distancë, çdo klikim shton një segment dhe " +
  "gjatësia totale përditësohet vazhdimisht. Për sipërfaqe, pikat formojnë një poligon dhe llogaritet " +
  "sipërfaqja e tij. Rezultati shfaqet në një kuti mbi hartë; shenja × në atë kuti i fshin matjet.");

h2("Raportimi i një problemi");
p("Pasi aktivizohet vegla, klikoni mbi vendin ku ndodhet problemi. Hapet një formular ku plotësohet lloji " +
  "i problemit, përshkrimi dhe data; koordinatat në sistemin Kosovaref01 plotësohen vetvetiu. Pas ruajtjes, " +
  "pika shfaqet si shenjë e kuqe mbi hartë.");
p("Raportet ruhen vetëm në shfletuesin tuaj. Çdo raport mund të hiqet duke e klikuar dhe duke zgjedhur " +
  "“Hiq nga harta”, ose të gjitha njëherësh nga paneli i shtresave.");

/* ------------------------------------ 8 ------------------------------------- */

h1("8. Simbolizimi sipas shkallës");
p("Që harta të mbetet e lexueshme, bizneset paraqiten ndryshe varësisht sa afër jeni. Ky është " +
  "përgjithësim kartografik: sa më e vogël shkalla, aq më i thjeshtë simboli.");
table([
    ["1:4 000 dhe 1:2 000", "Pika të thjeshta me ngjyrën e kategorisë. Emrat nuk shfaqen, që harta të mos mbingarkohet."],
    ["1:1 000", "Rreth me ngjyrën e kategorisë dhe logon e biznesit brenda tij."],
    ["1:500 e më afër", "Vetëm logoja, e vendosur mbi objektin dhe e përmasuar sipas tij."]
], "Shkalla", "Si duken bizneset");
p("Stacionet e shërbimeve kanë simbole të veçanta: rreth me ngjyrë dhe shenjë dalluese për autobusin, " +
  "trenin dhe taksinë; spitali paraqitet me kryqin e kuq mbi sfond të bardhë, sipas simbolit ndërkombëtar.");

/* ------------------------------------ 9 ------------------------------------- */

h1("9. Përdorimi në telefon");
p("Aplikacioni është përshtatur posaçërisht për ekrane të vogla.");
bullets([
    "Paneli hapet me butonin e rrumbullakët poshtë-djathtas dhe ngjitet nga fundi i ekranit.",
    "Butonat e veglave janë mjaftueshëm të mëdhenj për t’u prekur me gisht dhe nuk mbivendosen me butonat e zmadhimit.",
    "Zmadhimi bëhet me dy gishta; harta prapëseprapë ndalet te shkallët fikse.",
    "Rreshti i koordinatave nuk shfaqet, sepse ai ka kuptim vetëm me kursorin e miut.",
    "Klikimi mbi një biznes nuk e hap panelin — harta mbetet e dukshme."
]);

/* ------------------------------------ 10 ------------------------------------ */

h1("10. Sistemi referues dhe shkalla");
p("Të dhënat janë të përgatitura në sistemin referues zyrtar të Kosovës, EPSG:9141 — KOSOVAREF01 / " +
  "Balkans zone 7. Koordinatat e kursorit shfaqen në fund të faqes pikërisht në këtë sistem, si Lindje (E) " +
  "dhe Veri (N) në metra.");
p("Pranë tyre shfaqet shkalla aktuale e hartës. Meqë zmadhimi kalon vetëm nëpër shkallë fikse, kjo vlerë " +
  "është gjithmonë e rrumbullakët dhe mund të citohet drejtpërdrejt në raport ose në punim.");

/* ------------------------------------ 11 ------------------------------------ */

h1("11. Zgjidhja e problemeve");
table([
    ["Harta nuk shfaqet", "Kontrolloni lidhjen me internetin — sfondi i hartës merret nga interneti."],
    ["Nuk shoh ndryshimet e fundit", "Rifreskoni faqen duke mbajtur Ctrl dhe duke shtypur R, që shfletuesi të mos përdorë kopjen e ruajtur."],
    ["Bizneset nuk duken", "Sigurohuni që shtresa “Bizneset” është e ndezur dhe se nuk është fikur ndonjë kategori."],
    ["Bizneset u zhdukën papritur", "Ndoshta është ndezur një shtresë shërbimesh; fikeni atë dhe bizneset kthehen."],
    ["Rruga nuk vizatohet", "Rruga llogaritet nga pika “TI JE KËTU”; prisni ngarkimin e plotë të hartës dhe provoni sërish."],
    ["Fotoja e ruajtur del e zbrazët", "Prisni derisa harta të ngarkohet plotësisht para se ta ruani."]
], "Situata", "Çfarë të bëni");

/* ------------------------- Numërimi i faqeve (fundi) ------------------------- */

const range = doc.bufferedPageRange();
for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    if (i === 0) continue; // pa numër te kopertina
    // Teksti bie nën margjinën e poshtme; pa e hequr përkohësisht atë, pdfkit
    // e quan faqen të mbushur dhe shton një faqe bosh për secilin fund faqeje.
    const keepBottom = doc.page.margins.bottom;
    doc.page.margins.bottom = 0;
    const y = doc.page.height - M + 6;
    doc.fillColor(C.muted).font("Helvetica").fontSize(8)
       .text("The Village WebGIS — Manuali i përdorimit", M, y, { width: W / 2, lineBreak: false });
    doc.fillColor(C.muted).font("Helvetica").fontSize(8)
       .text(String(i + 1), M + W / 2, y, { width: W / 2, align: "right", lineBreak: false });
    doc.page.margins.bottom = keepBottom;
}

doc.end();
