const FIGMA_EMBED_URL = "https://odd-rally-44178332.figma.site/";

/* Peta di slide Lokasi. Ganti dengan link embed dari Google Maps:
   buka tempat Anda di Google Maps, pilih Bagikan > Sematkan peta, salin isi src="..." */
const MAPS_EMBED_URL = "https://www.google.com/maps?q=Kopi+Lonceng+Malang&output=embed";

const PRODUCTS = [
  { n: "Gayo Aceh Tengah", c: "Single Origin", d: "Natural, 200 g", t: "Kakao pahit, rempah manis, body tebal.", p: 98000 },
  { n: "Kintamani Bali", c: "Single Origin", d: "Washed, 200 g", t: "Mandarin, madu, asam yang bersih.", p: 95000 },
  { n: "Bajawa Flores", c: "Single Origin", d: "Honey, 200 g", t: "Cokelat susu, tembakau manis, tekstur lembut.", p: 92000 },
  { n: "Dampit Malang", c: "Single Origin", d: "Robusta natural, 200 g", t: "Karamel gosong, kacang panggang, pahit yang ramah.", p: 72000 },
  { n: "Lonceng Pagi", c: "House Blend", d: "Sangrai medium, 250 g", t: "Gula aren dan almond. Pas untuk V60 dan tubruk.", p: 85000 },
  { n: "Lonceng Malam", c: "House Blend", d: "Sangrai gelap, 250 g", t: "Cokelat pekat dan kayu manis. Enak dicampur susu.", p: 82000 },
  { n: "Cold Brew Original", c: "Kopi Botol", d: "Botol 250 ml", t: "Diseduh dingin 18 jam, bersih dan tidak pahit.", p: 38000 },
  { n: "Cold Brew Aren", c: "Kopi Botol", d: "Botol 250 ml", t: "Cold brew dengan gula aren dan sejumput garam.", p: 42000 }
];

const BAG = '<svg viewBox="0 0 80 100"><path d="M16 22h48l4 70H12zM16 22h48M26 36h28"/></svg>';
const BOTTLE = '<svg viewBox="0 0 80 100"><path d="M32 8h16v14l8 14v56H24V36l8-14zM24 58h32"/></svg>';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const rupiah = n => "Rp" + n.toLocaleString("id-ID");

let filter = "Semua";
let query = "";

/* ---------- Katalog ---------- */
function renderGrid() {
  const q = query.trim().toLowerCase();
  const list = PRODUCTS.filter(p =>
    (filter === "Semua" || p.c === filter) &&
    (!q || (p.n + " " + p.c + " " + p.t).toLowerCase().includes(q))
  );
  $("#grid").innerHTML = list.length
    ? list.map((p, i) => `
      <article class="prod">
        <div class="art c${i % 3}">${p.c === "Kopi Botol" ? BOTTLE : BAG}</div>
        <div class="info">
          <p class="cat">${p.c}</p>
          <h3>${p.n}</h3>
          <p>${p.t}</p>
          <p>${p.d}</p>
          <div class="row"><b>${rupiah(p.p)}</b><button class="mini" data-app>Pesan</button></div>
        </div>
      </article>`).join("")
    : `<p class="none">Belum ada kopi yang cocok. Coba kata kunci “Gayo” atau “cold brew”.</p>`;
  $("#count").textContent = list.length + " produk";
  $$(".chip").forEach(b => b.setAttribute("aria-pressed", b.dataset.filter === filter));
}

