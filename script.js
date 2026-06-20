// ===== Terminal typing animation =====
const lines = [
  { prompt: ">>> ", text: "import saad", type: "in" },
  { prompt: "",     text: "Loading developer profile...", type: "out" },
  { prompt: ">>> ", text: "saad.role", type: "in" },
  { prompt: "",     text: "'Python Developer & CS Student'", type: "str" },
  { prompt: ">>> ", text: "saad.status", type: "in" },
  { prompt: "",     text: "'Open to entry-level roles'", type: "str" },
  { prompt: ">>> ", text: "saad.builds(passion=True)", type: "in" },
  { prompt: "",     text: "Computer Science student and aspiring Python Developer skilled in OOP, API integration, automation scripting, and CRUD application development. Passionate about building practical software solutions, solving real-world problems, and continuously improving technical and problem-solving skills through hands-on projects.", type: "out" },
];

const termEl = document.getElementById("terminal-body");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function renderStatic() {
  termEl.innerHTML = lines.map(l => {
    const cls = l.type === "in" ? "tl-prompt" : l.type === "str" ? "tl-str" : "tl-out";
    const promptSpan = l.prompt ? `<span class="tl-prompt">${l.prompt}</span>` : "";
    return `<div>${promptSpan}<span class="${cls}">${l.text}</span></div>`;
  }).join("");
}

async function typeLine(container, prompt, text, cls) {
  const row = document.createElement("div");
  container.appendChild(row);
  const promptSpan = document.createElement("span");
  promptSpan.className = "tl-prompt";
  promptSpan.textContent = prompt;
  row.appendChild(promptSpan);
  const textSpan = document.createElement("span");
  textSpan.className = cls;
  row.appendChild(textSpan);

  for (let i = 0; i < text.length; i++) {
    textSpan.textContent += text[i];
    await sleep(prompt ? 28 : 14);
  }
}

function sleep(ms) {
  return new Promise(res => setTimeout(res, ms));
}

async function runTerminal() {
  if (!termEl) return;
  if (reducedMotion) { renderStatic(); return; }

  for (const line of lines) {
    const cls = line.type === "in" ? "tl-prompt" : line.type === "str" ? "tl-str" : "tl-out";
    await typeLine(termEl, line.prompt, line.text, cls);
    await sleep(180);
  }
  const cursor = document.createElement("span");
  cursor.className = "terminal-cursor";
  termEl.appendChild(cursor);
}

runTerminal();

// ===== Scroll reveal =====
const revealEls = document.querySelectorAll("[data-reveal]");

revealEls.forEach((el, i) => {
  const siblingIndex = Array.from(el.parentElement.children).indexOf(el);
  el.style.transitionDelay = reducedMotion ? "0ms" : `${Math.min(siblingIndex, 5) * 70}ms`;
});

if (reducedMotion || !("IntersectionObserver" in window)) {
  revealEls.forEach(el => el.classList.add("is-visible"));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });

  revealEls.forEach(el => observer.observe(el));
}

// ===== Footer year =====
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ===== Cursor spotlight glow =====
const glow = document.getElementById("cursorGlow");
if (glow && !reducedMotion && matchMedia("(hover:hover)").matches) {
  window.addEventListener("pointermove", (e) => {
    glow.style.setProperty("--mx", `${e.clientX}px`);
    glow.style.setProperty("--my", `${e.clientY}px`);
  }, { passive: true });
}

// ===== 3D tilt on cards =====
if (!reducedMotion && matchMedia("(hover:hover)").matches) {
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    let frame = null;
    card.addEventListener("pointermove", (e) => {
      const rect = card.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width - 0.5;
      const py = (e.clientY - rect.top) / rect.height - 0.5;
      if (frame) cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        card.style.transform = `translateY(-4px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 6).toFixed(2)}deg)`;
      });
    });
    card.addEventListener("pointerleave", () => {
      if (frame) cancelAnimationFrame(frame);
      card.style.transform = "";
    });
  });
}

// ===== Count-up stats =====
const statEls = document.querySelectorAll(".stat-number[data-count]");
function animateCount(el) {
  const target = parseInt(el.dataset.count, 10) || 0;
  const pad = parseInt(el.dataset.pad, 10) || 0;
  if (reducedMotion) { el.textContent = String(target).padStart(pad, "0"); return; }
  const duration = 900;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const value = Math.round(eased * target);
    el.textContent = String(value).padStart(pad, "0");
    if (progress < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
if (statEls.length && "IntersectionObserver" in window) {
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  statEls.forEach((el) => statObserver.observe(el));
} else {
  statEls.forEach(animateCount);
}
