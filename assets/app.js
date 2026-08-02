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

/* Builds a clickable, keyboard-accessible collapse header used for both
   .hub-track-head and .hub-phase-head — toggles a "hub-collapsed" class on
   the section it belongs to and keeps aria-expanded in sync for a11y. */
function makeCollapseHead(className, label, count, targetSection) {
  const head = document.createElement("div");
  head.className = className;
  head.tabIndex = 0;
  head.setAttribute("role", "button");
  head.setAttribute("aria-expanded", "true");
  head.innerHTML = `
    <span class="hub-collapse-chevron">&#9662;</span>
    <span class="${className === "hub-track-head" ? "hub-track-label" : "hub-phase-label"}">${label}</span>
    <span class="${className === "hub-track-head" ? "hub-track-count" : "hub-phase-count"}">${count}</span>
  `;
  function toggle() {
    const collapsed = targetSection.classList.toggle("hub-collapsed");
    head.setAttribute("aria-expanded", String(!collapsed));
  }
  head.addEventListener("click", toggle);
  head.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
  });
  return head;
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

    // Default view: two top-level tracks (Python Learning, Playwright Course),
    // each holding its phases as child sub-groups — a track with only one
    // phase skips the redundant sub-header and lists cards directly.
    grid.classList.add("grid-grouped");
    let cardIndex = 0;
    const trackOrder = window.TRACK_ORDER || [{ key: "_all", label: "All topics", phases: phaseOrder.map(p => p.key) }];
    trackOrder.forEach((track) => {
      const trackTopics = filtered.filter(t => track.phases.includes(t.phase));
      if (trackTopics.length === 0) return;
      const phasesInTrack = phaseOrder.filter(p => track.phases.includes(p.key));

      const trackSection = document.createElement("div");
      trackSection.className = "hub-track";
      const trackHead = makeCollapseHead("hub-track-head", track.label, trackTopics.length, trackSection);
      trackSection.appendChild(trackHead);
      const trackBody = document.createElement("div");
      trackBody.className = "hub-track-body";

      if (phasesInTrack.length <= 1) {
        const sectionGrid = document.createElement("div");
        sectionGrid.className = "grid";
        trackTopics.forEach((t) => { sectionGrid.appendChild(makeCard(t, cardIndex++)); });
        trackBody.appendChild(sectionGrid);
      } else {
        phasesInTrack.forEach((phase) => {
          const inPhase = filtered.filter(t => t.phase === phase.key);
          if (inPhase.length === 0) return;
          const section = document.createElement("div");
          section.className = "hub-phase hub-phase-nested";
          const phaseHead = makeCollapseHead("hub-phase-head", phase.label, inPhase.length, section);
          section.appendChild(phaseHead);
          const sectionGrid = document.createElement("div");
          sectionGrid.className = "grid";
          inPhase.forEach((t) => { sectionGrid.appendChild(makeCard(t, cardIndex++)); });
          section.appendChild(sectionGrid);
          trackBody.appendChild(section);
        });
      }

      trackSection.appendChild(trackBody);
      grid.appendChild(trackSection);
    });

    // Anything outside every track's phase list still needs to show up somewhere.
    const trackedKeys = trackOrder.flatMap(t => t.phases);
    const orphans = filtered.filter(t => !trackedKeys.includes(t.phase));
    orphans.forEach((t) => grid.appendChild(makeCard(t, cardIndex++)));
  }

  searchInput.addEventListener("input", (e) => {
    query = e.target.value;
    render();
  });

  render();
}

/* ---------- Topic page: scroll reveal + TOC scrollspy + collapsible sections ---------- */
function initTopicPage() {
  const sections = document.querySelectorAll(".content section[id]");
  if (sections.length === 0) return;

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.08 });
  sections.forEach(s => revealObserver.observe(s));

  // Each section's own heading (h2, directly inside the section) becomes a
  // collapse toggle — mobile readers can fold a section they already know
  // to cut scroll distance down to just the part they came for.
  sections.forEach((section) => {
    const heading = section.querySelector(":scope > h2");
    if (!heading) return;
    heading.classList.add("section-toggle");
    heading.tabIndex = 0;
    heading.setAttribute("role", "button");
    heading.setAttribute("aria-expanded", "true");
    const chevron = document.createElement("span");
    chevron.className = "section-chevron";
    chevron.innerHTML = "&#9662;";
    heading.appendChild(chevron);
    function toggle() {
      const collapsed = section.classList.toggle("section-collapsed");
      heading.setAttribute("aria-expanded", String(!collapsed));
    }
    heading.addEventListener("click", toggle);
    heading.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggle(); }
    });
  });

  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    // Jumping to a section via the TOC should always reveal it, even if the
    // reader had folded it earlier.
    tocLinks.forEach((link) => {
      link.addEventListener("click", () => {
        const id = link.getAttribute("href").slice(1);
        const target = document.getElementById(id);
        if (target && target.classList.contains("section-collapsed")) {
          target.classList.remove("section-collapsed");
          const h = target.querySelector(":scope > h2.section-toggle");
          if (h) h.setAttribute("aria-expanded", "true");
        }
      });
    });

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
