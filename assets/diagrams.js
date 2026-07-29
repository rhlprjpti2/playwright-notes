/**
 * Reusable animated diagram builders for topic pages.
 * Usage on a topic page:
 *
 *   <div class="diagram" id="flow-1"></div>
 *   <script>
 *     renderFlowDiagram("flow-1", {
 *       steps: [
 *         { label: "Browser", sub: "chromium.launch()", desc: "One browser process. Expensive to create, reused across tests." },
 *         { label: "Context", sub: "browser.newContext()", desc: "Isolated session — own cookies, storage, permissions. Cheap to create." },
 *         { label: "Page", sub: "context.newPage()", desc: "A tab. Most actions (goto, click, fill) happen here." },
 *         { label: "Locator", sub: "page.getByRole()", desc: "A lazy, auto-retrying reference to an element — not resolved until an action runs." }
 *       ]
 *     });
 *   </script>
 *
 *   <div class="diagram" id="timeline-1"></div>
 *   <script>
 *     renderTimeline("timeline-1", {
 *       steps: [
 *         { title: "Locator action called", detail: "e.g. locator.click()" },
 *         { title: "Element located in DOM", detail: "Query re-run each attempt" },
 *         { title: "Actionability checks", detail: "visible, stable, enabled, receives events" },
 *         { title: "Retry until timeout", detail: "Default 30s, checks every ~100ms", status: "fail" },
 *         { title: "Action performed", detail: "click/fill/etc. dispatched" }
 *       ]
 *     });
 *   </script>
 */

function renderFlowDiagram(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = config.steps || [];
  let current = 0;
  let playing = false;
  let timer = null;

  el.innerHTML = `
    <div class="diagram-controls">
      <button data-act="prev" title="Previous step">&larr;</button>
      <button data-act="play" title="Auto-play">&#9654; Play</button>
      <button data-act="next" title="Next step">&rarr;</button>
      <span class="step-label"></span>
    </div>
    <div class="flow-row"></div>
    <div class="flow-desc"></div>
  `;

  const row = el.querySelector(".flow-row");
  steps.forEach((s, i) => {
    const node = document.createElement("div");
    node.className = "flow-node";
    node.innerHTML = `${s.label}${s.sub ? `<span class="sub">${s.sub}</span>` : ""}`;
    node.dataset.index = i;
    node.onclick = () => { stop(); goTo(i); };
    row.appendChild(node);
    if (i < steps.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "flow-arrow";
      row.appendChild(arrow);
    }
  });

  const nodes = row.querySelectorAll(".flow-node");
  const arrows = row.querySelectorAll(".flow-arrow");
  const desc = el.querySelector(".flow-desc");
  const label = el.querySelector(".step-label");
  const playBtn = el.querySelector('[data-act="play"]');

  function goTo(i) {
    current = ((i % steps.length) + steps.length) % steps.length;
    nodes.forEach((n, idx) => {
      n.classList.toggle("active", idx === current);
      n.classList.toggle("done", idx < current);
    });
    arrows.forEach((a, idx) => a.classList.toggle("active", idx < current));
    desc.textContent = steps[current].desc || "";
    label.textContent = `Step ${current + 1} of ${steps.length}`;
  }

  function stop() {
    playing = false;
    clearInterval(timer);
    playBtn.innerHTML = "&#9654; Play";
  }

  el.querySelector('[data-act="prev"]').onclick = () => { stop(); goTo(current - 1); };
  el.querySelector('[data-act="next"]').onclick = () => { stop(); goTo(current + 1); };
  playBtn.onclick = () => {
    if (playing) { stop(); return; }
    playing = true;
    playBtn.innerHTML = "&#10074;&#10074; Pause";
    timer = setInterval(() => {
      if (current >= steps.length - 1) { goTo(0); return; }
      goTo(current + 1);
    }, 1600);
  };

  goTo(0);
}

function renderTimeline(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = config.steps || [];
  let current = -1;
  let playing = false;
  let timer = null;

  el.innerHTML = `
    <div class="diagram-controls">
      <button data-act="prev" title="Previous">&larr;</button>
      <button data-act="play" title="Auto-play">&#9654; Play</button>
      <button data-act="next" title="Next">&rarr;</button>
      <span class="step-label"></span>
    </div>
    <div class="timeline"></div>
  `;

  const track = el.querySelector(".timeline");
  steps.forEach((s, i) => {
    const item = document.createElement("div");
    item.className = "timeline-item" + (s.status === "fail" ? " fail" : "");
    item.dataset.index = i;
    item.innerHTML = `
      <div class="timeline-dot"></div>
      <div class="timeline-content">
        <b>${s.title}</b>
        <span>${s.detail || ""}</span>
      </div>`;
    item.onclick = () => { stop(); goTo(i); };
    track.appendChild(item);
  });

  const items = track.querySelectorAll(".timeline-item");
  const label = el.querySelector(".step-label");
  const playBtn = el.querySelector('[data-act="play"]');

  function goTo(i) {
    current = ((i % steps.length) + steps.length) % steps.length;
    items.forEach((it, idx) => it.classList.toggle("active", idx <= current));
    label.textContent = `Step ${current + 1} of ${steps.length}`;
  }

  function stop() {
    playing = false;
    clearInterval(timer);
    playBtn.innerHTML = "&#9654; Play";
  }

  el.querySelector('[data-act="prev"]').onclick = () => { stop(); goTo(current - 1); };
  el.querySelector('[data-act="next"]').onclick = () => { stop(); goTo(current + 1); };
  playBtn.onclick = () => {
    if (playing) { stop(); return; }
    playing = true;
    playBtn.innerHTML = "&#10074;&#10074; Pause";
    timer = setInterval(() => {
      if (current >= steps.length - 1) { goTo(0); return; }
      goTo(current + 1);
    }, 1400);
  };

  goTo(0);
}
