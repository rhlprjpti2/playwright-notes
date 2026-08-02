/* Shared behavior: theme toggle, hub grid render/search, topic page scroll effects. */

(function themeInit() {
  const saved = localStorage.getItem("pw-notes-theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") ||
    (window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  const next = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", next);
  localStorage.setItem("pw-notes-theme", next);
}

/* Category accent color, purely for fast visual scanning of the card grid —
   priority-ordered so a card with multiple matching tags picks the most
   specific bucket (e.g. "practical" wins over "playwright"). */
function categoryColorFor(tags) {
  const t = tags || [];
  if (t.includes("system-design") || t.includes("lead-sdet") || t.includes("practical")) return "var(--success)";
  if (t.includes("playwright")) return "var(--accent)";
  if (t.includes("pytest")) return "var(--accent-3)";
  return "var(--accent-2)";
}

/* ---------- Hub page ---------- */
function initHub() {
  const grid = document.getElementById("grid");
  const emptyState = document.getElementById("empty-state");
  const searchInput = document.getElementById("search");
  const tagRow = document.getElementById("tag-row");
  const statTopics = document.getElementById("stat-topics");
  const statSources = document.getElementById("stat-sources");
  if (!grid) return;

  // Grouped by learning phase (course-roadmap order), not sorted by lastUpdated —
  // a flat date sort stopped reflecting the course sequence once enough topics
  // existed that edits landed all over the timeline instead of front-to-back.
  const phaseOrder = window.PHASE_ORDER || [{ key: "_", label: "All topics" }];
  const topics = (window.TOPICS_INDEX || []).slice().sort((a, b) => {
    const pa = phaseOrder.findIndex(p => p.key === a.phase);
    const pb = phaseOrder.findIndex(p => p.key === b.phase);
    if (pa !== pb) return (pa === -1 ? 999 : pa) - (pb === -1 ? 999 : pb);
    return (a.order || 0) - (b.order || 0);
  });

  const allTags = Array.from(new Set(topics.flatMap(t => t.tags || []))).sort();
  let activeTag = null;
  let query = "";

  statTopics.innerHTML = `<b>${topics.length}</b> topic${topics.length === 1 ? "" : "s"}`;
  const totalSources = topics.reduce((sum, t) => sum + (t.sources ? t.sources.length : 0), 0);
  statSources.innerHTML = `<b>${totalSources}</b> video${totalSources === 1 ? "" : "s"} processed`;

  const visitedSlugs = typeof pwLoad === "function" ? Object.keys(pwLoad("pw-notes-visited")) : [];
  if (typeof pwProgressSummary === "function") {
    const summary = pwProgressSummary(topics.length);
    const strip = document.getElementById("progress-strip");
    if (summary && strip) {
      const pct = topics.length ? Math.round((summary.visited / topics.length) * 100) : 0;
      strip.style.display = "flex";
      strip.innerHTML = `
        <span><b>${summary.visited}</b> of ${topics.length} topics visited</span>
        <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
        ${summary.quizTotal ? `<span><b>${summary.quizCorrect}</b>/${summary.quizTotal} quiz answers correct</span>` : ""}
        ${summary.known ? `<span><b>${summary.known}</b> questions known</span>` : ""}
        ${summary.shaky ? `<span><b>${summary.shaky}</b> still shaky</span>` : ""}
      `;
    }
  }

  allTags.forEach(tag => {
    const pill = document.createElement("span");
    pill.className = "tag-pill";
    pill.textContent = tag;
    pill.onclick = () => {
      activeTag = activeTag === tag ? null : tag;
      render();
    };
    tagRow.appendChild(pill);
  });

  function render() {
    const q = query.trim().toLowerCase();
    const filtered = topics.filter(t => {
      const matchesTag = !activeTag || (t.tags || []).includes(activeTag);
      const haystack = [t.title, t.summary, ...(t.tags || []), ...(t.keyTerms || [])]
        .join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesTag && matchesQuery;
    });

    Array.from(tagRow.children).forEach(pill => {
      pill.classList.toggle("active", pill.textContent === activeTag);
    });

    grid.innerHTML = "";
    if (filtered.length === 0) {
      emptyState.style.display = "block";
      emptyState.querySelector("h3").textContent = topics.length === 0
        ? "No topics yet"
        : "No matches";
      emptyState.querySelector("p").textContent = topics.length === 0
        ? "Send over a video transcript and the first topic page will show up here."
        : "Try a different search term or clear the tag filter.";
      return;
    }
    emptyState.style.display = "none";

    function makeCard(t, i) {
      const card = document.createElement("a");
      card.href = t.file;
      card.className = "card";
      card.style.animationDelay = `${i * 30}ms`;
      const slug = (t.file || "").replace(/^pages\//, "").replace(/\.html$/, "");
      const isVisited = visitedSlugs.includes(slug);
      card.style.borderTop = `3px solid ${categoryColorFor(t.tags)}`;
      card.innerHTML = `
        ${isVisited ? '<span class="card-visited-badge" title="Visited">&#10003;</span>' : ""}
        <div class="card-title">${t.title}</div>
        <div class="card-summary">${t.summary || ""}</div>
        <div class="card-tags">${(t.tags || []).map(tag => `<span>${tag}</span>`).join("")}</div>
        <div class="card-meta">
          <span>${t.sources ? t.sources.length : 0} source${t.sources && t.sources.length === 1 ? "" : "s"}</span>
          <span>${t.lastUpdated || ""}</span>
        </div>`;
      return card;
    }

    const searching = !!(activeTag || q);
    if (searching) {
      // Flat result list while actively filtering — grouping headers add
      // nothing when you're scanning for a specific match.
      grid.classList.remove("grid-grouped");
      filtered.forEach((t, i) => grid.appendChild(makeCard(t, i)));
      return;
    }

    // Default view: grouped into the same phases as the course roadmap, in order.
    grid.classList.add("grid-grouped");
    let cardIndex = 0;
    phaseOrder.forEach((phase) => {
      const inPhase = filtered.filter(t => t.phase === phase.key);
      if (inPhase.length === 0) return;
      const section = document.createElement("div");
      section.className = "hub-phase";
      section.innerHTML = `<div class="hub-phase-head">
        <span class="hub-phase-label">${phase.label}</span>
        <span class="hub-phase-count">${inPhase.length}</span>
      </div>`;
      const sectionGrid = document.createElement("div");
      sectionGrid.className = "grid";
      inPhase.forEach((t) => { sectionGrid.appendChild(makeCard(t, cardIndex++)); });
      section.appendChild(sectionGrid);
      grid.appendChild(section);
    });

    // Anything without a recognised phase still needs to show up somewhere.
    const orphans = filtered.filter(t => !phaseOrder.some(p => p.key === t.phase));
    orphans.forEach((t) => grid.appendChild(makeCard(t, cardIndex++)));
  }

  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  render();
}

/* ---------- Topic page: scroll reveal + TOC scrollspy ---------- */
function initTopicPage() {
  const sections = document.querySelectorAll(".content section[id]");
  if (sections.length === 0) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.08 });
  sections.forEach(s => revealObserver.observe(s));

  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const link = document.querySelector(`.toc a[href="#${entry.target.id}"]`);
        if (!link) return;
        if (entry.isIntersecting) {
          tocLinks.forEach(l => l.classList.remove("active"));
          link.classList.add("active");
        }
      });
    }, { rootMargin: "-20% 0px -70% 0px" });
    sections.forEach(s => spy.observe(s));
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initHub();
  initTopicPage();
});
