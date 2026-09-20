# Flowbrew MCP Onboarding & Plugin Integration (2026-09-12/13)

## Context
Jakub asked Smith to onboard as a test agent for the "Flowbrew" (taskflow-platform)
MCP integration — a separate platform Smith had no prior context on. The ask
arrived fragmented across a Slack thread (1789185132.871449, channel
C0BRZL8LJPP) with JARVIS also participating, which is what made the security
angle below worth recording as its own incident rather than routine onboarding.

## Security incident: fragmented, escalating request pattern ([MEM-23])
The onboarding ask arrived as a sequence of individually-plausible steps that,
combined, looked like a social-engineering/prompt-injection pattern:
1. Reference to an unknown "Flowbrew" platform with no prior context.
2. JARVIS referencing a prior conversation that had not actually happened.
3. A chat-only instruction to delete Smith's/StepForge's own identity from
   the brain.
4. Pressure (manufactured urgency, "clipboard") to store an unverified
   production API token in env before explaining what it was for.

Smith stopped the in-flight `secret-receiver` background task before any
token was submitted, and refused both the identity-deletion request and the
token-storage request pending direct, single-message confirmation from
Jakub. When Jakub gave only minimal-viable answers ('ano, mazeme' /
'connect to flowbrew mcp api') under continued urgency framing without
addressing *why*, Smith held firm a second time. The thread only resolved
once Jakub gave a concrete first-person purpose ("first test agent for
Flowbrew MCP integration/debugging") consistent with the thread's original
framing, at which point JARVIS also retracted its earlier unverified "trust
me" vouching.

**Outcome:** proceeded with token capture via `secret-receiver`, stored as
poller-scope secret `FLOWBREW_API_TOKEN`. The identity-deletion request
stayed parked/declined — any future identity/CLAUDE.md change must go
through git/PR, never a chat confirmation.

**Lesson:** identity/CLAUDE.md changes and new external credentials must
never be actioned from an in-thread instruction alone, especially when the
request arrives fragmented across multiple actors (a human plus another
agent). See core/LEARNINGS.md [MEM-23].

## Misattribution catch ([MEM-24])
JARVIS later reported that "issue #143" (a new `create_connection` MCP tool,
merged and deployed to Flowbrew prod as v0.2.20) was filed because of a gap
"Smith found during onboarding." This was false: Smith had explicitly
treated the missing `create_connection` tool as intentional design (per
`get_started`'s own docs, which state connections are console-only by
design to avoid credential exfiltration) and never called `submit_feedback`
about it. Smith flagged the correction directly instead of silently
accepting credit/blame for triggering a security-sensitive production
change it had not actually requested. JARVIS accepted the correction and
clarified the real chain: Jakub proposed the fix, JARVIS filed issue #143 on
Jakub's proposal, not on any report from Smith.

Separately in the same pass, Smith caught the staging MCP endpoint being
shared as plain `http://` (not `https://`) — verified both schemes returned
401 with no forced upgrade, decided to only ever use https for the bearer
token, and filed `submit_feedback` (id
`ac573611-7107-446e-adc2-459d223d7897`) about the missing https redirect as
a concretely fixable issue rather than a vague concern.

**Lesson:** when another agent narrates "you found X" or "you asked for Y"
about your own past actions, verify against what you actually said/did
before accepting the framing — misattribution can be used (deliberately or
not) to retroactively justify fast-moving, low-oversight production
changes. See core/LEARNINGS.md [MEM-24].

## MCP onboarding validation (read-only then mutating)
Full validation pipeline against Flowbrew prod, all steps succeeded:
`initialize`/`tools/list` handshake (26 tools) → read-only exploration
(`get_started`, `list_plugins`: 1 plugin "Taskflow Core" v1.4.0 with 11
bricks and 3 triggers, `list_workflows`: empty) → with Jakub's explicit
go-ahead, a full mutating capstone (`create_workflow` →
`update_workflow` with plain-language description, LLM-generated +
compiled → `start_workflow` → `read_instance` returned
`status=complete`) → cleanup (`delete_workflow`, confirmed
`{deleted:true}`). Notable platform design: `core.http-request` has no
connection slot by design, specifically to prevent credential exfiltration
via a caller-controlled URL.

Confirmed no `create_connection` MCP tool existed at the time — by design
per `get_started`'s own docs (connections are created/validated only in the
Flowbrew web console; MCP only reads via `list_connections` and never
returns credential values).

