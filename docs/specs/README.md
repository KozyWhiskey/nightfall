# Spec queue

Agent-written change specs for Nightfall. Design authority remains `docs/` (Decision Register first). System specs stay in `docs/systems/`; this queue is the bug / enhancement / capability intake.

| Folder | Meaning |
|--------|---------|
| [proposed/](proposed/) | New capabilities and design-doc changes waiting on a human |
| [approved/](approved/) | Bugs and enhancements in flight, or capabilities you approved |
| [shipped/](shipped/) | Specs whose acceptance tests passed |
| [evidence/](evidence/) | Seeds, screenshots, and E2E notes |

Template: [../templates/change-spec.md](../templates/change-spec.md).

**Human gates:** merge PRs; move `new_capability` files from `proposed/` to `approved/` (or label the tracking PR `spec-approved`). Bugs vs accepted contracts skip the wait.

**Cursor Automations:** enable Bugbot on this GitHub repo from [Cursor Automations](https://cursor.com/automations/from-cursor/bugbot). Drafts for daily spec scout, `spec-approved` implementer, and CI triage live in `.cursor/automations/`.
