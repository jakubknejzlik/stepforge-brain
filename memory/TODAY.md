# 2026-09-21

- 03:33 — memory consolidation started

# 2026-09-22

- [09:33] flowbrew: deleted leftover test workflow smith-live-webhook-poke-1789634014 (eaa392a1...) + its trigger subscription/instance in prod workspace e4673c3e..., per Jakub's request in-thread. Workspace confirmed empty via list_workflows.
- [14:15] flowbrew: created cron/webhook/email trigger instances on staging (workspace mdfxQML4D68Q0xDMGPJUuPuRZMXH0tSs) for post-deploy testing of PR#221 metadata field — cron f9238bf2 (0 * * * * Europe/Prague), webhook dda47351, email 7341df78
- [MEM-36] flowbrew: MCP create_trigger_instance/list_trigger_instances outputSchema still additionalProperties:false with no metadata field declared, even after PR#221/v0.2.47 deploy — new email inboundAddress metadata is threaded to browser-api but not exposed via MCP tool surface. Verified via tools/list schema inspection on staging, not just absence in a response.
- [15:24] flowbrew: investigated v1/v2 test scenario for Jakub (email hook -> sentiment brick -> slack msg; v2 adds form-input brick before step2). Found: core plugin has native email/webhook/cron triggers + http-request/kv/file-storage bricks; slack plugin (public v1.0.0) has slack-send-message but no connection existed yet on staging workspace mdfxQML4D68Q0xDMGPJUuPuRZMXH0tSs -- created connection shell 94458b6c-a7db-45cb-af84-b06ee78f06d9, sent consoleUrl to Jakub for bot token. No built-in sentiment or form-input brick exists anywhere -- both need custom plugin bricks (sentiment: lexicon-based, no AI needed, quick; form: needs hosted-page+callback like existing approval-gate pattern, more effort).
