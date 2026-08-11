/* ============================================================
   CHROME VAULT STUDIOS
   ============================================================ */

/* ------------------------------------------------------------
   GALLERI — her tilføjer du dit eget indhold.

   Læg filer i:  public/assets/work/
   Sæt derefter en linje ind herunder for hver.

   type:  "photo"  eller  "video"
   kind:  "photo" | "video" | "event"   (styrer filterknapperne)
   src:   stien til filen
   poster: kun for video — billedet der vises før afspilning
------------------------------------------------------------ */


const WORK = [
  {
    type: "photo",
    kind: "photo",
    title: "Chrome Vault Studios",
    src: "/assets/work/chrome-vault-01.jpg"
  }
 {
    type: "photo",
    kind: "photo",
    title: "Chrome Vault Studios",
    src: "/assets/work/chrome-vault-02.jpg"
  }
];


/* ============================================================
   Header
   ============================================================ */
const header = document.getElementById("header");

const onScroll = () => {
  header.classList.toggle("scrolled", window.scrollY > 40);
  markActiveSection();
};

window.addEventListener("scroll", onScroll, { passive: true });

/* ============================================================
   Mobile menu
   ============================================================ */
const menuBtn = document.getElementById("menuBtn");
const mobileNav = document.getElementById("mobileNav");

const setMenu = (open) => {
  menuBtn.classList.toggle("open", open);
  mobileNav.classList.toggle("open", open);
  mobileNav.setAttribute("aria-hidden", String(!open));
  menuBtn.setAttribute("aria-expanded", String(open));
  menuBtn.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
  document.body.classList.toggle("locked", open);
};

menuBtn.addEventListener("click", () => setMenu(!mobileNav.classList.contains("open")));

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  if (mobileNav.classList.contains("open")) setMenu(false);
  closeLightbox();
});

/* ============================================================
   Navigation
   ============================================================ */
document.querySelectorAll("[data-nav]").forEach((link) => {
  link.addEventListener("click", (e) => {
    const id = link.getAttribute("href");
    const target = document.querySelector(id);
    if (!target) return;

    e.preventDefault();
    setMenu(false);

    const top = target.getBoundingClientRect().top + window.scrollY - 70;
    window.scrollTo({
      top,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth"
    });

    history.replaceState(null, "", id);
  });
});

const sections = ["forside", "om", "galleri", "kontakt"];

function markActiveSection() {
  const y = window.scrollY + window.innerHeight / 3;
  let current = sections[0];

  sections.forEach((id) => {
    const el = document.getElementById(id);
    if (el && el.offsetTop <= y) current = id;
  });

  document.querySelectorAll(".nav-desktop .nav-link").forEach((link) => {
    link.classList.toggle("active", link.getAttribute("href") === `#${current}`);
  });
}

/* ============================================================
   Reveal on scroll
   ============================================================ */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("shown");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12, rootMargin: "0px 0px -60px 0px" }
);

const observeReveals = () =>
  document.querySelectorAll(".reveal:not(.shown)").forEach((el) => revealObserver.observe(el));

/* ============================================================
   Gallery
   ============================================================ */
const gallery = document.getElementById("gallery");

function buildGallery() {
  if (!WORK.length) {
    gallery.innerHTML = Array.from({ length: 6 })
      .map(
        () => `
      <div class="tile" aria-hidden="true">
        <div class="tile-empty">Kommer snart</div>
      </div>`
      )
      .join("");
    return;
  }

  gallery.innerHTML = WORK.map((item, i) => {
    const media =
      item.type === "video"
        ? `<video class="tile-media" muted loop playsinline preload="metadata"
             ${item.poster ? `poster="${item.poster}"` : ""}>
             <source src="${item.src}" type="video/mp4">
           </video>
           <span class="tile-play" aria-hidden="true"></span>`
        : `<img class="tile-media" src="${item.src}" alt="${item.title}" loading="lazy">`;

    return `
      <button class="tile reveal" data-kind="${item.kind}" data-index="${i}"
              style="--d:${(i % 4) * 0.05}s" aria-label="Åbn ${item.title}">
        ${media}
        <span class="tile-veil">
          <span class="tile-kind">${item.kind === "event" ? "Event" : item.type === "video" ? "Video" : "Foto"}</span>
          <span class="tile-title">${item.title}</span>
        </span>
      </button>`;
  }).join("");

  // Preview videos on hover
  gallery.querySelectorAll(".tile").forEach((tile) => {
    const video = tile.querySelector("video");
    if (!video) return;
    tile.addEventListener("mouseenter", () => video.play().catch(() => {}));
    tile.addEventListener("mouseleave", () => {
      video.pause();
      video.currentTime = 0;
    });
  });

  gallery.querySelectorAll(".tile").forEach((tile) => {
    tile.addEventListener("click", () => openLightbox(Number(tile.dataset.index)));
  });

  observeReveals();
}

