/* Public site — renders live from data/content.json (edited via /admin) */
(function () {
  const root = document.documentElement;
  const LANGS = ["en", "az", "ru"];
  let CONTENT = null, LANG = "en";
  const san = (k) => k.replace(/[^a-z0-9]+/gi, "_");

  document.getElementById("year").textContent = new Date().getFullYear();
  const getLS = (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const setLS = (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} };
  function el(t, c, x) { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; }
  function stripHTML(s) { const d = document.createElement("div"); d.innerHTML = s || ""; return d.textContent || ""; }
  function u(key) { const o = CONTENT.ui[san(key)]; return o ? (o[LANG] != null && o[LANG] !== "" ? o[LANG] : o.en) : null; }
  function pick(o) { return (o && (o[LANG] != null && o[LANG] !== "" ? o[LANG] : o.en)) || ""; }

  /* theme */
  const themeToggle = document.getElementById("themeToggle");
  const savedTheme = getLS("theme");
  if (savedTheme) root.setAttribute("data-theme", savedTheme);
  else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches) root.setAttribute("data-theme", "light");
  themeToggle.addEventListener("click", () => {
    const next = root.getAttribute("data-theme") === "light" ? "dark" : "light";
    root.setAttribute("data-theme", next); setLS("theme", next);
  });

  /* nav */
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 24);
  onScroll(); window.addEventListener("scroll", onScroll, { passive: true });
  document.getElementById("navToggle").addEventListener("click", () => nav.classList.toggle("open"));
  document.querySelectorAll(".nav__links a").forEach((a) => a.addEventListener("click", () => nav.classList.remove("open")));

  /* reveal */
  function reveal() {
    const els = document.querySelectorAll(".reveal:not(.in)");
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver((es) => es.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } }), { threshold: 0.12 });
      els.forEach((e) => io.observe(e));
    } else els.forEach((e) => e.classList.add("in"));
  }

  /* text */
  function applyText() {
    document.querySelectorAll("[data-i18n]").forEach((e) => { const v = u(e.getAttribute("data-i18n")); if (v != null) e.textContent = v; });
    document.querySelectorAll("[data-i18n-html]").forEach((e) => { const v = u(e.getAttribute("data-i18n-html")); if (v != null) e.innerHTML = v; });
    document.querySelectorAll("[data-i18n-ph]").forEach((e) => { const v = u(e.getAttribute("data-i18n-ph")); if (v != null) e.setAttribute("placeholder", v); });
    const ml = document.querySelector('[data-i18n="train.s3b"]');
    const s3 = u("train.s3"); if (ml && s3) ml.textContent = stripHTML(s3).replace(/\*/g, "").trim();
  }

  function renderExperience() {
    const ul = document.getElementById("experienceList"); ul.innerHTML = "";
    (CONTENT.experience || []).forEach((it) => {
      const li = el("li", "timeline__item reveal in");
      const meta = el("div", "timeline__meta"); meta.appendChild(el("span", "timeline__years", pick(it.years)));
      const body = el("div", "timeline__body");
      body.appendChild(el("h3", null, pick(it.role)));
      body.appendChild(el("p", "timeline__org", it.org || ""));
      body.appendChild(el("p", "timeline__desc", pick(it.desc)));
      li.appendChild(meta); li.appendChild(body); ul.appendChild(li);
    });
  }
  function renderProjects() {
    const g = document.getElementById("projectsGrid"); g.innerHTML = "";
    (CONTENT.projects || []).forEach((p) => {
      const c = el("article", "card reveal in");
      c.appendChild(el("span", "card__tag", pick(p.tag)));
      c.appendChild(el("h3", null, p.title || ""));
      c.appendChild(el("p", null, pick(p.desc)));
      g.appendChild(c);
    });
  }
  function renderSkills() {
    const g = document.getElementById("skillsGrid"); g.innerHTML = "";
    (CONTENT.skills || []).forEach((s) => {
      const c = el("article", "skillset reveal in");
      c.appendChild(el("h3", null, pick(s.group)));
      const ul = el("ul", "chips");
      (s.items || []).forEach((it) => ul.appendChild(el("li", null, pick(it))));
      c.appendChild(ul); g.appendChild(c);
    });
  }
  function renderSpeaking() {
    const g = document.getElementById("speakingGrid"); g.innerHTML = "";
    (CONTENT.speaking || []).forEach((sp) => {
      const c = el("article", "card reveal in");
      c.appendChild(el("span", "card__tag", pick(sp.tag)));
      c.appendChild(el("h3", null, sp.title || ""));
      c.appendChild(el("p", null, pick(sp.desc)));
      if (sp.link) { const a = el("a", "card__link", u("speak.watch") || "Watch / learn more →"); a.href = sp.link; a.target = "_blank"; a.rel = "noopener"; c.appendChild(a); }
      g.appendChild(c);
    });
  }

  function applySettings() {
    const s = CONTENT.settings || {};
    if (s.portrait) document.getElementById("portrait").src = s.portrait;
    if (s.cv) document.getElementById("cvLink").href = s.cv;
    if (s.menteeCount) document.getElementById("menteeNum").textContent = s.menteeCount;
    const badges = document.getElementById("heroBadges"); badges.innerHTML = "";
    (s.badges || []).forEach((b) => badges.appendChild(el("li", null, b)));
    if (s.email) {
      const e1 = document.getElementById("emailLink");
      e1.textContent = s.email; e1.href = "mailto:" + s.email;
      document.getElementById("emailLink2").href = "mailto:" + s.email;
    }
    const li = document.getElementById("linkedinLink");
    if (s.linkedin) { li.href = s.linkedin; li.style.display = ""; } else { li.style.display = "none"; }
    if (s.phone) { const p = document.getElementById("phoneLink"); p.textContent = s.phone; p.href = "tel:" + s.phone.replace(/[^+\d]/g, ""); }
  }

  function setLang(lang) {
    if (!LANGS.includes(lang)) lang = "en";
    LANG = lang;
    applyText(); renderExperience(); renderProjects(); renderSkills(); renderSpeaking();
    root.setAttribute("lang", lang);
    document.querySelectorAll(".lang__btn").forEach((b) => b.classList.toggle("active", b.getAttribute("data-lang") === lang));
    setLS("lang", lang); reveal();
  }
  document.getElementById("lang").addEventListener("click", (e) => { const b = e.target.closest(".lang__btn"); if (b) setLang(b.getAttribute("data-lang")); });

  function initForm() {
    const form = document.getElementById("contactForm"), note = document.getElementById("formNote");
    const s = CONTENT.settings || {}, TO = s.email || "ilkinaziz02@gmail.com", fid = s.formspreeId || "";
    const msg = (t) => { note.hidden = false; note.textContent = t; };
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value.trim(), email = document.getElementById("email").value.trim(), message = document.getElementById("message").value.trim();
      if (!name || !email || !message) { msg("Please fill in your name, email, and a message."); return; }
      if (fid) {
        try { msg("Sending…");
          const res = await fetch("https://formspree.io/f/" + fid, { method: "POST", headers: { Accept: "application/json" }, body: new FormData(form) });
          if (res.ok) { form.reset(); msg("Thanks — your message has been sent."); } else msg("Something went wrong. Please email " + TO + ".");
        } catch (err) { msg("Network issue — please email " + TO + "."); }
        return;
      }
      window.location.href = "mailto:" + TO + "?subject=" + encodeURIComponent("Website message from " + name) + "&body=" + encodeURIComponent(message + "\n\n— " + name + "\n" + email);
      msg("Opening your email app… if nothing happens, write to " + TO + ".");
    });
  }

  fetch("content.json").then((r) => r.json()).then((data) => {
    CONTENT = data; applySettings();
    let start = getLS("lang");
    if (!start) { const n = (navigator.language || "en").slice(0, 2).toLowerCase(); start = LANGS.includes(n) ? n : "en"; }
    setLang(start); initForm(); reveal();
  }).catch(() => { document.body.innerHTML = "<p style='padding:2rem;font-family:sans-serif'>Could not load site content.</p>"; });
})();
/* ============================================================
   Enhancements (append-only, safe): favicon, employer logo strip,
   count-up stats. Paste this at the very END of site.js.
   ============================================================ */
