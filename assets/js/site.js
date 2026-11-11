/* A Miracle Smile — site behavior (no dependencies) */

// Where form submissions go: the Vercel function in api/submit.js (emails the office through Resend).
// If it isn't set up yet, the visitor is asked to call instead.
const FORM_ENDPOINT = "/api/submit";
const PHONE = "(916) 441-3311";

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
document.documentElement.classList.remove("no-js");

/* ---------- Header: transparent over the hero, solid after scrolling ---------- */
const header = document.querySelector(".site-header");
if (header) {
  const alwaysSolid = document.body.dataset.header === "solid";
  const update = () => header.classList.toggle("is-solid", alwaysSolid || window.scrollY > 80);
  update();
  window.addEventListener("scroll", update, { passive: true });
}

/* ---------- Announcement bar (homepage): scrolls away; the fixed header sits just below it until then ---------- */
const announce = document.querySelector(".announce");
if (announce && !document.documentElement.classList.contains("announce-off")) {
  const root = document.documentElement;
  const place = () => root.style.setProperty("--announce-offset", `${Math.max(0, announce.offsetHeight - window.scrollY)}px`);
  place();
  window.addEventListener("scroll", place, { passive: true });
  window.addEventListener("resize", place);
  announce.querySelector(".announce-close").addEventListener("click", () => {
    window.removeEventListener("scroll", place);
    window.removeEventListener("resize", place);
    root.classList.add("announce-off");
    root.style.removeProperty("--announce-offset");
    try { sessionStorage.setItem("ms-announce", "closed"); } catch (e) {}
  });
}

/* ---------- Side panel menu ---------- */
const panel = document.getElementById("panel");
const openBtn = document.querySelector("[data-menu-open]");
let lastFocus = null;

function openPanel() {
  lastFocus = document.activeElement;
  document.body.classList.add("panel-open");
  panel.removeAttribute("inert");
  panel.setAttribute("aria-hidden", "false");
  openBtn.setAttribute("aria-expanded", "true");
  panel.querySelector(".panel-nav a").focus({ preventScroll: true });
}
function closePanel() {
  document.body.classList.remove("panel-open");
  panel.setAttribute("inert", "");
  panel.setAttribute("aria-hidden", "true");
  openBtn.setAttribute("aria-expanded", "false");
  if (lastFocus) lastFocus.focus();
}

if (panel && openBtn) {
  panel.setAttribute("inert", "");
  openBtn.addEventListener("click", openPanel);
  document.querySelectorAll("[data-menu-close]").forEach((el) => el.addEventListener("click", closePanel));
  document.addEventListener("keydown", (e) => {
    if (!document.body.classList.contains("panel-open")) return;
    if (e.key === "Escape") closePanel();
    if (e.key === "Tab") {
      const items = [...panel.querySelectorAll("a, button")].filter((el) => el.offsetParent !== null);
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
}

/* ---------- Photo slots: until a photo is added to assets/media, show the teal gradient instead ---------- */
document.querySelectorAll(".ph img").forEach((img) => {
  const mark = () => img.closest(".ph").classList.add("is-empty");
  if (img.complete && img.naturalWidth === 0) mark();
  img.addEventListener("error", mark);
});

/* ---------- Reveal on scroll ---------- */
const revealEls = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window && !reduceMotion) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-in"); io.unobserve(entry.target); }
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  revealEls.forEach((el) => {
    if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("is-in");
    else io.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add("is-in"));
}

/* ---------- Visit steps: curved line through each step's dot, drawn as you scroll ---------- */
const steps = document.querySelector(".steps");
if (steps) {
  const svg = steps.querySelector(".steps-line");
  const track = svg.querySelector(".track");
  const line = svg.querySelector(".progress");

  const progress = () => {
    const len = +line.dataset.len || 0;
    if (reduceMotion) { line.style.strokeDashoffset = 0; return; }
    const r = steps.getBoundingClientRect();
    const seen = Math.min(Math.max((window.innerHeight * 0.6 - r.top) / r.height, 0), 1);
    line.style.strokeDashoffset = len * (1 - seen);
  };
  const draw = () => {
    const box = steps.getBoundingClientRect();
    const pts = [...steps.querySelectorAll(".step-dot")].map((dot) => {
      const r = dot.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top };
    });
    if (pts.length < 2) return;
    svg.setAttribute("viewBox", `0 0 ${box.width} ${box.height}`);
    // Wide screens: the line swings left and right between steps. Narrow: it runs straight down the edge.
    const swing = box.width < 700 ? 0 : Math.min(box.width * 0.16, 200);
    let d = `M ${pts[0].x} ${pts[0].y}`;
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1], b = pts[i];
      const bend = swing * (i % 2 ? 1 : -1);
      const midY = (a.y + b.y) / 2;
      d += ` C ${a.x + bend} ${midY}, ${b.x + bend} ${midY}, ${b.x} ${b.y}`;
    }
    track.setAttribute("d", d);
    line.setAttribute("d", d);
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.dataset.len = len;
    progress();
  };
  draw();
  window.addEventListener("resize", draw);
  window.addEventListener("load", draw);
  window.addEventListener("scroll", progress, { passive: true });
}

