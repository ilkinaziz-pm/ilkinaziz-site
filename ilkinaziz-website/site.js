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
