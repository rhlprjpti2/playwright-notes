/**
 * Reusable interactive widgets for topic pages: scroll progress, inline quizzes,
 * a value-flow demo (watch data travel), an assert-toggle demo, and a code-synced
 * step debugger (highlights real code lines against a simulated terminal).
 *
 * Quizzes auto-wire on DOMContentLoaded — just write the markup:
 *   <div class="quiz">
 *     <div class="quiz-q">Question text?</div>
 *     <div class="quiz-opts">
 *       <button class="quiz-opt" data-correct="false">Wrong answer</button>
 *       <button class="quiz-opt" data-correct="true">Right answer</button>
 *     </div>
 *     <div class="quiz-feedback"></div>
 *   </div>
 *
 * The other widgets are called explicitly — see renderValueFlowDemo,
 * renderAssertToggle, and renderStepDebugger below for usage.
 */

function initScrollProgress() {
  const bar = document.getElementById("scroll-progress");
  if (!bar) return;
  function update() {
    const h = document.documentElement;
    const scrolled = (h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100;
    bar.style.width = (scrolled || 0) + "%";
  }
  document.addEventListener("scroll", update);
  update();
}

/* ---------- Persistence: quiz answers, Q&A mastery, visited topics ---------- */
/* All under one localStorage namespace. Nothing here is sent anywhere —
   it's purely client-side memory of what you've engaged with. */

function pgHash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36);
}

function pwLoad(key) {
  try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) { return {}; }
}
function pwSave(key, obj) {
  try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) { /* storage unavailable — fail silently */ }
}

const PW_QUIZ_KEY = "pw-notes-quiz-state";
const PW_QA_MASTERY_KEY = "pw-notes-qa-mastery";
const PW_VISITED_KEY = "pw-notes-visited";

function pwTrackVisit() {
  const slug = location.pathname.split("/").pop().replace(/\.html$/, "");
  if (!slug || slug === "index") return;
  const visited = pwLoad(PW_VISITED_KEY);
  visited[slug] = Date.now();
  pwSave(PW_VISITED_KEY, visited);
}

/** Strips difficulty/topic badges out of a Q&A summary so the remaining question
 *  text hashes identically whether read from a topic page or the aggregated hub. */
function pwQuestionText(node) {
  const clone = node.cloneNode(true);
  clone.querySelectorAll(".q-level, .qhub-topic").forEach((n) => n.remove());
  return clone.textContent.replace(/\s+/g, " ").trim();
}

function initQuizzes() {
  const state = pwLoad(PW_QUIZ_KEY);

  document.querySelectorAll(".quiz").forEach((quiz) => {
    const qEl = quiz.querySelector(".quiz-q");
    const id = "quiz-" + pgHash(pwQuestionText(qEl || quiz));
    const opts = quiz.querySelectorAll(".quiz-opt");
    const feedback = quiz.querySelector(".quiz-feedback");

    function applyAnswer(chosenOpt, persist) {
      const correct = chosenOpt.dataset.correct === "true";
      opts.forEach((o) => (o.disabled = true));
      chosenOpt.classList.add(correct ? "correct" : "wrong");
      if (!correct) {
        const rightOne = Array.from(opts).find((o) => o.dataset.correct === "true");
        if (rightOne) rightOne.classList.add("correct");
      }
      if (feedback) {
        feedback.classList.add("show", correct ? "correct" : "wrong");
        feedback.textContent = correct
          ? (chosenOpt.dataset.feedback || "Correct.")
          : (quiz.dataset.wrongFeedback || "Not quite — re-check the section above.");
      }
      if (persist) {
        state[id] = { chosenIndex: Array.from(opts).indexOf(chosenOpt), correct, ts: Date.now() };
        pwSave(PW_QUIZ_KEY, state);
      }
    }

    if (state[id] && opts[state[id].chosenIndex]) {
      applyAnswer(opts[state[id].chosenIndex], false);
      if (qEl && !qEl.querySelector(".restored-badge")) {
        qEl.insertAdjacentHTML("beforeend", ' <span class="restored-badge">answered previously</span>');
      }
    }

    opts.forEach((opt) => opt.addEventListener("click", () => applyAnswer(opt, true)));
  });
}

/** Adds "I know this" / "Still shaky" self-assessment to every Q&A on the page,
 *  restoring prior state and tagging the card with a mastery color. Safe to call
 *  repeatedly (e.g. after the Interview Questions hub re-renders on a filter change). */
function initQaMastery() {
  const mastery = pwLoad(PW_QA_MASTERY_KEY);

  document.querySelectorAll(".qa").forEach((qa) => {
    if (qa.dataset.masteryWired) return;
    qa.dataset.masteryWired = "1";

    const summary = qa.querySelector("summary");
    const body = qa.querySelector(".qa-body");
    if (!summary || !body) return;

    const id = "qa-" + pgHash(pwQuestionText(summary));
    qa.dataset.qaId = id;

    const bar = document.createElement("div");
    bar.className = "qa-mastery-bar";
    bar.innerHTML =
      '<button class="qa-mastery-btn know" data-val="known">I know this</button>' +
      '<button class="qa-mastery-btn shaky" data-val="shaky">Still shaky</button>';
    body.appendChild(bar);

    function applyVisual(val) {
      qa.classList.remove("mastery-known", "mastery-shaky");
      if (val === "known") qa.classList.add("mastery-known");
      if (val === "shaky") qa.classList.add("mastery-shaky");
      bar.querySelectorAll(".qa-mastery-btn").forEach((b) => b.classList.toggle("active", b.dataset.val === val));
    }

    applyVisual(mastery[id]);

    bar.querySelectorAll(".qa-mastery-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const val = btn.dataset.val;
        const newVal = mastery[id] === val ? undefined : val;
        if (newVal) mastery[id] = newVal; else delete mastery[id];
        pwSave(PW_QA_MASTERY_KEY, mastery);
        applyVisual(newVal);
        document.dispatchEvent(new CustomEvent("pw-mastery-change"));
      });
    });
  });
}

