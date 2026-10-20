---
name: ux-audit
description: Audit UI designs (Figma frames, screenshots, HTML mockups, or live builds) against a UX checklist, frame by frame and across frames, and produce a severity-ranked findings report. Use when asked to audit, review, critique, or check screens, a flow, or a Figma file for UX issues, or to re-audit after fixes.
---

# UX Audit

Audit designs in two passes (per frame, then across frames) against `checklist.md`, and report only the problems found, ranked by severity.

## 1. Context

Collect these before auditing. Ask in one short message only for what is missing:

- **Product & user:** what the product is and who the primary user is
- **Flow:** which flow or section is being audited
- **Platform:** web, mobile, or both
- **Direction:** LTR, RTL (Arabic), or both

## 2. Scope

Pick the scope from the input, and tell the user which one you chose in one line:

| Scope | When | Checklist sections |
|---|---|---|
| **Screens** | Isolated frames or screenshots | Sections tagged `[screen]` |
| **Flow** | A connected sequence of frames | `[screen]` + `[flow]` |
| **Live build** | A running URL or app | All sections, including `[live]` |

Skip sections outside the scope. Do not report them as N/A.

## 3. Collect frames

**Figma (when the Figma MCP tools are available):**
1. `get_metadata` on the given node to list its frames.
2. If there are more than 20 frames, ask which section or flow to audit first.
3. `get_screenshot` for each frame to see it.
4. `get_design_context` when exact values matter (sizes, spacing, colors, text styles).
5. `get_variable_defs` to see the defined tokens, so off-token values can be flagged.

**Screenshots:** read each image. Keep the order the user gave as the flow order.

**HTML mockups:** read the file. If a browser tool is available, open it and check at mobile and desktop widths.

Name each frame consistently (Figma frame name, or `Screen 1`, `Screen 2`, ...). For Figma frames, record each frame's link (with its `node-id`) in the report, so the frames can be found again for a re-audit or the `ux-doc` skill.

Before fixing, suggest once that the user duplicate the audited frames to an **"Audit – before"** page, so before/after comparisons stay possible.

## 4. Pass 1: Frame by frame

For each frame, go through the `[screen]` items in `checklist.md`: contrast, hierarchy, touch targets, states, microcopy, alignment, RTL mirroring, and data density.

Record findings under the frame they belong to.

## 5. Pass 2: Across frames

Compare all frames together for:

- **Consistency:** typography, colors, spacing, icons, and components used the same way for the same purpose
- **Navigation:** the same patterns and labels from screen to screen
- **Flow** (Flow scope only): friction points, dead ends, missing steps, and error recovery paths
- **Missing screens:** expected states or steps with no frame (empty, error, confirmation, success)

Record these as cross-frame findings. Do not repeat them under each frame.

## 6. Severity

- **Critical:** blocks the task, causes data loss or a wrong action, or fails accessibility for a whole group of users
- **Major:** causes confusion, errors, or noticeable slowdown, or breaks consistency in a way users will notice
- **Minor:** polish, small inconsistency, or low-impact improvement

## 7. Rules

- Report only issues. Summarize what passed in one or two lines.
- Every finding must point to a specific element and give evidence (a value, a label, a comparison with another frame).
- Use the measurable criteria in `checklist.md` (for example, contrast ratio or target size), not impressions.
- If something cannot be verified from the input (for example, screen reader behavior from a static frame), list it under **Needs verification** instead of guessing.
- Fixes must be concrete ("Increase to 44×44px", "Use the Primary/600 token"), not generic advice.
- Write findings in the user's language, and keep each one short.

## 8. Report

Save the report as `ux-audit-<flow-name>-<YYYY-MM-DD>.md` in the current directory, then give a short summary in chat: counts by severity and the top three issues.

```markdown
# UX Audit: <Product> / <Flow>
**Date:** <date> · **Scope:** <Screens | Flow | Live build> · **Frames:** <n> · **Direction:** <LTR | RTL | both>

## Summary
- Critical: <n> · Major: <n> · Minor: <n>
- Top issues: <one line each, max 3>
- Passed: <one or two lines on what works well>

## Cross-frame issues
| # | Severity | Issue | Where | Fix |
|---|---|---|---|---|
| C1 | Major | ... | Frames 2, 5 | ... |

## Per-frame issues
### <Frame name> ([Figma](<frame link>))
| # | Severity | Issue | Element | Fix |
|---|---|---|---|---|
| F1.1 | Critical | ... | ... | ... |

## Needs verification
- <item that cannot be confirmed from the input, and how to check it>
```

Order rows by severity (Critical first). Omit a frame's section if it has no issues.

## 9. Re-audit

If the user asks to re-audit, or a previous `ux-audit-*.md` report for the same flow exists:

1. Read the previous report.
2. Check each previous finding and mark it **Fixed**, **Still open**, or **Regressed**.
3. Then run both passes again for new issues only.
4. Save a new dated report with a **Previous findings** table at the top.
