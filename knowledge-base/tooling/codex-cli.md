# OpenAI Codex CLI ("codex")

Comprehensive guide for using the **OpenAI Codex CLI** (`codex` command) with a focus on:

- Local development workflows.
- Automation from scripts and CI.
- Best practices for sandboxing, approvals, and code edits.

Codex CLI is an **OpenAI tool**, distinct from GitHub Copilot and the GitHub Copilot CLI, but conceptually similar:

- `copilot` CLI → GitHub Copilot (uses GitHub’s GPT‑5.1/-Codex models under GitHub’s terms).
- `codex` CLI → OpenAI Codex (OpenAI-hosted multi-agent coding assistant, governed by OpenAI’s developer terms).

> Status: Codex CLI is actively developed by OpenAI and is designed as a “coding agent” that can inspect, modify, and reason about your codebase, both interactively and via non-interactive commands (`codex exec`).

---

## 1. Concepts & Capabilities

### 1.1 What Is the Codex CLI?

Codex CLI is a terminal-based coding agent that can:

- Inspect your **local Git repository**.
- Read, edit, and create files (subject to sandbox and approval rules).
- Run commands in a sandboxed environment (tests, linters, formatters, etc.).
- Interact with **Codex Cloud** (OpenAI-hosted agents that propose changes as diffs).
- Expose itself as a **Model Context Protocol (MCP) server** for other tools.

You use it in two main ways:

- **Interactive TUI**: `codex` — chat with Codex, review diffs, approve actions.
- **Non-interactive exec**: `codex exec` — run one task and exit, ideal for scripts and CI.

### 1.2 Relationship to GitHub Copilot

- Codex CLI is built and hosted by **OpenAI**, not GitHub.
- GitHub Copilot products (including Copilot CLI) use OpenAI’s models (GPT‑5.1/-Codex family) behind GitHub’s APIs and policies.
- Codex CLI uses OpenAI’s own APIs and is governed by **OpenAI’s** terms and data policies.

In this repo, treat Codex CLI as an **optional advanced tool** for:

- Deep code review and refactoring.
- Automated analysis or change proposals in CI, especially in isolated branches/runners.

---

## 2. Installation (with Windows Notes)

### 2.1 Supported Platforms

- Officially supported: macOS, Linux.
- Windows: supported but **experimental**. OpenAI recommends using **WSL** for best security and sandboxing.

### 2.2 Install via npm (All Platforms)

Prerequisites:

- Node.js 20+ (check `node -v`).
- npm available on PATH.

Install globally:

```bash
npm i -g @openai/codex
```

Upgrade:

```bash
npm i -g @openai/codex@latest
```

After installation, confirm:

```bash
codex --version
```

### 2.3 Install via Homebrew (macOS)

```bash
brew install --cask codex
```

Then run `codex --version` to confirm.

### 2.4 Direct Binary Downloads

For pinned versions or air-gapped environments:

1. Go to the Codex GitHub releases page.
2. Download the appropriate binary for your OS/architecture.
3. Place it in a directory on PATH (e.g., `/usr/local/bin` or `C:\Tools`).

### 2.5 Windows Guidance

#### 2.5.1 Recommended: Use WSL

1. Install WSL (Ubuntu or similar).
2. Inside WSL, install Node.js and npm.
3. Run `npm i -g @openai/codex`.
4. Use `codex` from within WSL, pointing it at your repository checked out in the WSL filesystem.

#### 2.5.2 Native Windows (Experimental)

You can install Codex CLI directly under Windows (PowerShell, cmd), but the sandbox model is less mature. If you choose this path:

- Be extra conservative with sandbox and approval settings.
- Prefer **read-only** or limited workspace-write modes for safety.

---

## 3. Authentication & Accounts

Codex CLI supports multiple authentication paths, depending on whether you use ChatGPT or OpenAI API keys.

### 3.1 ChatGPT Login (Recommended for Human Users)

If you have ChatGPT Plus/Pro/Business/Edu/Enterprise:

1. Run:

   ```bash
   codex login
   ```

2. Codex opens a browser window and prompts you to log in.
3. After you approve access, the CLI saves credentials locally.

Check status:

```bash
codex login status
```

- Exit code 0: logged in.
- Non-zero: not logged in or token invalid.

### 3.2 OpenAI API Key Login (Usage-Based / CI-Friendly)

You can also authenticate with an OpenAI API key:

