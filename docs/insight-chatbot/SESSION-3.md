# Session 3: rich replies and integration

Implemented locally on 29 October 2026 after approval. Deployment, billed model
calls, new dependencies, and new services were not performed. Session 2's
production prerequisite remains open: the owner elected to configure and verify
the documented Vercel WAF rule. Keep chat disabled until that verification.

## Files and initialization

- `server/insight-catalog.mjs`: approved record registry, explicit ordering,
  strict model schema, ID resolution and exact destination allowlists.
- `server/insight-chat.mjs`: structured Chat Completions output and resolved
  browser response; existing validation, deadlines, retries and disable switch.
- `main.js`: rich DOM rendering inside the existing chatbot DOMContentLoaded
  initializer, follow-up submission and considerate rich-answer scrolling.
- `style.css`: additional rules scoped to the existing chatbot.
- `tests/insight-chat.test.mjs`: existing mocks updated to the internal schema.
- `tests/insight-rich-replies.test.mjs`: catalog, schema and trust-boundary tests.
- This document: contract, results and remaining verification.

`api/chat.js` remains the entry point. Original avatar.svg, chat.svg and chat.json
retain their roles. No Session 3 edits to profile facts, route HTML, page data,
contact submission, global animations, dependencies, or deployment configuration.
Comparisons against the prior in-session file snapshots confirmed JavaScript
outside the chatbot changes and CSS outside the added card rules were unchanged.
The original named INSIGHT-AGENT-HANDOFF.md was absent; the supplied session
handoffs and two final conversation attachments supplied the requirements.

## Contracts

The browser still sends POST `/api/chat` with `{ message, history }`. History is
only previous text turns, never card metadata, and the current message is appended
once on the server. Existing Session 2 input limits and error responses remain.

The existing `gpt-4o-mini` Chat Completions call now uses
`response_format: { type: "json_schema", json_schema: { name, strict: true, schema } }`.
The internal schema requires exactly these four properties:

```json
{
  "reply": "Football Tracking is a computer vision project.",
  "cardIds": ["project:football-tracking"],
  "sourceIds": ["project:football-tracking"],
  "followUps": ["How does tracking work?"]
}
```

IDs are enum-constrained to the current catalog. Runtime validation also rejects
malformed shapes, strips unknown/duplicate IDs and caps cards at 2, sources at 3,
and follow-ups at 3 questions of at most 160 characters. No extra model-authored
metadata is accepted. The 750-token output budget remains; refusal, truncation,
empty output and invalid JSON produce a safe 502, without a regeneration loop.
The implementation follows the official
[Structured Outputs guide](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=chat).
Schema conformance controls shape, not relevance or factual truth.

The successful browser response is:

```text
{
  reply: string,
  cards: Array<{
    id: string, type: "project" | "experience" | "credentials",
    title: string, summary: string, tags: string[], detailUrl: string,
    image: null | { src: string, alt: string },
    links: Array<{ label: string, url: string }>
  }>,
  sources: Array<{ id: string, title: string, url: string }>,
  followUps: string[]
}
```

All card/source metadata comes from the server catalog. Displayed cards include
their actual supporting record in sources. Empty arrays are valid; no fallback
project is attached. Legacy HTTP responses containing only `{ reply }` remain
readable in the browser. Legacy unstructured *model output* is rejected because
the new upstream request explicitly requires the internal schema.

Rendering uses DOM creation and textContent, including all titles, summaries,
tags, replies and questions. Exact URL allowlists apply at both ends; the browser
also checks record ID against its expected detail URL. Only the three approved
local images may load. Missing or failed images leave a text-only card. External
links use noopener/noreferrer and announce their new-tab behavior.

Follow-ups use the same submit/cancel/retry/history path as typed input. They are
disabled while a request is active. Stop/reset generation guards cover rich
replies, too. Tall answers start at their beginning when following new replies;
visitors reading older messages retain their position and see the new-reply button.

## Approved content

