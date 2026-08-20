# CI triage (Cursor Automation)

**Trigger:** GitHub Actions workflow run completed with failure on KozyWhiskey/nightfall  
**Repo:** KozyWhiskey/nightfall  
**Tools:** PR comments

## Instructions

Read the failing `check` workflow log. If the failure is caused by the PR's own changes, push the smallest fix that restores `pnpm check` without weakening tests or boundary rules. If the failure is unrelated or needs a design decision, comment with the log excerpt and stop. Do not disable CI.