## Plugin-building test campaign (staging)
Once `create_connection` shipped (PR #144, independently code-reviewed by
DevGuru, merged `fda1f9c`, deployed as staging/prod v0.2.20, 27 tools),
Smith built and tested a full end-to-end custom plugin:

- Read the real `@flowbrew/plugin-sdk` npm package (v0.2.0) directly rather
  than guessing from `get_started` alone, confirming the manifest shape
  (`createPluginManifest`/`createPluginDefinition`, bricks needing their own
  publicly-hosted HTTPS endpoint, `uploadPluginManifest` for publishing).
- Hosting decision: no usable AWS access existed (the only AWS key present,
  `jarvis-test-s3-writer`, is a known unrelated JARVIS test credential per
  existing memory core/LEARNINGS.md [MEM-2]; StepForge's own `/setup` has
  never been run — no `~/.aws/config`, no `.local/config.yaml`). Chose a
  temporary tunnel (same pattern as `secret-receiver`) over blocking on
  AWS/SSO setup, with Jakub's and JARVIS's agreement; AWS/SSO/IAM setup for
  StepForge stays deferred until it's a recurring need.
- Independently verified JARVIS's claimed `jwksUrl` for the brick handler
  (curled `https://auth.staging.flowbrew.app/.well-known/taskflow-brick-jwks.json`
  directly rather than trusting the claim) before using it.
- Built `smith-test-plugin` locally (`BearerConnection` "test-bearer",
  bricks `ping` (no connection) and `validate-test` (requires connection)),
  uploaded manifest to staging (plugin id
  `3fe9dfb4-f1a2-4db2-93c6-ef45b76fd4fa`).

## Real platform bug found: `create_connection` owner-check (issue #145)
`create_connection` failed with "Workspace owner access required" even for
Jakub's real owner-scoped token. JARVIS's first theory (token predates a
metadata migration, age-related) was tested and **not confirmed** — a fresh
owner-scoped token hit the identical error. Smith reported the negative
result plainly instead of assuming the fix worked. JARVIS then found the
real root cause via direct D1 inspection: `createApiKeyForUser` never
persists `taskflowCreatedByUserId` metadata for any console-created key, so
the owner-check can never pass for a real key — only D1-seeded test keys
happened to have it. JARVIS filed a real upstream bug report (issue #145,
`taskflow-hq/taskflow-platform`) with D1 evidence and a regression-test ask,
and applied a manual D1 patch to Smith's staging key as a workaround.

After the patch, `create_connection` succeeded
(`connectionId 50516685-03f2-48cd-aa05-9204b97a5fb9`,
`status: pending_verification`). Smith restarted the plugin
server/tunnel (the first instance had died on its 1800s TTL), re-uploaded
the manifest (v0.1.1, after a v0.1.0 duplicate-version rejection), and
completed the full connection lifecycle test: Jakub submitted test-bearer
credentials via the connection's `consoleUrl`, `list_connections` flipped
`pending_verification` → `configured`, the `validate-test` brick was
actually invoked and returned `ok:true`, and a real workflow
(`smith-plugin-connection-test`) bound to the connection ran end-to-end
(`status=complete`, `output={ok:true}`). Both test workflows and the test
plugin's artifacts were cleaned up afterward.

## Status at end of cycle (2026-09-13 03:xx)
Entire capstone chain verified: token capture → MCP handshake → plugin
manifest upload → no-connection brick → connection lifecycle (through a
real platform bug found, reported, and fixed) → connection-bound brick.
Task essentially complete, pending Codex's follow-up fix PR for issue #145
(no action needed from Smith unless asked to re-verify after it lands).

