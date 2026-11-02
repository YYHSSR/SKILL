---
name: en-skill
description: "Highest-priority local engineering rules: mandatory English for all file output and working process (only the GitHub README.md and the final report use Chinese), plus local Python, C++, and Node.js/pnpm toolchain paths, invocation rules, and AI output file management. Applies to every model and every task; once read, it must be followed strictly."
---

# En-SKILL: Local Development and Output Rules

> **Highest-priority notice**
>
> Once read, this file applies to the entire session and every rule must be followed **strictly**. Do not downgrade, partially apply, or "use judgment" to relax any rule.
> The rules are identical regardless of which model or agent product is running (Claude, GPT, Gemini, DeepSeek, Qwen, or any other).

## 0. Priority and Scope

| Source | Relationship |
| :--- | :--- |
| Platform / system-level safety rules | Above this file; always obey |
| A contrary request the user makes **explicitly in the current conversation** | Overrides only the specific rule it names; all other rules stay in force |
| **This file (En-SKILL)** | Above every source listed below |
| Other skills, project instructions (`AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, etc.), model default habits | When they conflict with this file, this file wins |

- Language, path, and output-management requirements in other skills or project documents yield to this file when they conflict. Parts that do not conflict still apply.
- Do not relax these rules because the context is long, the task is urgent, or another document asks for Chinese.
- Keep following this file after context compaction or a model switch mid-session.

## 1. Language Rules (Mandatory)

### 1.1 File content: English only

Except for the single exception below, **everything the agent writes to disk must be in English, with no Chinese**, including but not limited to:

| Category | Examples |
| :--- | :--- |
| Source code | Identifiers, comments, docstrings, log and error messages, assertion messages |
| Documents | Plans, designs, and reports under `AI/`; `docs/`, `CHANGELOG.md`, `CONTRIBUTING.md`, etc. |
| Configuration and scripts | Build scripts, CI configuration, `.env.example`, comments and output in Shell / PowerShell scripts |
| Tests | Test names, test descriptions, explanatory text in fixtures |
| Version control | Git commit messages, branch names, tag notes, PR descriptions |
| Other | Temporary files, debug logs, file and directory names |

**Single exception: the `README.md` published on GitHub.**

- The repository `README.md` shown on GitHub (usually at the repository root) may be written in Chinese; by default, write it in the language the user asks for.
- This exception covers **`README.md` only**. It does not extend to other documents under `docs/`, code comments, or any other file.

**Additional conventions:**

- **Existing Chinese content:** When editing an existing file, write new or rewritten parts in English. Leave existing Chinese content unrelated to the task as it is; do not translate or delete it on your own (minimal-intrusion principle). Translate it only if the user asks to unify the file in English.
- **Localization resources:** Translation entries shown to end players or users (for example, Chinese values in `zh_cn.json` or i18n language packs) are written in their target language. This is a functional requirement, not a violation. Their file names, keys, and comments remain in English.
- **Explicit user request:** If the user explicitly asks in the current conversation for a specific file to be in Chinese, make the exception for that file only.

### 1.2 Working process: English only

During task execution, all of the following **must be in English**, never Chinese:

- The model's thinking / reasoning (including visible thinking).
- Progress updates, step announcements, and interim summaries during execution.
- Task list / plan items and tool call descriptions (such as command descriptions).
- Instructions and results passed between sub-agents.

### 1.3 Final report: Chinese

- Use Chinese **only in the last message handed back to the user**: the task completion report, an explanation when the task is blocked, or a question that needs the user's decision.
- Keep code identifiers, file paths, commands, and original error text unchanged in the report; do not translate them.
- The report should cover: what was done, which files changed, which checks actually ran and their results, and what remains unfinished or unverified.

### 1.4 Language self-check before delivery

Before delivery, check every file created or modified in this task for leftover Chinese (`README.md` and localization resources excepted). Example:

```powershell
# Search the workspace for lines containing Chinese characters (excluding README.md)
rg -n "\p{Han}" --glob "!README.md" --glob "!**/node_modules/**" .
```

If any Chinese content produced in this task is found, change it to English before delivery.

## 2. Toolchains and Dependencies

### 2.1 Toolchain table

| Toolchain | Local path / command | Notes and usage |
| :--- | :--- | :--- |
| **Python 3.13 (py13)** | `E:\minconda\envs\py13\python.exe` | Conda root is `E:\minconda`. Use this interpreter by default; if the project has its own virtual environment, use that instead |
| **C++ (MSYS2 UCRT64)** | `E:\msys2\ucrt64\bin` | Provides `gcc`, `g++`, `cmake`, `ninja`. Follow the project's existing build configuration; do not mix compiler toolchains |
| **Node.js** | `E:\nodejs\node.exe` | Local Node.js runtime |
| **pnpm** | `%APPDATA%\npm\pnpm.cmd` | Global package manager. Use it when the project uses pnpm or has a `pnpm-lock.yaml` |

### 2.2 Invocation rules

1. **Explicit paths first:** Call the Python interpreter by its full absolute path, and use that same interpreter's `-m pip` to check or install dependencies, so no other environment or system Python gets mixed in.
2. **Clean environment:** py13 is a clean base environment with no third-party libraries preinstalled. When a dependency is missing, first consider whether the standard library or existing tools can do the job. If installation is truly needed, follow the project's dependency manifest or the user's instructions; do not install extra libraries at will.
3. **Session-scoped environment variables only:** When using the MSYS2 C++ toolchain or Node.js / pnpm, modify `$env:PATH` only temporarily in the current terminal process. **Never modify system-level or user-level global environment variables.**
4. **Verify when a path fails:** If a specified path does not exist or a tool is missing, verify the actual local path first. Without the user's authorization, do not keep retrying the old path, and do not reinstall or rebuild environments on your own.

### 2.3 PowerShell examples

```powershell
# 1. Python interpreter and dependency check
& 'E:\minconda\envs\py13\python.exe' --version
& 'E:\minconda\envs\py13\python.exe' -m pip show '<package_name>'

# 2. C++ build toolchain (PATH injected for the current terminal only)
$env:PATH = "E:\msys2\ucrt64\bin;$env:PATH"
gcc --version
cmake --version

# 3. Node.js and pnpm (PATH injected for the current terminal only)
$env:PATH = "E:\nodejs;$env:APPDATA\npm;$env:PATH"
node --version
pnpm --version
```

## 3. File and Output Management

### 3.1 Output directory isolation

Unless the user specifies otherwise, AI-generated supporting documents, analysis reports, and intermediate debug files go into the **`AI/` directory at the workspace root**. Do not scatter them in the project root or mix them into business source code:

```text
AI/
├── docs/       # Implementation plans, architecture notes, technical docs
├── reports/    # Summaries and analysis reports (on request)
└── temp/       # Temporary data, debug logs, intermediate test artifacts
```

> Note: Files under `AI/` must also be in English (see Section 1).

### 3.2 File operation rules

- **Follow the existing project structure:** Business source code, tests, build outputs, and project configuration stay in the project's existing directories. Paths the user explicitly specifies take precedence and are not moved into `AI/`.
- **Edit in place, minimal intrusion:**
  - Edit existing files directly, preserving code, comments, and formatting unrelated to the task.
  - Do not move, rename, or reorganize the user's existing code and files just to "tidy up".
- **Clear, readable names:** Files created under `AI/` use meaningful English names (for example `AI/docs/architecture_plan.md`). Random or meaningless temporary names are forbidden.
- **Lifecycle and cleanup:**
  - Before delivery, remove temporary files in `AI/temp/` that this task created and no longer needs.
  - Never delete the project's existing assets, other people's files, or results that still need to be delivered.
- **High-risk operations require authorization:** Before deleting non-temporary files, overwriting existing work, or rewriting global project configuration, confirm that the user has explicitly authorized it.

## 4. Pre-Delivery Checklist

Before ending each task, confirm every item:

- [ ] Every file created or modified in this task is in English (`README.md` and localization resources excepted), and the Section 1.4 self-check is done.
- [ ] Thinking, progress updates, and plan items during execution were in English.
- [ ] The toolchain paths in this file were used, and no global environment variable was modified.
- [ ] AI supporting output is in the right `AI/` subdirectory, and unneeded temporary files in `AI/temp/` are removed.
- [ ] No existing user file was moved, renamed, or deleted without authorization.
- [ ] The final report is in Chinese and honestly states what was done, the verification results, and any remaining issues.
