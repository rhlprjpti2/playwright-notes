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
// "python-track" is a standalone Python-fundamentals series, kept deliberately
// separate from the Playwright-course phases below it (different source,
// different pace) — a phase with zero topics simply doesn't render, so this
// is safe to sit here empty until the first entry exists.
window.PHASE_ORDER = [
  { key: "python-track", label: "Python Learning" },
  { key: "intro", label: "Course Intro" },
  { key: "fundamentals", label: "Setup & Fundamentals" },
  { key: "core", label: "Playwright Core" },
  { key: "advanced", label: "Playwright Advanced" },
  { key: "practical", label: "Practical & Strategy" },
  { key: "sql-core", label: "SQL Core Querying" },
  { key: "sql-advanced", label: "SQL Under the Hood" },
  { key: "sql-practical", label: "SQL for SDETs" }
];

// Top-level hub grouping: each track contains one or more phases from
// PHASE_ORDER above. The hub renders a track as a single un-nested section when
// it only has one phase (Python Learning), and as a labeled parent with phase
// sub-groups as children when it has several (Playwright Course, SQL).
window.TRACK_ORDER = [
  { key: "python", label: "Python Learning", phases: ["python-track"] },
  { key: "playwright", label: "Playwright Course", phases: ["intro", "fundamentals", "core", "advanced", "practical"] },
  { key: "sql", label: "SQL", phases: ["sql-core", "sql-advanced", "sql-practical"] }
];