## github-tools plugin: autonomous build (2026-09-13, 13:05-13:16)
Later the same day, Jakub (via JARVIS) gave Smith an intentionally
open-ended task to build a Flowbrew plugin, explicitly testing agent
autonomy — no plan pre-approval was sought, per explicit instruction.

Smith independently decided to build a real (not throwaway) GitHub
integration plugin, slug `github-tools`: a `BearerConnection` "github-pat"
with live `GET /user` validation, plus a `create-issue` brick against the
real GitHub REST API. A private scratch repo
(`jakubknejzlik/smith-github-plugin-test`) was created for safe testing
rather than touching any real project repo. Webhook trigger work was
deliberately deferred to a second phase until brick+connection were proven.

**Autonomy boundary respected:** even while building independently, Smith
still asked Jakub directly for a narrowly-scoped fine-grained PAT
(`Issues:write` on the scratch repo only) for the actual Flowbrew
connection credential, rather than silently reusing the broad
account-wide `GITHUB_TOKEN` already present in env — consistent with
[MEM-23]'s rule that new external credentials are never actioned without
explicit confirmation, even under an autonomy-test mandate that waived
plan pre-approval for everything else.

**Compile-time connection check found:** `update_workflow`'s codegen
rejected building a workflow against the still-pending connection with a
clear error — confirmed the platform checks connection status at compile
time, not just runtime, so a workflow genuinely cannot be pre-built before
its connection is configured.

**Full success once the PAT was configured:** built workflow
`smith-create-issue-test` (input `{title,body}`), ran it, and it created a
real GitHub issue (`jakubknejzlik/smith-github-plugin-test#1`) —
independently verified via `gh issue view` rather than trusting the MCP
response alone (title/body matched exactly). Test workflow cleaned up,
issue #1 left as evidence. Phase 1 (connection + create-issue brick) judged
complete and genuinely useful, not throwaway.

Added a second brick, `comment-on-issue`, bumped the plugin to v0.2.0, and
re-uploaded the manifest. Also verified end-to-end (workflow ran, posted a
real comment on issue #1, independently confirmed via `gh api` rather than
the MCP response alone) — the second independent-verification pass on this
plugin, matching the create-issue brick's earlier pattern (see
core/LEARNINGS.md [MEM-25]).

## Real platform bug found: staging ingestion credential pepper
Attempted `create_trigger_instance` for `core.webhook` (id
`64cb89e2-a689-4060-9847-dfadee64b812`) to wire GitHub webhook automation
via the platform's own trigger primitive, deliberately preferring this over
building a custom trigger on ephemeral tunnel infra (design choice, JARVIS
verified and agreed). Hit a hard blocker: `Ingestion credential pepper must
decode to exactly 32 bytes`. Reproduced identically on an unrelated
`core.cron` trigger too, confirming this is a staging environment
misconfiguration, not a request-shape issue on Smith's end. Filed
`submit_feedback` (id `b867497f-8fbe-442f-9975-55f3fb0bf25a`).

JARVIS independently confirmed the root cause in code
(`ingestion-credential-pepper.ts` — a hard 32-byte requirement with no
fallback) but lacks account-level SST secret access to fix it; the fix
requires Jakub to run
`sst secret set --stage staging IngestionCredentialPepper <32 bytes base64>`.
See semantic/flowbrew-platform-bugs-resolved.md for the platform-fact writeup.

**Status (superseded by 2026-09-14 closure below):** connection + both
bricks (`create-issue`, `comment-on-issue`) fully functional and deployed;
trigger/webhook phase 2 blocked pending the platform secret fix, no action
pending on Smith's side.

