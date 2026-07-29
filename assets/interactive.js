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

function initQuizzes() {
  document.querySelectorAll(".quiz").forEach((quiz) => {
    const opts = quiz.querySelectorAll(".quiz-opt");
    const feedback = quiz.querySelector(".quiz-feedback");
    opts.forEach((opt) => {
      opt.addEventListener("click", () => {
        const correct = opt.dataset.correct === "true";
        opts.forEach((o) => (o.disabled = true));
        opt.classList.add(correct ? "correct" : "wrong");
        if (!correct) {
          const rightOne = Array.from(opts).find((o) => o.dataset.correct === "true");
          if (rightOne) rightOne.classList.add("correct");
        }
        if (feedback) {
          feedback.classList.add("show", correct ? "correct" : "wrong");
          feedback.textContent = correct
            ? (opt.dataset.feedback || "Correct.")
            : (quiz.dataset.wrongFeedback || "Not quite — re-check the section above.");
        }
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

document.addEventListener("DOMContentLoaded", () => {
  initScrollProgress();
  initQuizzes();
  initQaFilters();
});
