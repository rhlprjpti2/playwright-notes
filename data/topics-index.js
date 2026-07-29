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
 * }
 */
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
    lastUpdated: "2026-07-29"
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
    lastUpdated: "2026-07-29"
  },
  {
    slug: "environment-setup",
    title: "Environment Setup: Python, Pip & PyCharm",
    file: "pages/environment-setup.html",
    tags: ["setup", "tooling", "fundamentals"],
    keyTerms: [
      "python.org", "pip", "pip3", "PyCharm", "interpreter", "which python3", "where python",
      "PATH", "environment variables", "pytest-playwright", "playwright install", "pip install pytest",
      "jetbrains", "custom environment", "project interpreter", "jars", "node packages"
    ],
    summary: "Installing Python and PyCharm, and why the IDE's interpreter has to stay in sync with the system Python for pip-installed packages to show up.",
    related: ["python-basics", "pytest-fixtures", "course-roadmap"],
    sources: [
      { title: "Installing Python on Windows", addedDate: "2026-07-29" },
      { title: "Installing Python on Mac", addedDate: "2026-07-29" },
      { title: "Installing PyCharm IDE & Syncing Interpreter", addedDate: "2026-07-29" },
      { title: "Pip & Installing Pytest/Playwright Packages", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
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
    lastUpdated: "2026-07-29"
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
      "pytest.mark", "pytest.mark.skip", "pytest -m", "tagging", "marks", "deselected", "smoke test"
    ],
    summary: "How Pytest discovers tests, how fixtures work (and why they don't auto-run), the four fixture scopes, conftest.py, yield-based setup/teardown, and running/tagging tests via CLI.",
    related: ["environment-setup", "python-basics", "course-roadmap", "playwright-browser-context-page"],
    sources: [
      { title: "Pytest Basics: Test Functions & Fixtures", addedDate: "2026-07-29" },
      { title: "Pytest Fixture Scopes & conftest.py", addedDate: "2026-07-29" },
      { title: "Pytest Fixtures: Return Values & Yield (Setup/Teardown)", addedDate: "2026-07-29" },
      { title: "Running & Tagging Tests via CLI", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
  },
  {
    slug: "playwright-browser-context-page",
    title: "Playwright Fundamentals: Browser, Context & Page",
    file: "pages/playwright-browser-context-page.html",
    tags: ["playwright", "fundamentals", "fixtures"],
    keyTerms: [
      "playwright fixture", "page fixture", "browser", "context", "new_context", "new_page",
      "chromium", "firefox", "headless", "headed", "--headed", "incognito", "pytest-playwright",
      "sync_api", "Page class", "Playwright class"
    ],
    summary: "The manual browser→context→page hierarchy vs the page fixture shortcut — and exactly when the shortcut stops being enough.",
    related: ["pytest-fixtures", "playwright-locators", "playwright-auto-waiting", "course-roadmap"],
    sources: [
      { title: "Invoking the Browser in Playwright", addedDate: "2026-07-29" },
      { title: "The Page Fixture Shortcut", addedDate: "2026-07-29" },
      { title: "Running Tests in Firefox", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
  },
  {
    slug: "playwright-locators",
    title: "Playwright Core Locators",
    file: "pages/playwright-locators.html",
    tags: ["playwright", "locators", "fundamentals"],
    keyTerms: [
      "get_by_label", "get_by_role", "get_by_text", "locator", "CSS selector", "select_option",
      "check", "combobox", "for attribute", "label tag", "id selector", "class selector", "name filter"
    ],
    summary: "get_by_label, get_by_role, CSS locators, and get_by_text — which to use depends on what the DOM actually exposes, including the get_by_label failure conditions.",
    related: ["playwright-browser-context-page", "playwright-dynamic-locators", "playwright-auto-waiting"],
    sources: [
      { title: "Handling Core Locators: Labels, Roles & Combo Boxes", addedDate: "2026-07-29" },
      { title: "get_by_label Limitations", addedDate: "2026-07-29" },
      { title: "Handling Buttons, Links & CSS Selectors", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
  },
  {
    slug: "playwright-auto-waiting",
    title: "Playwright Auto-Waiting & Assertions",
    file: "pages/playwright-auto-waiting.html",
    tags: ["playwright", "auto-waiting", "assertions"],
    keyTerms: [
      "auto-waiting", "actionability checks", "visible", "stable", "receives events", "enabled",
      "expect", "web-first assertions", "to_be_visible", "auto-retrying", "timeout", "synchronization"
    ],
    summary: "What Playwright's actionability checks actually verify before acting, and how auto-retrying web-first assertions remove explicit wait code entirely.",
    related: ["why-playwright-and-python", "playwright-locators", "playwright-browser-context-page"],
    sources: [
      { title: "Auto-Waiting & Assertions in Playwright", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
  },
  {
    slug: "playwright-dynamic-locators",
    title: "Dynamic Locators, Filtering & Scoped Search",
    file: "pages/playwright-dynamic-locators.html",
    tags: ["playwright", "locators", "filtering"],
    keyTerms: [
      "filter", "has_text", "has_not_text", "scoped locator", "to_have_count", "dynamic script",
      "index-based locator", "resilient script", "app-card"
    ],
    summary: "Scanning all matches, filtering by content instead of position, and scoping further searches inside an already-found element — via a product-cart example.",
    related: ["playwright-locators", "playwright-auto-waiting", "playwright-browser-context-page"],
    sources: [
      { title: "Dynamic Element Scanning: Product Cart Example", addedDate: "2026-07-29" }
    ],
    lastUpdated: "2026-07-29"
  }
];
