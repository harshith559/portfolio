/* =========================================================
   Koushik Mutthunuri - Portfolio
   ---------------------------------------------------------
   ADMIN: scroll to the footer -> click "Admin" -> password 1234
   Then use the bar at the bottom to add photos, videos,
   short films and to edit the About / Contact details.

   NOTE: uploads are saved inside THIS browser (IndexedDB).
   See the notes in the chat about showing them to the world.
   ========================================================= */

const ADMIN_PASSWORD = "1234";

/* ---------- Sample content (you can hide it from the admin bar) ---------- */
const samplePhotos = [
  { title: "Golden Hour",      category: "portrait",  src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=1000&q=80" },
  { title: "Mountain Silence", category: "landscape", src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1000&q=80" },
  { title: "City Rhythm",      category: "street",    src: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=1000&q=80" },
  { title: "Neon Dreams",      category: "creative",  src: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1000&q=80" },
  { title: "Quiet Gaze",       category: "portrait",  src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=1000&q=80" },
  { title: "Misty Valley",     category: "landscape", src: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1000&q=80" }
];
const sampleVideos = [
  { title: "Cinematic Showreel 2026", year: 2026, duration: "1:30", role: "DOP • Editor", desc: "A quick cut of my cinematography and editing work.",
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=1000&q=80",
    type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
];
const sampleFilms = [
  { title: "Echoes of Silence", year: 2026, duration: "8:24", role: "Director • DOP • Editor",
    desc: "A quiet short film about memory, loss and the sounds we leave behind.",
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1000&q=80",
    type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { title: "Last Train Home", year: 2025, duration: "5:47", role: "Cinematographer • Editor",
    desc: "One night, one platform and a decision that changes everything.",
    poster: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=1000&q=80",
    type: "youtube", url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" }
];

const DEFAULT_ABOUT = {
  heading: "Stories told through light & motion.",
  bio: "I'm Koushik Mutthunuri, a visual storyteller working across photography, cinematography and film editing. From still frames that freeze a moment to cinematic sequences that carry an audience, my work is driven by creativity and attention to detail.\n\nI shoot, light, direct and edit my own projects, so every frame stays true to the idea from the first spark to the final colour grade. This portfolio is a collection of my own original work, personal innovations, experiments and short films.",
  skills: "Photography, Cinematography, Video Editing, Colour Grading, Short Films, Sound Design",
  years: 5, statPhotos: 150, statVideos: 25, statFilms: 6,
  email: "yourname@example.com", phone: "+91 00000 00000", location: "Hyderabad, India"
};
const DEFAULT_PORTRAIT = "https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=900&q=80";

/* ---------- Helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

function detectType(url) {
  if (/youtu\.?be/.test(url)) return "youtube";
  if (/vimeo\.com/.test(url)) return "vimeo";
  return "file";
}
function youtubeId(url) {
  const m = url.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{11})/);
  return m ? m[1] : null;
}
function getEmbed(type, url) {
  if (type === "youtube") {
    const id = youtubeId(url);
    return id ? `<iframe src="https://www.youtube.com/embed/${id}?autoplay=1&rel=0" allow="autoplay; fullscreen" allowfullscreen></iframe>` : "<p style='padding:20px'>Invalid YouTube link.</p>";
  }
  if (type === "vimeo") {
    const m = url.match(/vimeo\.com\/(\d+)/);
    return m ? `<iframe src="https://player.vimeo.com/video/${m[1]}?autoplay=1" allow="autoplay; fullscreen" allowfullscreen></iframe>` : "<p style='padding:20px'>Invalid Vimeo link.</p>";
  }
  return `<video src="${url}" controls autoplay playsinline></video>`;
}

/* ---------- IndexedDB (stores your uploaded files in this browser) ---------- */
const DB_NAME = "koushik_portfolio", STORE = "items";
let dbPromise = null;
function openDB() {
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, 1);
      req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: "id" });
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  return dbPromise;
}
async function dbAll() {
  const db = await openDB();
  return new Promise((res, rej) => {
    const r = db.transaction(STORE).objectStore(STORE).getAll();
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function dbPut(item) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(item);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}
async function dbDelete(id) {
  const db = await openDB();
  return new Promise((res, rej) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).delete(id);
    tx.oncomplete = () => res();
    tx.onerror = () => rej(tx.error);
  });
}

/* ---------- State ---------- */
let stored = [];                 // everything saved by admin
let urlCache = {};               // blob -> object URL
let currentFilter = "all";
let visiblePhotos = [];
let currentIndex = 0;
let lists = { video: [], film: [] };

const hideSamples = () => localStorage.getItem("hideSamples") === "1";
const getDeleted = () => { try { return JSON.parse(localStorage.getItem("deletedSamples")) || []; } catch { return []; } };
const keepSample = id => !getDeleted().includes(id);
const getAbout = () => {
  try { return { ...DEFAULT_ABOUT, ...(JSON.parse(localStorage.getItem("about")) || {}) }; }
  catch { return { ...DEFAULT_ABOUT }; }
};
function blobUrl(id, blob) {
  if (!blob) return null;
  const key = id;
  if (!urlCache[key]) urlCache[key] = URL.createObjectURL(blob);
  return urlCache[key];
}

/* ---------- Build display lists ---------- */
function buildData() {
  const mine = stored.filter(i => i.kind !== "portrait").sort((a, b) => b.created - a.created);

  const photos = mine.filter(i => i.kind === "photo").map(i => ({
    id: i.id, custom: true, title: i.title, category: i.category, src: blobUrl(i.id, i.blob)
  }));
  const samples = hideSamples() ? [] : samplePhotos.map((p, n) => ({ ...p, id: "sp" + n, custom: false })).filter(p => keepSample(p.id));

  const toCard = (i, key) => {
    const isFile = i.sourceType === "file";
    const url = isFile ? blobUrl(i.id + "v", i.blob) : i.url;
    let poster = i.posterBlob ? blobUrl(i.id + "p", i.posterBlob) : null;
    if (!poster && i.sourceType === "youtube" && youtubeId(i.url || "")) poster = `https://img.youtube.com/vi/${youtubeId(i.url)}/hqdefault.jpg`;
    return { id: i.id, custom: true, title: i.title, year: i.year, duration: i.duration, role: i.role, desc: i.desc, poster, type: i.sourceType, url };
  };
  const mkSample = (arr, p) => hideSamples() ? [] : arr.map((f, n) => ({ ...f, id: p + n, custom: false })).filter(f => keepSample(f.id));

  lists.video = [...mine.filter(i => i.kind === "video").map(toCard), ...mkSample(sampleVideos, "sv")];
  lists.film = [...mine.filter(i => i.kind === "film").map(toCard), ...mkSample(sampleFilms, "sf")];
  return [...photos, ...samples];
}
let allPhotos = [];

/* ---------- Render: gallery ---------- */
function renderGallery() {
  visiblePhotos = currentFilter === "all" ? [...allPhotos] : allPhotos.filter(p => p.category === currentFilter);
  $("#gallery").innerHTML = visiblePhotos.map((p, i) => `
    <div class="gallery-item" data-index="${i}" style="animation-delay:${i * 50}ms">
      <img src="${p.src}" alt="${esc(p.title)}" loading="lazy" />
      <div class="overlay"><h4>${esc(p.title)}</h4><span>${esc(p.category)}</span></div>
      <button class="del-btn" data-del="${p.id}" title="Delete">&times;</button>
    </div>`).join("");
  $("#galleryEmpty").hidden = visiblePhotos.length > 0;
}

/* ---------- Render: videos & films ---------- */
function cardHTML(f, kind) {
  let thumb;
  if (f.poster) thumb = `<img src="${f.poster}" alt="${esc(f.title)}" loading="lazy" />`;
  else if (f.type === "file") thumb = `<video src="${f.url}#t=0.5" preload="metadata" muted></video>`;
  else thumb = `<div class="no-poster"></div>`;
  const meta = [f.year, f.role].filter(Boolean).join(" &nbsp;•&nbsp; ");
  return `
    <article class="film-card reveal visible" data-kind="${kind}" data-id="${f.id}">
      <div class="film-thumb">
        ${thumb}
        <span class="mini-play"></span>
        ${f.duration ? `<span class="film-duration">${esc(f.duration)}</span>` : ""}
      </div>
      <div class="film-body">
        <h3>${esc(f.title)}</h3>
        <p class="film-meta">${meta}</p>
        <p>${esc(f.desc)}</p>
      </div>
      <button class="del-btn" data-del="${f.id}" title="Delete">&times;</button>
    </article>`;
}
function renderVideos() {
  $("#videoGrid").innerHTML = lists.video.map(f => cardHTML(f, "video")).join("");
  $("#videoEmpty").hidden = lists.video.length > 0;
}
function renderFilms() {
  $("#filmGrid").innerHTML = lists.film.map(f => cardHTML(f, "film")).join("");
  $("#filmEmpty").hidden = lists.film.length > 0;
}

/* ---------- Render: about + contact ---------- */
const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count) || 0;
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 60));
    const timer = setInterval(() => {
      n = Math.min(n + step, target);
      el.textContent = n;
      if (n >= target) clearInterval(timer);
    }, 25);
    counterObserver.unobserve(el);
  });
}, { threshold: 0.6 });

