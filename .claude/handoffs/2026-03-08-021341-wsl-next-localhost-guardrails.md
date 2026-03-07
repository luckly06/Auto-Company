# Handoff: WSL localhost guardrails, skill extraction, and index sync

## Session Metadata
- Created: 2026-03-08 02:13:41
- Project: /home/dd/projects/grope/Auto-Company
- Branch: main
- Session duration: about 1 hour

### Recent Commits (for context)
  - e4f89d0 feat: scaffold meeting action tracker MVP
  - 75bba99 Update: Add execute permissions to scripts
  - 771fed1 chore: release v1.0.0
  - 61d6233 chore(release): add package metadata for v1.0.0
  - 38379b7 chore(gitignore): add release-ai private doc ignore entries

## Handoff Chain

- **Continues from**: None (fresh start)
- **Supersedes**: None

> This is the first handoff for this task.

## Current State Summary

This session started from a Windows-to-WSL networking failure where Windows could not reach the Next.js dev server on `http://localhost:3000` even though WSL-local access worked. The root causes were verified as (1) a stale Windows `portproxy` rule occupying `0.0.0.0:3000`, and (2) Next.js starting in a way that only exposed an IPv6 listener in WSL. I documented the incident as a reusable project runbook, extracted the diagnosis/fix workflow into a new global skill under `/home/dd/.agents/skills/devops/`, updated the global skill indexes, and hardened this project's `npm run dev` to use `next dev --hostname 0.0.0.0`. Final verification showed Windows `curl.exe http://localhost:3000` successfully returned HTML after the app-side host binding fix. No dev server is left running now.

## Codebase Understanding

## Architecture Overview

The project is a Next.js 14 app under `projects/meeting-action-tracker/` inside the `Auto-Company` repo. This task crossed two scopes: project-local docs/config in the repo, and global skill metadata under `/home/dd/.agents/skills/`. Important operational nuance: files under `docs/*/*` are currently ignored by this repo's `.gitignore`, so new runbooks and plan docs will exist on disk but will not appear in `git status` unless `.gitignore` is adjusted or files are force-added.

## Critical Files

| File | Purpose | Relevance |
|------|---------|-----------|
| `projects/meeting-action-tracker/package.json` | Local dev commands | `dev` was hardened to `next dev --hostname 0.0.0.0` to prevent repeat IPv6-only binding issues |
| `projects/meeting-action-tracker/README.md` | Project setup docs | Notes the WSL-safe dev binding and points readers to the runbook/skill |
| `docs/windows-setup.md` | Project-wide Windows + WSL setup guide | Added a dedicated section telling future agents/users to use the guardrails instead of guessing |
| `docs/devops/2026-03-08-wsl-next-localhost-guardrails.md` | Incident runbook | Project-specific Chinese runbook for this exact localhost failure pattern |
| `docs/plans/2026-03-08-wsl-next-localhost-hardening.md` | Implementation plan | Captures why the fix was split into doc + dev command hardening |
| `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/SKILL.md` | Reusable skill | Global workflow for diagnosing Windows-to-WSL localhost failures |
| `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/references/diagnostic-commands.md` | Command checklist | Quick reference for the skill's key commands and anti-patterns |
| `/home/dd/.agents/skills/INDEX.md` | Global skill index | Updated counts and added the new DevOps skill |
| `/home/dd/.agents/skills/SKILL_LOOKUP_PRIORITY.md` | Global lookup routing | Added WSL/localhost/portproxy keywords and an example lookup path |
| `/home/dd/.agents/skills/Business_Skills_Index.md` | Business-scenario routing | Added a new engineering/local-debugging scenario that references the skill |
| `/home/dd/.agents/skills/dist/wsl-next-localhost-guardrails.skill` | Packaged artifact | Validated package output for the new skill |

## Key Patterns Discovered

