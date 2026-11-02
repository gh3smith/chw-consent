/* CHW Consent – core logic shared by the app and its tests.
   Positions are on SCN020.001 (Request/Consent for Medical Procedure Treatment, 25/05/15),
   in PDF points from the top-left of the page; y is the text baseline. */
(function (root) {
  "use strict";
  var PAGE_H = 845.64, FS = 9, FS_MIN = 6.5;
  var L = {
    fam: { x: 343, y: 18, w: 127 }, giv: { x: 337, y: 36, w: 128 }, mrn: { x: 491, y: 18, w: 70 },
    dd: { x: 316, y: 55, w: 26 }, mm: { x: 348, y: 55, w: 26 }, yy: { x: 379, y: 55, w: 38 }, mo: { x: 437, y: 55, w: 125 },
    a1: { x: 327, y: 75, w: 238 }, a2: { x: 293, y: 94, w: 272 }, ward: { x: 357, y: 113, w: 208 }, fac: { x: 107, y: 64, w: 178 },
    prac1: { x: 79, y: 153, w: 178 }, proc1: { x: 62, y: 188, w: 508 }, proc2l: { x: 62, y: 208, w: 508 },
    pracPrint: { x: 62, y: 225, w: 212 }, dt: { x: 457, y: 225, w: 48 }, tm: { x: 517, y: 225, w: 42 }, interp: { x: 151, y: 247, w: 130 },
    prac2: { x: 62, y: 283, w: 205 }, pt: { x: 354, y: 283, w: 210 }, cond: { x: 62, y: 308, w: 508 }, proc3: { x: 62, y: 334, w: 508 },
    sig: { x: 281, y: 207, w: 170, h: 21 },
    male: { x: 470.6, y: 35.3 }, female: { x: 513.8, y: 35.3 }, u14: { x: 112.6, y: 467.3 }, a14: { x: 180.5, y: 467.3 }, a16: { x: 240, y: 467.3 }
  };

  function winAnsi(s) {
    return String(s || "").replace(/[đĐ]/g, function (c) { return c === "đ" ? "d" : "D"; })
      .normalize("NFD").replace(/[̀-ͯ]/g, "")
      .replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-")
      .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?");
  }
  function titleCase(s) { return String(s || "").toLowerCase().replace(/(^|[\s'\-])([a-z])/g, function (m, a, b) { return a + b.toUpperCase(); }); }
  function ausDate(iso) { if (!iso) return ""; var p = iso.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function ageOn(dobIso, refIso) {
    if (!dobIso) return null;
    var b = new Date(dobIso + "T00:00:00"), r = refIso ? new Date(refIso + "T00:00:00") : new Date();
    var a = r.getFullYear() - b.getFullYear();
    if (r < new Date(r.getFullYear(), b.getMonth(), b.getDate())) a--;
    return a;
  }
  function ageBox(dobIso, refIso) { var a = ageOn(dobIso, refIso); if (a === null || isNaN(a)) return null; return a < 14 ? "u14" : a < 16 ? "a14" : "a16"; }

  function makeMeasure(font) { return function (t, s) { return font ? font.widthOfTextAtSize(t, s) : t.length * s * 0.5; }; }
  function fit(t, w, measure) { var s = FS; while (s > FS_MIN && measure(t, s) > w) s -= 0.25; return { s: s, over: measure(t, s) > w }; }
  function wrap2(text, w, measure) {
    var t = winAnsi(text).replace(/\s+/g, " ").trim();
    if (!t) return { lines: ["", ""], s: FS, over: false };
    for (var s = FS; s >= FS_MIN; s -= 0.25) {
      var words = t.split(" "), lines = [""];
      for (var i = 0; i < words.length; i++) {
        var cur = lines[lines.length - 1], tryL = cur ? cur + " " + words[i] : words[i];
        if (measure(tryL, s) <= w) lines[lines.length - 1] = tryL; else lines.push(words[i]);
      }
      if (lines.length <= 2 && lines.every(function (l) { return measure(l, s) <= w; })) return { lines: [lines[0], lines[1] || ""], s: s, over: false };
    }
    return { lines: [t, ""], s: FS_MIN, over: true };
  }

  /* d: plain data object from the app. Returns everything drawn on the form. */
  function layout(d, measure) {
    var out = [];
    function add(k, t) { t = winAnsi(t).trim(); if (!t) return; var f = fit(t, L[k].w, measure); out.push({ k: k, t: t, x: L[k].x, y: L[k].y, s: f.s, over: f.over }); }
    add("fam", (d.fam || "").toUpperCase()); add("giv", d.giv); add("mrn", d.mrn);
    if (d.dob) { var p = d.dob.split("-"); add("dd", p[2]); add("mm", p[1]); add("yy", p[0]); }
    add("mo", d.amo); add("fac", d.fac);
    add("prac1", d.prac); add("pracPrint", d.prac); add("prac2", d.prac);
    var w = wrap2(d.proc, L.proc1.w, measure);
    if (w.lines[0]) out.push({ k: "proc1", t: w.lines[0], x: L.proc1.x, y: L.proc1.y, s: w.s, over: w.over });
    if (w.lines[1]) out.push({ k: "proc2l", t: w.lines[1], x: L.proc2l.x, y: L.proc2l.y, s: w.s, over: false });
    if (d.proc) { add("dt", ausDate(d.dt)); add("tm", d.tm); }
    add("interp", d.interp);
    add("pt", [d.giv, d.fam ? titleCase(d.fam) : ""].filter(Boolean).join(" "));
    add("cond", d.cond); add("proc3", d.proc);
    var ticks = [];
    if (d.sex === "M") ticks.push("male"); if (d.sex === "F") ticks.push("female");
    var ab = ageBox(d.dob, d.dt); if (d.tickAge && ab) ticks.push(ab);
    var p3 = out.filter(function (o) { return o.k === "proc3"; })[0];
    return { text: out, ticks: ticks, procOver: w.over || !!(p3 && p3.over), procLineOver: !!(p3 && p3.over) };
  }

  function sigBox(aspect) {
    var r = aspect || 3, w = L.sig.w, h = w / r;
    if (h > L.sig.h) { h = L.sig.h; w = h * r; }
    return { x: L.sig.x + (L.sig.w - w) / 2, top: L.sig.y + (L.sig.h - h), w: w, h: h };
  }

  async function buildPdf(PDFLib, templateBytes, d, sig) {
    var doc = await PDFLib.PDFDocument.load(templateBytes);
    var page = doc.getPages()[0];
    var helv = await doc.embedFont(PDFLib.StandardFonts.Helvetica);
    var bold = await doc.embedFont(PDFLib.StandardFonts.HelveticaBold);
    var ink = PDFLib.rgb(0.07, 0.14, 0.37);
    var lay = layout(d, makeMeasure(helv));
    lay.text.forEach(function (t) { page.drawText(t.t, { x: t.x, y: PAGE_H - t.y, size: t.s, font: helv, color: ink }); });
    lay.ticks.forEach(function (k) { var w = bold.widthOfTextAtSize("X", 9); page.drawText("X", { x: L[k].x - w / 2, y: PAGE_H - L[k].y - 3.2, size: 9, font: bold, color: ink }); });
    if (sig && sig.png) {
      var img = await doc.embedPng(sig.png), b = sigBox(sig.aspect);
      page.drawImage(img, { x: b.x, y: PAGE_H - b.top - b.h, width: b.w, height: b.h });
    }
    doc.setTitle("Consent " + winAnsi(d.fam || "").toUpperCase() + " " + (d.mrn || ""));
    doc.setSubject("SCN020.001 Request/Consent for Medical Procedure Treatment");
    doc.setProducer("CHW Consent");
    return doc.save();
  }

  /* Read text copied or scanned (iPhone Live Text) from a patient label.
     Label layouts vary, so every result must be checked by the user. */
  var STATES = "NSW|ACT|VIC|QLD|SA|WA|TAS|NT";
  var MONTHS = { jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6, jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12 };
  function isoFrom(dd, mm, yy) {
    var d = +dd, m = isNaN(+mm) ? MONTHS[String(mm).slice(0, 3).toLowerCase()] : +mm, y = +yy;
    if (!m || !d) return "";
    if (y < 100) { var now = new Date().getFullYear() % 100; y = y <= now ? 2000 + y : 1900 + y; }
    if (m < 1 || m > 12 || d < 1 || d > 31 || y < 1900) return "";
    return y + "-" + String(m).padStart(2, "0") + "-" + String(d).padStart(2, "0");
  }
  var DATE_RE = /\b(\d{1,2})[\/.\- ](\d{1,2}|[A-Za-z]{3,9})[\/.\- ](\d{4}|\d{2})\b/;
  function parseLabel(raw) {
    var text = String(raw || "").replace(/\r/g, "");
    var lines = text.split("\n").map(function (l) { return l.replace(/\s+/g, " ").trim(); }).filter(Boolean);
    var all = lines.join("\n"), r = { fam: "", giv: "", mrn: "", dob: "", amo: "", sex: "", a1: "", a2: "", ward: "" }, used = {};
    var m;

    m = all.match(/\b(?:MRN|URN|UR\s*No\.?|UR|MR\s*No\.?|Hosp(?:ital)?\s*No\.?)\s*[:#.]?\s*([A-Z]{0,3}\d[\dA-Z\-]{3,})/i);
    if (m) r.mrn = m[1];
    m = all.match(/\b(?:DOB|D\.O\.B\.?|Born|Date of Birth)\s*[:.]?\s*(\d{1,2}[\/.\- ](?:\d{1,2}|[A-Za-z]{3,9})[\/.\- ](?:\d{4}|\d{2}))/i);
    var dm = (m ? m[1] : all).match(DATE_RE);
    if (dm) r.dob = isoFrom(dm[1], dm[2], dm[3]);
    m = all.match(/\b(?:Sex|Gender)\s*[:.]?\s*(Male|Female|M|F)\b/i) || all.match(/(?:^|\s)(Male|Female|M|F)(?=\s|$)/);
    if (m) r.sex = m[1].charAt(0).toUpperCase();
    // AMO (admitting medical officer): "AMO: LASTNAME, Firstname" becomes "Dr Firstname Lastname"
    for (var a = 0; a < lines.length; a++) {
      var am = lines[a].match(/\bA\.?M\.?O\.?\s*[:.\-]?\s*(.+)$/i);
      if (!am) continue;
      used[a] = 1;
      var who = am[1].split(/\s{2,}|\t|\b(?:MRN|URN|DOB|Ward|Sex)\b/i)[0].replace(/^(Dr\.?|Doctor|Prof\.?|A\/Prof\.?)\s+/i, "").trim();
      var cm = who.match(/^([^,]+),\s*(.+)$/);
      var full = cm ? titleCase(cm[2].trim()) + " " + titleCase(cm[1].trim()) : titleCase(who);
      if (full.trim()) r.amo = "Dr " + full.trim();
      break;
    }
    m = all.match(/\b(?:Ward|Location|Loc)\s*[:.]?\s*([^\n]+)/i);
    if (m) r.ward = m[1].trim();

    for (var i = 0; i < lines.length; i++) {
      if (new RegExp("\\b(" + STATES + ")\\b\\s*\\d{4}\\b").test(lines[i])) {
        r.a2 = lines[i].replace(/^(Address|Addr)\s*[:.]?\s*/i, "").toUpperCase(); used[i] = 1;
        if (i > 0 && /\d|\b(St|Street|Rd|Road|Ave|Avenue|Cres|Pl|Place|Dr|Drive|Ct|Court|Pde|Hwy|Lane|Ln|Way|Cl|Close|Unit|PO Box)\b/i.test(lines[i - 1]) && !DATE_RE.test(lines[i - 1])) {
          r.a1 = lines[i - 1].replace(/^(Address|Addr)\s*[:.]?\s*/i, ""); used[i - 1] = 1;
        }
        break;
      }
    }

    // Name: labelled, "SURNAME, Given", or the first line of plain words with an all-caps surname
    m = all.match(/\b(?:Name|Patient)\s*[:.]\s*([^\n]+)/i);
    var nameLine = m ? m[1] : "";
    if (!nameLine) {
      for (var j = 0; j < lines.length; j++) {
        if (used[j] || /\bA\.?M\.?O\b|\bDr\b/i.test(lines[j])) continue;
        var ln = lines[j];
        if (/\d/.test(ln) || /\b(MRN|URN|DOB|Sex|Ward|Medicare|Address|Hospital|Westmead|Children)\b/i.test(ln)) continue;
        if (/^[A-Z][A-Z'\-]+(?:\s[A-Z][A-Z'\-]+)?\s*,\s*[A-Za-z]/.test(ln) || /^[A-Z][A-Z'\-]{1,}\s+[A-Z][a-z]/.test(ln) || /[A-Z][a-z]+\s+[A-Z][A-Z'\-]{1,}$/.test(ln)) { nameLine = ln; break; }
      }
    }
    if (nameLine) {
      nameLine = nameLine.replace(/\s*\b(Male|Female|M|F)\b\s*$/, "").replace(/\s{2,}.*$/, "").trim();
      var c = nameLine.match(/^([^,]+),\s*(.+)$/);
      if (c) { r.fam = c[1].trim().toUpperCase(); r.giv = titleCase(c[2].trim()); }
      else {
        var parts = nameLine.split(" "), caps = parts.filter(function (p) { return /^[A-Z][A-Z'\-]+$/.test(p); });
        if (caps.length && caps.length < parts.length) {
          r.fam = caps.join(" ");
          r.giv = titleCase(parts.filter(function (p) { return caps.indexOf(p) < 0; }).join(" "));
        } else if (parts.length > 1) { r.fam = parts[parts.length - 1].toUpperCase(); r.giv = titleCase(parts.slice(0, -1).join(" ")); }
      }
    }
    if (!r.mrn) { // unlabelled: a 6-10 digit number that isn't a date, phone, postcode or Medicare number
      var nums = all.replace(/\bMedicare[^\n]*/ig, "").replace(new RegExp("\\b(" + STATES + ")\\s*\\d{4}\\b", "g"), "").match(/\b\d{6,10}\b/g) || [];
      if (nums.length) r.mrn = nums[0];
    }
    return r;
  }

  var api = { PAGE_H: PAGE_H, L: L, winAnsi: winAnsi, titleCase: titleCase, ausDate: ausDate, ageOn: ageOn, ageBox: ageBox,
    makeMeasure: makeMeasure, layout: layout, sigBox: sigBox, buildPdf: buildPdf, parseLabel: parseLabel };
  if (typeof module !== "undefined" && module.exports) module.exports = api; else root.ConsentCore = api;
})(typeof self !== "undefined" ? self : this);
