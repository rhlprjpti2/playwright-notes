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

document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initQuizzes();
  initQaFilters();
  initQaMastery();
  initInteractionLegend();
  initFirstVisitHint();
  pwTrackVisit();
});
