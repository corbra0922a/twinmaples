const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function clamp(n, min, max) {
  return Math.min(max, Math.max(min, n));
}

function prefersReducedMotion() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
}

function initNav() {
  const toggle = $(".nav-toggle");
  const links = $("#navLinks");
  if (!toggle || !links) return;

  function setOpen(next) {
    links.classList.toggle("open", next);
    toggle.setAttribute("aria-expanded", String(next));
  }

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.contains("open");
    setOpen(!isOpen);
  });

  document.addEventListener("click", (e) => {
    if (!links.classList.contains("open")) return;
    const t = e.target;
    if (t instanceof Element && (links.contains(t) || toggle.contains(t))) return;
    setOpen(false);
  });

  links.addEventListener("click", (e) => {
    const t = e.target;
    if (t instanceof HTMLAnchorElement) setOpen(false);
  });
}

function initReveal() {
  const els = $$("[data-reveal]");
  if (!els.length) return;

  if (prefersReducedMotion()) {
    for (const el of els) el.classList.add("reveal-in");
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("reveal-in");
          io.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.12 }
  );

  for (const el of els) io.observe(el);
}

function initParallax() {
  const layers = $$("[data-parallax][data-speed]");
  if (!layers.length) return;
  if (prefersReducedMotion()) return;

  let ticking = false;

  const update = () => {
    ticking = false;
    const y = window.scrollY || 0;

    const vh = window.innerHeight || 800;
    // Keep movement subtle: based on viewport, not document length.
    for (const el of layers) {
      const speed = Number(el.getAttribute("data-speed")) || 0;
      const offset = clamp(y / vh, 0, 6) * speed * 60; // px
      el.style.transform = `translate3d(0, ${offset.toFixed(2)}px, 0)`;
    }
  };

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(update);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => requestAnimationFrame(update), { passive: true });

  // first paint
  requestAnimationFrame(update);
}

initNav();
initReveal();
initParallax();

