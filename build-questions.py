"""
Extracts every interview Q&A out of pages/*.html into data/questions.js so the
aggregated Interview Questions page can filter across all topics at once.

The topic pages remain the source of truth — questions are authored there, in
context. Re-run this script after adding or editing any Q&A:

    python build-questions.py

It rewrites data/questions.js in place.
"""

import glob
import json
import os
import re

ROOT = os.path.dirname(os.path.abspath(__file__))

# slug -> display label shown on the filter chips
TOPIC_LABELS = {
    "why-playwright-and-python": "Why Playwright",
    "course-roadmap": "Course Roadmap",
    "environment-setup": "Environment Setup",
    "python-basics": "Python Basics",
    "pytest-fixtures": "Pytest Fixtures",
    "playwright-browser-context-page": "Browser / Context / Page",
    "playwright-locators": "Locators",
    "playwright-auto-waiting": "Auto-Waiting",
    "playwright-dynamic-locators": "Dynamic Locators",
    "first-real-test": "First Real Test",
    "playwright-child-windows": "Child Windows &amp; Popups",
    "playwright-web-tables": "Web Tables",
    "playwright-alerts-dialogs": "Alerts &amp; Dialogs",
    "playwright-frames": "Frames &amp; iFrames",
    "framework-system-design": "Framework &amp; System Design",
    "playwright-api-testing": "API Testing &amp; Assertions",
    "playwright-network-interception": "Network Interception &amp; Storage",
    "sql-fundamentals": "SQL: Fundamentals",
    "sql-dml": "SQL: DML Deep Dive",
    "sql-joins": "SQL: Joins",
    "sql-aggregation": "SQL: Aggregation",
    "sql-subqueries": "SQL: Subqueries",
    "sql-window-functions": "SQL: Window Functions",
    "sql-views-procedures": "SQL: Views & Procedures",
    "sql-database-design": "SQL: Database Design",
    "sql-transactions": "SQL: Transactions",
    "sql-query-optimization": "SQL: Query Optimization",
    "sql-test-automation": "SQL: Test Automation",
    "sql-interview-problems": "SQL: Interview Problems",
    "python-memory-model": "Python: Memory Model",
    "python-data-types": "Python: Data Types",
    "python-strings": "Python: Strings",
    "python-lists-tuples": "Python: Lists &amp; Tuples",
    "python-dicts-sets": "Python: Dicts &amp; Sets",
    "python-control-flow": "Python: Control Flow",
    "python-functions": "Python: Functions",
    "python-decorators": "Python: Decorators",
    "python-generators": "Python: Generators",
}

QA_RE = re.compile(
    r'<details class="qa">\s*<summary>(.*?)</summary>\s*<div class="qa-body">(.*?)</div>\s*</details>',
    re.S,
)
LEVEL_RE = re.compile(r'<span class="q-level (\w+)">[^<]*</span>\s*')


def clean(fragment: str) -> str:
    """Collapse whitespace but keep inline markup (code/em/strong/links)."""
    return re.sub(r"\s+", " ", fragment).strip()


def main() -> None:
    questions = []

    for path in sorted(glob.glob(os.path.join(ROOT, "pages", "*.html"))):
        slug = os.path.splitext(os.path.basename(path))[0]
        if slug.startswith("_"):
            continue

        with open(path, encoding="utf-8") as fh:
            html = fh.read()

        for summary, body in QA_RE.findall(html):
            level_match = LEVEL_RE.search(summary)
            level = level_match.group(1) if level_match else "unrated"
            question = clean(LEVEL_RE.sub("", summary))

            questions.append(
                {
                    "q": question,
                    "a": clean(body),
                    "level": level,
                    "topic": slug,
                    "topicLabel": TOPIC_LABELS.get(slug, slug),
                    "file": f"pages/{slug}.html",
                }
            )

    out_path = os.path.join(ROOT, "data", "questions.js")
    with open(out_path, "w", encoding="utf-8") as fh:
        fh.write(
            "/**\n"
            " * GENERATED FILE — do not edit by hand.\n"
            " * Produced by build-questions.py from the Q&A blocks in pages/*.html.\n"
            " * Re-run `python build-questions.py` after changing any question.\n"
            " */\n"
            "window.ALL_QUESTIONS = "
        )
        json.dump(questions, fh, ensure_ascii=False, indent=1)
        fh.write(";\n")

    by_level = {}
    by_topic = {}
    for item in questions:
        by_level[item["level"]] = by_level.get(item["level"], 0) + 1
        by_topic[item["topicLabel"]] = by_topic.get(item["topicLabel"], 0) + 1

    print(f"wrote {out_path}")
    print(f"  total: {len(questions)}")
    print(f"  by level: {by_level}")
    print(f"  by topic: {by_topic}")


if __name__ == "__main__":
    main()
