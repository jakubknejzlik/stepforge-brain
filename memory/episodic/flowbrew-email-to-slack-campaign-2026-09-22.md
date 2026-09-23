# Flowbrew: email-to-slack test campaign (2026-09-22)

## Context
Jakub asked for a v1/v2 test scenario (email trigger -> [sentiment] ->
slack message, v2 adds a form-input brick). Descoped to v1 only
(email-hook -> slack-message). This file captures the resulting build,
staging validation, staging wipe, and prod rebuild — including a workspace-
identity incident that blocked prod completion. See `memory/daily/2026-09-22.md`
for the full timestamped log; MEM-36/37/38/39 (platform findings from the
same day) are promoted separately in `semantic/flowbrew-platform-bugs-open.md`.

## Staging: build + validate (09:33–15:32)
- Investigated brick availability: core plugin has native email/webhook/cron
  triggers + http-request/kv/file-storage bricks; slack plugin (public
  v1.0.0) has `slack-send-message`. No built-in sentiment or form-input
  brick exists anywhere — both would need custom plugin bricks (sentiment:
  lexicon-based, quick; form: needs hosted-page+callback like the existing
  approval-gate pattern, more effort). Deferred per Jakub's descoping.
- Created Slack connection shell `94458b6c` on staging workspace
  `mdfxQML4D68Q0xDMGPJUuPuRZMXH0tSs`; Jakub set the bot token via consoleUrl.
- Built workflow `smith-email-to-slack-v1` (`3adc0a50`), reused existing
  active email trigger instance `7341df78`, subscribed via `736393cd`.
- Validated end-to-end via `start_workflow` with a synthetic email payload:
  instance `db78fcca` completed, posted to Slack channel `C0BRZL8LJPP`
  (ts `1790091158.507569`). Tested via direct `start_workflow`, not the real
  email endpoint POST, per time constraints.
- Real-address workaround (MEM-37) let Jakub attempt a live email through
  the actual inbound address, but staging email delivery turned out to be
  fundamentally broken by a missing MX record (MEM-38) — confirmed
  independently and filed as bug `01M3547ADJ13JH99R04FA3P1CA`.

## Staging wipe (18:24)
Jakub confirmed a full staging wipe. Deleted all 5 workflows
(`github-issue-autoresponder`, `slack-plugin-blindtest`/`listandsend`/
`approvalflow`, `email-to-slack-v1`), all 4 trigger instances, both trigger
subscriptions. **Could not delete via MCP:** 3 connections (Smith test,
GitHub PAT, Slack) and 2 private plugins (`github-tools`, `smith-test-plugin`)
— no `delete_connection` MCP tool exists, and `delete_plugin` blocks while
connections are attached. Flagged to Jakub as console-only cleanup.

## Prod: build attempt + workspace-identity incident (18:24–18:35)
1. Started building the same scenario on the workspace the channel secret
   `FLOWBREW_API_TOKEN` points to (`e4673c3e`): workflow shell `a0e009d5` +
   email trigger `215a6b8c` (real address, domain confirmed to have working
   MX). Blocked on `create_connection` for prod Slack — the token is
   member-scoped, not owner-scoped ("Workspace owner access required").
2. Jakub offered to paste a fresh owner-scoped token directly into Slack;
   intercepted and routed it through the `secret-receiver` skill instead
   (encrypted form via bg-task tunnel) so the token never touched chat.
3. Token received, used to `create_connection` (`75294d01`, Slack) — but it
   turned out to belong to a **different** Flowbrew workspace
   (`fY95o8FW5bmPreaFK4FOH5RUKDiYsPnB`) than the one holding the just-built
   workflow/trigger (`e4673c3e`, same workspace `FLOWBREW_API_TOKEN` points
   to). Caught via `list_connections` returning empty under
   `FLOWBREW_API_TOKEN` post-creation, and by comparing the `consoleUrl`
   workspace segment against `create_trigger_instance`'s `workspaceId`.
4. Flagged the mismatch to Jakub rather than guessing. **He confirmed
   `fY95o8FW5bmPreaFK4FOH5RUKDiYsPnB` is the real prod workspace** —
   `e4673c3e` (what the channel secret `FLOWBREW_API_TOKEN` actually
   resolves to) is stale/wrong, and Jakub was asked to correct it via
   `/settings/secrets`. **As of this writing that correction has not been
   confirmed done** — `FLOWBREW_API_TOKEN` may still point to the wrong
   workspace next session; verify before trusting it for prod work. See
   `semantic/flowbrew-platform-reference.md` for the standing fact.
5. Reopened `secret-receiver` for a token scoped to the *correct* workspace.
   Confirmed working (saw connection `75294d01`, empty workflow list).
   Created workflow shell `798a5810` + email trigger `ec619533` in the real
   prod workspace.
6. **Left incomplete:** `update_workflow` failed with "Connection `75294d01`
   is pending_verification" — Jakub still needs to enter the real Slack bot
   token via the consoleUrl sent to him. Once that lands, `update_workflow`
   + trigger subscription still need to be (re)run to finish wiring
   `798a5810`/`ec619533` together. Not yet re-attempted as of this
   consolidation.

## Outcome
- Staging: fully built, validated end-to-end (synthetic payload), then
  fully wiped per Jakub's request. No longer exists.
- Prod: two false starts (wrong-scope token, then wrong-workspace token)
  before landing a workflow shell + email trigger in the confirmed-correct
  workspace `fY95o8FW5bmPreaFK4FOH5RUKDiYsPnB`. Blocked on Jakub completing
  Slack connection verification — pick up there next session.
- Handed MEM-36/37/38 findings to cross-brain agent U0AJN756TTL (MCP
  metadata schema fix owner) in thread `1790104705.497419`.