/**
 * renderValueFlowDemo("container-id", {
 *   steps: [{ k: "fixture runs", v: "pre_work()" }, { k: "it returns", v: '"fail"' }, { k: "captured in", v: "pre_work" }],
 *   playLabel: "Call the fixture"
 * });
 */
function renderValueFlowDemo(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = config.steps || [];

  const row = document.createElement("div");
  row.className = "vflow-row";
  const boxEls = [];
  steps.forEach((s, i) => {
    const box = document.createElement("div");
    box.className = "vflow-box";
    box.innerHTML = `<span class="k"></span><span class="v"></span>`;
    box.querySelector(".k").textContent = s.k;
    box.querySelector(".v").textContent = s.v;
    row.appendChild(box);
    boxEls.push(box);
    if (i < steps.length - 1) {
      const arrow = document.createElement("div");
      arrow.className = "vflow-arrow";
      arrow.textContent = "→";
      row.appendChild(arrow);
      boxEls.push(arrow);
    }
  });

  const controls = document.createElement("div");
  controls.className = "vflow-controls";
  controls.innerHTML = `
    <button class="btn-run">&#9654; ${config.playLabel || "Run"}</button>
    <button class="btn-reset" disabled>&#8635; Reset</button>
  `;

  el.appendChild(row);
  el.appendChild(controls);

  const runBtn = controls.querySelector(".btn-run");
  const resetBtn = controls.querySelector(".btn-reset");

  runBtn.addEventListener("click", () => {
    runBtn.disabled = true;
    boxEls.forEach((node, i) => {
      setTimeout(() => {
        node.classList.add("lit");
        if (i === boxEls.length - 1) resetBtn.disabled = false;
      }, i * 380);
    });
  });
  resetBtn.addEventListener("click", () => {
    boxEls.forEach((node) => node.classList.remove("lit"));
    runBtn.disabled = false;
    resetBtn.disabled = true;
  });
}

/**
 * renderAssertToggle("container-id", {
 *   expression: 'assert pre_work == expected',
 *   options: [
 *     { key: "pass", label: 'expected = "pass"', pass: true,  detail: 'pre_work == "pass" → "pass" == "pass" → true' },
 *     { key: "fail", label: 'expected = "fail"', pass: false, detail: "AssertionError: received 'pass', expected 'fail'" }
 *   ],
 *   initialKey: "pass"
 * });
 */