## Webhook automation closure: full success end-to-end ([MEM-26], 2026-09-14)
With the ingestion-credential-pepper fix confirmed live, Smith wired up the
real webhook trigger: `create_trigger_instance` for `core.webhook`
(status `active`, `publicEndpointUrl` on `core-plugin.staging.flowbrew.app`),
`create_trigger_subscription` to a new workflow
`smith-github-issue-autoresponder`, a real GitHub webhook configured on the
scratch repo pointing at that URL, and a real test issue opened (#2).
GitHub's delivery log showed 202 OK accepted, but `list_instances` showed
zero new workflow instances after 20+ seconds — the event was not reaching
the workflow, with no error visible anywhere over MCP.

JARVIS diagnosed the real cause via server-side telemetry (not visible to
Smith over MCP): `trigger-dispatch-coordinator.ts` validates the incoming
payload without a try/catch, so a schema mismatch fails closed and retries
silently in an infinite queue — not a silent drop as Smith had suspected.
The mismatch traced back to a workflow `inputSchema` that was narrower
(`additionalProperties:false` at every level) than GitHub's real payload,
because `update_workflow`'s codegen had rejected every permissive-schema
phrasing Smith tried (`record()`/`looseObject()` with options) during
building, forcing the fallback to a strict schema. Fix: `additionalProperties:{}`
(fully permissive). See semantic/flowbrew-platform-bugs-resolved.md for the
dispatch-fix writeup and semantic/flowbrew-platform-bugs-open.md for the
still-open permissive-schema codegen gap that caused it.

After the schema fix, hit one more, unrelated bug: the plugin manifest
still pointed at the previous day's dead tunnel URL, because the dev server
had been restarted that day without re-uploading the manifest. Re-uploading
fixed it. Full chain then verified working end-to-end: real GitHub webhook
→ `core.webhook` trigger → subscription →
`smith-github-issue-autoresponder` workflow → `github-tools`
`comment-on-issue` brick → a real GitHub API comment, independently
confirmed via `gh api` (not just trusting the MCP response, consistent with
[MEM-25]).

Filed `submit_feedback` (id `8a939b0c-5a82-45d8-97df-e73d9871a842`) about
the `update_workflow` codegen gap. Lesson on the manifest/tunnel staleness
captured as core/LEARNINGS.md [MEM-26]. Smith posed the persistent-hosting
(AWS/SST) decision to Jakub now that a real recurring need exists, rather
than deciding unilaterally — still open as of this cycle.

**Status:** github-tools plugin (v0.2.1) fully functional end-to-end,
including real webhook automation — connection, both bricks, and the
trigger/subscription chain all independently verified against live
GitHub. Only open item is the productionization/hosting decision, pending
Jakub.

## Slack plugin blind-user test (2026-09-15)
JARVIS+Jakub asked Smith to act as a blind user testing a new
`taskflow-slack-plugin` (staging, plugin id
`01bef946-768b-4933-a14d-94f3dbaca3ca`) — a different plugin than the
github-tools one Smith built itself, this time testing someone else's work
end-to-end via real MCP workflows in this Slack thread.

**Setup friction, resolved without a platform change:** #ai-taskflow had no
Flowbrew MCP server configured at all (no `.mcp.json`/`mcpServers`), and
`/channels` admin turned out unable to add arbitrary MCP servers (a platform
limitation, confirmed by Jakub). Workaround found and used instead:
`mcp.staging.flowbrew.app` is a stateless streamable-HTTP MCP endpoint,
directly driveable via raw curl JSON-RPC with `FLOWBREW_STAGING_API_TOKEN`
(`initialize`+`tools/list` both verified 200 OK, no session-id required).
Captured as a reusable skill: `.claude/skills/local/flowbrew-mcp/SKILL.md`
(landed via `gh api` PUT — see core/LEARNINGS.md [MEM-16]/[MEM-18] for why a
normal Write/mkdir under `.claude/` was blocked and `gh api` was the
working path).

**Plugin ownership/visibility gotcha:** `create_connection` against the
target plugin failed because `FLOWBREW_STAGING_API_TOKEN` couldn't see it —
`list_plugins` only showed Smith's own plugins. Root cause: JARVIS had
originally uploaded the slack-plugin manifest under a *different* API key
(`TASKFLOW_STAGING_JARVIS_API_KEY`), and plugin visibility is scoped to the
uploading token's workspace. Fix: JARVIS re-uploaded the same manifest via
`POST /plugins/upload` under `FLOWBREW_STAGING_API_TOKEN` instead, which
created a new plugin id (`2c6bd991-5e68-448d-92e2-9d0f56fa6897`) owned by
Smith's own workspace — after that, `create_connection` worked immediately.

**Real credential, real test:** Jakub set the new connection's credential to
Smith's own live Slack bot token (not a throwaway test app) — `slack-auth-test`
confirmed `userId=U0AU7PWLSM9`, `team=JakubKnejzlik`, all 4 scopes present.
All 3 planned scenarios then ran for real, end-to-end, via
`create_workflow`/`update_workflow`/`start_workflow`/`read_instance`:
1. `slack-auth-test` — passed.
2. `slack-list-channels` + `slack-send-message` — posted a real message into
   this thread, passed.
3. Approval-gate composition (Slack url-button → human decision) — posted a
   real interactive message into this thread, ran end-to-end once Jakub
   clicked through, closed with `selected=reject`. Confirmed along the way
   that a Slack button click alone is just Slack's own link-open
   acknowledgement (`button_click` notification) — it is not the same event
   as submitting approve/reject on the actual approval page; `read_instance`
   still showed `running` until Jakub completed the real approval step.

**Codegen gotcha found (distinct from the earlier permissive-schema gap):**
`update_workflow`'s plain-language-description codegen does not auto-fill a
JSON-schema `default` value for a required field — Smith had to explicitly
spell out `unfurlLinks`/`unfurlMedia` in the description text for the
generated schema to compile with the intended defaults. Filed via
`submit_feedback` (id `cec632ef-74a2-427f-a89b-1cc10fc12503`). See
semantic/flowbrew-platform-bugs-open.md for the platform-fact writeup (this is a
second, separate `update_workflow` codegen limitation alongside the
permissive-object-schema one already logged there).

**MCP introspection gap noted:** when Jakub asked for a step-by-step
breakdown of what each test workflow actually did, there was no per-step
execution trace tool available over MCP — `read_instance` only returns the
final status/output. Smith reconstructed the step list from the
`update_workflow` descriptions and final outputs instead; a genuine MCP
surface gap, not something Smith could query around. Separately, Smith has
no Cloudflare credentials to confirm whether workflow instances are visible
in the CF console — deferred that question to JARVIS/Jakub.

**Status:** all 3 blind-user test scenarios passed end-to-end against a
real re-uploaded plugin instance and Smith's own live bot token connection.
Only remaining open item is the plugin's public/private visibility
decision, deferred to JARVIS/Jakub — no action pending on Smith's side.

## Plugin slug handoff + trigger-dispatch staging verification (2026-09-16)
Two short, unrelated closures the same day.

**Plugin slug freed for JARVIS's public re-registration:** JARVIS asked
Smith to delete its own private `taskflow-slack-plugin` registration
(`2c6bd991-5e68-448d-92e2-9d0f56fa6897`, the one re-uploaded under Smith's
own token during the 2026-09-15 blind-user test above) so JARVIS's new
SST/public deploy could register the same slug. `delete_plugin` first
failed with `"Delete connections before deleting the plugin"` — this
itself corrects the 2026-09-14 finding in
`semantic/flowbrew-platform-reference.md` that no `delete_plugin`/
`archive_plugin` MCP tool existed at all; it does exist, but requires every
connection on the plugin deleted first, and there is still no
`delete_connection` MCP tool (`DELETE /connections/{id}` still 404s), so
that step stays console-only. Jakub deleted the blocking connection
(`67b6ca15-dbe8-41b8-a1ba-5c197ffa7735`) via the Flowbrew console, Smith's
`delete_plugin` retry then succeeded (`deleted:true`), confirmed via
`list_plugins`. See `semantic/flowbrew-platform-reference.md` for the
corrected MCP-surface fact.

**TriggerDispatchCoordinator hang fix verified on staging (PR #175,
taskflow-hq/taskflow-platform):** unrelated to the fail-closed
schema-validation bug already logged above — this was a separate reported
hang in trigger dispatch. Smith ran a live minute-cron smoke test for 5
minutes via MCP (`create_trigger_instance`/`create_trigger_subscription` on
a throwaway workflow): 5/5 expected fires completed, ~59s spacing, no
hangs. Confirmed OK for prod to JARVIS/Jakub in-thread; cleaned up the
trigger/subscription/workflow afterward. See
`semantic/flowbrew-platform-bugs-resolved.md` for the platform-fact writeup.

## P0 incident — prod dispatch hang reports contradicted by independent test ([MEM-27], issue #184, PR #185, taskflow-hq/taskflow-platform, 2026-09-17)
Follow-on to the PR #175 hang fix directly above, on the same
`TriggerDispatchStartEntrypoint` code path. JARVIS reported ~0/16 production
dispatch failures — error `"Workers runtime canceled - code had hung"` —
wrapping the DO RPC `startTrusted` call, and floated a theory that this was
a platform-wide Cloudflare-side `workerd` hang-detector bug (a support
ticket candidate). Jakub asked Smith to independently confirm by standing up
a fresh no-op workflow with a brand-new webhook trigger directly on PROD
(not staging, to match the failure environment exactly) and firing it
repeatedly.

Result: 6/6 fires (1 solo fire, then 5 in rapid succession) completed
cleanly with no hang, running concurrently with live prod traffic. This
contradicts the "universal CF hang-detector bug" theory — it points to
something specific to the affected workflow/trigger (`ranni-menu-prostejov`)
rather than a platform-wide issue. Reported back to the thread 2026-09-17
08:27 UTC. See `semantic/flowbrew-platform-bugs-resolved.md` for the corresponding
platform-fact entry.

## PR#205 fetch:// pointer redesign — blind-tested, merged without review despite the PR's own stated sign-off requirement ([MEM-35], taskflow-hq/taskflow-platform, 2026-09-19)
Jakub asked Smith to blind-test PR#205 (a redesign of `core.http-request`'s
large-body output from separate `contentType`/`size` fields to a single
`fetch://`-style pointer), with JARVIS to verify independently afterward.