/* ---------- Office hours: bold today's row ---------- */
document.querySelectorAll(".hours [data-day]").forEach((row) => {
  if (+row.dataset.day === new Date().getDay()) row.classList.add("is-today");
});

/* ---------- Forms: validate, send, show thank-you ---------- */
document.querySelectorAll("form[data-form]").forEach((form) => {
  form.noValidate = true;
  const check = (field) => {
    const input = field.querySelector("input:not([type=radio]), select, textarea");
    if (!input) return true;
    const ok = input.checkValidity();
    field.classList.toggle("invalid", !ok);
    return ok;
  };
  form.querySelectorAll(".field").forEach((field) => {
    field.addEventListener("change", () => field.classList.contains("invalid") && check(field));
    field.addEventListener("input", () => field.classList.contains("invalid") && check(field));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const bad = [...form.querySelectorAll(".field")].filter((f) => !check(f));
    if (bad.length) { bad[0].querySelector("input, select, textarea").focus(); return; }

    const button = form.querySelector("[type=submit]");
    button.disabled = true;
    const thanks = form.nextElementSibling;
    try {
      const res = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (!res.ok) throw new Error(res.status);
      form.classList.add("is-sent");
      thanks.setAttribute("tabindex", "-1");
      thanks.focus();
    } catch {
      button.disabled = false;
      form.querySelector(".form-note").textContent = `That didn't go through. Please call us at ${PHONE} and we'll get you scheduled.`;
    }
  });
});

/* ---------- Headings: light weight with one bold word (data-key) ---------- */
document.querySelectorAll("[data-key]").forEach((el) => {
  const text = el.textContent, key = el.dataset.key.replace(/&nbsp;/g, " "), i = text.indexOf(key);
  if (i < 0) return;
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  el.classList.add("kh");
  el.innerHTML = `${esc(text.slice(0, i))}<span class="k">${esc(key)}</span>${esc(text.slice(i + key.length))}`;
});

/* ---------- Site search: instant results from a small index of what's on each page ---------- */
const SEARCH_INDEX = [
  { t: "Request an appointment", d: "Pick a day and time, we call to confirm", u: "book.html", s: "Booking", k: "book booking schedule appointment visit new patient reserve" },
  { t: "New patient visit", d: "Exam, cleaning and a plan for your smile", u: "index.html#new-patients", s: "New patients", k: "new patient first visit exam checkup what to bring insurance card" },
  { t: "Dental emergencies", d: `Toothache, broken tooth or swelling: call ${PHONE}`, u: "index.html#emergency", s: "Care", k: "emergency pain toothache broken chipped cracked swelling knocked out urgent" },
  { t: "Cleanings & checkups", d: "Professional cleanings, exams and oral cancer screenings", u: "services.html#preventive", s: "Services", k: "cleaning checkup exam hygiene oral cancer screening prevention" },
  { t: "Sealants for children", d: "A protective coating for kids' back teeth", u: "services.html#preventive", s: "Services", k: "kids children child sealant cavity prevention family" },
  { t: "Gum disease therapy", d: "Treatment for bleeding, receding or infected gums", u: "services.html#preventive", s: "Services", k: "gum periodontal periodontitis gingivitis bleeding deep cleaning scaling" },
  { t: "Fillings & bonding", d: "Tooth-colored repairs for cavities and chips", u: "services.html#restorative", s: "Services", k: "filling cavity bonding composite chip tooth colored" },
  { t: "Crowns & bridges", d: "Rebuild a damaged tooth or replace a missing one", u: "services.html#restorative", s: "Services", k: "crown cap bridge missing tooth porcelain" },
  { t: "Root canal treatment", d: "Save an infected tooth and stop the pain", u: "services.html#restorative", s: "Services", k: "root canal endodontic infection abscess nerve pain" },
  { t: "Tooth extractions", d: "Gentle removal when a tooth can't be saved", u: "services.html#restorative", s: "Services", k: "extraction pull remove tooth wisdom" },
  { t: "Dental implants", d: "A permanent replacement for a missing tooth", u: "services.html#implants", s: "Services", k: "implant missing tooth replacement permanent" },
  { t: "Porcelain veneers", d: "Reshape and brighten your front teeth", u: "services.html#cosmetic", s: "Services", k: "veneer cosmetic smile makeover porcelain" },
  { t: "Teeth whitening", d: "A brighter smile, professionally done", u: "services.html#cosmetic", s: "Services", k: "whitening bleaching white brighter stains cosmetic" },
  { t: "Orthodontics", d: "Clear aligners, traditional braces and lingual braces", u: "services.html#orthodontics", s: "Services", k: "braces aligners clear invisible straighten crooked teeth orthodontic lingual" },
  { t: "TMJ / TMD treatment", d: "Relief for jaw pain, clicking and clenching", u: "services.html#comfort", s: "Services", k: "tmj tmd jaw pain clicking grinding clenching headache" },
  { t: "Meet Dr. Dezham", d: "Hassan M. Dezham, DDS · 20+ years in Sacramento", u: "about.html", s: "About", k: "doctor dentist dezham about bio education experience" },
  { t: "Office hours", d: "Mon–Thu 8 to 5 · Fri by appointment", u: "contact.html#hours", s: "Contact", k: "hours open closed time friday saturday sunday" },
  { t: "Contact & directions", d: `3009 K St, Suite 255, Sacramento · ${PHONE}`, u: "contact.html", s: "Contact", k: "contact phone call fax address directions map location parking midtown" },
  { t: "Insurance & payment", d: "Call with your plan and we'll check your benefits", u: "index.html#faq", s: "FAQ", k: "insurance ppo payment cost price pay plan benefits" },
  { t: "Common questions", d: "Insurance, first visits, kids, emergencies", u: "index.html#faq", s: "FAQ", k: "faq questions" },
];
const POPULAR = [0, 2, 3, 10];