/* Filters */
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter").forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    const filter = btn.dataset.filter;
    gallery.querySelectorAll(".tile").forEach((tile) => {
      const show = filter === "all" || tile.dataset.kind === filter;
      tile.classList.toggle("hidden", !show);
    });
  });
});

/* ============================================================
   Lightbox
   ============================================================ */
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxClose = document.getElementById("lightboxClose");

function openLightbox(index) {
  const item = WORK[index];
  if (!item) return;

  lightboxContent.innerHTML =
    item.type === "video"
      ? `<video src="${item.src}" controls autoplay playsinline ${item.poster ? `poster="${item.poster}"` : ""}></video>`
      : `<img src="${item.src}" alt="${item.title}">`;

  lightbox.classList.add("open");
  lightbox.setAttribute("aria-hidden", "false");
  document.body.classList.add("locked");
  lightboxClose.focus();
}

function closeLightbox() {
  if (!lightbox.classList.contains("open")) return;
  lightbox.classList.remove("open");
  lightbox.setAttribute("aria-hidden", "true");
  document.body.classList.remove("locked");
  setTimeout(() => (lightboxContent.innerHTML = ""), 400);
}

lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (e) => {
  if (e.target === lightbox) closeLightbox();
});

/* ============================================================
   Inquiry form
   ============================================================ */
const form = document.getElementById("inquiryForm");
const submitBtn = document.getElementById("submitBtn");
const status = document.getElementById("formStatus");
const btnLabel = submitBtn.querySelector(".btn-label");

const setStatus = (message, state = "") => {
  status.textContent = message;
  status.className = `form-status ${state}`;
};

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());

  // Validate
  form.querySelectorAll(".invalid").forEach((el) => el.classList.remove("invalid"));
  let firstInvalid = null;

  const required = { name: "navn", email: "email", message: "besked" };
  for (const key of Object.keys(required)) {
    const field = form.elements[key];
    if (!data[key]?.trim()) {
      field.classList.add("invalid");
      firstInvalid = firstInvalid || field;
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    form.elements.email.classList.add("invalid");
    firstInvalid = firstInvalid || form.elements.email;
  }

  if (firstInvalid) {
    setStatus("Udfyld navn, email og besked, så sender vi den afsted.", "error");
    firstInvalid.focus();
    return;
  }

  submitBtn.disabled = true;
  btnLabel.textContent = "Sender…";
  setStatus("");

  try {
    const res = await fetch("/api/inquiry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });

    const result = await res.json();

    if (result.ok) {
      form.reset();
      btnLabel.textContent = "Sendt";
      setStatus("Tak. Vi vender tilbage inden for et par dage.", "ok");
      setTimeout(() => {
        btnLabel.textContent = "Send forespørgsel";
        submitBtn.disabled = false;
      }, 4000);
    } else {
      throw new Error(result.error || "Noget gik galt.");
    }
  } catch (error) {
    setStatus(
      error.message || "Beskeden kunne ikke sendes. Skriv til chromevaultstudios@outlook.dk.",
      "error"
    );
    btnLabel.textContent = "Send forespørgsel";
    submitBtn.disabled = false;
  }
});

/* ============================================================
   Init
   ============================================================ */
document.getElementById("year").textContent = new Date().getFullYear();
buildGallery();
observeReveals();
onScroll();
