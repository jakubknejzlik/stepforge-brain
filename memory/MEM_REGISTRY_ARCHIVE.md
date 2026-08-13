# MEM Registry — Archive

REMOVED audit rows relocated from `MEM_REGISTRY.md` to keep the live registry
under threshold. Appended by `skills/memory/scripts/mem-registry-archive.ts`
during consolidation — do not hand-edit. Full lifecycle history lives here;
the live registry keeps only ACTIVE / OBSOLETE rows plus a pointer stub.

| Key | Status | Created | Obsoleted | Description |
|-----|--------|---------|-----------|-------------|
| MEM-1 | REMOVED | 2026-08-10 | 2026-08-11 | blocker: AWS creds in env (jarvis-test-s3-writer, account 693805235952) had zero usable permissions, blocking SST dummy SFN deploy. Superseded same-day by knedlopark SSO setup; root-cause lesson preserved in [MEM-2]. Never promoted to a content file (no [MEM-1:obsolete] tag existed to remove) — visible one full cycle as OBSOLETE, now REMOVED per lifecycle. |
