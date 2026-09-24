# Flowbrew: email-to-slack approval-gate build + v0.2.55 fix validation (2026-09-23)

## Context
Follow-on to `flowbrew-email-to-slack-campaign-2026-09-22.md` — that
campaign's prod work stayed blocked on Jakub's Slack connection
verification. This session ran entirely on staging: relay-fix validation,
a new test workflow, an approval-gate design detour, and a live platform-fix
confirmation. See `memory/daily/2026-09-23.md` for the full timestamped log.

## Staging relay confirmed live (12:56–13:04)
Jakub+JARVIS shipped PR#228/v0.2.53: prod `email()` now forwards raw MIME
for `*@triggers.staging.flowbrew.app` via an authenticated HTTPS relay
instead of local processing, with DNS MX/SPF live on staging. Set up a fresh
staging trigger `52571d6e` + echo workflow `smith-email-relay-test`
(`8f689647`) + subscription `f08bd632`. Confirmed [MEM-36] fixed:
`create_trigger_instance` now returns `metadata.inboundAddress` directly, no
GET-endpoint workaround needed. Jakub sent a real email to the trigger
address; it arrived and fired instance `22f98612` within ~10s, echoing
from/title/body correctly. Closes the [MEM-38] staging-email-broken saga —
both the MCP metadata gap and the underlying MX/relay issue are fixed and
verified live, not just deployed. (Promoted to
`semantic/flowbrew-platform-bugs-resolved.md`.)

## New test workflow: smith-email-to-slack-test (19:45)
Built `smith-email-to-slack-test` (`5b97dddc`), email trigger `e9d532d1`
(`trigger+6dUy0cxRR0m712uKUrvjoQ.BKUBYdZaIDP7CVyTI9Wo4g@triggers.staging.flowbrew.app`),
subscription `46e3aa19`, reusing the existing configured Slack connection
`94458b6c`. Forwards email from/title/body verbatim to `#C0BRZL8LJPP`.
Smoke-tested via `start_workflow` + `read_channel`: message landed correctly
formatted. Requested by Jakub in DM.

## Prod push declined — workspace-identity check re-run (19:46)
Jakub asked to push the workflow to prod ("prosim do produkce"). Re-verified
`FLOWBREW_API_TOKEN` still resolves to the stale workspace `e4673c3e` (0
connections), not the confirmed real prod `fY95o8FW5bmPreaFK4FOH5RUKDiYsPnB`
— the 2026-09-22 secret-fix request evidently didn't land (see
`semantic/flowbrew-platform-reference.md`). Held off building in prod, asked
Jakub to fix the secret or confirm the target workspace first. Jakub OK'd
staying on staging for now (20:43) — prod secret fix not urgent.

## Approval-gate detour: DM idea proposed, blocked, dropped (20:43–20:52)
Jakub asked (ambiguously) that the agent "always ask in our DM before
sending this message to the slack channel." Clarified as option (b): add a
real Flowbrew approval-gate to the workflow that DMs Jakub before forwarding
to `#C0BRZL8LJPP`. Built a throwaway lookup workflow
`smith-slack-dm-lookup` (`547e5e7d`) to resolve his DM channel ID —
`slack-list-users` found user `U01TALN63DK`, but `slack-list-channels
types=[im]` failed with `slack:missing_scope` (`conversations.list`);
connection `94458b6c` lacks `im:read`. Also surfaced a platform gap: no
`conversations.open`-equivalent brick exists, so a raw user ID can't
auto-open a DM (promoted to `semantic/flowbrew-platform-bugs-open.md`).
Asked Jakub to add `im:read`/`mpim:read` and reinstall the Slack app.
Jakub dropped the DM approach instead ("tak to posilej vse do
#C0BRZL8LJPP") — deleted the throwaway `smith-slack-dm-lookup` (`547e5e7d`).

## Approval-gate v2: both messages in-channel (20:52)
Jakub clarified he actually wants **both** the approval question and the
final forwarded message posted to `#C0BRZL8LJPP` (no DM needed) — sidesteps
the `im:read`/no-`conversations.open` blocker entirely. Rebuilt
`smith-email-to-slack-test` (`5b97dddc`) to v2: `email` →
`core.create-approval-gate` (options "Ano, poslat" / "Ne, zahodit") → post
approval message + link to `C0BRZL8LJPP` → `core.await-approval` → on
approve, post the verbatim from/title/body as a second message to the same
channel; on reject, nothing further. Compiled clean; live smoke test
`f7bb6928` posted the approval message with a real link.

## Joint real-email test confirms platform fix v0.2.55 live (22:13–22:18)
Jakub asked to jointly test the approval-gate workflow live via real email
now that platform fix v0.2.55 (issue #231/PR #232, `create-approval-gate`
`output_json` overwrite bug) was in prod. Sent the trigger address; Jakub
sent a real email. Instance `f84ae874` (22:16 UTC) confirmed the fix live
end-to-end: `create-approval-gate`'s own attempt completed in 2.0s (real
HTTP, previously stuck at full callback lifetime), `await-approval`
correctly showed a 55.0s wait, total 69.8s / 4 bricks / completed, decision
"Ano, poslat", and both Slack messages landed correctly in `#C0BRZL8LJPP`.
Closes the issue #231/PR #232 validation loop on a real user-facing
workflow, not just unit tests.

## Outcome
- `smith-email-to-slack-test` (`5b97dddc`) stands as a working staging
  approval-gate email-to-Slack workflow, fully validated via real email.
- Prod push still blocked on the same `FLOWBREW_API_TOKEN`
  workspace-mismatch issue from 2026-09-22 — still unconfirmed fixed.
- New standing platform gap recorded: no DM-channel-resolution path via MCP
  (`semantic/flowbrew-platform-bugs-open.md`).
