# Insight Session 2 — backend handoff

Prepared 29 October 2026. Code and mocked tests are local; nothing was deployed.
The owner will apply the Vercel firewall rules below. **Production rate limiting
is pending and is not implemented by the code in this repository.** No in-memory
counter, fake limiter, or browser client ID is used as a substitute.

## Files and compatibility

- `api/chat.js`: existing route, server-only SDK construction and cached profile loader.
- `server/insight-chat.mjs`: body limits, validation, public-profile selection, prompt,
  timeout/retry logic, safe error mapping, and operator disable switch.
- `tests/insight-chat.test.mjs`: Node tests with mocks and a loopback HTTP test.
- `profile.json`: approved factual consolidation and corrections.
- `vercel.json`: `profile.json` explicitly included for `api/chat.js`; 30-second maximum duration.

Success remains HTTP 200 with `{ "reply": "plain text" }`. Requests remain
`{ "message": "current question", "history": [{ "role": "user", "content": "previous question" }] }`.
The current question is appended once after the accepted previous messages.
No frontend, contact endpoint, framework, dependency, API family, or model change
was made in this session. Session 1's existing dirty changes were preserved.

## Enforced limits

| Control | Value / behavior |
| --- | --- |
| Method | POST only; other methods return 405 and `Allow: POST` |
| Media type | `application/json`; compressed request bodies rejected |
| Raw body | 131,072 bytes (128 KiB), counted from stream, including whitespace |
| Body arrival deadline | 3 seconds after handler entry |
| Current question | Nonempty string, at most 2,000 JavaScript UTF-16 code units before trimming |
| Previous messages | Validate all entries; retain the latest 12 at most |
| Accepted history text | At most 16,000 UTF-16 code units, keeping a contiguous suffix of whole messages |
| History roles | Only `user` and `assistant`; content must be a nonempty string |
| Extra history fields | Discarded; rebuild each retained entry as `{ role, content }` |
| Oversized history entry | If an entry cannot fit the remaining 16,000-character budget, drop it and all older entries |
| Public profile file | At most 128 KiB; invalid/missing profile fails closed |
| Model | Existing `gpt-4o-mini` through Chat Completions |
| Output | `max_completion_tokens: 750`; only nonempty text with `finish_reason: stop` accepted |
| Whole handler deadline | 20 seconds after handler entry, including profile loading, model work and retry delay |
| Per-attempt SDK timeout | At most 10 seconds, further bounded by the remaining overall deadline |
| SDK automatic retries | Disabled (`maxRetries: 0`) |
| Application retries | At most one, only for explicit 429 (excluding exhausted quota) or 503 responses |
| Retry delay | 250 ms default; honor numeric/date `Retry-After` only when its wait is 0–1,000 ms; otherwise do not retry |

Timeout, uncertain network failure, authentication/configuration failure, refusal,
empty/malformed/truncated output are not automatically regenerated. At most two
model attempts can occur per accepted HTTP request. Abort is attempted on deadline
or client disconnect; late completions cannot produce a second response. Aborting
a connection does not guarantee that upstream generation or billing stops.

History truncation may begin with an assistant turn and may omit an older question;
it is context only, never factual evidence. The browser can forge prior assistant
messages. System instructions explicitly establish that approved public records
override all such history. These instructions reduce risk but cannot guarantee
factual accuracy or immunity from prompt injection.

The Session 1 textarea allows longer input than this new server limit; messages
over 2,000 characters receive HTTP 400. Its existing error/retry UI remains usable,
but does not display every server error detail. No UI change was authorized here.