function renderAbout() {
  const a = getAbout();
  $("#aboutHeading").textContent = a.heading;
  $("#aboutBio").innerHTML = String(a.bio).split(/\n\s*\n/).filter(Boolean).map(p => `<p>${esc(p.trim())}</p>`).join("");
  $("#skillsList").innerHTML = String(a.skills).split(",").map(s => s.trim()).filter(Boolean).map(s => `<li>${esc(s)}</li>`).join("");
  $("#aboutYears").textContent = `${a.years}+`;

  [["statPhotos", a.statPhotos], ["statVideos", a.statVideos], ["statFilms", a.statFilms]].forEach(([id, v]) => {
    const el = $("#" + id);
    el.dataset.count = v;
    el.textContent = "0";
    counterObserver.observe(el);
  });

  const portrait = stored.find(i => i.id === "portrait");
  $("#aboutImg").src = portrait ? blobUrl("portrait" + portrait.created, portrait.blob) : DEFAULT_PORTRAIT;

  const em = $("#contactEmail"); em.textContent = a.email; em.href = `mailto:${a.email}`;
  const ph = $("#contactPhone"); ph.textContent = a.phone; ph.href = `tel:${a.phone.replace(/[^\d+]/g, "")}`;
  $("#contactLoc").textContent = a.location;
}

