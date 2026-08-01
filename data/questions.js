/**
 * GENERATED FILE — do not edit by hand.
 * Produced by build-questions.py from the Q&A blocks in pages/*.html.
 * Re-run `python build-questions.py` after changing any question.
 */
window.ALL_QUESTIONS = [
 {
  "q": "Why learn Pytest before Playwright, specifically?",
  "a": "Playwright's Python test support is built directly on the Pytest framework — Pytest isn't a separate, optional tool alongside Playwright, it's the foundation the tests actually run on. Skipping it means not understanding fixtures, test discovery, and assertions that Playwright-Python code relies on.",
  "level": "junior",
  "topic": "course-roadmap",
  "topicLabel": "Course Roadmap",
  "file": "pages/course-roadmap.html"
 },
 {
  "q": "What does \"framework design\" cover beyond writing individual test scripts?",
  "a": "Data-driven testing, parameterization, running tests in parallel or in groups, logging, reporting, automatic screenshots, and the Page Object Model design pattern for maintainable test code.",
  "level": "mid",
  "topic": "course-roadmap",
  "topicLabel": "Course Roadmap",
  "file": "pages/course-roadmap.html"
 },
 {
  "q": "How does BDD fit into a Playwright + Pytest framework?",
  "a": "Through a separate Pytest plugin that lets you write Gherkin feature files, bringing Cucumber-style behavior-driven development on top of the existing Pytest/Playwright framework — it's layered on, not a replacement.",
  "level": "mid",
  "topic": "course-roadmap",
  "topicLabel": "Course Roadmap",
  "file": "pages/course-roadmap.html"
 },
 {
  "q": "Where does Jenkins fit in?",
  "a": "Once the framework and tests are built, Jenkins is used as the CI/CD tool to integrate the framework and schedule automated test job runs.",
  "level": "junior",
  "topic": "course-roadmap",
  "topicLabel": "Course Roadmap",
  "file": "pages/course-roadmap.html"
 },
 {
  "q": "What is pip, and how does it relate to concepts in other languages?",
  "a": "Pip is Python's built-in package installer/manager, bundled with every Python install. It's the equivalent of downloading jars in Java or installing node packages in JavaScript — Python just calls the downloaded external libraries \"packages.\"",
  "level": "junior",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "Why does Playwright for Python need a separate Pytest plugin?",
  "a": "Playwright's Python tests are written on top of the Pytest testing framework/engine. The <code>pytest-playwright</code> plugin is what makes Pytest actually recognize and execute Playwright-based test code — without it, Pytest has no built-in awareness of Playwright.",
  "level": "junior",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "What's the difference between `pip install pytest-playwright` and `playwright install`?",
  "a": "The pip command installs the Python package/plugin itself. <code>playwright install</code> is a separate step that downloads the actual browser engine binaries (Chromium, Firefox, WebKit) that your tests run against — installing the plugin doesn't get you the browsers.",
  "level": "junior",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "Why does keeping the IDE's interpreter in sync with the system Python matter?",
  "a": "Packages installed via pip are stored inside whatever Python installation pip is attached to. If PyCharm's project interpreter points at a different Python installation than the one you used in the terminal, packages you installed from the terminal won't appear in the project — you'd have to reinstall them again through the IDE, or vice versa. Pointing both at the same interpreter keeps everything in sync regardless of where you install from.",
  "level": "mid",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "On a Mac, why use `which python3` / `pip3` instead of `which python` / `pip`?",
  "a": "Mac machines ship with Python 2 pre-installed by default. Plain `python`/`pip` commands can resolve to that legacy Python 2 rather than the Python 3 you separately installed, so Mac users should explicitly use the `python3`/`pip3` variants to target the right version. Windows machines don't have this issue since they don't ship with a default Python.",
  "level": "junior",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "Why use a virtual environment instead of installing packages system-wide?",
  "a": "Isolation. Each project gets its own copy of Python plus its own independent set of installed packages, so Project A needing <code>pytest-playwright==0.5.2</code> and Project B needing a different version don't conflict. It also keeps a machine's system Python clean and makes a project's exact dependencies reproducible on another machine.",
  "level": "mid",
  "topic": "environment-setup",
  "topicLabel": "Environment Setup",
  "file": "pages/environment-setup.html"
 },
 {
  "q": "Walk me through how you'd structure a Playwright + Pytest project from scratch.",
  "a": "A <code>tests/</code> directory holding the test files plus a <code>conftest.py</code> for shared fixtures (browser/page setup, login, test data), a <code>pytest.ini</code> registering custom markers and default options, and <code>requirements.txt</code> pinning <code>pytest</code> and <code>pytest-playwright</code>. Fixtures go in conftest so they're shared by directory without imports; test data lives in fixtures rather than hardcoded in tests; and page interactions use semantic locators so tests survive UI churn.",
  "level": "mid",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "A fixture depends on another fixture. How does Pytest resolve that?",
  "a": "Automatically, by name. <code>logged_in_page</code> declares <code>login_page</code> as a parameter, which itself declares <code>page</code>. Pytest walks that dependency chain and builds them in order before the test body runs — you never instantiate them yourself. Each is also cached per its scope, so a session-scoped dependency isn't rebuilt for every consumer.",
  "level": "mid",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "Why put login in a fixture rather than a helper function you call at the top of each test?",
  "a": "Three reasons. Scope control — a fixture can be session/module scoped to avoid repeating expensive setup, a plain function can't. Automatic teardown — <code>yield</code> gives you guaranteed cleanup even if the test fails, whereas a helper's cleanup is skipped on exception unless you wrap everything in try/finally. And composability — other fixtures can depend on it, letting Pytest build a dependency graph rather than you sequencing calls by hand.",
  "level": "senior",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "How would you debug a Playwright test that fails only in CI?",
  "a": "Run with <code>--tracing on</code> so CI produces a trace artifact, then open it locally with <code>playwright show-trace</code> — it gives per-step DOM snapshots, network activity and console logs from the actual failing run. Locally, reproduce with <code>--headed --slowmo</code> or drop a <code>page.pause()</code> to step through with Inspector. Also check for the classic CI-only causes: different viewport size, missing <code>--headed</code> display assumptions, timezone/locale differences, and test-ordering dependencies exposed by parallel execution.",
  "level": "senior",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "How do you run only a subset of tests?",
  "a": "By file (<code>pytest tests/test_login.py</code>), by single function using the double-colon syntax (<code>pytest tests/test_login.py::test_name</code>), or by marker (<code>pytest -m smoke</code>) after tagging tests with <code>@pytest.mark.smoke</code> and registering that marker in <code>pytest.ini</code>.",
  "level": "junior",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "Your suite has 40 tests and each one logs in through the UI. It takes 25 minutes. How do you speed it up?",
  "a": "Stop logging in through the UI repeatedly. Authenticate once, save the session with <code>context.storage_state(path=\"state.json\")</code>, and have tests start from a context created with that stored state — turning a multi-second UI login into a near-instant state load. Beyond that: run tests in parallel with <code>pytest-xdist</code> (<code>-n auto</code>), keep the browser session-scoped rather than per-test, and reserve full UI login for the handful of tests actually testing login itself.",
  "level": "senior",
  "topic": "first-real-test",
  "topicLabel": "First Real Test",
  "file": "pages/first-real-test.html"
 },
 {
  "q": "Walk me through how you'd design a test automation strategy for a new product from scratch.",
  "a": "Start by clarifying constraints — team size, release cadence, surfaces to test, timeline. Then lay out the architecture in layers (test scripts, framework core, driver/SDK, data/config, execution/reporting) rather than naming tools first. Define a target test-pyramid ratio justified by the specifics given, design staged CI/CD gates (fast blocking pre-merge, broader blocking pre-deploy, non-blocking scheduled full regression), and close with rollout: how this gets built incrementally by a real team without freezing releases, plus concrete exit criteria.",
  "level": "senior",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "A team says \"our E2E suite is too flaky, let's just delete the flaky tests.\" How do you respond?",
  "a": "Deleting flaky tests removes coverage along with the flakiness, trading a known problem for an unknown risk. Better: quarantine flaky tests into a non-blocking pipeline stage with tracked tickets, diagnose root cause (bad waits, shared mutable test data, genuine race conditions, or environment instability), and fix or rewrite based on that diagnosis. Track flake rate as a visible metric so \"flaky\" becomes measurable rather than a vibe. Only delete a test after confirming the behavior it covers is tested elsewhere.",
  "level": "senior",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "Leadership wants to cut the E2E suite runtime from 3 hours to 20 minutes in one sprint. What do you do?",
  "a": "Push back on the timeline honestly while offering a real interim step. A structural fix (rebalancing the pyramid, moving logic to API-level tests) takes longer than one sprint to do safely. What's achievable fast: aggressive parallelization/sharding of the existing suite (if tests are independent), trimming the blocking path to a small critical-path smoke set while moving full regression to a non-blocking scheduled run, and quarantining known-flaky tests immediately. Frame it as \"here's what closes the gap this sprint, here's the two-quarter plan for the rest\" rather than either refusing or overpromising.",
  "level": "scenario",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "You're the new Lead SDET and the team resents the current framework but leadership sees testing as a cost center, not an investment. How do you get buy-in for a rebuild?",
  "a": "Lead with numbers leadership already cares about, not testing philosophy: current suite runtime, deploy frequency it's blocking, defect escape rate, engineer-hours lost to flaky-test investigation. Propose an incremental plan with measurable milestones rather than a \"give me two quarters and trust me\" rebuild — e.g. quarantine flaky tests this month (immediate stability win), rebalance pyramid on new features going forward (no big-bang risk), report flake-rate and runtime trend monthly. Buy-in follows visible, incremental proof, not an upfront pitch.",
  "level": "scenario",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "How do you decide what to automate vs what stays manual?",
  "a": "Risk-based, not coverage-percentage-based: automate what's repeated often, high business impact if broken, and stable enough that the automation won't itself become high-maintenance churn. Exploratory testing, one-off validations, and UI still actively being redesigned are usually poor automation candidates early. The test pyramid ratio is a starting heuristic, not the actual decision criterion — the criterion is expected ROI per test.",
  "level": "mid",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "What's the difference between Page Object Model and the Screenplay pattern, and when would you choose one over the other?",
  "a": "POM models the UI — one class per page/component, encapsulating locators and actions. It's simple and well understood, and fine for small-to-mid frameworks. Screenplay models the <em>user</em> — actors with abilities performing tasks, composed from smaller interactions — which scales better for large frameworks with many user roles/journeys and encourages more reusable, composable test code, at the cost of more upfront design complexity. For a 15-engineer team building fresh, POM is usually the pragmatic choice; Screenplay earns its complexity at larger scale or with many distinct user personas.",
  "level": "mid",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "How do you introduce contract testing (e.g. Pact) into an organization with 40 microservices and no existing practice?",
  "a": "Don't roll it out everywhere at once — pick one high-traffic, frequently-changing consumer/provider pair with a known history of integration breakage as the pilot. Prove the value there (fewer integration incidents, faster feedback than full E2E) before expanding. Organizationally, contract tests need to live with the consumer team and run in the provider's CI as a required check — that ownership model has to be agreed on explicitly, or contracts rot unmaintained. Position it as replacing some brittle cross-service E2E coverage, not as additional work on top of it.",
  "level": "senior",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "How would you measure whether a test automation investment is actually paying off?",
  "a": "Track trends, not snapshots: suite runtime over time, flake rate, defect escape rate (bugs found in production that automation should have caught), time-to-feedback on a PR, and engineer-hours spent investigating false failures. The strongest ROI story ties a specific metric's improvement to a specific change you made — \"flake rate dropped from 12% to 3% after quarantining and fixing the shared-test-data issue\" is far more persuasive than \"we now have 500 more tests.\"",
  "level": "senior",
  "topic": "framework-system-design",
  "topicLabel": "Framework &amp; System Design",
  "file": "pages/framework-system-design.html"
 },
 {
  "q": "Why can't you use a normal locator to click OK on a JavaScript alert?",
  "a": "Because the alert is rendered by the browser, not the page — it has no HTML representation at all. There's no element in the DOM to match, so any locator times out. This affects every DOM-based automation tool, not just Playwright. Dialogs are handled via an event handler instead: <code>page.on(\"dialog\", lambda dialog: dialog.accept())</code>.",
  "level": "junior",
  "topic": "playwright-alerts-dialogs",
  "topicLabel": "Alerts &amp; Dialogs",
  "file": "pages/playwright-alerts-dialogs.html"
 },
 {
  "q": "Why must the dialog handler be registered before the triggering action?",
  "a": "Because it's an event subscription, not a wait. When the dialog fires, Playwright looks for an already-registered handler; if none exists, the handler you register afterwards never sees that event. Registering first is the same principle as <code>expect_popup()</code> being a context manager — subscribe before the trigger so the event can't be missed.",
  "level": "mid",
  "topic": "playwright-alerts-dialogs",
  "topicLabel": "Alerts &amp; Dialogs",
  "file": "pages/playwright-alerts-dialogs.html"
 },
 {
  "q": "What is a lambda and why is one used here?",
  "a": "A lambda is a Python anonymous function — a function defined inline without a name. <code>page.on()</code> requires a function to invoke when the event fires, and since the handler body is a single call, a lambda avoids defining a separate named function. <code>lambda dialog: dialog.accept()</code> is equivalent to a <code>def handle(dialog): dialog.accept()</code> passed by name.",
  "level": "junior",
  "topic": "playwright-alerts-dialogs",
  "topicLabel": "Alerts &amp; Dialogs",
  "file": "pages/playwright-alerts-dialogs.html"
 },
 {
  "q": "How would you test the \"user clicks Cancel\" path?",
  "a": "Register a handler calling <code>dialog.dismiss()</code> instead of <code>accept()</code>, then assert on whatever the application does when the action is declined — the record still exists, no confirmation message appears, and so on. The dialog handling itself is one line; the meaningful assertions are about the app's resulting state.",
  "level": "mid",
  "topic": "playwright-alerts-dialogs",
  "topicLabel": "Alerts &amp; Dialogs",
  "file": "pages/playwright-alerts-dialogs.html"
 },
 {
  "q": "A colleague says dialogs can't be asserted on, only clicked through. Is that right?",
  "a": "Not entirely. The dialog object exposes <code>message</code> and <code>type</code>, so you can capture the text inside the handler and assert it afterwards — verifying that the confirmation wording is correct, not just that a dialog appeared. Worth also knowing that Playwright auto-dismisses dialogs when no handler is registered, so a forgotten handler silently takes the Cancel path instead of failing loudly, which can make a test pass for the wrong reason.",
  "level": "senior",
  "topic": "playwright-alerts-dialogs",
  "topicLabel": "Alerts &amp; Dialogs",
  "file": "pages/playwright-alerts-dialogs.html"
 },
 {
  "q": "What does Playwright's automatic actionability check actually check for?",
  "a": "Per this course: visible, stable (finished loading/animating), receives events (not obscured by another element), and enabled. Playwright verifies these before most actions, retrying automatically until they pass or a timeout is reached.",
  "level": "junior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "How is this different from Selenium's approach to synchronization?",
  "a": "Selenium has no built-in auto-wait for actionability — an immediate check on a not-yet-rendered or not-yet-stable element simply fails. The developer must write explicit or implicit wait code by hand to compensate. Playwright performs these checks and retries internally, with no synchronization code required from the test author.",
  "level": "mid",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "Does auto-waiting apply only to actions like click/fill, or also to assertions?",
  "a": "Both. Playwright's `expect()` assertions are \"web-first\" and auto-retrying — they recheck the condition repeatedly until it's true or the timeout is hit, rather than evaluating once immediately like a plain equality check would.",
  "level": "junior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "If an element becomes ready in 2 seconds but the timeout is much longer, does Playwright wait out the full timeout?",
  "a": "No — Playwright proceeds the instant all actionability checks succeed. It only consumes the full timeout when the checks keep failing all the way until the deadline.",
  "level": "mid",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "What genuinely differentiates Playwright's auto-waiting from Selenium, in one sentence for an interview?",
  "a": "Playwright treats waiting for actionability as a built-in, automatic, retrying part of every action and assertion, while Selenium treats it as something the test author must explicitly code — that shift is what removes synchronization code from Playwright test scripts entirely.",
  "level": "mid",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "What are Playwright's actual default timeouts — for actions and for assertions?",
  "a": "30 seconds for actions (click, fill, etc.), configurable via <code>page.set_default_timeout()</code> or a per-call <code>timeout=</code> argument. 5 seconds for web-first assertions (<code>expect()</code>), configured separately. They're two independent values — knowing this precisely (rather than \"a few seconds\") signals you've actually used the tool, not just watched a tutorial.",
  "level": "mid",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "What's the difference between <code>to_have_text()</code> and <code>to_contain_text()</code>?",
  "a": "<code>to_have_text()</code> requires the element's full text to match exactly; <code>to_contain_text()</code> is a substring match that passes if the text appears anywhere within. On a narrow locator targeting one label, exact matching is usually right. On a broad locator like <code>body</code> — checking whether text appears anywhere on a page — <code>to_contain_text()</code> is the only sensible option.",
  "level": "junior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "How would you test that clicking \"Hide\" actually hides an element?",
  "a": "Assert visible, click, assert hidden: <code>expect(locator).to_be_visible()</code> → <code>click()</code> → <code>expect(locator).to_be_hidden()</code>. No waits needed between them — both assertions auto-retry, so the DOM changing in between is handled. <code>to_be_hidden()</code> passes whether the element is hidden via CSS or removed from the DOM entirely.",
  "level": "junior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "A colleague fixes a flaky test by adding <code>time.sleep(5)</code> before the assertion. Why is that wrong, and what do you do instead?",
  "a": "It's wrong on both ends. It's <em>too slow</em> when the element appears in 200ms — you've now permanently added 5s to every run of that test. And it's <em>still flaky</em> when a slow CI machine takes 6s. It trades a fast intermittent failure for a slow intermittent failure. The right fix is a web-first assertion (<code>expect(locator).to_be_visible()</code>), which polls and continues the instant the condition holds, and only consumes the full timeout on genuine failure. If a specific step genuinely needs longer, raise that call's <code>timeout=</code> rather than blocking the thread.",
  "level": "scenario",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "A test passes locally but fails in CI with a timeout on a click. What's your diagnostic sequence?",
  "a": "Auto-waiting means the element failed at least one actionability check for the entire timeout window — so ask which one. Grab a trace (<code>--tracing on</code>) and inspect the DOM snapshot at failure: is the element absent entirely (data/seed differences, slower backend), present but off-screen (smaller CI viewport — a real difference from a local maximized window), present but covered (a cookie banner or overlay that only appears in a fresh CI profile), or present but <code>disabled</code> (an async precondition that hadn't resolved yet)? Each points at a different fix; blanket-raising the timeout usually just makes the failure slower.",
  "level": "scenario",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "Given auto-waiting, is there ever a legitimate reason to wait explicitly?",
  "a": "Yes, for conditions actionability checks don't cover. Actionability is about a specific element's state — it says nothing about, say, a network request having settled, an animation having finished before a visual snapshot, or a background job completing. For those, Playwright provides purpose-built waits (<code>wait_for_load_state</code>, <code>wait_for_response</code>, <code>expect_download</code>, <code>locator.wait_for(state=...)</code>). The rule isn't \"never wait\" — it's \"never sleep a fixed duration.\" Wait on a condition, not on the clock.",
  "level": "senior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "Playwright checks that an element \"receives events.\" What real bug class does that catch?",
  "a": "Elements that are visually present and enabled but covered by something else at the click point — a modal overlay, a sticky header, a cookie banner, a toast notification. Playwright hit-tests the target point and confirms the click would actually reach that element rather than the thing on top of it. Without that check (Selenium's default position), the click silently lands on the overlay: the test reports a successful click, no exception is raised, and it fails confusingly several steps later. It converts a misleading downstream failure into a precise one at the real point of breakage.",
  "level": "senior",
  "topic": "playwright-auto-waiting",
  "topicLabel": "Auto-Waiting",
  "file": "pages/playwright-auto-waiting.html"
 },
 {
  "q": "What's the difference between the `playwright` fixture and the `page` fixture in pytest-playwright?",
  "a": "<code>playwright</code> is the low-level global fixture you use to manually launch a specific browser engine, open a context, and open a page — full control over engine choice, headless/headed mode, and number of contexts. <code>page</code> is a higher-level convenience fixture that does all three steps internally, but with fixed assumptions: Chromium engine, headless by default, single context.",
  "level": "junior",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "Why open a new browser context instead of just using one for everything?",
  "a": "A context is isolated like an incognito window — its own cookies, cache, and session data. If you need to simulate multiple independent users logging in within the same test (or want a guaranteed-fresh session), you open separate contexts rather than risk one login's cookies leaking into a supposedly-fresh flow.",
  "level": "mid",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "When would you NOT use the page fixture shortcut?",
  "a": "When you need a non-Chromium engine (Firefox/WebKit), when you need headed mode without relying on an external CLI flag, when a test needs multiple browser contexts at once (e.g. a multi-user or OTP-across-sessions flow), or when mixing UI and API testing in one script that requires switching contexts.",
  "level": "mid",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "How do you run a test in headed mode if you're using the page fixture shortcut?",
  "a": "Pass <code>--headed</code> as an additional argument in the run configuration or CLI command (e.g. <code>pytest --headed</code>), since the fixture's internal launch call isn't directly editable the way it is in the manual 3-step approach.",
  "level": "junior",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "Why does testing against Playwright's Chromium engine effectively cover both Chrome and Edge?",
  "a": "Both Google Chrome and Microsoft Edge are built on the Chromium engine under the hood, so automating against Playwright's Chromium build simulates real-world behavior for both browsers.",
  "level": "junior",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "Explain browser vs context vs page as a hierarchy, including the cost of each.",
  "a": "A <strong>browser</strong> is an actual launched browser process — expensive (hundreds of ms to seconds), so you launch it once and reuse it. A <strong>context</strong> is an isolated session inside that process with its own cookies, storage and cache — cheap to create, which is what makes per-test isolation practical. A <strong>page</strong> is a tab inside a context; one context can hold several pages that share the same session state. The standard framework shape follows directly: session-scoped browser, function-scoped context, page per test.",
  "level": "mid",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "You need to test a chat feature where User A sends a message and User B must receive it — in one test. How do you set that up?",
  "a": "Two contexts from a single browser, not two browsers. Launch the browser once, then <code>ctx_a = browser.new_context()</code> and <code>ctx_b = browser.new_context()</code>, open a page in each, and log in as a different user per context. Because contexts are isolated, the two sessions won't share cookies or clobber each other's auth — while still being cheap since you only paid the browser-launch cost once. The <code>page</code> fixture can't do this, as it's locked to a single context.",
  "level": "scenario",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "Every test in a suite logs in through the UI, adding ~4 seconds each. How would you eliminate that?",
  "a": "Authenticate once, then reuse the resulting session state. Log in in a session-scoped setup step and call <code>context.storage_state(path=\"state.json\")</code> to persist cookies and local storage; each test then creates its context with <code>browser.new_context(storage_state=\"state.json\")</code> and starts already authenticated — milliseconds instead of a full UI flow. Tests stay isolated because each still gets its own context. Keep a small number of tests that do exercise real UI login, since that path still needs coverage.",
  "level": "senior",
  "topic": "playwright-browser-context-page",
  "topicLabel": "Browser / Context / Page",
  "file": "pages/playwright-browser-context-page.html"
 },
 {
  "q": "Why doesn't your existing page object automatically work on a new tab/window that a click opens?",
  "a": "A page object is scoped to the specific page it was created on — by default, the page your browser context started on. Playwright doesn't automatically expand that scope when a click happens to open a new window; you have to explicitly listen for the new page and capture a separate page object for it.",
  "level": "junior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "Walk through what page.expect_popup() actually does, step by step.",
  "a": "It's a context manager that arms an event listener before the action that might open a popup runs. The action (e.g. a click) executes inside the `with` block; if it results in a new page/window opening, the listener captures that new page's info. After the block exits, `.value` on the captured object returns the actual new Page instance, which you then use for all further interaction with that window.",
  "level": "mid",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "What's the difference between text_content() and a visibility assertion like to_be_visible()?",
  "a": "to_be_visible() checks a boolean condition — is the element rendered and visible — and is what you use for assertions. text_content() actually retrieves and returns the element's text content as a string, for when you need to read, print, log, or further process that text in code rather than just confirm it exists.",
  "level": "junior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "You use the correct child_page for the new window, but a teammate's code uses the original page and their test times out with \"element not found.\" How do you explain what's happening?",
  "a": "The original page object never gained any knowledge that a new window opened — it's still scoped to the base page. When their code searches for an element that only exists in the popup, Playwright's auto-waiting kicks in exactly as designed: it retries, checking visibility repeatedly, and since the element genuinely doesn't exist on that page, it eventually times out and fails. It's not a bug or a special popup-related error — it's the standard actionability-timeout behavior failing for a completely mundane reason: wrong page object.",
  "level": "scenario",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "If two different links could each open a different popup, how would you distinguish which new page you got?",
  "a": "expect_popup() alone just captures whatever popup opened as a result of the wrapped action — fine when only one link is in play. For distinguishing between multiple possible popups, pass a <code>predicate</code> (e.g. <code>lambda p: \"documents\" in p.url</code>) so the listener only accepts a matching window, inspect properties of the resulting page after capturing it, or use <code>context.pages</code> to enumerate every currently-open page and filter for the one you expect.",
  "level": "mid",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "Why is expect_popup() a context manager rather than a method you call after the click?",
  "a": "Race-condition avoidance. If you clicked first and then called a wait method, the popup event could fire in the gap between those two statements — the listener would never see it, and the test would hang until timeout, intermittently, depending on machine speed. The <code>with</code> block subscribes the listener <em>before</em> the triggering action executes, so the event cannot be missed regardless of timing. Every Playwright <code>expect_*</code> method (expect_download, expect_request, expect_navigation) uses this pattern for the same reason.",
  "level": "senior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "What does expect_popup() actually return, and when is .value available?",
  "a": "It returns an event context manager, not a Page. <code>.value</code> is only meaningful after the <code>with</code> block exits — at that point it blocks until the popup has been captured and returns the new <code>Page</code> object. It also accepts <code>timeout</code> (ms before raising TimeoutError, defaulting to the context timeout) and <code>predicate</code> (a filter so only a matching popup is accepted).",
  "level": "mid",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "What's the difference between plain <code>assert</code> and Playwright's <code>expect()</code>?",
  "a": "Plain <code>assert</code> is a standard Pytest assertion on a value you already hold — it evaluates once, immediately, with no retry. <code>expect()</code> is Playwright's web-first assertion that operates on a <em>locator</em> and auto-retries until the condition holds or it times out. Rule of thumb: once you've extracted a value out of the page into a Python variable it's frozen, so plain <code>assert</code> is right; while the thing you're checking is still live on the page, use <code>expect()</code> so auto-waiting applies.",
  "level": "junior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "A test extracting text with <code>split(\" \")[0]</code> returns an empty string. What's the most likely cause?",
  "a": "A leading space in the string being split. <code>split(\" \")</code> breaks at the very first space it finds — if that's at position 0, index <code>[0]</code> is everything to its left, which is nothing. The fix is <code>.strip()</code> before splitting, to remove leading/trailing whitespace. This class of bug is hard to spot because whitespace is invisible in printed output; <code>repr()</code> in a debugger reveals it immediately.",
  "level": "mid",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "What does Python's <code>split()</code> return, and what happens to the delimiter?",
  "a": "A list of substrings, with the delimiter itself consumed and removed. <code>\"a-b-c\".split(\"-\")</code> returns <code>['a','b','c']</code> — note it splits on <em>every</em> occurrence, not just the first, so the list length depends on how many times the delimiter appears. <code>strip()</code> is separate: it removes whitespace from both ends of a single string and returns a string, not a list.",
  "level": "junior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "Extracting data via string splitting is brittle. When would you push back on this approach?",
  "a": "Index-based string splitting couples the test to exact sentence wording — a copy change like \"email us at\" becoming \"contact us at\" silently breaks it, and the failure message (\"expected X, got '' \") won't point at the real cause. It's acceptable when the surrounding text is genuinely static and you control it. Better alternatives when available: a more precise locator that targets just the email element (e.g. a dedicated <code>&lt;a href=\"mailto:\"&gt;</code> or a test id), or a regex match on a pattern rather than positional splitting. If the data matters enough to assert on, it usually deserves its own addressable element.",
  "level": "senior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "You capture a popup and immediately query an element on it, but get intermittent failures. What's a likely cause beyond using the wrong page object?",
  "a": "The popup <code>Page</code> is returned as soon as the window is created, which can be before its content has finished loading. Auto-waiting covers element actionability, but if the page is still navigating, the DOM you're querying may not be the final one. Calling <code>child_page.wait_for_load_state()</code> (optionally with <code>\"networkidle\"</code>) before querying makes the readiness explicit rather than relying on timing.",
  "level": "senior",
  "topic": "playwright-child-windows",
  "topicLabel": "Child Windows &amp; Popups",
  "file": "pages/playwright-child-windows.html"
 },
 {
  "q": "Why scan-and-filter instead of clicking an element at a fixed index?",
  "a": "Resilience. If the page's display order changes — items re-sorted, a new item inserted — an index-based script targets the wrong element or breaks entirely. A filter-by-content script finds the correct element regardless of its position on the page.",
  "level": "junior",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "What's the difference between `page.locator(...).get_by_role(...)` and `product_locator.get_by_role(...)`?",
  "a": "Scope. The first searches the entire page for that role, which can return many matches. The second searches only within the previously-located element (`product_locator`), so it can resolve uniquely without further filtering — because the search space was already narrowed.",
  "level": "mid",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "How do you assert on the number of elements a locator matched?",
  "a": "<code>expect(locator).to_have_count(n)</code> — a web-first assertion, so it auto-retries like other Playwright assertions rather than checking the count exactly once immediately.",
  "level": "junior",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "What's the difference between get_by_role's `name=` filter and a separate `.filter(has_text=...)` call?",
  "a": "<code>name=</code> is bundled directly into <code>get_by_role</code> and specifically matches the element's accessible name. <code>.filter()</code> is a separate, more general-purpose chained method usable on any locator (not just role-based ones), and can match on text content via <code>has_text</code> (there's also <code>has_text</code>/<code>has_not_text</code>/<code>has</code> variants for different filter conditions).",
  "level": "mid",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "Are Playwright locators evaluated when you create them?",
  "a": "No — locators are lazy. Creating one just describes <em>how</em> to find an element; the DOM query runs at the moment you act or assert on it, and re-runs on each auto-wait retry. That's why a locator stored in a variable still works after the page updates, and why locators don't go stale the way a Selenium <code>WebElement</code> reference does.",
  "level": "mid",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "You must click \"Delete\" on the row for user \"jsmith\" in a table where rows load in unpredictable order. How do you write it?",
  "a": "Filter to the row by its content, then scope the button search inside that row: <code>page.get_by_role(\"row\").filter(has_text=\"jsmith\").get_by_role(\"button\", name=\"Delete\").click()</code>. The row is identified by the data that makes it unique, not its index, and the Delete button is found <em>within</em> that row — so it can't accidentally hit another row's Delete even though every row has one. This is the canonical shape of this whole pattern.",
  "level": "scenario",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "When is using <code>.nth()</code> or <code>.first</code> actually the correct choice rather than a smell?",
  "a": "When position itself is the thing under test, not an incidental detail. Examples: asserting that a \"sort by newest\" control genuinely puts the newest item first, verifying a top-ranked search result, or checking pagination boundaries. The distinction is intent — <code>.first</code> is legitimate when your assertion is <em>about</em> ordering, and a smell when you're just using position as a lazy proxy for identity. A useful tell: if reordering the data should keep the test passing, filtering by content is right; if reordering <em>should</em> fail the test, position is right.",
  "level": "senior",
  "topic": "playwright-dynamic-locators",
  "topicLabel": "Dynamic Locators",
  "file": "pages/playwright-dynamic-locators.html"
 },
 {
  "q": "What is an iframe and why can't a normal locator find elements inside one?",
  "a": "An iframe embeds a completely separate HTML document inside the current page — its own html, body and DOM tree. <code>page.locator()</code> only queries the parent document, so anything inside the frame is outside its search scope. You cross the boundary with <code>page.frame_locator(selector)</code>, then chain locators off that.",
  "level": "junior",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "What's the difference between <code>page.locator(\"#frame\")</code> and <code>page.frame_locator(\"#frame\")</code>?",
  "a": "<code>locator()</code> matches the <code>&lt;iframe&gt;</code> element itself as an object sitting in the parent document — useful for checking the frame exists or its dimensions, but it gives no access to the content inside. <code>frame_locator()</code> means \"enter this frame\": subsequent locators chained off it query the embedded document instead of the parent.",
  "level": "mid",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "After working inside a frame, how do you get back to the main page?",
  "a": "You don't \"switch back\" — there's no modal state to reset. The <code>page</code> object always refers to the parent document and the frame object always refers to the frame; both remain valid simultaneously. Calling <code>page.locator(...)</code> queries the parent, calling <code>page_frame.locator(...)</code> queries the frame. (This differs from Selenium, where <code>switch_to.frame()</code> changes driver state and requires an explicit <code>switch_to.default_content()</code> to return.)",
  "level": "mid",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "How do you assert that some text appears anywhere on a page?",
  "a": "Target the <code>body</code> element — which wraps the whole document — and use a substring assertion: <code>expect(page.locator(\"body\")).to_contain_text(\"happy subscribers\")</code>. Use <code>to_contain_text()</code> rather than <code>to_have_text()</code>, since the latter requires the element's entire text to match exactly.",
  "level": "junior",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "An element is clearly visible on screen, but your locator times out saying it doesn't exist. What do you check?",
  "a": "Visible-but-unreachable almost always means wrong document. Check whether the element sits inside an <code>&lt;iframe&gt;</code> (needs <code>frame_locator()</code>), inside a popup window opened by an earlier click (needs the child page object from <code>expect_popup()</code>), or whether it's a native browser dialog (not in any DOM — needs <code>page.on(\"dialog\")</code>). Inspecting the element and looking for an iframe ancestor in the DOM tree settles it quickly. If none of those apply, then consider timing or an incorrect selector.",
  "level": "scenario",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "How do you handle an element inside a frame that's nested within another frame?",
  "a": "Chain <code>frame_locator()</code> calls, one per level: <code>page.frame_locator(\"#outer\").frame_locator(\"#inner\").locator(\"button\")</code>. Each call descends one document deeper. Worth noting frames can load asynchronously and independently of the parent — <code>frame_locator()</code> participates in auto-waiting, so it handles a frame that hasn't loaded yet, but a frame whose <code>src</code> is slow can still surface as a timeout on the inner locator rather than an obvious frame-level error.",
  "level": "senior",
  "topic": "playwright-frames",
  "topicLabel": "Frames &amp; iFrames",
  "file": "pages/playwright-frames.html"
 },
 {
  "q": "What two DOM conditions must hold for get_by_label to successfully find an element?",
  "a": "Either the input element is nested inside the <code>&lt;label&gt;</code> tag itself, or the label's <code>for</code> attribute exactly matches the input's <code>id</code> attribute. If neither holds, get_by_label won't find it — even if a label is visually present on the page.",
  "level": "junior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "How do you disambiguate multiple elements that share the same role, like several buttons on a page?",
  "a": "Pass the <code>name=</code> parameter to <code>get_by_role</code>, e.g. <code>get_by_role(\"button\", name=\"Sign In\")</code> — Playwright gets all elements with that role first, then filters to the one whose visible/accessible name matches.",
  "level": "junior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "When would you fall back to a CSS locator instead of get_by_role or get_by_label?",
  "a": "When the element is a custom component with no semantic ARIA role attached — e.g. a plain <code>&lt;div&gt;</code>-based product card — or a form field with no associated label. CSS built from id/class attributes works regardless of role or label semantics.",
  "level": "mid",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "What's the difference between what select_option chooses and what's visually shown in a dropdown?",
  "a": "select_option targets the underlying HTML <code>option value</code> attribute, which is not necessarily identical to the text visually displayed to the user in the dropdown UI.",
  "level": "junior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "A search box has no label and no text content. How do you locate it?",
  "a": "<code>get_by_placeholder(\"...\")</code> matches on the greyed-out hint text inside the field. It's the right choice when no label exists, and also a clean workaround when a label exists but its <code>for</code>/<code>id</code> linkage is broken. Note a placeholder isn't the element's text content, so <code>get_by_text()</code> won't find it.",
  "level": "junior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "How do you click an item in a menu that only appears on mouse hover?",
  "a": "Two steps: <code>.hover()</code> on the trigger element to open the menu, then a normal locator + <code>.click()</code> on the item inside it. Auto-waiting won't infer that a hover is needed — it checks whether an element is visible and actionable, and a hover-only menu item genuinely isn't visible until the hover happens, so the hover must be its own explicit step.",
  "level": "mid",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "Name the full get_by_* family.",
  "a": "<code>get_by_role</code>, <code>get_by_label</code>, <code>get_by_text</code>, <code>get_by_placeholder</code>, <code>get_by_alt_text</code>, <code>get_by_title</code>, and <code>get_by_test_id</code>. Plus the generic <code>locator()</code> which takes a raw CSS or XPath selector.",
  "level": "junior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "Rank the locator strategies by preference and justify the order.",
  "a": "Roughly: <code>get_by_role</code> first, because it matches how a real user and assistive technology perceive the page — so it breaks only when actual user-facing behaviour changes. Then <code>get_by_label</code>/<code>get_by_placeholder</code> for form fields, still user-visible. Then <code>get_by_test_id</code> where the team maintains dedicated hooks — completely stable but invisible to users, so it tests nothing about accessibility. CSS/XPath last, because it couples tests to internal DOM structure and styling, which change for reasons that have nothing to do with behaviour.",
  "level": "mid",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "A form field has a visible \"Email\" label on screen, but <code>get_by_label(\"Email\")</code> finds nothing. Walk through your diagnosis.",
  "a": "The label is rendering, so the problem is the association, not the text. Inspect the DOM and check the two valid linkages: (1) is the input nested inside the <code>&lt;label&gt;</code>? (2) does the label's <code>for</code> value exactly match the input's <code>id</code>? The classic failure is a near-miss like <code>for=\"email\"</code> against <code>id=\"userEmail\"</code> — visually fine, functionally unlinked. Fixes: correct the HTML if you own it (which also fixes real accessibility for screen-reader users), or work around it with <code>get_by_placeholder</code>, <code>get_by_role(\"textbox\")</code>, or a CSS selector on the id.",
  "level": "scenario",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "Your <code>get_by_role(\"button\")</code> call suddenly fails after a UI update that added a second button. What happened and how do you fix it?",
  "a": "Playwright runs in strict mode by default — a locator resolving to multiple elements raises a strict-mode violation rather than silently acting on the first one. That's deliberate: it surfaces ambiguity instead of letting a test quietly click the wrong thing. Fix by narrowing: add <code>name=</code> (<code>get_by_role(\"button\", name=\"Sign In\")</code>), scope the search to a container first, or use <code>.filter()</code>. Reaching for <code>.first</code> \"makes it pass\" but reintroduces exactly the positional fragility you were avoiding.",
  "level": "scenario",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "A team's suite is full of CSS selectors like <code>div.container &gt; div:nth-child(3) &gt; button</code> and breaks constantly. What do you change and how do you argue for it?",
  "a": "Those selectors encode DOM structure, so any layout refactor breaks them even though behaviour is unchanged — high maintenance cost, zero behavioural signal. Migrate to role/label-based locators so tests bind to what users actually perceive, and introduce <code>data-testid</code> for genuinely ambiguous elements. The business argument is maintenance cost and trust: a suite that fails for non-bugs gets ignored, and an ignored suite provides no safety net. Practical rollout is incremental — convert as you touch tests, not a big-bang rewrite — and adding roles/labels often improves real accessibility as a side effect.",
  "level": "senior",
  "topic": "playwright-locators",
  "topicLabel": "Locators",
  "file": "pages/playwright-locators.html"
 },
 {
  "q": "How would you verify a specific cell's value in a table where both the row and column positions are dynamic?",
  "a": "Resolve both coordinates at runtime. For the column: get all <code>th</code> elements, use <code>count()</code> as a loop bound, and check each with <code>.nth(i).filter(has_text=\"Price\").count() &gt; 0</code>, recording the index and breaking on match. For the row: <code>page.locator(\"tr\").filter(has_text=\"Rice\")</code> — content-based, so position doesn't matter. Then intersect: <code>rice_row.locator(\"td\").nth(price_column)</code>, scoping the cell search to that row. Finally assert with <code>expect(...).to_have_text()</code>.",
  "level": "mid",
  "topic": "playwright-web-tables",
  "topicLabel": "Web Tables",
  "file": "pages/playwright-web-tables.html"
 },
 {
  "q": "What's the difference between <code>.count()</code> and <code>expect(locator).to_have_count(n)</code>?",
  "a": "<code>.count()</code> returns a number you can use in code — as a loop bound, in an if-condition, anywhere. <code>to_have_count(n)</code> is a web-first assertion: it doesn't return anything usable, it auto-retries until the count matches or fails the test. Use <code>count()</code> for logic, <code>to_have_count()</code> for verification.",
  "level": "junior",
  "topic": "playwright-web-tables",
  "topicLabel": "Web Tables",
  "file": "pages/playwright-web-tables.html"
 },
 {
  "q": "Earlier you said hardcoding <code>.nth()</code> is fragile. Why is it acceptable here?",
  "a": "Because the index isn't hardcoded — it's computed at runtime by scanning the headers. <code>nth(price_column)</code> where <code>price_column</code> was discovered by searching for the text \"Price\" is fundamentally different from <code>nth(1)</code> written by hand. The fragility of <code>.nth()</code> comes from assuming a fixed position, not from the method itself.",
  "level": "mid",
  "topic": "playwright-web-tables",
  "topicLabel": "Web Tables",
  "file": "pages/playwright-web-tables.html"
 },
 {
  "q": "Your table test passes locally but fails in a different environment where the table has an extra \"Stock\" column inserted before Price. Does this solution survive?",
  "a": "Yes — that's precisely what it's built for. The column loop rescans headers at runtime, so Price simply resolves to index 2 instead of 1, and everything downstream adjusts. A hardcoded <code>nth(1)</code> would silently read the Stock value and either fail with a confusing mismatch or, worse, pass against the wrong data.",
  "level": "scenario",
  "topic": "playwright-web-tables",
  "topicLabel": "Web Tables",
  "file": "pages/playwright-web-tables.html"
 },
 {
  "q": "Is looping through headers in Python the best approach, or is there a more idiomatic Playwright way?",
  "a": "The loop is explicit and easy to reason about, which is why it's good for demonstrating the logic. More idiomatic options: <code>page.locator(\"th\").all_text_contents()</code> returns every header's text as a Python list in one round-trip, so <code>.index(\"Price\")</code> replaces the whole loop — fewer calls to the browser and simpler code. If the markup is semantic, <code>get_by_role(\"row\")</code>/<code>get_by_role(\"cell\")</code> is more robust than tag selectors. Worth noting the loop makes one browser round-trip per header, which matters on large tables.",
  "level": "senior",
  "topic": "playwright-web-tables",
  "topicLabel": "Web Tables",
  "file": "pages/playwright-web-tables.html"
 },
 {
  "q": "Does a Pytest fixture run automatically, like JUnit's @BeforeTest or TestNG's before-hooks?",
  "a": "No — this is a common trip-up for people coming from Java. A Pytest fixture only executes when a test function explicitly names it as an argument. Defining <code>@pytest.fixture</code> alone does nothing on its own; without the linkage, the fixture body never runs.",
  "level": "mid",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "Explain the four fixture scopes and how they differ.",
  "a": "<code>function</code> (default) runs before every test that references it. <code>class</code> runs once per test class. <code>module</code> runs once per test file, no matter how many tests in that file use it. <code>session</code> runs exactly once across the entire test run, shared across all files — but this is only observable when running the full suite, since running one file in isolation looks identical to module scope.",
  "level": "junior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "What is conftest.py and why does it need that exact filename?",
  "a": "It's a specially-recognized file Pytest automatically checks for fixture definitions not found in a test's own file. The filename is fixed — Pytest looks for it by that exact name in the same directory as the tests. It's used to centralize fixtures shared across multiple test files instead of duplicating them.",
  "level": "junior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "How do you implement both setup and teardown in a single fixture?",
  "a": "Use the <code>yield</code> keyword. Code before <code>yield</code> runs as setup; Pytest then pauses the fixture, runs the test, and once the test completes, resumes the fixture from the line after <code>yield</code> as teardown — all inside one function, no separate before/after methods needed.",
  "level": "mid",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "How do you run a single test function from the command line, and how do you run only a tagged subset?",
  "a": "Target a single function with the double-colon syntax: <code>pytest test_file.py::test_function_name</code>. For a tagged subset, mark tests with <code>@pytest.mark.&lt;tagname&gt;</code> (e.g. <code>@pytest.mark.smoke</code>) and run <code>pytest -m smoke</code> — tests without that mark are skipped as \"deselected.\" This is Pytest's equivalent of Cucumber tags or TestNG groups.",
  "level": "junior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "Can a fixture provide test data, not just perform setup actions?",
  "a": "Yes. A fixture can return a value (or yield one), and that value becomes accessible to the test through the fixture argument — commonly used to centrally supply data like credentials or tokens rather than hardcoding them per test.",
  "level": "junior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "What is <code>autouse=True</code> and when is it appropriate?",
  "a": "It makes a fixture run for every test in its scope without any test naming it as an argument — the one exception to the normal linkage rule. Appropriate for genuinely universal concerns like global logging setup or a session-wide browser launch. Overusing it hurts readability, because a test's dependencies become invisible from its signature: someone reading the test can no longer tell what ran before it.",
  "level": "mid",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "Can one fixture depend on another? How does Pytest resolve the chain?",
  "a": "Yes — a fixture declares another fixture as a parameter exactly like a test does. Pytest builds the full dependency graph and instantiates them in order, caching each according to its scope. So a session-scoped fixture consumed by three function-scoped fixtures is still created only once.",
  "level": "mid",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "A fixture has <code>scope=\"session\"</code>, but you observe it running before every single test. What are the likely causes?",
  "a": "Two common ones. First: it's being requested by a <em>narrower-scoped</em> fixture in a way that forces re-creation, or you're misreading output that's actually showing a different function-scoped fixture. Second and more likely: you're running one file at a time, where session and module scope are behaviourally indistinguishable — the difference only appears across a multi-file run. Verify by running the full suite with <code>-s</code> and counting the setup prints. Also confirm the argument is spelled <code>scope=\"session\"</code> exactly; a typo silently falls back to the default function scope.",
  "level": "scenario",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "Teardown code after <code>yield</code> — does it still run if the test fails? What if the setup itself raises?",
  "a": "If the test fails, teardown after <code>yield</code> still runs — that's the main advantage over cleanup written inline at the end of a test, which gets skipped on exception. If the fixture's own setup raises <em>before</em> reaching <code>yield</code>, the teardown half never executes, because execution never got there — so anything already allocated at that point can leak. For setup that acquires several resources, either split into separate fixtures (each with its own teardown) or guard with try/finally inside the fixture.",
  "level": "senior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "When is session-scoped browser reuse the wrong choice?",
  "a": "When tests can contaminate each other through shared browser state — cookies, localStorage, service workers, or an authenticated session leaking from one test into the next and creating order-dependent passes. The usual resolution isn't abandoning the session-scoped <em>browser</em> (which is expensive to launch), but giving each test its own <em>context</em> from that shared browser: cheap to create and fully isolated. Session-scoped browser + function-scoped context is the standard trade-off.",
  "level": "senior",
  "topic": "pytest-fixtures",
  "topicLabel": "Pytest Fixtures",
  "file": "pages/pytest-fixtures.html"
 },
 {
  "q": "Does Python require you to declare a variable's data type?",
  "a": "No. Python is dynamically typed — you write <code>a = 3</code> with no type annotation, and the interpreter determines the data type from the assigned value at runtime. Data types still exist internally; they're just never declared explicitly at the point of creation, unlike Java's <code>int a = 3;</code>.",
  "level": "junior",
  "topic": "python-basics",
  "topicLabel": "Python Basics",
  "file": "pages/python-basics.html"
 },
 {
  "q": "How do you declare multiple variables on a single line, and why would you?",
  "a": "<code>b, c, d = 5, 6.4, \"great\"</code> assigns each value to the corresponding variable in order, avoiding three separate declaration lines for related values.",
  "level": "junior",
  "topic": "python-basics",
  "topicLabel": "Python Basics",
  "file": "pages/python-basics.html"
 },
 {
  "q": "What character starts a comment in Python?",
  "a": "The hash character <code>#</code>. Everything after it on that line is ignored by the interpreter.",
  "level": "junior",
  "topic": "python-basics",
  "topicLabel": "Python Basics",
  "file": "pages/python-basics.html"
 },
 {
  "q": "Playwright supports multiple browsers and OSes — isn't that the same as Selenium? What's actually unique about it then?",
  "a": "Cross-browser and cross-OS support are shared with Selenium, not exclusive to Playwright. What's genuinely different: (1) built-in automatic waiting, so you don't hand-write synchronization/explicit-wait code; (2) the ability to do web <em>and</em> API automation in the same tool/script, enabling combined front-end + back-end end-to-end tests; (3) inbuilt logging/tracing and automatic before/after screenshots with no extra reporting setup.",
  "level": "mid",
  "topic": "why-playwright-and-python",
  "topicLabel": "Why Playwright",
  "file": "pages/why-playwright-and-python.html"
 },
 {
  "q": "How is Playwright different from Cypress specifically?",
  "a": "Cypress is JavaScript-only by design. Playwright supports JavaScript, Python, C#, and Java, so teams aren't forced into one language ecosystem.",
  "level": "junior",
  "topic": "why-playwright-and-python",
  "topicLabel": "Why Playwright",
  "file": "pages/why-playwright-and-python.html"
 },
 {
  "q": "Why would a QA team pick Python over JavaScript or Java for Playwright automation?",
  "a": "Python currently has the largest market share of Playwright's supported languages, with comparatively less competition for jobs than Java. Its syntax is simple enough that beginners ramp up quickly. There's also a strategic angle: since most AI/ML models are built on Python, dev orgs are gravitating toward Python-first stacks — and QA teams that want a unified tech stack with development follow that same direction.",
  "level": "mid",
  "topic": "why-playwright-and-python",
  "topicLabel": "Why Playwright",
  "file": "pages/why-playwright-and-python.html"
 },
 {
  "q": "What does Playwright's \"automatic waiting mechanism\" actually mean?",
  "a": "When you interact with an element (click, select, etc.) and the app needs to load a new page or component, Playwright automatically waits until that element is present/loaded before acting — you don't write explicit wait/synchronization code yourself. It's inbuilt behavior, not an add-on. See <a href=\"playwright-auto-waiting.html\">Playwright Auto-Waiting &amp; Assertions</a> for the full actionability-check breakdown.",
  "level": "junior",
  "topic": "why-playwright-and-python",
  "topicLabel": "Why Playwright",
  "file": "pages/why-playwright-and-python.html"
 }
];