- When adding a new global skill under `/home/dd/.agents/skills/`, you must also update `INDEX.md` and `SKILL_LOOKUP_PRIORITY.md`; for scenario-driven discoverability, `Business_Skills_Index.md` should be updated too.
- This repo ignores `docs/*/*` via `.gitignore`, so new runbooks/plans under `docs/devops/` or `docs/plans/` are easy to forget because they do not show up in `git status`.
- For this WSL issue, the correct debugging order is: verify app inside WSL, split IPv4/IPv6 listener checks, inspect Windows `portproxy`, run a minimal Python control server, then apply the smallest fix that matches the evidence.
- A Windows listener on the target port is not sufficient proof of success; `svchost/iphlpsvc` on that port usually points to host-side forwarding or stale `portproxy`, not the app itself.

## Work Completed

## Tasks Finished

- [x] Diagnosed the WSL localhost failure without guessing
- [x] Verified the stale Windows `portproxy` rule on `0.0.0.0:3000` was intercepting traffic
- [x] Verified a Python control server on `0.0.0.0:3000` was reachable from Windows, proving the WSL path itself worked
- [x] Verified Next.js needed explicit IPv4 binding and hardened the local `dev` script
- [x] Wrote a project runbook in Chinese for the incident and future agents
- [x] Created a reusable global skill `wsl-next-localhost-guardrails`
- [x] Updated the global skill indexes and business scenario index
- [x] Validated and packaged the new skill into `.skill` format

## Files Modified

| File | Changes | Rationale |
|------|---------|-----------|
| `projects/meeting-action-tracker/package.json` | Changed `dev` to `next dev --hostname 0.0.0.0` | Prevent repeat IPv6-only bind failures when running in WSL |
| `projects/meeting-action-tracker/README.md` | Added note that `npm run dev` is WSL-safe and linked to the runbook/skill | Make the fix discoverable from the main project docs |
| `docs/windows-setup.md` | Added a `localhost:3000` / WSL Web 服务访问守则 section | Route future agents/users to the correct workflow instead of ad hoc fixes |
| `docs/devops/2026-03-08-wsl-next-localhost-guardrails.md` | Created project-specific guardrails/runbook | Preserve the verified root cause and anti-patterns in repo-local docs |
| `docs/plans/2026-03-08-wsl-next-localhost-hardening.md` | Created implementation plan | Record the reasoning and scope of the hardening work |
| `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/SKILL.md` | Created the new reusable skill | Make the workflow portable across future sessions/projects |
| `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/references/diagnostic-commands.md` | Added command checklist and anti-patterns | Keep `SKILL.md` concise while preserving operational detail |
| `/home/dd/.agents/skills/INDEX.md` | Updated counts and added the new DevOps skill | Keep the installed skill catalog accurate |
| `/home/dd/.agents/skills/SKILL_LOOKUP_PRIORITY.md` | Added lookup keywords and a WSL example | Ensure future agents route WSL/localhost issues to the new skill |
| `/home/dd/.agents/skills/Business_Skills_Index.md` | Added an engineering/local-debugging scenario | Make the skill discoverable from scenario-based workflows |

## Decisions Made

| Decision | Options Considered | Rationale |
|----------|-------------------|-----------|
| Put the new skill under `devops/` | `core/`, `devops/`, project-local doc only | The workflow is primarily networking/ops diagnosis, not a general core process |
| Harden `npm run dev` with `--hostname 0.0.0.0` | Keep manual startup instructions only, or switch to mirrored-only WSL advice | This directly fixes the verified app-side root cause in this project with the smallest ongoing cost |
| Keep a separate project runbook in addition to the skill | Skill only, or repo doc only | The skill is reusable globally; the runbook preserves this project's exact evidence and constraints in Chinese |
| Update all three indexes (`INDEX`, lookup priority, business index) | Update only `INDEX.md` | Full discoverability requires technical, routing, and scenario-level sync |
| Do not touch unrelated repo diffs | Clean up existing modified files while here | Stay scoped to this task and avoid bundling unrelated work |

## Pending Work

## Immediate Next Steps

