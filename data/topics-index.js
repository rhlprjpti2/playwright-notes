/**
 * This file is the "memory" of the notes app.
 * Every time a new transcript is processed, this index is checked first
 * (by title / tags / keyTerms) to decide whether the content belongs on
 * an existing page or needs a new one. Keep entries accurate — this is
 * what makes topic-matching across videos possible.
 *
 * Schema per topic:
 * {
 *   slug:       string, unique, matches pages/<slug>.html
 *   title:      display title
 *   file:       relative path from index.html, e.g. "pages/locators.html"
 *   tags:       short labels shown as pills on the hub (broad categories)
 *   keyTerms:   specific terminology/APIs/phrases used to detect overlap
 *               with future transcripts (e.g. "getByRole", "auto-waiting")
 *   summary:    1-2 sentence description shown on the hub card
 *   related:    array of other slugs this topic links to
 *   sources:    [{ title: "video title", addedDate: "YYYY-MM-DD" }]
 *   lastUpdated: "YYYY-MM-DD"
 *   phase:      which stage of the learning path this belongs on (see PHASE_ORDER
 *               below) — drives how the hub GROUPS cards, since sorting by
 *               lastUpdated alone stops reflecting the course sequence once
 *               enough topics exist that edits land all over the timeline.
 *   order:      position within that phase (lower = earlier)
 * }
 */

// Display order + label for each phase — the hub renders sections in this order.
window.PHASE_ORDER = [
  { key: "intro", label: "Course Intro" },
  { key: "fundamentals", label: "Setup & Fundamentals" },
  { key: "core", label: "Playwright Core" },
  { key: "advanced", label: "Playwright Advanced" },
  { key: "practical", label: "Practical & Strategy" }
];

