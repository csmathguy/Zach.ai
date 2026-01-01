# Feature Workspaces

Use this folder to track per-feature artifacts that should live alongside the codebase during development (planning notes, APRs, test plans, retrospectives, etc.). Each feature/idea gets its own subfolder, named after the **branch/PRD identifier** you are working on.

## Workflow

1. Copy the template folder:
   ```bash
   cp -R features/_template/feature-branch-name features/<your-branch-name>
   ```
2. Rename the new folder to match the feature branch (for example `features/feat-dashboard-health`).
3. Populate the files under `plan/`, `tests/`, `dev/`, and `retro/`, keeping each phase’s artifacts in its respective folder.
4. Keep the template folder untouched so future work can reuse it.

> **Note:** The entire `features/` tree (except this README and the template) is git-ignored. Your local artifacts stay out of commits while still being colocated with the repo for faster iteration.