Vercel may buffer a request before this handler runs. Its platform-level 4.5 MB
limit still applies; the smaller application limit prevents oversized input from
reaching parsing/model work in this handler, not from reaching Vercel's edge.
The reader uses Vercel's restored raw stream rather than its lazy `req.body` parser.
See [Vercel payload limits](https://vercel.com/docs/functions/limitations) and
[Node helper implementation](https://github.com/vercel/vercel/blob/main/packages/node/src/serverless-functions/helpers.ts).

## Error responses

Errors contain only a fixed safe `error` message and a stable `code`, never SDK
objects, raw prompts, credentials, file paths, provider responses, or stack traces.
All responses use `Cache-Control: no-store`.

| HTTP status | Meaning |
| --- | --- |
| 400 | Invalid JSON, encoding, body shape, current message, history, or interrupted request |
| 405 | Unsupported HTTP method |
| 408 | Body arrival timeout |
| 413 | Raw body over the application limit |
| 415 | Unsupported media type or compressed body |
| 429 | Provider throttling after bounded retry; safe `Retry-After` supplied |
| 502 | Provider error or refused, empty, malformed, filtered, or truncated response |
| 503 | Chat disabled, missing key/profile, invalid profile, provider auth/quota failure, unavailable model, or unexpected internal failure |
| 504 | Provider/overall timeout |

When the response connection is already destroyed, no JSON is written. A local
499 cancellation code is reserved for a close event while a response remains writable.
Vercel WAF responses occur before the handler and may have different bodies;
the existing frontend checks HTTP status before parsing JSON.

## Server-side configuration and emergency shutdown

`OPENAI_API_KEY` remains a server-side environment variable. No value is included
in this handoff or tests. Do not add it to browser code, public configuration,
screenshots, commits, or logs.

**New requirement:** `INSIGHT_CHAT_ENABLED=true` is required to serve model replies.
Missing, false, or any other value returns 503 without constructing the client.
This is deliberately disabled by default until the operator has verified rate
limiting. The flag is a manual switch, not a limiter or proof of WAF configuration.

For an emergency shutdown, activate the Vercel WAF block rule below. Then set
`INSIGHT_CHAT_ENABLED=false` for subsequent deployments. Vercel environment
changes generally require a new deployment to reach the deployed function; the
environment flag is not claimed to be an instantaneous fleet-wide remote switch.
The handler reads the flag on each request in its own environment. Already-running
requests are not retroactively stopped by a firewall rule or an environment change.
Provider budget alerts are not relied upon as a hard spending cap.

## Owner action: Vercel WAF production rate limiting

No authenticated Vercel tooling/browser session was available during this work.
The owner elected to configure the rule. Do not mark this item complete until
the deployed firewall behavior has been verified.

1. Open the existing portfolio project in Vercel → Firewall → Configure → New Rule.
2. Name it `Insight chat rate limit`.
3. Match **request method POST** and **request path `/api/chat`**. Also cover any
   accepted equivalent path such as `/api/chat/`; check existing rewrites/domain
   routes so an alternate path cannot reach the function unprotected. Do not
   include contact submission or other endpoints.
4. Choose **Rate Limit**, **Fixed Window**, **10 requests per 60 seconds**, counting
   by Vercel-observed **IP address**. Do not count by a browser-supplied `clientId`,
   cookie, or arbitrary forwarded-IP header. Ensure the enforcement action blocks
   excess traffic instead of merely logging it. Review the project's actual plan,
   available rule slots, and pricing dialog before enabling any billed feature.
5. Ensure the rule applies to every publicly reachable project domain/deployment
   that can invoke this function. Review bypass rules. A protected custom domain
   must not leave the `vercel.app` domain or previews as an alternate paid API path.
6. Prepare a separate rule, `Insight emergency stop`, matching the same endpoint,
   with **Block** as its action. Normally keep it disabled; enabling it is the
   operator's project-wide cutoff for new requests. Keep its priority ahead of
   any rule that would otherwise bypass it. Verify propagation through the dashboard.
7. With the newly deployed backend still disabled (`INSIGHT_CHAT_ENABLED` absent
   or false), send a small controlled burst of valid JSON requests from the same
   source. The permitted requests should return the application's 503 and excess
   traffic should be denied by WAF. Confirm Firewall events show the rule matched.
   Changing a JSON `clientId` must not reset the WAF counter. This verifies protection
   without making model calls. Repeat against reachable aliases and verify the
   emergency rule blocks new requests. Clear/disable the emergency rule afterward.
8. Only after successful verification, set `INSIGHT_CHAT_ENABLED=true` for an
   explicitly approved deployment. No deployment is authorized or performed here.

Vercel's counters are regional, not a globally atomic quota. Multiple IPs or
regions can exceed a single-IP regional threshold; shared-IP visitors can also
share a quota. This is production edge rate limiting, **not a guaranteed global
currency/usage budget**. A strict automated global quota would require a separately
approved shared atomic store/service. None has been provisioned.
See [Vercel WAF configuration, limits and pricing](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting).

## Facts, packaging, and privacy

Factual duplication was removed from the server prompt and redundant profile
notes. Preferred name has a dedicated field. Name, school, language levels,
employment dates/titles, mentorship and unofficial-collaboration distinctions are
preserved. CHS wording is past tense. All five Microsoft credentials, including
AZ-900, remain earned. CCNA is also earned; AZ-500 is separately in preparation.
Football Tracking now says ByteTrack, matching the approved detail page.
Other page data files remain read-only: the project archive still contains its
older DeepSORT text, and some credential summaries omit CCNA/AZ-500. This session
does not reconcile those page components; chatbot facts come only from the profile.

Only approved public profile fields are selected into model context; unexpected
top-level and nested fields are excluded. No private company files or work records
are read. Adding sensitive content inside an existing public field would still
require owner review; an allowlist cannot classify prose automatically.

`vercel.json` explicitly includes `profile.json` in `api/chat.js` packaging.
The helper is a static import and is traceable. The loader uses the function's
working-directory profile path and caches the validated result (or load failure)
once per process/cold start. It is not a deployment-wide singleton. A new deployment
is needed for changed profile contents. Configuration and an isolated filesystem
test passed; **a real Vercel build artifact and deployed runtime were not inspected**.
See [Vercel function file packaging](https://vercel.com/kb/guide/how-can-i-use-files-in-serverless-functions).

The handler writes no conversation, prompt, SDK error, or IP logs, and uses no
conversation database. SDK logging is explicitly off. Request text exists in
memory during processing; only the public profile and SDK client are cached.
The unchanged browser holds conversation history in memory for its page session.
`store: false` is sent to OpenAI, but it is not a zero-retention guarantee. OpenAI
documents default abuse-monitoring retention up to 30 days, with exceptions and
separately approved controls. Organization-specific controls were not inspected.
Vercel access/firewall logs and any account log drains have their own retention;
those settings were not inspected. Do not promise complete privacy or zero retention.
See [OpenAI data controls](https://developers.openai.com/api/docs/guides/your-data).

## Validation and separate maintenance

Run `node --test tests/insight-chat.test.mjs` from the repository root. Tests use
fake SDK replies, a mocked SDK fetch transport, and loopback HTTP only. No billed
model calls are made. They cover validation before client creation, history role
injection, body/message/history limits, deadlines, bounded retries, refusal and
truncation, missing configuration/profile, disconnect, late responses, approved
facts, public-field filtering, and the unchanged frontend JSON contract.

Actual checks: 82 tests passed; JavaScript syntax checks and `git diff --check`
were run. Live WAF enforcement, deployed packaging, account-specific model access,
and organization-specific retention remain unverified. Session 2 is not fully
production-accepted until the infrastructure verification above is complete.

The model remains `gpt-4o-mini`. Official documentation marks its listed snapshot
deprecated and schedules `gpt-4o-mini-2024-07-18` shutdown for **14 January 2027**.
Plan model maintenance separately before that date; no silent replacement or API
migration was made. See [OpenAI deprecations](https://developers.openai.com/api/docs/deprecations)
and the [GPT-4o mini model page](https://developers.openai.com/api/docs/models/gpt-4o-mini).