window.TOPICS_INDEX = [
  {
    slug: "why-playwright-and-python",
    title: "Why Playwright & Why Python",
    file: "pages/why-playwright-and-python.html",
    tags: ["fundamentals", "tool-comparison", "course-intro"],
    keyTerms: [
      "Playwright", "Selenium", "Cypress", "cross-browser", "cross-OS",
      "multi-language", "auto-waiting", "auto-waiting mechanism", "automatic waiting",
      "web and API testing", "Python", "JavaScript", "C#", "Java",
      "Chromium", "Firefox", "WebKit", "trace", "screenshots", "unified tech stack"
    ],
    summary: "What makes Playwright stand out from Selenium and Cypress, and why Python is a strong language choice for it.",
    related: ["course-roadmap", "playwright-auto-waiting"],
    sources: [
      { title: "Course Introduction — Why Playwright, Why Python (Lecture 1)", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "intro",
    order: 1
  },
  {
    slug: "course-roadmap",
    title: "Course Roadmap",
    file: "pages/course-roadmap.html",
    tags: ["course-intro", "roadmap", "fundamentals"],
    keyTerms: [
      "Pytest", "pytest framework", "Page Object Model", "POM",
      "data driven testing", "parameterization", "parallel testing",
      "BDD", "Gherkin", "Cucumber", "Jenkins", "CI/CD",
      "network interception", "API automation", "framework design", "logging", "reporting"
    ],
    summary: "The course's learning path from Python fundamentals to a CI/CD-integrated framework — also a living coverage checklist.",
    related: [
      "why-playwright-and-python", "environment-setup", "python-basics", "pytest-fixtures",
      "playwright-browser-context-page", "playwright-locators", "playwright-auto-waiting", "playwright-dynamic-locators"
    ],
    sources: [
      { title: "Course Curriculum Overview (Lecture 2)", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "intro",
    order: 2
  },
  {
    slug: "environment-setup",
    title: "Environment Setup: Python, Pip & PyCharm",
    file: "pages/environment-setup.html",
    tags: ["setup", "tooling", "fundamentals"],
    keyTerms: [
      "python.org", "pip", "pip3", "PyCharm", "interpreter", "which python3", "where python",
      "PATH", "environment variables", "pytest-playwright", "playwright install", "pip install pytest",
      "jetbrains", "custom environment", "project interpreter", "jars", "node packages",
      "virtual environment", "venv", "activate", "isolated environment"
    ],
    summary: "Installing Python and PyCharm, and why the IDE's interpreter has to stay in sync with the system Python for pip-installed packages to show up.",
    related: ["python-basics", "pytest-fixtures", "course-roadmap"],
    sources: [
      { title: "Installing Python on Windows", addedDate: "2026-07-29" },
      { title: "Installing Python on Mac", addedDate: "2026-07-29" },
      { title: "Installing PyCharm IDE & Syncing Interpreter", addedDate: "2026-07-29" },
      { title: "Pip & Installing Pytest/Playwright Packages", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "fundamentals",
    order: 1
  },
  {
    slug: "python-basics",
    title: "Python Basics",
    file: "pages/python-basics.html",
    tags: ["python", "fundamentals"],
    keyTerms: [
      "print", "comments", "variables", "dynamic typing", "data types",
      "multiple assignment", "indentation", "code formatting"
    ],
    summary: "print(), comments, and variables with no declared type — the minimum syntax before touching Playwright code.",
    related: ["environment-setup", "pytest-fixtures", "course-roadmap"],
    sources: [
      { title: "Python Basics: Print, Comments, Variables", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "fundamentals",
    order: 2
  },
  {
    slug: "pytest-fixtures",
    title: "Pytest Fixtures & Fundamentals",
    file: "pages/pytest-fixtures.html",
    tags: ["pytest", "fundamentals", "fixtures"],
    keyTerms: [
      "pytest", "fixture", "@pytest.fixture", "scope", "function scope", "module scope",
      "class scope", "session scope", "conftest.py", "yield", "setup", "teardown",
      "assert", "test discovery", "test_ prefix", "fixture linkage", "return value fixture",
      "pytest.mark", "pytest.mark.skip", "pytest -m", "tagging", "marks", "deselected", "smoke test",
      "autouse", "autouse=True"
    ],
    summary: "How Pytest discovers tests, how fixtures work (and why they don't auto-run), the four fixture scopes, conftest.py, yield-based setup/teardown, and running/tagging tests via CLI.",
    related: ["environment-setup", "python-basics", "course-roadmap", "playwright-browser-context-page"],
    sources: [
      { title: "Pytest Basics: Test Functions & Fixtures", addedDate: "2026-07-29" },
      { title: "Pytest Fixture Scopes & conftest.py", addedDate: "2026-07-29" },
      { title: "Pytest Fixtures: Return Values & Yield (Setup/Teardown)", addedDate: "2026-07-29" },
      { title: "Running & Tagging Tests via CLI", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "fundamentals",
    order: 3
  },
  {
    slug: "playwright-browser-context-page",
    title: "Playwright Fundamentals: Browser, Context & Page",
    file: "pages/playwright-browser-context-page.html",
    tags: ["playwright", "fundamentals", "fixtures"],
    keyTerms: [
      "playwright fixture", "page fixture", "browser", "context", "new_context", "new_page",
      "chromium", "firefox", "headless", "headed", "--headed", "incognito", "pytest-playwright",
      "sync_api", "Page class", "Playwright class", "slow_mo", "viewport", "storage_state"
    ],
    summary: "The manual browser→context→page hierarchy vs the page fixture shortcut — and exactly when the shortcut stops being enough.",
    related: ["pytest-fixtures", "playwright-locators", "playwright-auto-waiting", "course-roadmap"],
    sources: [
      { title: "Invoking the Browser in Playwright", addedDate: "2026-07-29" },
      { title: "The Page Fixture Shortcut", addedDate: "2026-07-29" },
      { title: "Running Tests in Firefox", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "core",
    order: 1
  },
  {
    slug: "playwright-locators",
    title: "Playwright Core Locators",
    file: "pages/playwright-locators.html",
    tags: ["playwright", "locators", "fundamentals"],
    keyTerms: [
      "get_by_label", "get_by_role", "get_by_text", "locator", "CSS selector", "select_option",
      "check", "combobox", "for attribute", "label tag", "id selector", "class selector", "name filter",
      "get_by_placeholder", "get_by_alt_text", "get_by_title", "get_by_test_id", "data-testid",
      "ARIA roles", "textbox", "radio", "heading", "dialog", "tab", "menuitem"
    ],
    summary: "get_by_label, get_by_role, CSS locators, and get_by_text — which to use depends on what the DOM actually exposes, including the get_by_label failure conditions.",
    related: ["playwright-browser-context-page", "playwright-dynamic-locators", "playwright-auto-waiting", "playwright-child-windows"],
    sources: [
      { title: "Handling Core Locators: Labels, Roles & Combo Boxes", addedDate: "2026-07-29" },
      { title: "get_by_label Limitations", addedDate: "2026-07-29" },
      { title: "Handling Buttons, Links & CSS Selectors", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "core",
    order: 2
  },
  {
    slug: "playwright-auto-waiting",
    title: "Playwright Auto-Waiting & Assertions",
    file: "pages/playwright-auto-waiting.html",
    tags: ["playwright", "auto-waiting", "assertions"],
    keyTerms: [
      "auto-waiting", "actionability checks", "visible", "stable", "receives events", "enabled",
      "expect", "web-first assertions", "to_be_visible", "auto-retrying", "timeout", "synchronization",
      "default timeout", "set_default_timeout", "30 seconds", "5 seconds"
    ],
    summary: "What Playwright's actionability checks actually verify before acting, and how auto-retrying web-first assertions remove explicit wait code entirely.",
    related: ["why-playwright-and-python", "playwright-locators", "playwright-browser-context-page"],
    sources: [
      { title: "Auto-Waiting & Assertions in Playwright", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "core",
    order: 3
  },
  {
    slug: "first-real-test",
    title: "Your First Real Test: Putting It Together",
    file: "pages/first-real-test.html",
    tags: ["playwright", "pytest", "practical", "framework"],
    keyTerms: [
      "project structure", "conftest.py", "pytest.ini", "requirements.txt", "folder layout",
      "complete example", "runnable test", "logged_in_page", "credentials fixture", "markers",
      "pytest --headed", "--slowmo", "--tracing", "show-trace", "PWDEBUG", "page.pause",
      "storage_state", "pytest-xdist", "how to run tests", "worked example"
    ],
    summary: "The whole thing assembled: real folder structure, complete conftest.py and test files, run commands, and where every other topic actually lands in the code.",
    related: ["pytest-fixtures", "playwright-locators", "playwright-auto-waiting", "playwright-dynamic-locators", "playwright-browser-context-page"],
    sources: [
      { title: "Synthesis of course material covered so far", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "practical",
    order: 1
  },
  {
    slug: "framework-system-design",
    title: "Framework & System Design: A Worked Exercise",
    file: "pages/framework-system-design.html",
    tags: ["system-design", "lead-sdet", "strategy", "leadership"],
    keyTerms: [
      "test automation strategy", "framework design", "system design round", "test pyramid",
      "flaky tests", "quarantine", "CI/CD gates", "quality gates", "sharding", "parallelization",
      "Screenplay pattern", "Page Object Model", "contract testing", "Pact", "ROI", "buy-in",
      "rollout", "leadership", "behavioral questions", "STAR", "Lead SDET", "Staff SDET"
    ],
    summary: "Not from the course — a worked 'design a test automation strategy' exercise plus leadership/behavioral prep for Lead/Staff SDET loops.",
    related: ["first-real-test", "pytest-fixtures", "interview-questions", "course-roadmap"],
    sources: [
      { title: "Original content — written for Lead/Staff SDET interview prep, not sourced from a transcript", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "practical",
    order: 2
  },
  {
    slug: "playwright-child-windows",
    title: "Handling Child Windows & Popups",
    file: "pages/playwright-child-windows.html",
    tags: ["playwright", "popups", "multi-page", "assertions"],
    keyTerms: [
      "expect_popup", "child window", "popup", "new_page_info", "child_page", "text_content",
      "page.on(\"popup\")", "context.pages", "multi-page", "with block", "closure", "event listener",
      "split", "strip", "string extraction", "leading space", "assert", "pytest assertion",
      "expected vs actual", "predicate", "wait_for_load_state", "race condition"
    ],
    summary: "A page object only knows the page it was created on — expect_popup() to capture a new window, then split()/strip() to extract text and plain assert vs expect() to check it.",
    related: ["playwright-browser-context-page", "playwright-locators", "playwright-auto-waiting", "python-basics"],
    sources: [
      { title: "Handling Child Windows / Popups in Playwright", addedDate: "2026-07-30" },
      { title: "Extracting Text with split() & strip() + Pytest Assertions", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "advanced",
    order: 1
  },
  {
    slug: "playwright-web-tables",
    title: "Dynamic Web Tables",
    file: "pages/playwright-web-tables.html",
    tags: ["playwright", "tables", "locators", "logic"],
    keyTerms: [
      "web table", "dynamic table", "th", "td", "tr", "count", "nth", "filter", "has_text",
      "for loop", "break", "f-string", "scoped locator", "to_have_text", "all_text_contents",
      "dynamic column", "dynamic row", "table interview question"
    ],
    summary: "The classic table interview question — resolving both the column index and the row at runtime, then reading the cell where they intersect.",
    related: ["playwright-dynamic-locators", "playwright-locators", "playwright-auto-waiting", "python-basics"],
    sources: [
      { title: "Handling Dynamic Web Tables", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "advanced",
    order: 4
  },
  {
    slug: "playwright-alerts-dialogs",
    title: "JavaScript Alerts & Dialogs",
    file: "pages/playwright-alerts-dialogs.html",
    tags: ["playwright", "dialogs", "events"],
    keyTerms: [
      "alert", "confirm", "prompt", "dialog", "page.on", "lambda", "anonymous function",
      "dialog.accept", "dialog.dismiss", "dialog.message", "dialog.type", "event handler",
      "not in DOM", "JavaScript popup", "page.once", "auto-dismiss"
    ],
    summary: "A native alert isn't in the DOM at all, so no locator can find it — you register an event handler in advance instead.",
    related: ["playwright-child-windows", "playwright-frames", "playwright-locators"],
    sources: [
      { title: "Handling Alerts & JavaScript Dialogs", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "advanced",
    order: 2
  },
  {
    slug: "playwright-frames",
    title: "Frames & iFrames",
    file: "pages/playwright-frames.html",
    tags: ["playwright", "frames", "locators"],
    keyTerms: [
      "iframe", "frame", "frame_locator", "nested frame", "embedded document", "page.frames",
      "to_contain_text", "to_have_text", "body locator", "switch_to.frame", "scope"
    ],
    summary: "An iframe is a separate embedded document, so page.locator() can't see into it — frame_locator() crosses that boundary.",
    related: ["playwright-child-windows", "playwright-alerts-dialogs", "playwright-locators", "playwright-auto-waiting"],
    sources: [
      { title: "Handling Frames & iFrames", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-07-30",
    phase: "advanced",
    order: 3
  },
  {
    slug: "playwright-dynamic-locators",
    title: "Dynamic Locators, Filtering & Scoped Search",
    file: "pages/playwright-dynamic-locators.html",
    tags: ["playwright", "locators", "filtering"],
    keyTerms: [
      "filter", "has_text", "has_not_text", "scoped locator", "to_have_count", "dynamic script",
      "index-based locator", "resilient script", "app-card", "nth", "first", "last", "has="
    ],
    summary: "Scanning all matches, filtering by content instead of position, and scoping further searches inside an already-found element — via a product-cart example.",
    related: ["playwright-locators", "playwright-auto-waiting", "playwright-browser-context-page"],
    sources: [
      { title: "Dynamic Element Scanning: Product Cart Example", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29",
    phase: "core",
    order: 4
  }
];