/* ---------- Navigasi antar-slide ---------- */
function show(id) {
  if (!document.getElementById(id) || !$("#" + id).classList.contains("page")) id = "beranda";
  const changed = !$("#" + id).classList.contains("active");
  $$(".page").forEach(s => s.classList.toggle("active", s.id === id));
  $$(".menu a").forEach(a => a.dataset.go === id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  if (id === "lokasi") loadMap();
  if (changed) window.scrollTo(0, 0);
}
function loadMap() {
  const f = $("#mapFrame");
  if (!f.getAttribute("src")) f.src = MAPS_EMBED_URL;
}
function go(id) {
  if (location.hash === "#" + id) show(id);
  else location.hash = id;
}
window.addEventListener("hashchange", () => show(location.hash.slice(1)));

/* ---------- Klik terpusat ---------- */
document.addEventListener("click", e => {
  const t = e.target.closest("[data-go],[data-filter],[data-app]");
  if (!t) return;
  if (t.dataset.go) { e.preventDefault(); go(t.dataset.go); }
  else if (t.dataset.filter) {
    filter = t.dataset.filter; query = ""; $("#q").value = "";
    renderGrid(); go("kopi");
  } else openApp();
});

/* ---------- Pencarian ---------- */
$("#searchBtn").addEventListener("click", () => {
  const bar = $("#searchbar"), open = bar.hidden;
  bar.hidden = !open;
  $("#searchBtn").setAttribute("aria-expanded", open);
  if (open) $("#q").focus();
});
$("#q").addEventListener("input", e => {
  query = e.target.value; filter = "Semua";
  renderGrid(); go("kopi");
});

/* ---------- Modal Open App (Figma) ---------- */
const modal = $("#appModal");
function openApp() {
  const frame = $("#appFrame");
  if (FIGMA_EMBED_URL && !frame.getAttribute("src")) frame.src = FIGMA_EMBED_URL;
  $("#appEmpty").hidden = !!FIGMA_EMBED_URL;
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  $("#closeApp").focus();
}
function closeApp() {
  modal.hidden = true;
  document.body.style.overflow = "";
}
$("#closeApp").addEventListener("click", closeApp);
modal.addEventListener("click", e => { if (e.target === modal) closeApp(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !modal.hidden) closeApp(); });

/* ---------- Newsletter ---------- */
$("#news").addEventListener("submit", e => {
  e.preventDefault();
  $("#newsMsg").textContent = "Terima kasih. Surat pertama kami terkirim Jumat ini, bersama jadwal sangrai terbaru.";
  e.target.reset();
});

/* ---------- Mulai ---------- */
renderGrid();
show(location.hash.slice(1) || "beranda");

/* ---------- Menu Hamburger Mobile ---------- */
const burgerBtn = $("#burgerBtn");
const navMenu = $(".menu");

if (burgerBtn && navMenu) {
  burgerBtn.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("open");
    burgerBtn.setAttribute("aria-expanded", isOpen);
  });

  // Otomatis tutup menu setelah salah satu halaman dipilih di HP
  $$(".menu a").forEach(link => {
    link.addEventListener("click", () => {
      navMenu.classList.remove("open");
      burgerBtn.setAttribute("aria-expanded", "false");
    });
  });
}