function renderAssertToggle(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const options = config.options || [];

  el.innerHTML = `
    <div class="demo-label">${config.expression || ""}</div>
    <div class="toggle-row"></div>
    <div class="result-panel" id="${containerId}-result">
      <div class="head"><span class="dot"></span> <span class="verdict"></span></div>
      <div class="result-detail"></div>
    </div>
  `;
  const row = el.querySelector(".toggle-row");
  const panel = el.querySelector(".result-panel");

  function applyOption(opt) {
    panel.className = "result-panel " + (opt.pass ? "pass" : "fail");
    panel.querySelector(".verdict").textContent = opt.pass ? "PASSED" : "FAILED";
    panel.querySelector(".result-detail").textContent = opt.detail || "";
  }

  options.forEach((opt) => {
    const btn = document.createElement("button");
    btn.className = "toggle-btn" + (opt.key === config.initialKey ? " selected" : "");
    btn.textContent = opt.label;
    btn.addEventListener("click", () => {
      row.querySelectorAll(".toggle-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      applyOption(opt);
    });
    row.appendChild(btn);
  });

  const initial = options.find((o) => o.key === config.initialKey) || options[0];
  if (initial) applyOption(initial);
}

/**
 * renderStepDebugger("container-id", {
 *   title: "second_work fixture · step debugger",
 *   terminalPrompt: "$ pytest test_validation.py -s",
 *   codeBlocks: [
 *     { caption: "conftest.py", lines: [
 *         { id: "ln1", html: '<span class="tok-kw">@pytest.fixture</span>(scope=<span class="tok-str">"function"</span>)', zone: "setup" },
 *         { id: "ln4", html: '<span class="tok-kw">yield</span> <span class="tok-str">"fail"</span>' }
 *     ]}
 *   ],
 *   legend: [{ label: "setup zone", color: "var(--success)" }, { label: "pause point", color: "#e0c14a" }, { label: "teardown zone", color: "var(--accent-3)" }],
 *   steps: [
 *     { lineIds: ["ln1","ln2"], desc: "pytest sees the test needs the fixture", term: '<span class="tag-setup">collecting fixture</span>' }
 *   ]
 * });
 */
function renderStepDebugger(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = config.steps || [];
  const totalSteps = steps.length;

  let codeHtml = "";
  const allLineIds = [];
  (config.codeBlocks || []).forEach((block, bi) => {
    codeHtml += `<div class="code-block"${bi > 0 ? ' style="margin-top:10px;"' : ""}>`;
    if (block.caption) codeHtml += `<div class="cap">${block.caption}</div>`;
    block.lines.forEach((line) => {
      allLineIds.push(line.id);
      const zoneClass = line.zone ? ` ${line.zone}-zone` : "";
      codeHtml += `<span class="code-line${zoneClass}" id="${line.id}">${line.html}</span>`;
    });
    codeHtml += `</div>`;
  });

  const legendHtml = (config.legend || [])
    .map((l) => `<span><i style="background:${l.color};"></i> ${l.label}</span>`)
    .join("");

  el.innerHTML = `
    <div class="sim-head"><span class="sim-title">${config.title || ""}</span></div>
    <div class="sim-body">
      <div class="sim-code">${codeHtml}</div>
      <div class="sim-terminal" id="${containerId}-terminal"></div>
    </div>
    ${legendHtml ? `<div class="sim-legend">${legendHtml}</div>` : ""}
    <div class="sim-controls">
      <button class="btn-back" disabled>&#9668; Step back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-autoplay">&#9654; Autoplay</button>
      <button class="btn-sim-reset" disabled>&#8635; Reset</button>
      <span class="sim-step-label"></span>
    </div>
  `;

  const terminal = el.querySelector(`#${containerId}-terminal`);
  const backBtn = el.querySelector(".btn-back");
  const stepBtn = el.querySelector(".btn-step");
  const playBtn = el.querySelector(".btn-autoplay");
  const resetBtn = el.querySelector(".btn-sim-reset");
  const label = el.querySelector(".sim-step-label");

  let index = 0;
  let playing = false;

  function render() {
    allLineIds.forEach((id) => {
      const lineEl = document.getElementById(id);
      if (lineEl) lineEl.classList.remove("active");
    });
    if (index > 0) {
      (steps[index - 1].lineIds || []).forEach((id) => {
        const lineEl = document.getElementById(id);
        if (lineEl) lineEl.classList.add("active");
      });
    }

    let html = `<span class="out-line shown">${config.terminalPrompt || ""}<span class="cursor" style="display:none;"></span></span>`;
    for (let i = 0; i < index; i++) {
      html += `<span class="out-line shown">${steps[i].term}</span>`;
    }
    html += `<span class="cursor" style="display:block; margin-top:2px;"></span>`;
    terminal.innerHTML = html;
    terminal.scrollTop = terminal.scrollHeight;

    label.textContent = index === 0
      ? `Ready — step 0 of ${totalSteps}`
      : `Step ${index} of ${totalSteps} — ${steps[index - 1].desc}`;

    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    const atEnd = index === totalSteps;
    stepBtn.disabled = atEnd || playing;
    playBtn.disabled = atEnd || playing;
    stepBtn.textContent = atEnd ? "Done ✓" : "Step ▸";
  }

  function stepForward() {
    if (index < totalSteps) {
      index++;
      render();
    }
  }
  function stepBack() {
    if (index > 0) {
      index--;
      render();
    }
  }
  function autoplay() {
    playing = true;
    render();
    const tick = () => {
      if (index >= totalSteps) {
        playing = false;
        render();
        return;
      }
      stepForward();
      setTimeout(tick, 950);
    };
    tick();
  }

  stepBtn.addEventListener("click", stepForward);
  backBtn.addEventListener("click", stepBack);
  playBtn.addEventListener("click", autoplay);
  resetBtn.addEventListener("click", () => {
    index = 0;
    playing = false;
    render();
  });

  render();
}

/**
 * Auto-wires a difficulty filter above any Q&A section whose questions carry a
 * <span class="q-level junior|mid|senior|scenario"> badge. No per-page setup:
 * tag the questions, the filter builds itself from whatever levels are present.
 */
function initQaFilters() {
  const LEVEL_ORDER = ["junior", "mid", "senior", "scenario"];
  const LEVEL_LABEL = { junior: "Junior", mid: "Mid", senior: "Senior", scenario: "Scenario" };

  document.querySelectorAll("section").forEach((section) => {
    const items = Array.from(section.querySelectorAll(".qa"));
    if (items.length === 0) return;

    const levelsPresent = LEVEL_ORDER.filter((lvl) =>
      items.some((qa) => qa.querySelector(`.q-level.${lvl}`))
    );
    if (levelsPresent.length < 2) return; // nothing meaningful to filter

    const bar = document.createElement("div");
    bar.className = "qa-filter";
    bar.innerHTML = `<span class="qa-filter-label">Filter</span>`;

    const makeBtn = (value, label) => {
      const b = document.createElement("button");
      b.className = "qa-filter-btn" + (value === "all" ? " active" : "");
      b.textContent = label;
      b.dataset.level = value;
      b.addEventListener("click", () => {
        bar.querySelectorAll(".qa-filter-btn").forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        items.forEach((qa) => {
          const match = value === "all" || !!qa.querySelector(`.q-level.${value}`);
          qa.hidden = !match;
          if (!match) qa.open = false;
        });
      });
      return b;
    };

    const counts = { all: items.length };
    levelsPresent.forEach((lvl) => {
      counts[lvl] = items.filter((qa) => qa.querySelector(`.q-level.${lvl}`)).length;
    });

    bar.appendChild(makeBtn("all", `All (${counts.all})`));
    levelsPresent.forEach((lvl) => bar.appendChild(makeBtn(lvl, `${LEVEL_LABEL[lvl]} (${counts[lvl]})`)));

    const heading = section.querySelector("h2");
    if (heading) heading.insertAdjacentElement("afterend", bar);
    else section.insertBefore(bar, section.firstChild);
  });
}

/**
 * Small always-visible key explaining the interaction vocabulary — only inserted
 * if the page actually has one of these widgets, and only the relevant items show.
 */
function initInteractionLegend() {
  const header = document.querySelector(".topic-header");
  if (!header) return;

  const present = [
    { sel: ".playground, .sim, .demo", icon: "&#9654;", label: "Click to run" },
    { sel: ".quiz", icon: "&#10003;", label: "Quiz — click an answer" },
    { sel: ".qa", icon: "&#9733;", label: '"I know this" tracks what you\'ve reviewed' },
    { sel: ".callout.supplement", icon: "&#43;", label: "Beyond the source video" }
  ].filter((item) => document.querySelector(item.sel));

  if (present.length === 0) return;

  const bar = document.createElement("div");
  bar.className = "legend-bar";
  bar.innerHTML = present
    .map((i) => `<span class="legend-item"><span class="legend-icon">${i.icon}</span>${i.label}</span>`)
    .join("");
  header.insertAdjacentElement("afterend", bar);
}

/** One-time (site-wide, not per-page) pulse on the first interactive element a
 *  visitor encounters, so the interaction vocabulary is discoverable without
 *  requiring the legend to be read first. Never repeats once seen. */
function initFirstVisitHint() {
  const HINT_KEY = "pw-notes-hint-seen";
  if (localStorage.getItem(HINT_KEY)) return;
  const target = document.querySelector(".playground, .sim, .demo, .quiz");
  if (!target) return;
  target.classList.add("first-visit-hint");
  setTimeout(() => target.classList.remove("first-visit-hint"), 3600);
  localStorage.setItem(HINT_KEY, "1");
}

/** Reads visited/quiz/mastery state and renders a small progress line — used on
 *  index.html and course-roadmap.html. Returns null if there's nothing to show yet. */
function pwProgressSummary(totalTopics) {
  const visited = Object.keys(pwLoad(PW_VISITED_KEY)).length;
  const quizState = pwLoad(PW_QUIZ_KEY);
  const quizCorrect = Object.values(quizState).filter((q) => q.correct).length;
  const quizTotal = Object.keys(quizState).length;
  const mastery = pwLoad(PW_QA_MASTERY_KEY);
  const known = Object.values(mastery).filter((v) => v === "known").length;
  const shaky = Object.values(mastery).filter((v) => v === "shaky").length;
  if (visited === 0 && quizTotal === 0 && known === 0 && shaky === 0) return null;
  return { visited, totalTopics, quizCorrect, quizTotal, known, shaky };
}

/**
 * renderLayerStack("container-id", {
 *   playLabel: "Trace a request",
 *   layers: [{ name: "Test Scripts", sub: "what engineers write daily", desc: "..." }, ...]
 * });
 * A vertical stack (top layer first) with a play button that traces a single
 * pass top-to-bottom, pausing at each layer with its description — distinct
 * from the horizontal step-through flow diagram used elsewhere, appropriate
 * for genuinely layered/architectural content.
 */
function renderLayerStack(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const layers = config.layers || [];

  el.innerHTML = `
    <div class="layer-stack-controls">
      <button class="btn-run">&#9654; ${config.playLabel || "Trace a request"}</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
    </div>
    <div class="layer-stack"></div>
    <div class="layer-desc">Click play to trace how a request flows down through each layer.</div>
  `;
  const stack = el.querySelector(".layer-stack");
  const desc = el.querySelector(".layer-desc");
  const runBtn = el.querySelector(".btn-run");
  const resetBtn = el.querySelector(".btn-reset");

  layers.forEach((l, i) => {
    if (i > 0) {
      const connector = document.createElement("div");
      connector.className = "layer-connector";
      stack.appendChild(connector);
    }
    const box = document.createElement("div");
    box.className = "layer-box";
    box.innerHTML = `<span class="layer-name">${l.name}</span><span class="layer-sub">${l.sub || ""}</span>`;
    stack.appendChild(box);
  });

  const boxes = stack.querySelectorAll(".layer-box");
  const connectors = stack.querySelectorAll(".layer-connector");
  let running = false;

  function reset() {
    boxes.forEach((b) => b.classList.remove("active", "done"));
    connectors.forEach((c) => c.classList.remove("done"));
    desc.textContent = "Click play to trace how a request flows down through each layer.";
    runBtn.disabled = false;
    resetBtn.disabled = true;
    running = false;
  }

  runBtn.addEventListener("click", () => {
    if (running) return;
    running = true;
    reset();
    runBtn.disabled = true;
    let i = 0;
    const tick = () => {
      if (i > 0) {
        boxes[i - 1].classList.remove("active");
        boxes[i - 1].classList.add("done");
        if (connectors[i - 1]) connectors[i - 1].classList.add("done");
      }
      if (i >= layers.length) {
        resetBtn.disabled = false;
        running = false;
        return;
      }
      boxes[i].classList.add("active");
      desc.textContent = layers[i].desc || "";
      i++;
      setTimeout(tick, 1300);
    };
    tick();
  });
  resetBtn.addEventListener("click", reset);
}

/**
 * renderWindowFlow("container-id", { windows: [...], steps: [...] })
 *
 * Side-by-side mock browser windows with variable-pointer badges, for concepts
 * where *which window a variable points at* is the actual lesson — child
 * windows/popups, multi-context flows. Shows spatially what a code-and-terminal
 * debugger can't: two windows existing simultaneously, and which one each page
 * object controls.
 *
 * windows: [{ key, title, body }]           body = HTML string for the mock page
 * steps:   [{ desc, visible:[keys], focus, pointers:[{name,target,tone}],
 *             highlight:{window,sel}, verdict:{tone,text} }]
 */
function renderWindowFlow(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const wins = config.windows || [];
  const steps = config.steps || [];

  el.innerHTML = `
    <div class="wf-controls">
      <button class="btn-back" disabled>&#9668; Back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-auto">&#9654; Autoplay</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
      <span class="wf-step-label"></span>
    </div>
    <div class="wf-stage">
      ${wins.map((w) => `
        <div class="wf-window" data-key="${w.key}">
          <div class="wf-chrome">
            <span class="wf-dot"></span><span class="wf-dot"></span><span class="wf-dot"></span>
            <span class="wf-url">${w.title}</span>
          </div>
          <div class="wf-page">${w.body}</div>
          <div class="wf-pointers"></div>
        </div>`).join("")}
    </div>
    <div class="wf-desc"></div>
  `;

  const stage = el.querySelector(".wf-stage");
  const desc = el.querySelector(".wf-desc");
  const label = el.querySelector(".wf-step-label");
  const backBtn = el.querySelector(".btn-back");
  const stepBtn = el.querySelector(".btn-step");
  const autoBtn = el.querySelector(".btn-auto");
  const resetBtn = el.querySelector(".btn-reset");

  let index = 0;
  let playing = false;

  function render() {
    const step = index > 0 ? steps[index - 1] : null;

    wins.forEach((w) => {
      const node = stage.querySelector(`.wf-window[data-key="${w.key}"]`);
      const visible = step ? (step.visible || []).includes(w.key) : (w.key === wins[0].key);
      node.classList.toggle("wf-hidden", !visible);
      node.classList.toggle("wf-focus", !!step && step.focus === w.key);
      node.querySelectorAll(".wf-hit").forEach((n) => n.classList.remove("wf-hit"));
      node.querySelector(".wf-pointers").innerHTML = "";
    });

    if (step) {
      (step.pointers || []).forEach((p) => {
        const target = stage.querySelector(`.wf-window[data-key="${p.target}"] .wf-pointers`);
        if (target) {
          target.insertAdjacentHTML(
            "beforeend",
            `<span class="wf-pointer ${p.tone || ""}"><code>${p.name}</code> &rarr; this window</span>`
          );
        }
      });
      if (step.highlight) {
        const node = stage.querySelector(`.wf-window[data-key="${step.highlight.window}"] ${step.highlight.sel}`);
        if (node) node.classList.add("wf-hit");
      }
      desc.className = "wf-desc" + (step.verdict ? " " + step.verdict.tone : "");
      desc.innerHTML = (step.verdict ? `<b>${step.verdict.text}</b><br>` : "") + step.desc;
    } else {
      desc.className = "wf-desc";
      desc.textContent = config.introText || "Step through to see how each page object maps to a window.";
    }

    label.textContent = index === 0 ? `Ready — step 0 of ${steps.length}` : `Step ${index} of ${steps.length}`;
    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    const atEnd = index === steps.length;
    stepBtn.disabled = atEnd || playing;
    autoBtn.disabled = atEnd || playing;
    stepBtn.textContent = atEnd ? "Done ✓" : "Step ▸";
  }

  stepBtn.addEventListener("click", () => { if (index < steps.length) { index++; render(); } });
  backBtn.addEventListener("click", () => { if (index > 0) { index--; render(); } });
  autoBtn.addEventListener("click", () => {
    playing = true; render();
    const tick = () => {
      if (index >= steps.length) { playing = false; render(); return; }
      index++; render();
      setTimeout(tick, 1700);
    };
    tick();
  });
  resetBtn.addEventListener("click", () => { index = 0; playing = false; render(); });

  render();
}

/**
 * renderStringPipeline("container-id", { steps: [...] })
 *
 * Visualises a string being transformed step by step, rendering whitespace as a
 * visible marker. Built for bugs that are invisible in ordinary text — a stray
 * leading space, a delimiter that isn't where you assumed — where seeing the
 * actual characters is the entire explanation.
 *
 * steps: [{
 *   code:  "words[1].split(' ')[0]",     // the expression being evaluated
 *   note:  "why this step matters",
 *   parts: [{ t: "text", tone: "keep|drop|hit|space|delim" }],
 *   result: { value: "'...'", tone: "pass|fail|neutral", label: "..." }
 * }]
 */
function renderStringPipeline(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const steps = config.steps || [];

  el.innerHTML = `
    <div class="sp-controls">
      <button class="btn-back" disabled>&#9668; Back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-auto">&#9654; Autoplay</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
      <span class="sp-step-label"></span>
    </div>
    <div class="sp-legend">
      <span><i class="sp-sw space"></i> space character</span>
      <span><i class="sp-sw delim"></i> split point</span>
      <span><i class="sp-sw hit"></i> what we want</span>
      <span><i class="sp-sw drop"></i> discarded</span>
    </div>
    <div class="sp-expr"></div>
    <div class="sp-string"></div>
    <div class="sp-result"></div>
    <div class="sp-note"></div>
  `;

  const exprEl = el.querySelector(".sp-expr");
  const strEl = el.querySelector(".sp-string");
  const resEl = el.querySelector(".sp-result");
  const noteEl = el.querySelector(".sp-note");
  const label = el.querySelector(".sp-step-label");
  const backBtn = el.querySelector(".btn-back");
  const stepBtn = el.querySelector(".btn-step");
  const autoBtn = el.querySelector(".btn-auto");
  const resetBtn = el.querySelector(".btn-reset");

  let index = 0;
  let playing = false;

  function renderParts(parts) {
    return (parts || [])
      .map((p) => {
        // Any whitespace-only segment renders as visible middots, whatever its
        // tone. This matters most when the split point IS the invisible space —
        // showing it as a literal " " would hide the exact thing being taught.
        if (p.tone === "space" || /^\s+$/.test(p.t)) {
          return `<span class="sp-seg ${p.tone || "space"}">${"·".repeat(Math.max(1, p.t.length))}</span>`;
        }
        const safe = p.t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        return `<span class="sp-seg ${p.tone || "keep"}">${safe}</span>`;
      })
      .join("");
  }

  function render() {
    const step = index > 0 ? steps[index - 1] : null;
    if (!step) {
      exprEl.textContent = config.initialExpr || "";
      strEl.innerHTML = renderParts(config.initialParts);
      resEl.className = "sp-result";
      resEl.innerHTML = "";
      noteEl.textContent = config.introText || "Step through to watch the string transform.";
    } else {
      exprEl.textContent = step.code || "";
      strEl.innerHTML = renderParts(step.parts);
      if (step.result) {
        resEl.className = "sp-result " + (step.result.tone || "neutral");
        resEl.innerHTML = `<span class="sp-result-label">${step.result.label || "result"}</span><code>${step.result.value}</code>`;
      } else {
        resEl.className = "sp-result";
        resEl.innerHTML = "";
      }
      noteEl.innerHTML = step.note || "";
    }
    label.textContent = index === 0 ? `Ready — step 0 of ${steps.length}` : `Step ${index} of ${steps.length}`;
    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    const atEnd = index === steps.length;
    stepBtn.disabled = atEnd || playing;
    autoBtn.disabled = atEnd || playing;
    stepBtn.textContent = atEnd ? "Done ✓" : "Step ▸";
  }

  stepBtn.addEventListener("click", () => { if (index < steps.length) { index++; render(); } });
  backBtn.addEventListener("click", () => { if (index > 0) { index--; render(); } });
  autoBtn.addEventListener("click", () => {
    playing = true; render();
    const tick = () => {
      if (index >= steps.length) { playing = false; render(); return; }
      index++; render();
      setTimeout(tick, 1900);
    };
    tick();
  });
  resetBtn.addEventListener("click", () => { index = 0; playing = false; render(); });

  render();
}

/**
 * renderTableScan("container-id", { headers, rows, steps })
 *
 * A real HTML table you can watch a locator strategy walk across — built for
 * dynamic-table logic, where the whole point is that you don't know which
 * column or row holds your target until runtime.
 *
 * steps: [{
 *   code, desc,
 *   header: i,                 // highlight one header cell
 *   row: i,                    // highlight a whole row
 *   cell: [rowIdx, colIdx],    // highlight one intersecting cell
 *   scanned: [i, ...],         // headers already checked and rejected
 *   vars: { name: "value" },   // loop/variable state shown below the table
 *   result: { tone, text }
 * }]
 */
function renderTableScan(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const { headers = [], rows = [], steps = [] } = config;

  el.innerHTML = `
    <div class="ts-controls">
      <button class="btn-back" disabled>&#9668; Back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-auto">&#9654; Autoplay</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
      <span class="ts-step-label"></span>
    </div>
    <div class="ts-code"></div>
    <div class="ts-table-wrap">
      <table class="ts-table">
        <thead><tr>${headers.map((h, i) => `<th data-col="${i}">${h}</th>`).join("")}</tr></thead>
        <tbody>
          ${rows.map((r, ri) => `<tr data-row="${ri}">${r.map((c, ci) => `<td data-row="${ri}" data-col="${ci}">${c}</td>`).join("")}</tr>`).join("")}
        </tbody>
      </table>
    </div>
    <div class="ts-vars"></div>
    <div class="ts-desc"></div>
  `;

  const table = el.querySelector(".ts-table");
  const codeEl = el.querySelector(".ts-code");
  const varsEl = el.querySelector(".ts-vars");
  const descEl = el.querySelector(".ts-desc");
  const label = el.querySelector(".ts-step-label");
  const backBtn = el.querySelector(".btn-back");
  const stepBtn = el.querySelector(".btn-step");
  const autoBtn = el.querySelector(".btn-auto");
  const resetBtn = el.querySelector(".btn-reset");

  let index = 0;
  let playing = false;

  function clearMarks() {
    table.querySelectorAll("th, td, tr").forEach((n) =>
      n.classList.remove("ts-hit", "ts-row-hit", "ts-scanned", "ts-cell-hit")
    );
  }

  function render() {
    const step = index > 0 ? steps[index - 1] : null;
    clearMarks();

    if (step) {
      (step.scanned || []).forEach((i) => {
        const th = table.querySelector(`th[data-col="${i}"]`);
        if (th) th.classList.add("ts-scanned");
      });
      if (step.header !== undefined) {
        const th = table.querySelector(`th[data-col="${step.header}"]`);
        if (th) th.classList.add("ts-hit");
      }
      if (step.row !== undefined) {
        const tr = table.querySelector(`tr[data-row="${step.row}"]`);
        if (tr) tr.classList.add("ts-row-hit");
      }
      if (step.cell) {
        const td = table.querySelector(`td[data-row="${step.cell[0]}"][data-col="${step.cell[1]}"]`);
        if (td) td.classList.add("ts-cell-hit");
      }
      codeEl.textContent = step.code || "";
      varsEl.innerHTML = Object.entries(step.vars || {})
        .map(([k, v]) => `<span class="ts-var"><code>${k}</code><b>${v}</b></span>`)
        .join("");
      descEl.className = "ts-desc" + (step.result ? " " + step.result.tone : "");
      descEl.innerHTML = (step.result ? `<b>${step.result.text}</b><br>` : "") + (step.desc || "");
    } else {
      codeEl.textContent = config.introCode || "";
      varsEl.innerHTML = "";
      descEl.className = "ts-desc";
      descEl.textContent = config.introText || "Step through to watch the locator find the right cell.";
    }

    label.textContent = index === 0 ? `Ready — step 0 of ${steps.length}` : `Step ${index} of ${steps.length}`;
    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    const atEnd = index === steps.length;
    stepBtn.disabled = atEnd || playing;
    autoBtn.disabled = atEnd || playing;
    stepBtn.textContent = atEnd ? "Done ✓" : "Step ▸";
  }

  stepBtn.addEventListener("click", () => { if (index < steps.length) { index++; render(); } });
  backBtn.addEventListener("click", () => { if (index > 0) { index--; render(); } });
  autoBtn.addEventListener("click", () => {
    playing = true; render();
    const tick = () => {
      if (index >= steps.length) { playing = false; render(); return; }
      index++; render();
      setTimeout(tick, 1600);
    };
    tick();
  });
  resetBtn.addEventListener("click", () => { index = 0; playing = false; render(); });

  render();
}

/**
 * renderChainCompare("container-id", { nodes, chains })
 *
 * Renders a DOM tree and shows where a locator chain "lands" after each step —
 * built for the descend-vs-narrow distinction, where two nearly identical
 * chains diverge because one moves deeper into the tree and the other stays
 * at the same level.
 *
 * nodes:  [{ id, depth, tag, note }]
 * chains: [{ key, label, tone, steps: [{ code, lands: [ids], searchIn: id,
 *            desc, verdict: {tone,text} }] }]
 */
function renderChainCompare(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const nodes = config.nodes || [];
  const chains = config.chains || [];

  el.innerHTML = `
    <div class="cc-chainpick"></div>
    <div class="cc-controls">
      <button class="btn-back" disabled>&#9668; Back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
      <span class="cc-step-label"></span>
    </div>
    <div class="cc-code"></div>
    <div class="cc-tree">
      ${nodes.map((n) => `
        <div class="cc-node" data-id="${n.id}" style="padding-left:${n.depth * 18}px">
          <span class="cc-tag">${n.tag}</span>
          ${n.note ? `<span class="cc-note">${n.note}</span>` : ""}
        </div>`).join("")}
    </div>
    <div class="cc-desc"></div>
  `;

  const pick = el.querySelector(".cc-chainpick");
  const tree = el.querySelector(".cc-tree");
  const codeEl = el.querySelector(".cc-code");
  const descEl = el.querySelector(".cc-desc");
  const label = el.querySelector(".cc-step-label");
  const backBtn = el.querySelector(".btn-back");
  const stepBtn = el.querySelector(".btn-step");
  const resetBtn = el.querySelector(".btn-reset");

  let chainIdx = 0;
  let index = 0;

  chains.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "cc-chain-btn" + (i === 0 ? " active" : "") + (c.tone ? " " + c.tone : "");
    b.innerHTML = c.label;
    b.addEventListener("click", () => {
      chainIdx = i;
      index = 0;
      pick.querySelectorAll(".cc-chain-btn").forEach((x) => x.classList.remove("active"));
      b.classList.add("active");
      render();
    });
    pick.appendChild(b);
  });

  function render() {
    const chain = chains[chainIdx];
    const step = index > 0 ? chain.steps[index - 1] : null;

    tree.querySelectorAll(".cc-node").forEach((n) =>
      n.classList.remove("cc-lands", "cc-searching", "cc-dim")
    );

    if (step) {
      if (step.searchIn) {
        const scope = tree.querySelector(`.cc-node[data-id="${step.searchIn}"]`);
        if (scope) scope.classList.add("cc-searching");
      }
      (step.lands || []).forEach((id) => {
        const n = tree.querySelector(`.cc-node[data-id="${id}"]`);
        if (n) n.classList.add("cc-lands");
      });
      codeEl.textContent = step.code || "";
      descEl.className = "cc-desc" + (step.verdict ? " " + step.verdict.tone : "");
      descEl.innerHTML = (step.verdict ? `<b>${step.verdict.text}</b><br>` : "") + (step.desc || "");
    } else {
      codeEl.textContent = chain.introCode || "";
      descEl.className = "cc-desc";
      descEl.innerHTML = chain.introText || "Step through to see where each call lands in the tree.";
    }

    label.textContent = index === 0
      ? `Ready — step 0 of ${chain.steps.length}`
      : `Step ${index} of ${chain.steps.length}`;
    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    const atEnd = index === chain.steps.length;
    stepBtn.disabled = atEnd;
    stepBtn.textContent = atEnd ? "Done ✓" : "Step ▸";
  }

  stepBtn.addEventListener("click", () => {
    if (index < chains[chainIdx].steps.length) { index++; render(); }
  });
  backBtn.addEventListener("click", () => { if (index > 0) { index--; render(); } });
  resetBtn.addEventListener("click", () => { index = 0; render(); });

  render();
}

