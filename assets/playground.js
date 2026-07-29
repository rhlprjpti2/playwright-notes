/**
 * Live locator playground.
 *
 * Renders a real (sandboxed) mock page into the notes, then evaluates
 * Playwright-style locators against that actual DOM and highlights whatever
 * matches. Nothing here is faked — match counts come from real queries, so
 * the failing cases genuinely fail for the same reason they would in a test.
 *
 * Locator resolution mirrors Playwright's documented rules:
 *   get_by_label(t)       -> <label> whose text is t, resolved via for=/id or nesting
 *   get_by_role(r, name)  -> implicit/explicit ARIA role, optionally narrowed by accessible name
 *   get_by_text(t)        -> deepest elements containing that text (substring match)
 *   get_by_placeholder(t) -> [placeholder="t"]
 *   get_by_test_id(t)     -> [data-testid="t"]
 *   locator(css)          -> raw querySelectorAll
 *
 * Usage:
 *   <div class="playground" id="pg"></div>
 *   <script>renderLocatorPlayground("pg", { locators: [...] });</script>
 */

const PG_ROLE_SELECTORS = {
  button: 'button, input[type="submit"], input[type="button"], [role="button"]',
  link: 'a[href], [role="link"]',
  combobox: 'select, [role="combobox"]',
  checkbox: 'input[type="checkbox"], [role="checkbox"]',
  radio: 'input[type="radio"], [role="radio"]',
  textbox: 'input[type="text"], input[type="email"], input[type="password"], input:not([type]), textarea, [role="textbox"]',
  heading: 'h1, h2, h3, h4, h5, h6, [role="heading"]',
  img: 'img, [role="img"]',
  list: 'ul, ol, [role="list"]',
  listitem: 'li, [role="listitem"]',
  alert: '[role="alert"]'
};

function pgAccessibleName(el) {
  if (el.hasAttribute("aria-label")) return el.getAttribute("aria-label").trim();
  if (el.tagName === "INPUT" && (el.type === "submit" || el.type === "button")) return (el.value || "").trim();
  if (el.tagName === "IMG") return (el.getAttribute("alt") || "").trim();
  return (el.textContent || "").trim();
}

/** Resolve one locator against a root element. Returns {elements, note}. */
function pgResolve(locator, root) {
  const { kind, arg, name, css } = locator;

  if (kind === "css") {
    return { elements: Array.from(root.querySelectorAll(css)) };
  }

  if (kind === "label") {
    const labels = Array.from(root.querySelectorAll("label"))
      .filter((l) => l.textContent.trim().replace(/\s+/g, " ").toLowerCase() === arg.toLowerCase());
    if (labels.length === 0) {
      return { elements: [], note: `No <label> with the text "${arg}" exists on this page.` };
    }
    const found = [];
    let reason = null;
    labels.forEach((label) => {
      const forAttr = label.getAttribute("for");
      if (forAttr) {
        const target = root.querySelector(`#${CSS.escape(forAttr)}`);
        if (target) {
          found.push(target);
        } else {
          reason = `The label exists and has for="${forAttr}", but no element on the page has id="${forAttr}" — so the link is broken and nothing resolves.`;
        }
      } else {
        const nested = label.querySelector("input, textarea, select");
        if (nested) {
          found.push(nested);
        } else {
          reason = "The label exists but has no for= attribute and no input nested inside it — neither linking rule is satisfied.";
        }
      }
    });
    return { elements: found, note: found.length === 0 ? reason : null };
  }

  if (kind === "role") {
    const sel = PG_ROLE_SELECTORS[arg];
    if (!sel) return { elements: [], note: `No elements with role "${arg}" on this page.` };
    let els = Array.from(root.querySelectorAll(sel));
    if (name) {
      els = els.filter((el) => pgAccessibleName(el).toLowerCase() === name.toLowerCase());
    }
    return { elements: els };
  }

  if (kind === "text") {
    const all = Array.from(root.querySelectorAll("*"));
    const matches = all.filter((el) => {
      const own = Array.from(el.childNodes)
        .filter((n) => n.nodeType === 3)
        .map((n) => n.textContent)
        .join("");
      return own.toLowerCase().includes(arg.toLowerCase());
    });
    return { elements: matches };
  }

  if (kind === "placeholder") {
    return { elements: Array.from(root.querySelectorAll(`[placeholder="${CSS.escape(arg)}" i]`)) };
  }

  if (kind === "testid") {
    return { elements: Array.from(root.querySelectorAll(`[data-testid="${arg}"]`)) };
  }

  return { elements: [] };
}

function renderLocatorPlayground(containerId, config) {
  const el = document.getElementById(containerId);
  if (!el) return;

  el.innerHTML = `
    <div class="pg-head">
      <span class="pg-title">Live locator playground</span>
      <span class="pg-hint">click a locator &rarr; watch it resolve on the real page below</span>
    </div>
    <div class="pg-body">
      <div class="pg-controls">
        <div class="pg-controls-label">Locators to try</div>
        <div class="pg-locator-list"></div>
        <div class="pg-result" id="${containerId}-result">
          <div class="pg-result-empty">Pick a locator to see what it matches.</div>
        </div>
      </div>
      <div class="pg-preview">
        <div class="pg-preview-chrome">
          <span class="pg-dot"></span><span class="pg-dot"></span><span class="pg-dot"></span>
          <span class="pg-url">practice-site.local/login</span>
        </div>
        <div class="pg-page" id="${containerId}-page">${config.pageHtml}</div>
      </div>
    </div>
    <div class="pg-dom">
      <div class="pg-dom-label">Relevant HTML <span>— the DOM the locator is matching against</span></div>
      <pre class="pg-dom-code" id="${containerId}-dom"></pre>
    </div>
  `;

  const page = document.getElementById(`${containerId}-page`);
  const resultBox = document.getElementById(`${containerId}-result`);
  const domBox = document.getElementById(`${containerId}-dom`);
  const list = el.querySelector(".pg-locator-list");

  function clearHighlights() {
    page.querySelectorAll(".pg-match").forEach((n) => n.classList.remove("pg-match"));
    page.querySelectorAll(".pg-match-multi").forEach((n) => n.classList.remove("pg-match-multi"));
  }

  (config.locators || []).forEach((loc) => {
    const btn = document.createElement("button");
    btn.className = "pg-locator-btn";
    btn.innerHTML = `<code>${loc.display}</code>`;
    btn.addEventListener("click", () => {
      list.querySelectorAll(".pg-locator-btn").forEach((b) => b.classList.remove("selected"));
      btn.classList.add("selected");
      clearHighlights();

      const { elements, note } = pgResolve(loc, page);
      const count = elements.length;
      const multi = count > 1;
      elements.forEach((m) => m.classList.add(multi ? "pg-match-multi" : "pg-match"));

      let verdict, cls;
      if (count === 0) {
        verdict = "0 matches — this locator fails";
        cls = "fail";
      } else if (count === 1) {
        verdict = "1 match — resolves uniquely";
        cls = "pass";
      } else {
        verdict = `${count} matches — ambiguous, needs narrowing`;
        cls = "warn";
      }

      resultBox.className = `pg-result ${cls}`;
      resultBox.innerHTML = `
        <div class="pg-verdict"><span class="pg-dot-i"></span>${verdict}</div>
        <div class="pg-explain">${note || loc.explain || ""}</div>
      `;

      domBox.textContent = loc.dom || "";
      domBox.parentElement.style.display = loc.dom ? "block" : "none";
    });
    list.appendChild(btn);
  });

  domBox.parentElement.style.display = "none";
}