1. Generate an API key in the OpenAI Platform dashboard.
2. For interactive login:

   ```bash
   codex login --with-api-key
   ```

   Paste your key when prompted.

3. For automation with `codex exec` only, you can use an environment variable (see Section 7):
   - `CODEX_API_KEY` – used by `codex exec` when set.

### 3.3 Where Credentials Are Stored

By default, Codex stores credentials in a location like:

- `~/.codex/auth.json` (file-based store), or
- OS keyring / credential manager (if configured).

Configuration is controlled by the `cli_auth_credentials_store` setting in `config.toml` (see Section 6).

### 3.4 Logging Out

To clear cached credentials:

```bash
codex logout
```

---

## 4. Core Commands Overview

### 4.1 `codex` (Interactive TUI)

Launches the interactive Codex interface in the current directory:

```bash
codex
```

From here you can:

- Ask questions about the repo.
- Let Codex propose and apply code changes.
- Use slash commands (see Section 5).

### 4.2 `codex exec` (Non-Interactive Execution)

`codex exec` runs a single task non-interactively and exits, making it ideal for scripts and CI.

Basic usage:

```bash
codex exec "Summarize this repository in one paragraph."
```

You can also pipe prompts via stdin:

```bash
echo "List the main services and their responsibilities." | codex exec -
```

### 4.3 Other Key Subcommands

- `codex login` / `codex login status` – authenticate and check login state.
- `codex logout` – clear stored credentials.
- `codex resume` – resume an interactive session by ID or `--last`.
- `codex cloud` / `codex cloud exec` – run tasks in Codex Cloud.
- `codex apply` – apply diffs from Codex Cloud to your local repo.
- `codex mcp` – manage MCP servers.
- `codex mcp-server` – run Codex as an MCP server.
- `codex sandbox` / `codex debug` – run commands under Codex’s sandbox for debugging.
- `codex execpolicy` – validate execpolicy rule files.
- `codex app-server` – local app server (primarily for extension/advanced scenarios).

---

## 5. Interactive Mode & Slash Commands

When you run `codex` without arguments, you enter an interactive environment that supports **slash commands** for common tasks.

Important commands (names are representative; check `codex help` for exact list):

- `/review` – have Codex review the working tree for risky or untested changes.
- `/diff` – show Git diff and discuss changes.
- `/status` – show repo status, active sandbox, and approval mode.
- `/mention path` – explicitly include files/folders in context.
- `/undo` – revert Codex’s most recent action (including file edits).
- `/model` – choose the underlying model.
- `/approvals` – inspect or adjust approval behavior.
- `/sandbox` – show or adjust sandbox mode.
- `/init` – create an `AGENTS.md` scaffold to help define custom agents.

Interactive mode is where you:

- Experiment with prompts and workflows before automating them.
- Inspect how Codex edits files and runs tests.
- Tune models and approval/sandbox settings.

---

## 6. Configuration (`config.toml` & Managed Config)

Codex CLI reads configuration from `~/.codex/config.toml` by default (or another path if configured).

### 6.1 User Config (`config.toml`)

In `~/.codex/config.toml`, you can define:

- Default model.
- Sandbox mode defaults.
- Approval policies.
- Profiles.

Example minimal config:

```toml
model = "gpt-5.1-codex"

[sandbox]
mode = "workspace-write"   # or "read-only" | "danger-full-access"

[approvals]
policy = "on-request"      # or "untrusted" | "on-failure" | "never"
```

You can also define named profiles, then select them via `--profile`:

```toml
[profiles.ci-readonly]
model = "gpt-5.1-codex"

[profiles.ci-readonly.sandbox]
mode = "read-only"

[profiles.ci-readonly.approvals]
policy = "never"
```

Run with:

```bash
codex exec --profile ci-readonly "Analyze the test coverage gaps in this repo."
```

### 6.2 Managed Config (Enterprise)

For stricter environments, admins can deploy:

- `requirements.toml` – **hard constraints** (e.g., disallow `danger-full-access`).
- `managed_config.toml` – **managed defaults** (e.g., required sandbox/approval profiles, OTEL config).

This is relevant if you adopt Codex CLI in a larger team and want to enforce policies.

### 6.3 OTEL & Telemetry

Codex can emit OpenTelemetry traces/logs when configured, but OTEL is **off by default**. You enable it in `config.toml` or managed config. For this repo, keep OTEL disabled unless you have an OTEL backend.