/**
 * renderScopeCompare("container-id", { panels })
 *
 * Two side-by-side card diagrams that advance IN SYNC from one Step button, so
 * the moment two similar locator chains diverge is directly visible rather than
 * remembered. Shows the "search region" as an actual shrinking box — if the
 * target sits outside that box, you can see it, no DOM-tree reading required.
 *
 * panels: [{
 *   title, tone,
 *   steps: [{ code, scope: "card"|"<childId>", desc, verdict: {tone,text} }]
 * }]
 * Each panel renders the same card: a container with two labelled children.
 */
function renderScopeCompare(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const panels = config.panels || [];
  const total = Math.max(...panels.map((p) => p.steps.length));

  const cardMarkup = `
    <div class="sc-card" data-zone="card">
      <span class="sc-card-tag">&lt;app-card&gt;</span>
      <div class="sc-child" data-zone="link">
        <span class="sc-child-tag">&lt;a&gt;</span>
        <span class="sc-child-label">iphone X</span>
      </div>
      <div class="sc-child" data-zone="button">
        <span class="sc-child-tag">&lt;button&gt;</span>
        <span class="sc-child-label">Add</span>
        <span class="sc-target-flag">target</span>
      </div>
    </div>`;

  el.innerHTML = `
    <div class="sc-controls">
      <button class="btn-back" disabled>&#9668; Back</button>
      <button class="btn-step">Step &#9658;</button>
      <button class="btn-reset" disabled>&#8635; Reset</button>
      <span class="sc-step-label"></span>
    </div>
    <div class="sc-legend">
      <span><i class="sc-key scope"></i> where Playwright is searching</span>
      <span><i class="sc-key target"></i> the button we want</span>
    </div>
    <div class="sc-panels">
      ${panels.map((p, i) => `
        <div class="sc-panel ${p.tone || ""}" data-panel="${i}">
          <div class="sc-panel-head">${p.title}</div>
          <div class="sc-code"></div>
          ${cardMarkup}
          <div class="sc-status"></div>
        </div>`).join("")}
    </div>
  `;

  const stepBtn = el.querySelector(".btn-step");
  const backBtn = el.querySelector(".btn-back");
  const resetBtn = el.querySelector(".btn-reset");
  const label = el.querySelector(".sc-step-label");
  let index = 0;

  function render() {
    panels.forEach((p, i) => {
      const panel = el.querySelector(`.sc-panel[data-panel="${i}"]`);
      const step = index > 0 ? p.steps[Math.min(index, p.steps.length) - 1] : null;
      const card = panel.querySelector(".sc-card");

      panel.querySelectorAll("[data-zone]").forEach((z) => z.classList.remove("sc-scope", "sc-outside"));

      if (step) {
        const scopeEl = panel.querySelector(`[data-zone="${step.scope}"]`);
        if (scopeEl) scopeEl.classList.add("sc-scope");
        // anything not inside the current scope is visibly out of reach
        if (step.scope !== "card") {
          panel.querySelectorAll("[data-zone]").forEach((z) => {
            if (z !== scopeEl && !scopeEl.contains(z)) z.classList.add("sc-outside");
          });
        }
        panel.querySelector(".sc-code").textContent = step.code;
        const st = panel.querySelector(".sc-status");
        st.className = "sc-status" + (step.verdict ? " " + step.verdict.tone : "");
        st.innerHTML = (step.verdict ? `<b>${step.verdict.text}</b><br>` : "") + step.desc;
      } else {
        panel.querySelector(".sc-code").textContent = p.introCode || "";
        const st = panel.querySelector(".sc-status");
        st.className = "sc-status";
        st.textContent = p.introText || "";
      }
    });

    label.textContent = index === 0 ? `Ready — step 0 of ${total}` : `Step ${index} of ${total}`;
    backBtn.disabled = index === 0;
    resetBtn.disabled = index === 0;
    stepBtn.disabled = index === total;
    stepBtn.textContent = index === total ? "Done ✓" : "Step ▸";
  }

  stepBtn.addEventListener("click", () => { if (index < total) { index++; render(); } });
  backBtn.addEventListener("click", () => { if (index > 0) { index--; render(); } });
  resetBtn.addEventListener("click", () => { index = 0; render(); });
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initQuizzes();
  initQaFilters();
  initQaMastery();
  initInteractionLegend();
  initFirstVisitHint();
  pwTrackVisit();
});