(function () {
  // --- Favicon: IA monogram, injected as an SVG data URI ---
  try {
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="%230c0c10"/><text x="32" y="45" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="700" fill="%23ff4d2e" text-anchor="middle">IA</text></svg>';
    var fav = document.createElement("link");
    fav.rel = "icon";
    fav.type = "image/svg+xml";
    fav.href = "data:image/svg+xml," + svg;
    document.head.appendChild(fav);
  } catch (e) {}

  // --- Employer logo strip (text wordmarks) inserted above Experience ---
  function buildLogos() {
    if (document.getElementById("logoStrip")) return;
    var exp = document.getElementById("experience");
    if (!exp || !exp.parentNode) return;
    var names = ["PASHA Bank", "Kapital Bank", "AzerGold", "Coca-Cola", "Digital Services", "G-5 Group"];
    var sec = document.createElement("section");
    sec.id = "logoStrip";
    sec.className = "logos reveal in";
    var html = '<p class="logos__label">Where I’ve delivered</p><div class="logos__track">';
    names.concat(names).forEach(function (n) { html += '<span class="logos__item">' + n + "</span>"; });
    html += "</div>";
    sec.innerHTML = html;
    exp.parentNode.insertBefore(sec, exp);
  }

  // --- Count-up animation for the stat numbers ---
  function countUp(elm) {
    var raw = elm.getAttribute("data-target") || elm.textContent.trim();
    elm.setAttribute("data-target", raw);
    var m = raw.match(/^(\D*)(\d+)(.*)$/);
    if (!m) return;
    var pre = m[1], target = parseInt(m[2], 10), suf = m[3], start = null, dur = 1200;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      elm.textContent = pre + Math.floor(p * target) + suf;
      if (p < 1) requestAnimationFrame(step); else elm.textContent = raw;
    }
    requestAnimationFrame(step);
  }
  function initCounts() {
    var nums = document.querySelectorAll(".stat__num, .tstat__num");
    if (!nums.length || !("IntersectionObserver" in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (en) { if (en.isIntersecting) { countUp(en.target); io.unobserve(en.target); } });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  }

  function run() { buildLogos(); initCounts(); }
  if (document.readyState !== "loading") setTimeout(run, 600);
  else window.addEventListener("DOMContentLoaded", function () { setTimeout(run, 600); });
  window.addEventListener("load", function () { setTimeout(run, 300); });
})();
/* ============================================================
   Enhancements v2 (append-only, safe): scroll bar, PM quiz,
   WhatsApp button, SEO schema, Konami easter egg.
   Paste at the very END of site.js.
   ============================================================ */