// ---------- Python Learning (standalone track, original content) ----------
window.TOPICS_INDEX_PYTHON = [
  {
    slug: "python-memory-model",
    title: "Variables & the Memory Model",
    file: "pages/python-memory-model.html",
    tags: ["python", "memory-model", "fundamentals"],
    keyTerms: [
      "variable", "object", "reference", "id()", "is vs ==", "identity", "aliasing",
      "mutable", "immutable", "rebinding", "mutating", "heap", "pass by object reference",
      "mutable default argument", "None singleton", "small integer caching", "interning",
      "garbage collection"
    ],
    summary: "A variable is a name pointing at an object, not a box holding a value — the one idea that explains aliasing, mutable defaults, and is vs ==.",
    related: ["python-data-types", "python-strings", "pytest-fixtures"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 1
  },
  {
    slug: "python-data-types",
    title: "Core Data Types",
    file: "pages/python-data-types.html",
    tags: ["python", "data-types", "fundamentals"],
    keyTerms: [
      "int", "float", "str", "bool", "None", "NoneType", "type()", "isinstance()",
      "truthy", "falsy", "type coercion", "bool subclass of int", "singleton",
      "arbitrary precision", "IEEE 754", "decimal module"
    ],
    summary: "int, float, str, bool, None — and the handful of behaviors around them (truthy/falsy, no coercion, bool-is-int) that actually come up in interviews.",
    related: ["python-memory-model", "python-strings"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 2
  },
  {
    slug: "python-strings",
    title: "String Methods for Automation",
    file: "pages/python-strings.html",
    tags: ["python", "strings", "fundamentals"],
    keyTerms: [
      "string methods", "slicing", "split", "strip", "join", "replace", "find", "index",
      "startswith", "endswith", "f-strings", "format", "immutable strings", "regex", "re module",
      "re.search", "re.findall", "re.sub", "string concatenation performance"
    ],
    summary: "The string method toolkit for automation — slicing, split/join/replace, f-strings, and when to reach for regex instead.",
    related: ["python-memory-model", "python-data-types", "playwright-child-windows"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-07-30" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 3
  },
  {
    slug: "python-lists-tuples",
    title: "Lists & Tuples",
    file: "pages/python-lists-tuples.html",
    tags: ["python", "lists", "tuples", "fundamentals"],
    keyTerms: [
      "list", "tuple", "indexing", "negative index", "slicing", "append", "extend", "insert",
      "pop", "remove", "sort", "sorted", "list comprehension", "shallow copy", "deep copy",
      "packing", "unpacking", "star unpacking", "hashable", "shared reference", "matrix bug"
    ],
    summary: "append vs extend, slicing, comprehensions, and the shared-reference bug that shows up the moment a mutable list gets multiplied.",
    related: ["python-memory-model", "python-dicts-sets", "python-strings"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 4
  },
  {
    slug: "python-dicts-sets",
    title: "Dicts & Sets",
    file: "pages/python-dicts-sets.html",
    tags: ["python", "dicts", "sets", "fundamentals"],
    keyTerms: [
      "dict", "dictionary", "set", "get", "setdefault", "update", "pop", "hash table",
      "hashable", "O(1) lookup", "dict comprehension", "set comprehension", "union",
      "intersection", "difference", "symmetric difference", "insertion order"
    ],
    summary: "Why dict/set lookups are O(1) instead of O(n), the method toolkit, and the set operators that turn ID-comparison loops into one-liners.",
    related: ["python-lists-tuples", "python-memory-model", "python-control-flow"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 5
  },
  {
    slug: "python-control-flow",
    title: "Control Flow",
    file: "pages/python-control-flow.html",
    tags: ["python", "control-flow", "fundamentals"],
    keyTerms: [
      "if elif else", "ternary", "for loop", "while loop", "enumerate", "zip",
      "for else", "break", "continue", "walrus operator", "range", "iteration"
    ],
    summary: "Iterating without index variables, enumerate() and zip(), the for/else clause almost nobody expects, and the walrus operator.",
    related: ["python-lists-tuples", "playwright-auto-waiting", "python-functions"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 6
  },
  {
    slug: "python-functions",
    title: "Functions Deep Dive",
    file: "pages/python-functions.html",
    tags: ["python", "functions", "scope", "fundamentals"],
    keyTerms: [
      "args", "kwargs", "default argument", "positional-only", "keyword-only",
      "LEGB", "local enclosing global builtin", "global keyword", "nonlocal",
      "closure", "late binding", "lambda", "first-class function"
    ],
    summary: "*args/**kwargs, positional-only vs keyword-only params, the LEGB scope rule, and the late-binding closure trap in loops.",
    related: ["python-memory-model", "python-decorators", "python-control-flow"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 7
  },
  {
    slug: "python-decorators",
    title: "Decorators",
    file: "pages/python-decorators.html",
    tags: ["python", "decorators", "closures"],
    keyTerms: [
      "decorator", "@syntax", "closure", "functools.wraps", "decorator factory",
      "decorator with arguments", "stacking decorators", "wrapper function",
      "pytest.fixture decorator"
    ],
    summary: "What @decorator syntax actually does, why functools.wraps matters, decorators that take arguments, and the order multiple stacked decorators run in.",
    related: ["python-functions", "pytest-fixtures", "python-generators"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 8
  },
  {
    slug: "python-generators",
    title: "Generators & yield",
    file: "pages/python-generators.html",
    tags: ["python", "generators", "iterators"],
    keyTerms: [
      "generator", "yield", "yield vs return", "lazy evaluation", "generator expression",
      "iterator protocol", "iter", "next", "StopIteration", "memory efficiency",
      "pytest fixture yield", "setup teardown"
    ],
    summary: "How yield's pause-and-resume actually works, generator expressions, the iterator protocol, and why pytest fixtures use yield for setup/teardown.",
    related: ["pytest-fixtures", "python-decorators", "python-memory-model"],
    sources: [
      { title: "Original content — Python Learning series", addedDate: "2026-08-02" }
    ],
    lastUpdated: "2026-08-02",
    phase: "python-track",
    order: 9
  }
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
    lastUpdated: "2026-07-31",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-07-31",
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
    lastUpdated: "2026-08-02",
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
      "autouse", "autouse=True", "params", "parametrize", "parametrized fixture", "request.param",
      "request fixture", "ids", "name parameter", "fixture options", "cross-browser test matrix"
    ],
    summary: "How Pytest discovers tests, how fixtures work, and every option @pytest.fixture accepts — scope, params, autouse, ids, name — plus conftest.py and yield-based setup/teardown.",
    related: ["environment-setup", "python-basics", "course-roadmap", "playwright-browser-context-page"],
    sources: [
      { title: "Pytest Basics: Test Functions & Fixtures", addedDate: "2026-07-29" },
      { title: "Pytest Fixture Scopes & conftest.py", addedDate: "2026-07-29" },
      { title: "Pytest Fixtures: Return Values & Yield (Setup/Teardown)", addedDate: "2026-07-29" },
      { title: "Running & Tagging Tests via CLI", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-07-31",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
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
    lastUpdated: "2026-08-02",
    phase: "core",
    order: 4
  },
  {
    slug: "playwright-api-testing",
    title: "API Testing & Assertion Validation",
    file: "pages/playwright-api-testing.html",
    tags: ["playwright", "api-testing", "assertions"],
    keyTerms: [
      "APIRequestContext", "api_request_context", "page.request", "playwright.request.new_context",
      "to_be_ok", "response.json", "response.status", "response.ok", "GET", "POST", "PUT", "PATCH",
      "DELETE", "multipart", "extra_http_headers", "storage_state", "hybrid testing",
      "route interception vs api testing", "dispose"
    ],
    summary: "Sending real HTTP requests with APIRequestContext — status vs body assertions, auth, hybrid API+UI patterns, and how this differs from route interception.",
    related: ["playwright-browser-context-page", "playwright-alerts-dialogs", "pytest-fixtures", "framework-system-design"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-04" }
    ],
    lastUpdated: "2026-08-04",
    phase: "advanced",
    order: 5
  },
  {
    slug: "playwright-network-interception",
    title: "Network Interception & Session Storage",
    file: "pages/playwright-network-interception.html",
    tags: ["playwright", "network", "mocking", "storage"],
    keyTerms: [
      "page.route", "route.fulfill", "route.continue_", "route.abort", "route.request",
      "page.unroute", "mocking response", "mocking request", "network interception",
      "add_init_script", "localStorage", "local storage", "session storage", "storage_state",
      "bypass login", "token injection", "glob pattern", "url pattern"
    ],
    summary: "Faking a response with route.fulfill(), altering a request with route.continue_(), and skipping login entirely by planting a token via add_init_script() (or storage_state).",
    related: ["playwright-api-testing", "playwright-alerts-dialogs", "playwright-child-windows", "playwright-frames", "course-roadmap"],
    sources: [
      { title: "Intercepting & Mocking API Responses", addedDate: "2026-08-04" },
      { title: "Intercepting & Mocking API Requests", addedDate: "2026-08-04" },
      { title: "Bypassing Login via Session/Local Storage Injection", addedDate: "2026-08-04" }
    ],
    lastUpdated: "2026-08-04",
    phase: "advanced",
    order: 6
  }
];

// ---------- SQL (standalone track, original content) ----------
window.TOPICS_INDEX_SQL = [
  {
    slug: "sql-fundamentals",
    title: "SQL Fundamentals & Command Categories",
    file: "pages/sql-fundamentals.html",
    tags: ["sql", "fundamentals"],
    keyTerms: [
      "DDL", "DML", "DCL", "TCL", "SELECT", "WHERE", "ORDER BY", "DISTINCT", "LIMIT", "OFFSET",
      "logical query execution order", "execution order", "NULL", "IS NULL", "COALESCE", "NULLIF",
      "three-valued logic", "CASE WHEN", "VARCHAR", "CHAR", "DECIMAL", "FLOAT", "TIMESTAMP",
      "NOT IN vs NOT EXISTS"
    ],
    summary: "The DDL/DML/DCL/TCL categorization question, and the logical query execution order model that explains most \"why doesn't this work\" SQL surprises.",
    related: ["sql-dml", "sql-joins", "pytest-fixtures"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-04" }
    ],
    lastUpdated: "2026-08-04",
    phase: "sql-core",
    order: 1
  },
  {
    slug: "sql-dml",
    title: "DML Deep Dive",
    file: "pages/sql-dml.html",
    tags: ["sql", "dml"],
    keyTerms: [
      "INSERT", "UPDATE", "DELETE", "TRUNCATE", "DROP", "INSERT SELECT", "multi-row insert",
      "UPDATE without WHERE", "UPDATE JOIN", "upsert", "ON CONFLICT", "ON DUPLICATE KEY UPDATE",
      "MERGE", "bulk insert", "COPY", "LOAD DATA INFILE", "column order"
    ],
    summary: "INSERT, UPDATE, DELETE vs TRUNCATE vs DROP, upsert patterns, and the single most expensive typo in SQL — UPDATE or DELETE without a WHERE clause.",
    related: ["sql-fundamentals", "sql-joins", "pytest-fixtures"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-04" }
    ],
    lastUpdated: "2026-08-04",
    phase: "sql-core",
    order: 2
  },
  {
    slug: "sql-joins",
    title: "Joins & Relationships",
    file: "pages/sql-joins.html",
    tags: ["sql", "joins"],
    keyTerms: [
      "INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN", "CROSS JOIN", "SELF JOIN",
      "cartesian product", "ON vs WHERE", "NULL-filled columns", "foreign key", "table alias",
      "customers with no orders", "accidental cross join"
    ],
    summary: "INNER vs LEFT vs FULL OUTER vs CROSS vs SELF joins via actual row matching, plus the classic WHERE-on-outer-join trap that silently turns a LEFT JOIN into an INNER JOIN.",
    related: ["sql-fundamentals", "sql-dml", "playwright-web-tables"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-04" }
    ],
    lastUpdated: "2026-08-04",
    phase: "sql-core",
    order: 3
  },
  {
    slug: "sql-aggregation",
    title: "Aggregation & Grouping",
    file: "pages/sql-aggregation.html",
    tags: ["sql", "aggregation"],
    keyTerms: [
      "GROUP BY", "HAVING", "COUNT", "SUM", "AVG", "MIN", "MAX", "COUNT star vs COUNT column",
      "NULL in COUNT", "aggregate function", "multi-column GROUP BY", "bucket rows"
    ],
    summary: "GROUP BY's row-by-row bucketing mechanics, COUNT(*) vs COUNT(column) once NULL is involved, and HAVING vs WHERE as an aggregation-specific consequence.",
    related: ["sql-fundamentals", "sql-subqueries", "sql-joins"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-05" }
    ],
    lastUpdated: "2026-08-05",
    phase: "sql-core",
    order: 4
  },
  {
    slug: "sql-subqueries",
    title: "Subqueries & Set Operations",
    file: "pages/sql-subqueries.html",
    tags: ["sql", "subqueries"],
    keyTerms: [
      "correlated subquery", "non-correlated subquery", "EXISTS", "IN", "UNION", "UNION ALL",
      "INTERSECT", "EXCEPT", "MINUS", "CTE", "WITH clause", "recursive CTE", "WITH RECURSIVE",
      "named subquery", "anchor member", "recursive member"
    ],
    summary: "Correlated subqueries re-running once per outer row, EXISTS vs IN's NULL-safety gap, UNION's silent deduplication, and recursive CTEs for hierarchical data.",
    related: ["sql-fundamentals", "sql-aggregation", "sql-window-functions"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-05" }
    ],
    lastUpdated: "2026-08-05",
    phase: "sql-core",
    order: 5
  },
  {
    slug: "sql-window-functions",
    title: "Window Functions",
    file: "pages/sql-window-functions.html",
    tags: ["sql", "window-functions"],
    keyTerms: [
      "OVER", "PARTITION BY", "ROW_NUMBER", "RANK", "DENSE_RANK", "LEAD", "LAG",
      "window function vs GROUP BY", "ties in ranking", "top N per group"
    ],
    summary: "Window functions annotate rows instead of collapsing them like GROUP BY — ROW_NUMBER vs RANK vs DENSE_RANK's tie-handling differences, PARTITION BY, and LEAD/LAG.",
    related: ["sql-aggregation", "sql-subqueries", "sql-fundamentals"],
    sources: [
      { title: "Original content — written for interview prep, not sourced from a transcript", addedDate: "2026-08-05" }
    ],
    lastUpdated: "2026-08-05",
    phase: "sql-core",
    order: 6
  }
];

window.TOPICS_INDEX = window.TOPICS_INDEX.concat(window.TOPICS_INDEX_PYTHON).concat(window.TOPICS_INDEX_SQL);