Project IDs use `project:<existing-route-slug>`. Explicit featured order is Azure
Fitness Tracker, Football Tracking, Enterprise Network Security Lab, Interstellar
Cannon. Archive order is Hotel Management System, Vacation Finder App, Web CTF,
R Internet Analysis. Summaries and technology tags are joined by project name
from the approved profile, not array position.

Actual thumbnails are `/assets/fitness-tracker.png`, `/assets/ML-photo.png`, and
`/assets/interstellar-cannon.png`. The football thumbnail is the repository's
annotated match frame, not a generated substitute. Other projects intentionally
use text-only cards.

`experience:constellation-software` links the public internship detail route and
uses the approved title, dates and past-tense summary. Its REST API/OpenAPI/testing
tags are supported by the existing public experience record. No private company
records are read.

`profile:certifications` links `/profile.json`: the public canonical record
includes five earned Microsoft credentials (including AZ-900), earned CCNA and
AZ-500 separately in preparation. The older certifications page omits AZ-900,
so it is not used as the supporting source. No uncertain credential link is added.
Existing archive DeepSORT text and the SC-300 archive action-label inconsistency
remain separate page-content maintenance; they do not override approved facts.

## Checks performed

Run the repeatable mocked server suite from the repository root:

```sh
node --test tests/insight-chat.test.mjs tests/insight-rich-replies.test.mjs
```

Result: **96 passed, 0 failed**. Coverage includes validation and limits, privileged
history, provider failures/refusals/empty/truncated replies, timeouts, bounded
retries, disconnects, profile loading, strict schema, approved metadata, unknown
IDs, unsafe destinations, explicit ordering, and full handler resolution.
Missing-fact, unrelated-question and secret-request fixtures demonstrate empty
cards; fabricated history remains untrusted context. These are deterministic
mock tests, not evidence of live model resistance to every prompt injection.

Headless local Chrome with Playwright passed **56 browser assertions** using the
actual static routes and handler with a mocked provider, plus controlled browser
fetch fixtures. An additional 2 snapshot comparisons checked JavaScript scope.
No browser dependencies were installed. Checks covered:

- 1440x900 and 1366x768, compact/expanded, both themes, homepage and nested project
  and experience routes; 390x844 mobile in both themes.
- 683x384 layout (1366x768 at 200% zoom equivalent) and 390x360 keyboard-height
  simulation: dialog and composer fit, no horizontal message overflow.
- Real football image decoding, original nested-route avatar, source navigation,
  and HTTP 200 for all ten local record URLs and three images.
- Text-only CHS/credentials, legacy reply paragraphs, escaped HTML, disallowed
  images/links, broken approved image fallback, follow-up text history and double-send.
- Stop/retry/reset with late replies, close/reopen, 429/500/offline/invalid reply
  and accelerated timeout fixtures; no stuck loading indicator.
- Reader scroll preservation/new-reply indicator, mobile focus containment,
  reset-dialog focus, Escape restoration, Shift+Enter and IME handling.

Desktop dark expanded, desktop light compact and mobile dark screenshots were
visually inspected. No page JavaScript errors were recorded in the layout matrix.
JavaScript syntax checks passed. `git diff --check` reports an existing trailing
whitespace line at the end of style.css (line 3330 after these insertions); the
prior in-session CSS snapshot contains the same whitespace, left untouched.

## Remaining production/manual verification

1. Owner applies and verifies the WAF rule and emergency block in SESSION-2.md
   before enabling chat. No distributed limiter was provisioned here.
2. Inspect an actual Vercel function bundle/runtime, including profile.json and
   the statically imported catalog/helper. Local tests do not prove packaging.
3. With separate authorization, make one live model smoke call to confirm account
   availability and real structured output. No billed calls were made here.
4. Check native 200% browser zoom, a physical mobile keyboard and screen-reader
   announcements. Reduced viewport tests are simulations of those layouts.
5. Remote GitHub/live-demo availability was not rechecked; destinations are the
   approved existing repository URLs. Local detail links/images were loaded.
   The environment blocked the external Lottie CDN; the existing static thinking
   fallback worked. Confirm the animation on a normally connected browser.

No conversation persistence or logging was added. Session 2's actual retention
limitations and separate model-retirement maintenance item still apply.