(function () {
  // --- Scroll progress bar ---
  try {
    var bar = document.createElement("div");
    bar.id = "scrollBar";
    document.body.appendChild(bar);
    var upd = function () {
      var h = document.documentElement;
      var sc = h.scrollTop / (h.scrollHeight - h.clientHeight);
      bar.style.transform = "scaleX(" + (sc || 0) + ")";
    };
    upd();
    window.addEventListener("scroll", upd, { passive: true });
  } catch (e) {}

  // --- SEO: Person structured data ---
  try {
    var ld = {
      "@context": "https://schema.org", "@type": "Person",
      name: "Ilkin Aziz", jobTitle: "Project Manager",
      address: { "@type": "PostalAddress", addressLocality: "Baku", addressCountry: "AZ" },
      sameAs: ["https://www.linkedin.com/in/ilkin-aziz/", "https://www.instagram.com/ilkinazizpm/"],
      knowsAbout: ["Project Management", "Agile", "Scrum", "PMP", "Risk Management", "Stakeholder Management"]
    };
    var sc = document.createElement("script");
    sc.type = "application/ld+json";
    sc.textContent = JSON.stringify(ld);
    document.head.appendChild(sc);
  } catch (e) {}

  // --- WhatsApp quick button in contact ---
  try {
    var soc = document.querySelector(".contact__socials");
    if (soc && !document.getElementById("waLink")) {
      var wa = document.createElement("a");
      wa.id = "waLink"; wa.href = "https://wa.me/994105113011";
      wa.target = "_blank"; wa.rel = "noopener"; wa.textContent = "WhatsApp";
      soc.appendChild(wa);
    }
  } catch (e) {}

  // --- PM knowledge quiz (injected before Contact) ---
  function buildQuiz() {
    if (document.getElementById("pmQuiz")) return;
    var anchor = document.getElementById("contact");
    if (!anchor || !anchor.parentNode) return;
    var Q = [
      { q: "A stakeholder requests a scope change mid-sprint. Best first step?", a: ["Add it to the current sprint now", "Log it and take it to the product owner / backlog", "Reject it outright", "Ignore it until the retro"], c: 1 },
      { q: "Which is a lagging indicator of project health?", a: ["Sprint burndown", "Actual cost at completion", "Daily stand-up mood", "Backlog size"], c: 1 },
      { q: "“Definition of Done” primarily ensures…", a: ["Faster typing", "Shared, consistent quality criteria", "More meetings", "Larger scope"], c: 1 },
      { q: "Requirements are unclear and evolving. Best approach?", a: ["Pure Waterfall", "Agile / iterative", "No plan", "Fixed-bid only"], c: 1 },
      { q: "A risk is 90% likely with high impact. You should…", a: ["Accept it silently", "Mitigate and escalate with a plan", "Delete it from the register", "Wait and see"], c: 1 }
    ];
    var sec = document.createElement("section");
    sec.id = "pmQuiz"; sec.className = "quiz reveal in";
    var h = '<div class="quiz__inner"><h2 class="section__title">Test your PM knowledge</h2><p class="section__sub">Five quick questions — see how you score.</p><form id="pmQuizForm">';
    Q.forEach(function (item, i) {
      h += '<div class="quiz__q"><p class="quiz__qtext">' + (i + 1) + ". " + item.q + "</p>";
      item.a.forEach(function (opt, j) { h += '<label class="quiz__opt"><input type="radio" name="q' + i + '" value="' + j + '"> ' + opt + "</label>"; });
      h += "</div>";
    });
    h += '<button type="submit" class="btn btn--primary">See my score</button><p class="quiz__result" id="quizResult" hidden></p></div>';
    sec.innerHTML = h;
    anchor.parentNode.insertBefore(sec, anchor);
    var form = document.getElementById("pmQuizForm"), res = document.getElementById("quizResult");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var score = 0;
      Q.forEach(function (item, i) {
        var sel = form.querySelector('input[name="q' + i + '"]:checked');
        if (sel && parseInt(sel.value, 10) === item.c) score++;
      });
      var msg = score >= 4 ? "Sharp — you think like a delivery lead." : (score >= 2 ? "Solid instincts." : "Room to grow.");
      res.hidden = false;
      res.textContent = "You scored " + score + "/5. " + msg + " Want to go deeper? Let’s talk — scroll down.";
    });
  }

  // --- Konami easter egg ---
  try {
    var seq = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], pos = 0;
    document.addEventListener("keydown", function (e) {
      pos = (e.keyCode === seq[pos]) ? pos + 1 : 0;
      if (pos === seq.length) {
        pos = 0;
        var t = document.createElement("div");
        t.className = "toast";
        t.textContent = "🎉 On time, on scope, on budget.";
        document.body.appendChild(t);
        setTimeout(function () { t.remove(); }, 3000);
      }
    });
  } catch (e) {}

  function run() { buildQuiz(); }
  if (document.readyState !== "loading") setTimeout(run, 700);
  else window.addEventListener("DOMContentLoaded", function () { setTimeout(run, 700); });
  window.addEventListener("load", function () { setTimeout(run, 400); });
})();