function renderAll() {
  allPhotos = buildData();
  renderAbout();
  renderGallery();
  renderVideos();
  renderFilms();
  $("#samplesBtn").textContent = hideSamples() ? "Show sample content" : "Hide sample content";
}

async function reload() {
  try { stored = await dbAll(); } catch (e) { console.error(e); stored = []; }
  renderAll();
}

/* ---------- Navbar ---------- */
const navbar = $("#navbar");
const navLinks = $("#navLinks");
const menuToggle = $("#menuToggle");
window.addEventListener("scroll", () => navbar.classList.toggle("scrolled", window.scrollY > 60));
menuToggle.addEventListener("click", () => {
  menuToggle.classList.toggle("open");
  navLinks.classList.toggle("open");
});
$$("#navLinks a").forEach(a => a.addEventListener("click", () => {
  menuToggle.classList.remove("open");
  navLinks.classList.remove("open");
}));

/* ---------- Gallery filter + lightbox ---------- */
$("#filters").addEventListener("click", e => {
  const btn = e.target.closest(".filter");
  if (!btn) return;
  $$(".filter").forEach(f => f.classList.remove("active"));
  btn.classList.add("active");
  currentFilter = btn.dataset.filter;
  renderGallery();
});

const lightbox = $("#lightbox");
function showPhoto(i) {
  currentIndex = (i + visiblePhotos.length) % visiblePhotos.length;
  const p = visiblePhotos[currentIndex];
  $("#lbImg").src = p.src;
  $("#lbImg").alt = p.title;
  $("#lbCaption").textContent = p.title;
}
function openLightbox(i) {
  showPhoto(i);
  lightbox.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.style.overflow = "";
}
$("#gallery").addEventListener("click", e => {
  const del = e.target.closest(".del-btn");
  if (del) { e.stopPropagation(); deleteItem(del.dataset.del); return; }
  const item = e.target.closest(".gallery-item");
  if (item) openLightbox(Number(item.dataset.index));
});
$("#lbClose").addEventListener("click", closeLightbox);
$("#lbPrev").addEventListener("click", () => showPhoto(currentIndex - 1));
$("#lbNext").addEventListener("click", () => showPhoto(currentIndex + 1));
lightbox.addEventListener("click", e => { if (e.target === lightbox) closeLightbox(); });