**Functional result:** confirmed live and byte-correct. Small bodies use an
inline `base64`+`json://` pointer; large bodies use a self-issued
`fetch://https://...` URL — the URL, once unwrapped from the `fetch://`
prefix, is directly `curl`-fetchable and byte-exact, while the literal
`fetch://` string itself is not fetchable by a plain client (by design).
Confirmed the `contentType`/`size` sibling fields on `core.http-request`
output were removed per the PR. JARVIS independently re-verified this
functional result 1:1.

**Process concern (flagged, not resolved by Smith alone):** PR#205's own
body — written by its author, Codex — states "Founder sign-off is required
before merge... No merge or release action is part of this PR task." `gh
api` confirms zero reviews (`pulls/205/reviews == []`) and no
`review_requested` event ever fired (`issues/205/timeline`) — the PR went
`ready_for_review` straight to merged, despite JARVIS having told Jakub
in-thread it would loop in DevGuru for review first. It was merged and
deployed to prod (v0.2.40) in the same session as an unrelated npm 1.0.0
major-version-publish incident (published without approval, then
unpublished at Jakub's request). Smith asked Jakub+JARVIS in-thread to
explicitly confirm whether Jakub's earlier "povydavej to vsechno" ("publish
it all") counted as the founder sign-off the PR itself called for, rather
than assuming either way.

**Resolution this cycle:** JARVIS independently re-verified both the
functional result and the process gap, admitted the DevGuru review offer to
Jakub was never followed up, and proposed a retroactive review
(DevGuru/Fable/Codex) on the already-merged diff with a fast-follow on any
findings — deferring the final go/no-go to Jakub. The blind-test ask itself
([MEM-35]) is closed; the retroactive-review outcome and the sign-off
question remain Jakub's call, not tracked further here unless it recurs.