---

## 7. Non-Interactive Usage (`codex exec`) & Script Integration

This section focuses on using Codex CLI from scripts and CI.

### 7.1 Common Flags for Automation

Key options for `codex exec` and global behavior:

- `--cd, -C <path>` – set working directory (workspace root).
- `--profile, -p <name>` – use a named profile from `config.toml`.
- `--model, -m <id>` – override model for this invocation.
- `--sandbox, -s <mode>` – `read-only`, `workspace-write`, or `danger-full-access`.
- `--ask-for-approval, -a <policy>` – `untrusted`, `on-failure`, `on-request`, `never`.
- `--full-auto` – convenience preset: usually `workspace-write` + moderate approvals.
- `--add-dir <path>` – add extra directories Codex can write to.
- `--skip-git-repo-check` – allow running outside a Git repo (use sparingly).
- `--json` – emit a JSONL event stream to stdout.
- `--output-last-message, -o <path>` – write final assistant message to a file.
- `--output-schema <schema.json>` – enforce structured JSON output.

### 7.2 Environment Variables for CI

For headless CI usage, you can set:

- `CODEX_API_KEY` – API key used by `codex exec`.

Example (Bash):

```bash
export CODEX_API_KEY="<your-api-key>"

codex exec --profile ci-readonly --json "Summarize this PR and list risky changes."
```

In CI (GitHub Actions):

```yaml
- name: Analyze changes with Codex
  env:
    CODEX_API_KEY: ${{ secrets.CODEX_API_KEY }}
  run: |
    codex exec --profile ci-readonly --json "Review the diff of HEAD~1..HEAD and flag any untested behavior changes." > codex-report.jsonl
```

### 7.3 Simple Q&A from Scripts

**Bash**:

```bash
answer=$(codex exec "Summarize this repository in one sentence.")
printf '%s\n' "$answer"
```

**PowerShell** (under WSL or Windows build):

```powershell
$prompt = "Summarize the purpose of this repository in one sentence."
$answer = codex exec $prompt
$answer
```

### 7.4 Structured JSON Output

You can ask Codex to emit JSON, then parse it:

```bash
codex exec "Respond ONLY with JSON: {\"summary\": string, \"riskLevel\": string}." > codex-output.json

jq . codex-output.json
```

For stronger guarantees, use `--output-schema` with a JSON Schema file, so Codex is guided to a specific shape.

### 7.5 Requesting Code Changes (With Sandbox & Approvals)

**Example: auto-fix tests in a feature branch CI job (in an isolated runner)**

```bash
export CODEX_API_KEY="<your-api-key>"

codex exec \
  --sandbox workspace-write \
  --ask-for-approval never \
  "Fix failing tests in this repository with minimal, well-documented code changes. Prioritize changes under @backend/src and @frontend/src."

npm test
```

Notes:

- Run only on disposable/ephemeral runners (never directly on `main` in a shared environment).
- Always run your own test suite/lint/validate afterwards.

### 7.6 Read-Only Repo Analysis

For analysis with no file writes:

```bash
codex exec \
  --sandbox read-only \
  --ask-for-approval never \
  "Scan this repo and list areas likely to be fragile given our Jest/TDD setup. Suggest where to add more tests."
```

This is safe to run on any branch; Codex can’t modify files or run arbitrary commands.

### 7.7 Using From Node.js

```js
import { execFileSync } from 'node:child_process';

function runCodex(prompt) {
  const output = execFileSync(
    'codex',
    ['exec', '--sandbox', 'read-only', '--ask-for-approval', 'never', prompt],
    { encoding: 'utf8' }
  );

  return output.trim();
}

const summary = runCodex('Summarize the folder structure and key services.');
console.log(summary);
```

Use environment variables (like `CODEX_API_KEY`) to manage credentials securely.

---

## 8. Code Search, Refactoring & Cloud Tasks

### 8.1 Repo-Aware Reasoning

Codex is designed to work with Git repositories:

- It can inspect `git diff`, untracked files, and commit history.
- It can search for patterns and usages across files.

Examples (interactive or via `codex exec`):

```bash
codex exec "Within this repository, find all instances of direct SQL queries and summarize potential injection risks, listing file paths and approximate line ranges."

codex exec "Find usages of 'UserService' and group them by responsibility (read, write, auth)."
```

