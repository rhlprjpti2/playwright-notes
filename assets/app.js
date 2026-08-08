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

/* Slug lookup shared by makeCard and the per-group learned-progress counts —
   the one place that knows how to turn a topic's file path into its slug. */
function slugFor(t) {
  return (t.file || "").replace(/^pages\//, "").replace(/\.html$/, "");
}

/* Builds a clickable, keyboard-accessible collapse header used for both
   .hub-track-head and .hub-phase-head — toggles a "hub-collapsed" class on
   the section it belongs to and keeps aria-expanded in sync for a11y.
   learnedCount, when > 0, switches the count badge to "N/total learned"
   so progress reads per-track and per-phase, not just as one site-wide
   number — matters once Python and Playwright are being learned at
   different paces. */
function makeCollapseHead(className, label, count, targetSection, learnedCount, onToggle) {
  const head = document.createElement("div");
  head.className = className;
  head.tabIndex = 0;
  head.setAttribute("role", "button");
  head.setAttribute("aria-expanded", String(!targetSection.classList.contains("hub-collapsed")));
  const labelClass = className === "hub-track-head" ? "hub-track-label" : "hub-phase-label";
  const countClass = className === "hub-track-head" ? "hub-track-count" : "hub-phase-count";
  const hasProgress = learnedCount > 0;
  const countText = hasProgress ? `${learnedCount}/${count} learned` : `${count}`;
  head.innerHTML = `
    <span class="hub-collapse-chevron">&#9662;</span>
    <span class="${labelClass}">${label}</span>
    <span class="${countClass}${hasProgress ? " has-progress" : ""}">${countText}</span>
  `;
  function toggle() {
    const collapsed = targetSection.classList.toggle("hub-collapsed");
    head.setAttribute("aria-expanded", String(!collapsed));
    if (typeof onToggle === "function") onToggle(collapsed);
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
  let showBookmarksOnly = false;

  statTopics.innerHTML = `<b>${topics.length}</b> topic${topics.length === 1 ? "" : "s"}`;
  const totalSources = topics.reduce((sum, t) => sum + (t.sources ? t.sources.length : 0), 0);
  statSources.innerHTML = `<b>${totalSources}</b> video${totalSources === 1 ? "" : "s"} processed`;

  const visitedSlugs = typeof pwLoad === "function" ? Object.keys(pwLoad("pw-notes-visited")) : [];
  const learnedSlugs = typeof pwLoad === "function" ? Object.keys(pwLoad("pw-notes-learned")) : [];
  function renderProgressStrip() {
    if (typeof pwProgressSummary !== "function") return;
    const summary = pwProgressSummary(topics.length);
    const strip = document.getElementById("progress-strip");
    if (!summary || !strip) { if (strip) strip.style.display = "none"; return; }
    const pct = topics.length ? Math.round((summary.learned / topics.length) * 100) : 0;
    strip.style.display = "flex";
    strip.innerHTML = `
      <span><b>${summary.learned}</b> of ${topics.length} topics learned</span>
      <div class="progress-bar-track"><div class="progress-bar-fill" style="width:${pct}%"></div></div>
      ${summary.visited ? `<span><b>${summary.visited}</b> visited</span>` : ""}
      ${summary.quizTotal ? `<span><b>${summary.quizCorrect}</b>/${summary.quizTotal} quiz answers correct</span>` : ""}
      ${summary.known ? `<span><b>${summary.known}</b> questions known</span>` : ""}
      ${summary.shaky ? `<span><b>${summary.shaky}</b> still shaky</span>` : ""}
    `;
  }
  renderProgressStrip();
  document.addEventListener("pw-learned-change", renderProgressStrip);

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

  // Collapsed by default — dozens of tag pills otherwise eat a full screen
  // of vertical space before a reader sees a single topic card.
  const quickFiltersToggle = document.getElementById("quick-filters-toggle");
  const quickFiltersCount = document.getElementById("quick-filters-count");
  const quickFiltersActive = document.getElementById("quick-filters-active");
  if (quickFiltersCount) quickFiltersCount.textContent = `(${allTags.length})`;
  if (quickFiltersToggle) {
    quickFiltersToggle.addEventListener("click", () => {
      const expanded = tagRow.style.display !== "none";
      tagRow.style.display = expanded ? "none" : "flex";
      quickFiltersToggle.setAttribute("aria-expanded", String(!expanded));
      quickFiltersToggle.classList.toggle("expanded", !expanded);
    });
  }

  function render() {
    const q = query.trim().toLowerCase();
    let filtered = topics.filter(t => {
      const matchesTag = !activeTag || (t.tags || []).includes(activeTag);
      const haystack = [t.title, t.summary, ...(t.tags || []), ...(t.keyTerms || [])]
        .join(" ").toLowerCase();
      const matchesQuery = !q || haystack.includes(q);
      return matchesTag && matchesQuery;
    });
    if (showBookmarksOnly && typeof pwSlugHasBookmark === "function") {
      filtered = filtered.filter(t => pwSlugHasBookmark(slugFor(t)));
    }

    Array.from(tagRow.children).forEach(pill => {
      pill.classList.toggle("active", pill.textContent === activeTag);
    });
    if (quickFiltersActive) {
      quickFiltersActive.style.display = activeTag ? "inline" : "none";
      quickFiltersActive.textContent = activeTag ? `· filtering: ${activeTag}` : "";
    }
    if (quickFiltersToggle) quickFiltersToggle.classList.toggle("has-active-filter", !!activeTag);

    grid.innerHTML = "";
    if (filtered.length === 0) {
      emptyState.style.display = "block";
      if (showBookmarksOnly) {
        emptyState.querySelector("h3").textContent = "No bookmarks yet";
        emptyState.querySelector("p").textContent = "Star a topic card, or a section heading inside any topic page, to save it here for later.";
      } else {
        emptyState.querySelector("h3").textContent = topics.length === 0
          ? "No topics yet"
          : "No matches";
        emptyState.querySelector("p").textContent = topics.length === 0
          ? "Send over a video transcript and the first topic page will show up here."
          : "Try a different search term or clear the tag filter.";
      }
      return;
    }
    emptyState.style.display = "none";

    function makeCard(t, i) {
      const card = document.createElement("a");
      card.href = t.file;
      card.className = "card";
      card.style.animationDelay = `${i * 30}ms`;
      const slug = slugFor(t);
      const isVisited = visitedSlugs.includes(slug);
      card.style.borderTop = `3px solid ${categoryColorFor(t.tags)}`;
      const isBookmarked = typeof pwSlugHasBookmark === "function" && pwSlugHasBookmark(slug);
      const isLearned = typeof pwIsLearned === "function" && pwIsLearned(slug);
      const bookmarkedSections = typeof pwBookmarksForSlug === "function"
        ? pwBookmarksForSlug(slug).filter(b => b.sectionId)
        : [];
      card.innerHTML = `
        <div class="card-badges">
          <button type="button" class="card-bookmark-badge${isBookmarked ? " active" : ""}" title="${isBookmarked ? "Remove bookmark" : "Bookmark this topic"}" aria-pressed="${isBookmarked}">${isBookmarked ? "&#9733;" : "&#9734;"}</button>
          <div class="card-badges-right">
            <button type="button" class="card-learned-badge${isLearned ? " active" : ""}" title="${isLearned ? "Learned — click to undo" : "Mark as learned"}" aria-pressed="${isLearned}">${isLearned ? "&#10003;" : "&#9711;"}</button>
            ${isVisited ? '<span class="card-visited-badge" title="Visited">&#10003;</span>' : ""}
          </div>
        </div>
        <div class="card-title">${t.title}</div>
        <div class="card-summary">${t.summary || ""}</div>
        ${bookmarkedSections.length ? `<div class="card-bookmarked-sections">${bookmarkedSections.map(b => `<a href="${t.file}#${b.sectionId}" class="card-bookmark-link">&#9733; ${b.sectionTitle}</a>`).join("")}</div>` : ""}
        <div class="card-tags">${(t.tags || []).map(tag => `<span>${tag}</span>`).join("")}</div>
        <div class="card-meta">
          <span>${t.sources ? t.sources.length : 0} source${t.sources && t.sources.length === 1 ? "" : "s"}</span>
          <span>${t.lastUpdated || ""}</span>
        </div>`;
      const bookmarkBtn = card.querySelector(".card-bookmark-badge");
      bookmarkBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof pwToggleBookmark === "function") {
          pwToggleBookmark({ slug, sectionId: null, pageTitle: t.title, sectionTitle: null });
        }
        render();
      });
      const learnedBtn = card.querySelector(".card-learned-badge");
      learnedBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (typeof pwToggleLearned === "function") {
          pwToggleLearned(slug, t.title);
        }
        render();
      });
      return card;
    }

    const searching = !!(activeTag || q || showBookmarksOnly);
    if (searching) {
      // Flat result list while actively filtering — grouping headers add
      // nothing when you're scanning for a specific match.
      grid.classList.remove("grid-grouped");
      filtered.forEach((t, i) => grid.appendChild(makeCard(t, i)));
      return;
    }

    // Default view: top-level tracks (Python Learning, Playwright Course, SQL),
    // each holding its phases as child sub-groups — a track with only one
    // phase skips the redundant sub-header and lists cards directly.
    //
    // Tracks render COLLAPSED by default, with only the last-opened one (or
    // the first, initially) expanded. With 38 topics across 3 tracks, having
    // everything expanded meant scrolling ~10 screens on mobile to reach the
    // last track — and that got linearly worse with every track added. The
    // open track is remembered so returning to the hub lands where you left off.
    grid.classList.add("grid-grouped");
    let cardIndex = 0;
    const trackOrder = window.TRACK_ORDER || [{ key: "_all", label: "All topics", phases: phaseOrder.map(p => p.key) }];
    const openTrackKey = (typeof pwLoad === "function" ? pwLoad("pw-notes-open-track").key : null) || trackOrder[0].key;
    trackOrder.forEach((track) => {
      const trackTopics = filtered.filter(t => track.phases.includes(t.phase));
      if (trackTopics.length === 0) return;
      const phasesInTrack = phaseOrder.filter(p => track.phases.includes(p.key));

      const trackLearned = typeof pwIsLearned === "function"
        ? trackTopics.filter(t => pwIsLearned(slugFor(t))).length
        : 0;
      const trackSection = document.createElement("div");
      trackSection.className = "hub-track";
      // A search or tag filter is an explicit "show me matches" intent — keep
      // every matching track open in that case rather than hiding results
      // behind a collapsed header the user then has to hunt for.
      const filtersActive = !!query || !!activeTag || showBookmarksOnly;
      if (!filtersActive && track.key !== openTrackKey) trackSection.classList.add("hub-collapsed");
      const trackHead = makeCollapseHead("hub-track-head", track.label, trackTopics.length, trackSection, trackLearned, (collapsed) => {
        if (!collapsed && typeof pwSave === "function") pwSave("pw-notes-open-track", { key: track.key });
      });
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
          const phaseLearned = typeof pwIsLearned === "function"
            ? inPhase.filter(t => pwIsLearned(slugFor(t))).length
            : 0;
          const section = document.createElement("div");
          section.className = "hub-phase hub-phase-nested";
          const phaseHead = makeCollapseHead("hub-phase-head", phase.label, inPhase.length, section, phaseLearned);
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

  const bookmarkFilterBtn = document.getElementById("bookmark-filter-btn");
  const bookmarkFilterCount = document.getElementById("bookmark-filter-count");
  function updateBookmarkCount() {
    if (bookmarkFilterCount && typeof pwLoad === "function") {
      bookmarkFilterCount.textContent = Object.keys(pwLoad("pw-notes-bookmarks")).length;
    }
  }
  if (bookmarkFilterBtn) {
    bookmarkFilterBtn.addEventListener("click", () => {
      showBookmarksOnly = !showBookmarksOnly;
      bookmarkFilterBtn.classList.toggle("active", showBookmarksOnly);
      bookmarkFilterBtn.setAttribute("aria-pressed", String(showBookmarksOnly));
      render();
    });
    updateBookmarkCount();
    document.addEventListener("pw-bookmark-change", () => {
      updateBookmarkCount();
      if (showBookmarksOnly) render();
    });
  }

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

/* ---------- Topic page: breadcrumb shows where the topic actually sits ---------- */
/* A flat "All topics / Page Title" breadcrumb doesn't say which part of the
   course a topic belongs to. Rebuilds it from topics-index.js at runtime —
   every topic page loads that file already, and this stays correct
   automatically as topics move between phases, instead of needing 24 pages
   of hardcoded breadcrumb text kept in sync by hand. */
function initBreadcrumb() {
  const bc = document.querySelector(".topic-header .breadcrumb");
  if (!bc || !window.TOPICS_INDEX) return;

  const slug = location.pathname.split("/").pop().replace(/\.html$/, "");
  if (!slug) return;
  const entry = window.TOPICS_INDEX.find(t => (t.file || "").replace(/^pages\//, "").replace(/\.html$/, "") === slug);
  if (!entry) return;

  const phaseOrder = window.PHASE_ORDER || [];
  const trackOrder = window.TRACK_ORDER || [];
  const phase = phaseOrder.find(p => p.key === entry.phase);
  const track = trackOrder.find(t => t.phases.includes(entry.phase));

  // Each middle crumb bundles its separator with its label into one unit —
  // on narrow screens the whole pair hides together (see .breadcrumb-crumb
  // in style.css), so there's never an orphaned "/" left with nothing after it.
  let html = '<a href="../index.html">All topics</a>';
  if (track) html += ` <span class="breadcrumb-crumb"><span class="breadcrumb-sep">/</span> <span class="breadcrumb-seg">${track.label}</span></span>`;
  if (phase && (!track || track.phases.length > 1)) html += ` <span class="breadcrumb-crumb"><span class="breadcrumb-sep">/</span> <span class="breadcrumb-seg">${phase.label}</span></span>`;
  html += ` <span class="breadcrumb-sep">/</span> <span class="breadcrumb-current">${entry.title}</span>`;

  bc.innerHTML = html;
}

/* ---------- Mobile nav drawer ---------- */
/* Site-wide (every page shares the same #topbar-hamburger / #nav-drawer
   markup) — desktop never sees the hamburger at all (display:none until the
   760px breakpoint), so this only changes behavior on narrow screens. The
   hamburger opens ONE slide-out drawer that absorbs everything mobile had
   scattered across the page: search, bookmarks, quick filters, and
   track/phase navigation on the hub; the "on this page" section list on
   topic pages. It's built by proxying clicks/input to the real controls
   (search, bookmark button, quick-filters toggle) rather than duplicating
   their state, so there is exactly one source of truth for each. */
function initNavDrawer() {
  const hamburger = document.getElementById("topbar-hamburger");
  const drawer = document.getElementById("nav-drawer");
  const overlay = document.getElementById("nav-drawer-overlay");
  const closeBtn = document.getElementById("nav-drawer-close");
  const body = document.getElementById("nav-drawer-body");
  if (!hamburger || !drawer || !overlay || !body) return;

  function open() {
    drawer.classList.add("open");
    overlay.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
  }
  function close() {
    drawer.classList.remove("open");
    overlay.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
  hamburger.addEventListener("click", (e) => {
    e.stopPropagation();
    drawer.classList.contains("open") ? close() : open();
  });
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", close);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open")) close();
  });

  const sections = [];

  // Search — proxies into the real #search input so there's only one
  // query state; the real input's own listener does the filtering.
  const searchInput = document.getElementById("search");
  if (searchInput) {
    sections.push(`
      <div class="nav-drawer-section">
        <div class="nav-drawer-search-box">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="drawer-search" placeholder="Search topics, tags, terms…" autocomplete="off">
        </div>
      </div>
    `);
  }

  // Bookmarks + quick filters — proxy-click the real (now hidden) buttons
  // so their existing toggle logic runs unchanged, then close the drawer
  // and let the user see the result on the page underneath.
  const bookmarkBtn = document.getElementById("bookmark-filter-btn");
  const quickFiltersToggle = document.getElementById("quick-filters-toggle");
  if (bookmarkBtn || quickFiltersToggle) {
    sections.push(`
      <div class="nav-drawer-section">
        <div class="nav-drawer-label">Filter</div>
        ${bookmarkBtn ? '<button type="button" class="nav-drawer-link" id="drawer-bookmarks">&#9733; Bookmarks only</button>' : ""}
        ${quickFiltersToggle ? '<button type="button" class="nav-drawer-link" id="drawer-quick-filters">&#9662; Filter by tag</button>' : ""}
      </div>
    `);
  }

  // Section/track navigation ("Python Learning" / "Playwright Course" and
  // their phases, e.g. "Course Intro") — read straight from the hub grid
  // that initHub() already built, so this list can never drift out of sync
  // with the real track/phase structure. Each track's phases start
  // collapsed behind a chevron — Playwright Course alone has 5, and
  // showing all of them plus every other drawer section by default made
  // the drawer too tall to use comfortably. Python Learning isn't split
  // into phases in the data model, but the drawer still needs the same
  // expand affordance for it, so a track with no phases falls back to
  // listing its own topics as the expandable children instead — same
  // chevron pattern, just linking straight to each topic's page rather
  // than scrolling to a phase heading.
  const trackEls = document.querySelectorAll(".hub-track");
  if (trackEls.length) {
    const esc = (s) => s.replace(/"/g, "&quot;");
    const items = [...trackEls].map((trackEl) => {
      const trackLabelEl = trackEl.querySelector(".hub-track-head .hub-track-label");
      const trackLabel = trackLabelEl ? trackLabelEl.textContent : "";
      const phaseLabels = [...trackEl.querySelectorAll(".hub-phase-head .hub-phase-label")].map((el) => el.textContent);
      let childrenHtml;
      if (phaseLabels.length > 0) {
        childrenHtml = phaseLabels.map((label) =>
          `<button type="button" class="nav-drawer-link drawer-phase-link drawer-jump" data-jump-label="${esc(label)}" data-jump-phase="true">${label}</button>`
        ).join("");
      } else {
        const topicCards = [...trackEl.querySelectorAll(".card")];
        childrenHtml = topicCards.map((card) => {
          const titleEl = card.querySelector(".card-title");
          const title = titleEl ? titleEl.textContent : "";
          return `<a class="nav-drawer-link drawer-phase-link" href="${card.getAttribute("href")}">${title}</a>`;
        }).join("");
      }
      const hasChildren = childrenHtml.length > 0;
      return `
        <div class="drawer-track-group">
          <div class="drawer-track-row">
            <button type="button" class="nav-drawer-link drawer-jump" data-jump-label="${esc(trackLabel)}" data-jump-phase="false">${trackLabel}</button>
            ${hasChildren ? '<button type="button" class="drawer-track-chevron" aria-expanded="false" aria-label="Expand sections"><span class="section-chevron">&#9662;</span></button>' : ""}
          </div>
          ${hasChildren ? `<div class="drawer-track-children">${childrenHtml}</div>` : ""}
        </div>
      `;
    }).join("");
    sections.push(`
      <div class="nav-drawer-section">
        <div class="nav-drawer-label">Jump to</div>
        ${items}
      </div>
    `);
  }

  // Topic-page TOC ("On this page") — the .toc sidebar is display:none on
  // mobile (see style.css), its links live here instead while narrow.
  const tocLinks = document.querySelectorAll(".toc a");
  if (tocLinks.length) {
    const items = [...tocLinks].map((a) =>
      `<a class="nav-drawer-link" href="${a.getAttribute("href")}">${a.textContent}</a>`
    ).join("");
    sections.push(`
      <div class="nav-drawer-section">
        <div class="nav-drawer-label">On this page</div>
        ${items}
      </div>
    `);
  }

  const questionsLink = document.querySelector(".topbar-link");
  const hasIntro = document.querySelector(".hero, .topic-header");
  sections.push(`
    <div class="nav-drawer-section">
      <div class="nav-drawer-label">More</div>
      ${hasIntro ? '<button type="button" class="nav-drawer-link" id="drawer-intro">Intro</button>' : ""}
      ${questionsLink ? `<a class="nav-drawer-link" href="${questionsLink.getAttribute("href")}">Interview Questions</a>` : ""}
      <button type="button" class="nav-drawer-link" id="drawer-theme-toggle">&#9788; Toggle theme</button>
    </div>
  `);

  body.innerHTML = sections.join("");

  const drawerSearch = document.getElementById("drawer-search");
  if (drawerSearch && searchInput) {
    drawerSearch.addEventListener("input", () => {
      searchInput.value = drawerSearch.value;
      searchInput.dispatchEvent(new Event("input", { bubbles: true }));
    });
  }
  const drawerBookmarks = document.getElementById("drawer-bookmarks");
  if (drawerBookmarks && bookmarkBtn) {
    drawerBookmarks.addEventListener("click", () => { bookmarkBtn.click(); close(); });
  }
  const drawerQuickFilters = document.getElementById("drawer-quick-filters");
  if (drawerQuickFilters && quickFiltersToggle) {
    drawerQuickFilters.addEventListener("click", () => {
      quickFiltersToggle.click();
      close();
      const tagRow = document.getElementById("tag-row");
      if (tagRow) setTimeout(() => tagRow.scrollIntoView({ behavior: "smooth", block: "center" }), 200);
    });
  }
  body.querySelectorAll(".drawer-track-chevron").forEach((chevron) => {
    chevron.addEventListener("click", (e) => {
      e.stopPropagation();
      const group = chevron.closest(".drawer-track-group");
      const expanded = group.classList.toggle("expanded");
      chevron.setAttribute("aria-expanded", String(expanded));
    });
  });
  // Re-queries by label text at click time (rather than keeping the
  // original element reference) because initHub() rebuilds the whole grid
  // on every search/filter change, which would otherwise leave these
  // buttons pointing at detached nodes.
  body.querySelectorAll(".drawer-jump").forEach((btn) => {
    btn.addEventListener("click", () => {
      const label = btn.dataset.jumpLabel;
      const isPhase = btn.dataset.jumpPhase === "true";
      const heads = document.querySelectorAll(isPhase ? ".hub-phase-head" : ".hub-track-head");
      const head = [...heads].find((h) => {
        const el = h.querySelector(isPhase ? ".hub-phase-label" : ".hub-track-label");
        return el && el.textContent === label;
      });
      close();
      if (!head) return;
      const container = head.closest(isPhase ? ".hub-phase" : ".hub-track");
      if (container && container.classList.contains("hub-collapsed")) {
        container.classList.remove("hub-collapsed");
        head.setAttribute("aria-expanded", "true");
      }
      setTimeout(() => head.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    });
  });
  body.querySelectorAll('a.nav-drawer-link[href^="#"]').forEach((a) => {
    a.addEventListener("click", close);
  });
  const drawerIntro = document.getElementById("drawer-intro");
  if (drawerIntro) {
    drawerIntro.addEventListener("click", () => {
      close();
      const target = document.querySelector(".hero, .topic-header");
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 200);
    });
  }
  const drawerTheme = document.getElementById("drawer-theme-toggle");
  if (drawerTheme) {
    drawerTheme.addEventListener("click", () => {
      if (typeof toggleTheme === "function") toggleTheme();
      close();
    });
  }
}

/* ---------- Fullscreen illustration viewer ---------- */
/* Every diagram/simulator container type used across the topic pages —
   add new ones here as they're introduced. Containers are matched by
   class, not by a shared wrapper markup, since each renderer function
   (renderStepDebugger, renderMemoryModel, etc.) owns its own markup. */
const ILLUSTRATION_SELECTORS = [
  ".concept-art", ".diagram", ".sim", ".demo",
  ".string-pipeline", ".window-flow", ".scope-compare",
  ".table-scan", ".memory-model"
];

function initFullscreenIllustrations() {
  const targets = document.querySelectorAll(ILLUSTRATION_SELECTORS.join(","));
  if (!targets.length) return;

  const overlay = document.createElement("div");
  overlay.className = "illustration-fullscreen-overlay";
  overlay.innerHTML = `
    <button type="button" class="illustration-fullscreen-close" aria-label="Close fullscreen view">&times;</button>
    <div class="illustration-fullscreen-hint">Turning your device sideways gives wide diagrams more room</div>
    <div class="illustration-fullscreen-body"></div>
  `;
  document.body.appendChild(overlay);
  const body = overlay.querySelector(".illustration-fullscreen-body");
  const closeBtn = overlay.querySelector(".illustration-fullscreen-close");

  // The moved element's original spot is held by a comment node so
  // close() can put it back in exactly the right place in the page —
  // the element itself is relocated, not cloned, so anything interactive
  // inside it (step-debugger buttons, assert toggles) keeps the event
  // listeners it already had rather than losing them to a clone.
  let activeEl = null;
  let placeholder = null;

  function close() {
    if (!activeEl || !placeholder) return;
    placeholder.replaceWith(activeEl);
    activeEl.classList.remove("illustration-fullscreen-active");
    activeEl = null;
    placeholder = null;
    overlay.classList.remove("open");
    document.body.classList.remove("fullscreen-lock");
  }

  function open(el) {
    if (activeEl) close();
    placeholder = document.createComment("illustration-placeholder");
    el.replaceWith(placeholder);
    body.appendChild(el);
    el.classList.add("illustration-fullscreen-active");
    activeEl = el;
    overlay.classList.add("open");
    overlay.scrollTop = 0;
    document.body.classList.add("fullscreen-lock");
  }

  closeBtn.addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay.classList.contains("open")) close();
  });

  targets.forEach((el) => {
    if (!el.children.length) return; // empty/failed-to-render container — nothing to expand
    if (getComputedStyle(el).position === "static") el.classList.add("illustration-anchor");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "illustration-expand-btn";
    btn.setAttribute("aria-label", "View fullscreen");
    btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M9 4H4v5M15 4h5v5M9 20H4v-5M15 20h5v-5"/></svg>';
    btn.addEventListener("click", (e) => { e.stopPropagation(); open(el); });
    el.appendChild(btn);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initHub();
  initTopicPage();
  initBreadcrumb();
  initNavDrawer();
  initFullscreenIllustrations();
});
