---
name: ux-doc
description: Turn UX audit and re-audit reports, Figma designs, and a prototype into project documentation (decisions, before/after, results, open items), or into a portfolio case study with "portfolio". Use when asked to document design work, write up an audit, record design decisions, or make a case study after an audit or prototype.
---

# UX Doc

Turn work that already exists (audit reports, Figma frames, prototype) into documentation. Never invent decisions, reasons, research, or metrics. Anything missing is marked for the user to fill in.

## Modes

- **`/ux-doc`** — team documentation for devs, PMs, and stakeholders
- **`/ux-doc portfolio`** — the same material rewritten as a portfolio case study

## 1. Gather inputs

Look in the current folder first, then ask in **one short message** only for what is missing:

| Input | Where | Required |
|---|---|---|
| Audit report | `ux-audit-*.md` in the current folder (use the oldest for the flow) | Yes |
| Re-audit report | the newest `ux-audit-*.md` for the same flow, with a **Previous findings** table | No |
| Final design | Figma link to the updated frames | Yes |
| "Before" design | Figma page or file with the original frames, version history link, or a screenshots folder | Yes, for before/after |
| Prototype | Figma prototype link (or other URL) | No |
| Notes | test feedback, constraints, reasons for skipping fixes | No |

If several audit reports exist for different flows, ask which flow to document.

**Before frames:** frames are usually edited in place, so the original may no longer exist. If the user has no "before" source, say so once, then continue and mark each before image as `[add before screenshot]`. Suggest for next time: duplicate the frames to an **"Audit – before"** page before fixing.

## 2. Read and match

1. From the audit report, list every finding: ID, severity, issue, where, fix.
2. From the re-audit report (if any), take each finding's status: **Fixed**, **Still open**, or **Regressed**. Without a re-audit, ask the user which findings were addressed, or check the final frames yourself against each finding and mark them **Fixed (checked)** or **Not fixed (checked)**.
3. Match each finding to its frame in the before and final designs by frame name. If a frame was renamed or merged, ask rather than guess.

## 3. Collect visuals

**Figma (when the Figma MCP tools are available):**
- `get_metadata` to find the frames by name.
- `get_screenshot` on the before and final frame for each fixed finding, to see the change.
- Save images to `./ux-doc-assets/` if the tools return them as files; otherwise link each frame by its Figma URL (with `node-id`) and mark `[add screenshot]`.

Only include before/after pairs for **Critical and Major** fixes, plus Minor fixes the user calls out. Group Minor fixes into one line each.

## 4. Write the decisions

For each fixed finding:

- **Finding:** the problem, in one line, with its severity
- **Change:** what was done in the design, specific (component, value, label)
- **Why:** the reason this solution was chosen

**Rules for "Why":**
- Use the user's notes, the audit's evidence, or the checklist criterion it now meets (for example, "now meets 4.5:1 contrast").
- If the reason for choosing *this* solution over others is not stated anywhere, write `[Why this solution? — add reason]`. Do not write a plausible-sounding reason.

Group related findings into one decision when one change fixed several (for example, one new button component fixing three consistency findings).

## 5. Calculate results

From the reports only:
- Total findings, by severity
- Fixed, still open, regressed
- Critical remaining

Write it as one line, for example: **15 issues found · 12 fixed · 0 critical remaining**.

Do not add numbers that are not in the reports or the user's notes (task time, satisfaction, conversion). If the user shares test results, include them and say where they came from.

## 6. Write the document

Use the matching template in `templates.md`:
- `/ux-doc` → **Team doc**
- `/ux-doc portfolio` → **Portfolio case study**

Save as:
- `ux-doc-<flow-name>-<YYYY-MM-DD>.md`
- `ux-case-study-<flow-name>-<YYYY-MM-DD>.md` (portfolio)

Then reply in chat with: the file name, the results line, and a list of every `[...]` placeholder left for the user to fill.

## 7. Portfolio mode rules

- Anonymize the client and product if the user asks, or ask once if it is unclear whether the work is confidential.
- Lead with the user problem and the outcome, not the process.
- Captions under images state **the value to the user**, not what is on the screen.
  - ✗ "The new table with sorting and a status column."
  - ✓ "Managers find late employees in seconds instead of scanning the whole list."
- Keep it short: 3–5 key decisions, the strongest before/after pairs only.
- Make the user's own role and judgment visible: what they found, what they decided, what they chose not to do.

## 8. Writing style

- Short sentences, plain language, no filler.
- Write in the language the user writes in. For Arabic products, keep UI labels in their original language and add a translation in parentheses when the doc is in English.
