# Spec queue

Agent-written change specs for Nightfall. Design authority remains `docs/` (Decision Register first). System specs stay in `docs/systems/`; this queue is the bug / enhancement / capability intake.

| Folder | Meaning |
|--------|---------|
| [proposed/](proposed/) | New capabilities and design-doc changes waiting on a human |
| [approved/](approved/) | Bugs and enhancements in flight, or capabilities you approved |
| [shipped/](shipped/) | Specs whose acceptance tests passed |
| [evidence/](evidence/) | Seeds, screenshots, and E2E notes |

Template: [../templates/change-spec.md](../templates/change-spec.md).

**Human gates:** merge PRs; review `new_capability` PRs labeled `needs-human` (move `proposed/` → `approved/` and add `spec-approved` when ready). Bugs and enhancements are auto-labeled `auto-bug` + `spec-approved` by the daily scout so the implementer can run without a daily click.

**Notifications:** `needs-human` PRs post to a private Discord channel via `.github/workflows/notify-needs-human.yml` (secret `DISCORD_WEBHOOK_URL`). No Slack required. Cursor does not push a reliable in-IDE “action required” for cloud automations.

**Cursor Automations:** Bugbot is optional. Drafts for daily spec scout, `spec-approved` implementer, and CI triage live in `.cursor/automations/`.