const search = document.getElementById("search");
if (search) {
  const input = document.getElementById("search-input");
  const list = document.getElementById("search-results");
  const hint = document.getElementById("search-hint");
  let active = 0;
  let lastSearchFocus = null;

  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const render = () => {
    const words = input.value.toLowerCase().split(/\s+/).filter(Boolean);
    let items;
    if (!words.length) {
      items = POPULAR.map((i) => SEARCH_INDEX[i]);
      hint.textContent = "Popular";
    } else {
      items = SEARCH_INDEX
        .map((it) => {
          const title = it.t.toLowerCase(), rest = `${it.d} ${it.k} ${it.s}`.toLowerCase();
          let score = 0;
          for (const w of words) {
            if (title.includes(w)) score += 13;
            else if (rest.includes(w)) score += 10;
          }
          return { it, score };
        })
        .filter((r) => r.score > 0)
        .sort((a, b) => b.score - a.score)
        .map((r) => r.it);
      hint.textContent = items.length ? "Results" : "";
    }
    active = 0;
    list.innerHTML = items.length
      ? items.map((it, i) => `<li><a href="${it.u}"${i === 0 ? ' class="is-active"' : ""}><strong>${esc(it.t)}</strong><span>${esc(it.d)}</span><em>${esc(it.s)}</em></a></li>`).join("")
      : `<li class="search-empty">Nothing found. Try "cleaning", "implant" or "hours", or call ${PHONE}.</li>`;
  };
  const highlight = (i) => {
    const links = [...list.querySelectorAll("a")];
    if (!links.length) return;
    active = (i + links.length) % links.length;
    links.forEach((a, j) => a.classList.toggle("is-active", j === active));
  };
  const openSearch = () => {
    if (document.body.classList.contains("panel-open")) closePanel();
    lastSearchFocus = document.activeElement;
    search.hidden = false;
    requestAnimationFrame(() => search.classList.add("is-open"));
    document.body.style.overflow = "hidden";
    input.value = "";
    render();
    setTimeout(() => input.focus(), 50);
  };
  const closeSearch = () => {
    search.classList.remove("is-open");
    document.body.style.overflow = "";
    setTimeout(() => { search.hidden = true; }, 300);
    if (lastSearchFocus) lastSearchFocus.focus();
  };

  document.querySelectorAll("[data-search-open]").forEach((b) => b.addEventListener("click", openSearch));
  search.querySelector("[data-search-close]").addEventListener("click", closeSearch);
  search.addEventListener("click", (e) => { if (e.target === search) closeSearch(); });
  input.addEventListener("input", render);
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); highlight(active + 1); }
    if (e.key === "ArrowUp") { e.preventDefault(); highlight(active - 1); }
    if (e.key === "Enter") {
      const link = list.querySelectorAll("a")[active];
      if (link) window.location.href = link.getAttribute("href");
    }
  });
  document.addEventListener("keydown", (e) => {
    const typing = /input|textarea|select/i.test(document.activeElement.tagName);
    if (!search.hidden && e.key === "Escape") closeSearch();
    else if (search.hidden && ((e.key === "/" && !typing) || ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k"))) { e.preventDefault(); openSearch(); }
  });
}

/* ---------- Footer year ---------- */
document.querySelectorAll("[data-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });
