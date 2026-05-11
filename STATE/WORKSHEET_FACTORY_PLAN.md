# WORKSHEET_FACTORY_PLAN — parabula-next

Status: planning document only. No worksheet files are changed by this file.

## Purpose

Define the future worksheet creation pipeline so new A4 worksheets can be created consistently, safely, beautifully, and without breaking metadata, mobile, preview, print, or existing pages.

## Core problem

The repository already protects A4 worksheets, but it still needs a real worksheet factory: a repeatable process for creating new pages with correct HTML, CSS, metadata, validation, preview, mobile behavior, and print behavior.

## Factory principles

1. A worksheet is not complete when an HTML file exists.
2. A worksheet is complete only when content, CSS, metadata, preview, mobile, print, and validation all pass.
3. New worksheets must not duplicate existing content.
4. New worksheets must not break existing pages.
5. New worksheets must be assigned to exactly the correct topic.
6. New worksheets must use scoped CSS.
7. New worksheets must remain true A4.

## Required output for every new worksheet

For a new page `N`, the factory must produce or update:

- `עמוד-N.html`
- `styles/pages/עמוד-N.css`
- `meta/topics.json`
- optional topic-specific assets only when needed
- validation report
- preview/mobile/print check notes

## Required worksheet template fields

Every new worksheet should have a machine-readable planning record before creation:

```text
topic
page_number
worksheet_type
title
learning_goal
difficulty
required_mathjax
required_svg
requires_print_precision
requires_mobile_special_handling
source_or_prompt
validation_status
```

## Supported worksheet types

Initial planned types:

- algebra practice
- equations
- quadratic equations
- geometry
- coordinate geometry
- graph reading
- table completion
- multiple choice
- open response
- investigation / discovery
- test-style worksheet
- mixed review

## HTML contract

Generated HTML must:

- use `lang="he" dir="rtl"`;
- include `styles/a4-base.css`;
- include `styles/pages/עמוד-N.css`;
- include `main.a4-page.page-N`;
- avoid inline styles;
- avoid `<style>` blocks;
- avoid duplicate page wrappers;
- include accessible labels where useful;
- keep MathJax syntax consistent.

## CSS contract

Generated CSS must:

- be scoped under `.page-N`;
- avoid global `body`, `html`, `.a4-page`, `.page-title`, `.header-container` overrides;
- avoid `overflow: auto` as an A4 height fix;
- use design-system tokens/components when available;
- preserve print behavior;
- remain readable on mobile through the reader layer.

## Metadata contract

The factory must update `meta/topics.json` only after:

- page file exists;
- CSS file exists;
- topic is confirmed;
- no duplicate page assignment exists;
- `count` and `totalPages` remain consistent.

## Validation gates

A generated worksheet must pass:

- A4 page contract;
- CSS scope check;
- metadata consistency check;
- topic separation check;
- MathJax syntax check when relevant;
- preview load check;
- mobile reader check;
- print/PDF check.

## Human review gates

Before publishing a worksheet as final:

- content is mathematically correct;
- Hebrew RTL is natural;
- typography is readable;
- print page is not crowded;
- mobile preview is comfortable;
- no placeholder/demo text remains.

## Future commands

Planned commands:

```text
npm run page:create
npm run page:check -- עמוד-N
npm run page:preview -- עמוד-N
npm run page:mobile-check -- עמוד-N
npm run page:print-check -- עמוד-N
```

## Non-goals for first implementation

- Do not move existing root worksheets.
- Do not rewrite all existing pages at once.
- Do not create fake validation results.
- Do not generate new worksheets without metadata.

## Success condition

A teacher can request a new worksheet and the system can create a real A4 page with correct HTML, CSS, metadata, preview, mobile, and print behavior while preserving existing worksheets.