/* ---------- Video player ---------- */
const videoModal = $("#videoModal");
const videoWrap = $("#videoWrap");
function openVideo(type, url) {
  videoWrap.innerHTML = getEmbed(type, url);
  videoModal.classList.add("open");
  document.body.style.overflow = "hidden";
}
function closeVideo() {
  videoModal.classList.remove("open");
  videoWrap.innerHTML = "";
  document.body.style.overflow = "";
}
$("#vmClose").addEventListener("click", closeVideo);
videoModal.addEventListener("click", e => { if (e.target === videoModal) closeVideo(); });

function onCardClick(e, kind) {
  const del = e.target.closest(".del-btn");
  if (del) { e.stopPropagation(); deleteItem(del.dataset.del); return; }
  const card = e.target.closest(".film-card");
  if (!card) return;
  const f = lists[kind].find(x => x.id === card.dataset.id);
  if (f) openVideo(f.type, f.url);
}
$("#videoGrid").addEventListener("click", e => onCardClick(e, "video"));
$("#filmGrid").addEventListener("click", e => onCardClick(e, "film"));

document.addEventListener("keydown", e => {
  if (e.key === "Escape") { closeLightbox(); closeVideo(); closeModal(); }
  if (lightbox.classList.contains("open")) {
    if (e.key === "ArrowLeft") showPhoto(currentIndex - 1);
    if (e.key === "ArrowRight") showPhoto(currentIndex + 1);
  }
});

/* ---------- Scroll reveal ---------- */
const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("visible");
    observer.unobserve(entry.target);
  });
}, { threshold: 0.15 });
$$(".reveal").forEach(el => observer.observe(el));

/* =========================================================
   ADMIN
   ========================================================= */
const modal = $("#modal");
const modalBox = $("#modalBox");
function openModal(html) {
  modalBox.innerHTML = html;
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  const first = $("input:not([type=file]), textarea", modalBox);
  if (first) setTimeout(() => first.focus(), 100);
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
}
modal.addEventListener("mousedown", e => { if (e.target === modal) closeModal(); });
modalBox.addEventListener("click", e => { if (e.target.matches("[data-close]")) closeModal(); });

const isAdmin = () => sessionStorage.getItem("isAdmin") === "1";
function applyAdmin() { document.body.classList.toggle("is-admin", isAdmin()); }

/* --- Login --- */
$("#adminLink").addEventListener("click", e => {
  e.preventDefault();
  if (isAdmin()) { document.body.classList.add("is-admin"); return; }
  openModal(`
    <h3>Admin Login</h3>
    <p class="m-sub">Enter the password to add or edit your work.</p>
    <form id="loginForm">
      <label>Password<input type="password" id="pw" autocomplete="current-password" /></label>
      <p class="m-error" id="loginErr"></p>
      <div class="m-actions">
        <button type="button" class="btn-ghost" data-close>Cancel</button>
        <button type="submit" class="btn btn-primary">Login</button>
      </div>
    </form>`);
  $("#loginForm").addEventListener("submit", ev => {
    ev.preventDefault();
    if ($("#pw").value === ADMIN_PASSWORD) {
      sessionStorage.setItem("isAdmin", "1");
      applyAdmin();
      closeModal();
    } else {
      $("#loginErr").textContent = "Wrong password. Try again.";
      $("#pw").value = "";
    }
  });
});

/* --- Admin bar buttons --- */
$("#adminBar").addEventListener("click", e => {
  const btn = e.target.closest("[data-admin]");
  if (!btn) return;
  const act = btn.dataset.admin;
  if (act === "photo") photoForm();
  if (act === "video") videoForm("video");
  if (act === "film") videoForm("film");
  if (act === "about") aboutForm();
  if (act === "samples") {
    if (hideSamples()) {
      localStorage.setItem("hideSamples", "0");
      localStorage.removeItem("deletedSamples");   // restore every sample item
    } else {
      localStorage.setItem("hideSamples", "1");
    }
    renderAll();
  }
  if (act === "logout") {
    sessionStorage.removeItem("isAdmin");
    applyAdmin();
  }
});