1. If you want these repo-local docs versioned, decide whether to change `.gitignore` or force-add `docs/devops/2026-03-08-wsl-next-localhost-guardrails.md` and `docs/plans/2026-03-08-wsl-next-localhost-hardening.md`.
2. Stage only the intended project files (`docs/windows-setup.md`, `projects/meeting-action-tracker/README.md`, `projects/meeting-action-tracker/package.json`) separately from the repo's pre-existing unrelated changes.
3. If broader rollout is desired, add a short reference to the new skill in any other team runbooks that cover Windows + WSL local development.

## Blockers/Open Questions

- [ ] The repo already had unrelated modified/deleted files before this session (`.gitignore`, `projects/meeting-action-tracker/src/app/page.tsx`, `projects/meeting-action-tracker/src/lib/action-items.ts`, etc.); any commit should avoid accidentally bundling those changes.
- [ ] `docs/*/*` is ignored by `.gitignore`, so the new runbook and plan doc are present on disk but not tracked by Git by default.

## Deferred Items

- No attempt was made to clean or reconcile the repo's unrelated working tree changes.
- No attempt was made to automate deletion of stale Windows `portproxy` rules from inside the repo; the runbook documents the manual/admin path instead.

## Context for Resuming Agent

## Important Context

The most important operational lesson is that this was not a generic “WSL networking is broken” incident. The verified chain was: WSL app was healthy locally, Windows had a stale `portproxy` occupying `3000`, and after that was cleared, Next.js still needed explicit IPv4 binding to be reachable from Windows. The reusable diagnosis sequence is now encoded both in the project runbook and in the global skill. If this issue comes back, the next agent should not start by changing `.wslconfig`, adding new `portproxy` rules, or blaming `wsl-vpnkit`. The next agent should first follow the exact workflow in the new skill: WSL-local curl, split IPv4/IPv6 checks, inspect `portproxy`, run the Python control server, then apply the smallest evidenced fix. Also remember that the project docs created during this session are ignored by Git unless force-added or `.gitignore` is updated.

## Assumptions Made

- Future agents still have access to `/home/dd/.agents/skills/` and can read/use the new global skill.
- Running this project in WSL should continue to prefer Windows access through `http://localhost:3000`.
- Windows admin access may still be required in future sessions if a stale `portproxy` rule must be deleted again.

## Potential Gotchas

- `git status` in the repo will not show the new `docs/devops/...` and `docs/plans/...` files because `.gitignore` excludes `docs/*/*`.
- Global skill changes under `/home/dd/.agents/skills/` are outside the repo and therefore invisible to `git status` from `Auto-Company`.
- A successful port bind on Windows does not prove the app is returning real HTTP content.
- `hostAddressLoopback=true` is not a universal fix; the skill explicitly warns against using it as a generic answer.

## Environment State

## Tools/Services Used

- `powershell.exe` and `cmd.exe` invoked from WSL for Windows-side diagnostics
- `wslinfo` for current WSL networking mode
- `curl` / `curl.exe` for WSL-side and Windows-side verification
- `ss` for IPv4/IPv6 listener inspection
- `python3` for the session-handoff scripts and the temporary control HTTP server
- `npm` / Next.js dev server for app-side verification

## Active Processes

- No intentional background services were left running by the end of this session.
- The temporary Next.js dev server used for verification was stopped.

## Environment Variables

- `OPENAI_API_KEY` may exist for normal app behavior, but it was not required for this networking task.

## Related Resources

- `docs/windows-setup.md`
- `docs/devops/2026-03-08-wsl-next-localhost-guardrails.md`
- `docs/plans/2026-03-08-wsl-next-localhost-hardening.md`
- `projects/meeting-action-tracker/README.md`
- `projects/meeting-action-tracker/package.json`
- `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/SKILL.md`
- `/home/dd/.agents/skills/devops/wsl-next-localhost-guardrails/references/diagnostic-commands.md`
- `/home/dd/.agents/skills/INDEX.md`
- `/home/dd/.agents/skills/SKILL_LOOKUP_PRIORITY.md`
- `/home/dd/.agents/skills/Business_Skills_Index.md`
- `/home/dd/.agents/skills/dist/wsl-next-localhost-guardrails.skill`

---

**Security Reminder**: Before finalizing, run `validate_handoff.py` to check for accidental secret exposure.