/* ================= EFEK MODERN ================= */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* 1. Loading screen (sekali per sesi) */
  const loader = document.getElementById("loader"), pct = document.getElementById("pct");
  const finish = () => { document.body.classList.remove("loading"); document.body.style.overflow = ""; };
  let seen = false;
  try { seen = sessionStorage.getItem("kl_seen") === "1"; } catch (e) {}
  if (seen || reduce || !loader) { if (loader) loader.remove(); finish(); }
  else {
    document.body.style.overflow = "hidden";
    const t0 = performance.now(), MIN = 1800;
    let loaded = document.readyState === "complete";
    addEventListener("load", () => loaded = true);
    (function step(now) {
      if (now - t0 > 6000) loaded = true;
      const p = Math.min((now - t0) / MIN, 1), e = 1 - Math.pow(1 - p, 3);
      const v = loaded ? e : Math.min(e, .92);
      loader.style.setProperty("--p", v);
      pct.textContent = Math.round(v * 100);
      if (p < 1 || !loaded) return requestAnimationFrame(step);
      loader.classList.add("done");
      try { sessionStorage.setItem("kl_seen", "1"); } catch (e) {}
      setTimeout(finish, 500);
      setTimeout(() => loader.remove(), 1300);
    })(t0);
  }

  /* 2. Latar berlapis: orb + biji kopi, bergeser mengikuti kursor */
  const BEAN = '<svg viewBox="0 0 60 80"><ellipse cx="30" cy="40" rx="24" ry="34"/><path d="M30 8c-14 22 14 42 0 64"/></svg>';
  const BEANS = [[6,14,64,-24,.5],[88,10,90,28,1.4],[14,62,110,40,1.6],[78,58,56,-40,.7],[46,86,80,12,1.1],[60,30,44,64,.4],[30,34,52,-12,.9]];
  const bg = document.createElement("div");
  bg.className = "bg-fx"; bg.setAttribute("aria-hidden", "true");
  bg.innerHTML = '<i class="orb o1"></i><i class="orb o2"></i><i class="orb o3"></i>' +
    BEANS.map(([l, t, w, r, z]) => `<span class="bean" style="left:${l}%;top:${t}%;width:${w}px;--r:${r}deg;--z:${z}">${BEAN}</span>`).join("");
  document.body.prepend(bg);

  if (fine && !reduce) {
    let tx = 0, ty = 0, cx = 0, cy = 0, run = false;
    const tick = () => {
      cx += (tx - cx) * .07; cy += (ty - cy) * .07;
      bg.style.setProperty("--px", cx.toFixed(3)); bg.style.setProperty("--py", cy.toFixed(3));
      if (Math.abs(tx - cx) > .001 || Math.abs(ty - cy) > .001) requestAnimationFrame(tick); else run = false;
    };
    addEventListener("pointermove", e => {
      tx = e.clientX / innerWidth * 2 - 1; ty = e.clientY / innerHeight * 2 - 1;
      bg.style.setProperty("--mx", e.clientX + "px"); bg.style.setProperty("--my", e.clientY + "px");
      if (!run) { run = true; requestAnimationFrame(tick); }
    }, { passive: true });

    /* 3. Kartu miring 3D mengikuti kursor */
    const TILT = ".hero-card,.prod,.plan", VARS = ["--rx", "--ry", "--gx", "--gy", "--tx", "--ty"];
    let cur = null;
    const clear = el => { VARS.forEach(v => el.style.removeProperty(v)); el.classList.remove("is-tilt"); };
    document.addEventListener("pointermove", e => {
      if (e.pointerType !== "mouse") return;
      const el = e.target.closest && e.target.closest(TILT);
      if (cur && cur !== el) clear(cur);
      cur = el;
      if (!el) return;
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      el.style.setProperty("--rx", ((.5 - y) * 9).toFixed(2) + "deg");
      el.style.setProperty("--ry", ((x - .5) * 11).toFixed(2) + "deg");
      el.style.setProperty("--gx", (x * 100).toFixed(1) + "%");
      el.style.setProperty("--gy", (y * 100).toFixed(1) + "%");
      el.style.setProperty("--tx", (x * 2 - 1).toFixed(2));
      el.style.setProperty("--ty", (y * 2 - 1).toFixed(2));
      el.classList.add("is-tilt");
    }, { passive: true });
    document.documentElement.addEventListener("pointerleave", () => { if (cur) { clear(cur); cur = null; } });
  }

  /* 4. Animasi tirai saat pindah slide */
  const curtain = document.querySelector(".curtain");
  const baseShow = show;
  let busy = false;
  show = function (id) {
    const now = document.querySelector(".page.active"), next = document.getElementById(id);
    if (reduce || busy || !curtain || !now || !next || now === next || !next.classList.contains("page")) return baseShow(id);
    busy = true;
    curtain.className = "curtain in";
    setTimeout(() => {
      baseShow(id);
      curtain.className = "curtain out";
      setTimeout(() => { curtain.className = "curtain"; busy = false; }, 640);
    }, 570);
  };
})();