async function deleteItem(id) {
  if (!isAdmin()) return;
  if (!confirm("Delete this item? This cannot be undone.")) return;
  if (stored.some(i => i.id === id)) {
    // your own upload: remove it from storage
    await dbDelete(id);
    ["", "v", "p"].forEach(s => { if (urlCache[id + s]) { URL.revokeObjectURL(urlCache[id + s]); delete urlCache[id + s]; } });
  } else {
    // sample item: remember it as deleted
    const list = getDeleted();
    if (!list.includes(id)) list.push(id);
    localStorage.setItem("deletedSamples", JSON.stringify(list));
  }
  await reload();
}

/* --- Add photos --- */
function photoForm() {
  openModal(`
    <h3>Add Photos</h3>
    <p class="m-sub">Select one or many photos from your device.</p>
    <form id="photoForm">
      <label>Photo files<input type="file" id="pFiles" accept="image/*" multiple required /></label>
      <label>Title <span class="m-hint">(optional - file name is used if empty)</span><input type="text" id="pTitle" placeholder="e.g. Golden Hour" /></label>
      <label>Category
        <select id="pCat">
          <option value="portrait">Portrait</option>
          <option value="landscape">Landscape</option>
          <option value="street">Street</option>
          <option value="creative">Creative</option>
        </select>
      </label>
      <p class="m-error" id="mErr"></p>
      <div class="m-actions">
        <button type="button" class="btn-ghost" data-close>Cancel</button>
        <button type="submit" class="btn btn-primary">Upload</button>
      </div>
    </form>`);
  $("#photoForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const files = [...$("#pFiles").files];
    if (!files.length) return;
    const title = $("#pTitle").value.trim();
    const category = $("#pCat").value;
    try {
      let n = 0;
      for (const f of files) {
        await dbPut({
          id: uid(), kind: "photo", created: Date.now() + n++,
          title: files.length === 1 && title ? title : (title || f.name.replace(/\.[^.]+$/, "")),
          category, blob: f
        });
      }
      closeModal();
      await reload();
    } catch (err) {
      $("#mErr").textContent = "Could not save (storage full or blocked by browser).";
      console.error(err);
    }
  });
}

/* --- Add video / short film --- */
function videoForm(kind) {
  const label = kind === "film" ? "Short Film" : "Video";
  openModal(`
    <h3>Add ${label}</h3>
    <p class="m-sub">Upload a video file, or paste a YouTube / Vimeo link.</p>
    <form id="vidForm">
      <label>Title<input type="text" id="vTitle" required /></label>
      <label>Video file<input type="file" id="vFile" accept="video/*" /></label>
      <div class="or">- or -</div>
      <label>YouTube / Vimeo link<input type="url" id="vLink" placeholder="https://www.youtube.com/watch?v=..." /></label>
      <label>Poster / thumbnail image <span class="m-hint">(optional)</span><input type="file" id="vPoster" accept="image/*" /></label>
      <div class="row">
        <label>Year<input type="number" id="vYear" value="${new Date().getFullYear()}" /></label>
        <label>Duration<input type="text" id="vDur" placeholder="e.g. 5:30" /></label>
      </div>
      <label>Your role<input type="text" id="vRole" placeholder="e.g. Director • DOP • Editor" /></label>
      <label>Description<textarea id="vDesc" rows="3"></textarea></label>
      <p class="m-error" id="mErr"></p>
      <div class="m-actions">
        <button type="button" class="btn-ghost" data-close>Cancel</button>
        <button type="submit" class="btn btn-primary">Save ${label}</button>
      </div>
    </form>`);
  $("#vidForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const file = $("#vFile").files[0];
    const link = $("#vLink").value.trim();
    if (!file && !link) { $("#mErr").textContent = "Choose a video file or paste a link."; return; }
    const item = {
      id: uid(), kind, created: Date.now(),
      title: $("#vTitle").value.trim(),
      year: $("#vYear").value, duration: $("#vDur").value.trim(),
      role: $("#vRole").value.trim(), desc: $("#vDesc").value.trim(),
      posterBlob: $("#vPoster").files[0] || null
    };
    if (file) { item.sourceType = "file"; item.blob = file; }
    else { item.sourceType = detectType(link); item.url = link; }
    try {
      await dbPut(item);
      closeModal();
      await reload();
    } catch (err) {
      $("#mErr").textContent = "Could not save (file too large or storage blocked).";
      console.error(err);
    }
  });
}