### 8.2 Refactoring & File Edits

Codex can:

- Propose refactorings (e.g., extract services, simplify controllers, improve error handling).
- Apply small, targeted edits directly to files.

You typically:

1. Use `codex` interactively to refine prompts and see how it behaves.
2. Once comfortable, automate narrow workflows with `codex exec` and strict sandbox/approval policies.

### 8.3 Codex Cloud Workflows

`codex cloud` and `codex apply` support workflows where:

- Codex Cloud analyzes your code (via Git) and proposes changes as diffs.
- You fetch and apply those diffs locally with `codex apply`.

This is more advanced and best introduced after basic CLI usage is stable in the team.

---

## 9. Security, Data Flow & Governance

### 9.1 Where Code & Data Go

- Codex CLI runs on your machine; it sends prompts, selected file contents, diffs, and command outputs to the configured model provider (OpenAI by default).
- With sandboxing enabled, Codex’s **generated** commands run in a restricted environment and cannot access the wider system by default.
- Codex Cloud runs agents in OpenAI-managed containers; they do not have direct access to your machine or network unless you explicitly connect via Git or other protocols.

### 9.2 Sandbox Modes

- `read-only` – model can read files and run harmless commands, but cannot write.
- `workspace-write` – model can modify files in the workspace and run tests/tools.
- `danger-full-access` – minimal restrictions; only use in hardened containers.

For this repo’s local development, `workspace-write` is acceptable **only** when:

- You are on a feature branch.
- You review all diffs before committing.

For CI, prefer `read-only` unless you are in a special “auto-fix” job that runs in a disposable environment.

### 9.3 Approval Policies

- `untrusted` – very strict; many actions require explicit approval.
- `on-request` – ask for approval when Codex isn’t sure.
- `on-failure` – only ask for approval when a command fails.
- `never` – never ask; best for purely read-only jobs.

Combine sandbox and approval to meet your risk tolerance.

### 9.4 Team Governance

If Codex CLI becomes a shared tool:

- Use `requirements.toml` to block dangerous sandbox modes (`danger-full-access`).
- Use `managed_config.toml` to enforce default profiles in CI vs dev.
- Document standard profiles (`ci-readonly`, `dev-workspace-write`) and how to use them.

---

## 10. Best Practices for This Repo

### 10.1 Local Development

- Start with **interactive** mode (`codex`) to:
  - Explore `/review`, `/diff`, `/undo`, `/status`, `/init`.
  - Understand how Codex modifies files and runs tests.
- Keep sandbox at `workspace-write` with `on-request` approvals.
- Run `npm run validate` after letting Codex change code.
- Never run Codex with `danger-full-access` on your primary machine.

### 10.2 CI & Automation

- Prefer **read-only** analysis with `codex exec`:
  - `--sandbox read-only --ask-for-approval never`.
- Use `CODEX_API_KEY` as a secret, not ChatGPT auth, for CI.
- Run Codex jobs in separate steps from build/test, and treat Codex output as advisory (e.g., upload reports or comments), unless you are in a dedicated auto-fix pipeline.

### 10.3 Comparing Codex CLI vs GitHub Copilot CLI

Use:

- **GitHub Copilot CLI (`copilot`)** when you:
  - Want tight integration with GitHub repos and Copilot agents.
  - Prefer GitHub’s governance and billing.
- **OpenAI Codex CLI (`codex`)** when you:
  - Want direct access to OpenAI’s Codex features, Codex Cloud, and MCP server.
  - Need `codex exec` JSONL output and `--output-schema` for rich automation.

Both can coexist; choose per-script based on governance and capabilities.

---

## 11. Checklist for Introducing Codex CLI

Before using Codex CLI broadly in this repo:

- [ ] Confirm OpenAI account and terms are acceptable for this codebase.
- [ ] Install Codex CLI (preferably in WSL on Windows).
- [ ] Decide on standard profiles in `~/.codex/config.toml` (e.g., `ci-readonly`).
- [ ] Document how to log in (ChatGPT vs API key) for developers.
- [ ] Pilot interactive usage on feature branches.
- [ ] Add **read-only** `codex exec` examples to CI as advisory checks.
- [ ] Optionally, add auto-fix jobs in isolated runners, gated on manual review.

This document should give you a solid foundation for using the OpenAI Codex CLI as a programmable automation surface alongside GitHub Copilot and Copilot CLI in this codebase.