/* --- Edit About + Contact --- */
function aboutForm() {
  const a = getAbout();
  openModal(`
    <h3>Edit About &amp; Contact</h3>
    <p class="m-sub">Changes appear on the site immediately.</p>
    <form id="aboutForm">
      <label>Heading<input type="text" id="aHeading" value="${esc(a.heading)}" /></label>
      <label>About me text <span class="m-hint">(leave a blank line between paragraphs)</span>
        <textarea id="aBio" rows="8">${esc(a.bio)}</textarea></label>
      <label>Skills <span class="m-hint">(separate with commas)</span><input type="text" id="aSkills" value="${esc(a.skills)}" /></label>
      <label>Your photo <span class="m-hint">(optional)</span><input type="file" id="aPortrait" accept="image/*" /></label>
      <div class="row">
        <label>Years of experience<input type="number" id="aYears" value="${esc(a.years)}" min="0" /></label>
        <label>Photo projects<input type="number" id="aSP" value="${esc(a.statPhotos)}" min="0" /></label>
      </div>
      <div class="row">
        <label>Videos edited<input type="number" id="aSV" value="${esc(a.statVideos)}" min="0" /></label>
        <label>Short films<input type="number" id="aSF" value="${esc(a.statFilms)}" min="0" /></label>
      </div>
      <label>Email<input type="email" id="aEmail" value="${esc(a.email)}" /></label>
      <div class="row">
        <label>Phone<input type="text" id="aPhone" value="${esc(a.phone)}" /></label>
        <label>Location<input type="text" id="aLoc" value="${esc(a.location)}" /></label>
      </div>
      <p class="m-error" id="mErr"></p>
      <div class="m-actions">
        <button type="button" class="btn-ghost" data-close>Cancel</button>
        <button type="submit" class="btn btn-primary">Save</button>
      </div>
    </form>`);
  $("#aboutForm").addEventListener("submit", async ev => {
    ev.preventDefault();
    const data = {
      heading: $("#aHeading").value.trim(), bio: $("#aBio").value.trim(), skills: $("#aSkills").value.trim(),
      years: Number($("#aYears").value) || 0, statPhotos: Number($("#aSP").value) || 0,
      statVideos: Number($("#aSV").value) || 0, statFilms: Number($("#aSF").value) || 0,
      email: $("#aEmail").value.trim(), phone: $("#aPhone").value.trim(), location: $("#aLoc").value.trim()
    };
    localStorage.setItem("about", JSON.stringify(data));
    const pic = $("#aPortrait").files[0];
    try {
      if (pic) await dbPut({ id: "portrait", kind: "portrait", created: Date.now(), blob: pic });
      closeModal();
      await reload();
    } catch (err) {
      $("#mErr").textContent = "Could not save the photo.";
      console.error(err);
    }
  });
}

/* ---------- Contact form (opens visitor's email app) ---------- */
$("#contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const name = $("#cName").value.trim();
  const email = $("#cEmail").value.trim();
  const service = $("#cService").value;
  const message = $("#cMessage").value.trim();
  const note = $("#formNote");

  if (!name || !email || !message) { note.textContent = "Please fill in all fields."; note.className = "form-note error"; return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { note.textContent = "Please enter a valid email address."; note.className = "form-note error"; return; }

  const subject = encodeURIComponent(`${service} enquiry from ${name}`);
  const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nService: ${service}\n\n${message}`);
  window.location.href = `mailto:${getAbout().email}?subject=${subject}&body=${body}`;
  note.textContent = "Opening your email app... thank you!";
  note.className = "form-note ok";
  e.target.reset();
});

/* ---------- Init ---------- */
$("#year").textContent = new Date().getFullYear();
applyAdmin();
reload();