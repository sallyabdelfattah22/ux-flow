---
name: ux-flow
description: One-link UX handoff for any design source — a Figma flow, screenshots, or a prototype or app built with an AI tool (a live URL or its code), with no Figma needed. Every run, without being asked, it measures the frames, audits them with the ux-audit checklist, and updates ONE visual developer guide per product (a published HTML page) plus its developer .md (the same content as Markdown, user flows as Mermaid) — a General tab with the shared design system (spacing, type, radius, grid, shell, component sizes, tokens, system issues) plus one tab per flow (notes, user flow diagram, to-scale layout spacing, responsive rules, components and states, clicks, data formats, before/after, decisions, audit). A later run with the same link updates that flow's tab. Use this whenever the user pastes a Figma flow, section or frame link, screenshots, or a link to (or the code of) an AI-built prototype or app and wants it documented, audited or handed off, even with no instructions, or says "run ux-flow", "full pass", "re-run on this flow", or "what changed".
---

# UX Flow

One Figma link in, **one visual guide per product out**: a published HTML page (Artifact) titled `<Product> Guide`, with a **General** tab first and **one tab per flow**. Everything lives in it — no Claude Doc, no token files, no separate report, no screenshots. **Plus one developer .md** (`<product>-handoff.md`): the same content as Markdown for repos and AI coding tools, written from the guide by `scripts/guide2md.py` on every run, so the two never disagree.

Run the whole pipeline on every link without asking what to produce: snapshot (first run of a flow), measure, audit, update the guide. Ask only for missing context (step 0) or scope when a section holds more than 20 frames. Skip a part only when the user says so ("no audit").

## Standing rule: feedback updates the skill

Whenever the user gives a note about what the guide or the process should be (add, remove, change, "always", "don't"), apply it to the current guide **and** write it into this skill in the same turn: edit `SKILL.md` and/or `references/guide.md`, re-zip the skill, and refresh the share page if there is one. Say in one line that the skill was updated. Never leave a note only in the conversation.

## The guide

**One guide per product** (TeamSmart, Attendance App …), found by memory or the user's artifact list. A flow from the same product is added as a new tab to the existing guide (same URL), even when it comes from a different Figma file. A flow from another product starts that product's guide. Keep one product per guide.

| Tab | Holds |
|---|---|
| **General** (first) | Foundations rules · standard app shell · spacing scale, semantic spacing and common containers (to-scale diagrams) · radius · typography · grid and breakpoints · component sizes · CSS tokens · design system issues found across flows |
| **One tab per flow** | Notes · **user flow** · layout spacing (to-scale diagrams of that flow's containers) · app shell deviations · responsive rules specific to the flow · component map and states · what each click does · data formats · before / after · decisions · audit |

Shared values live only in General; a flow tab records only what is specific or different. Anything that affects every screen (duplicate components, stray fonts, off-token values, color sources) goes in General → Design system issues, not in a flow's audit.

## Writing rules (from the user's notes)

- **Documentation, not description.** Developers have the design link: no per-screen descriptions. Each flow gets a short **Notes** entry (4–7 one-line notes + the design link).
- **Every flow gets a user flow.** A diagram from `scripts/userflow.py`: entry → screens, modals and system checks → exits, each arrow labeled with the trigger and marked Linked (prototype) / Not linked / Open question. Steps the flow needs but the design lacks are drawn as *Not designed* boxes.
- **Ask, don't assume.** Any open question — an unclear path, a value drawn two ways, a missing screen, an ambiguous rule — is asked with `AskUserQuestion` before the run ends, never filled in with a guess. Until answered it stays *Needs decision* in the guide (dashed red `?` arrow in the user flow). A recommendation may be offered as the first option, but is never written as decided.
- **Ask before changing Figma.** Never edit the design on your own. Before any change, list exactly what will change (finding or decision, frames, before → after value) and ask with `AskUserQuestion` (multi-select, one option per change group). Change only what was approved. Right after, update the flow's **Before / after** chapter and republish.
- **Edit only the files the user allows.** When the user names a file as off-limits (or names the only file to edit), never write to the other files, not even the snapshot; their fixes stay *Proposed* in the guide, and Before / after says the file is read-only. If such a file was already edited, offer to revert it exactly.
- **Spacing is visualized.** Every repeated container gets a to-scale diagram (`scripts/anatomy.py`): padding, gaps, sizes, radius, with token chips.
- **No screenshots or images** in the guide. Screenshots are taken only so Claude can see the screens; never published.
- **Two outputs, nothing else.** The guide and its .md. Tokens are a CSS block with a Copy button; the .md is embedded in the guide (View .md panel with Copy, and Save .md through the `downloads` capability), published beside it and sent to the user as a file.
- **Audit always included**, in each flow's Audit chapter.
- Visuals and tables over prose; one-line answers; no intros or conclusions. Status pills: In Figma · Proposed · Needs decision · Decided D-00x. Never present a proposal as a measurement; never round a measured value.

## 0. Read the link and the context

1. **Source.** Figma link → take `fileKey` and `node-id` (no `node-id` → list pages and ask which flow). Screenshots, or a prototype or app made with an AI tool (a live URL, an artifact, or its code) → see *Other sources* below. Never assume the design lives in Figma.
2. **Product** from the frames (sidebar logo, header) or memory; **flow name** from the section or frame.
3. **Scope.** List the node's children with a small `use_figma` read (not `get_metadata`, which overflows). More than 20 frames → ask once which part (`AskUserQuestion`, recommended first) and pass those frame IDs to the scripts.
4. **Context** for the audit (user, platform, direction): ask only for what is missing.
5. **Mode.** Find the product's guide and this flow's **Audit – before** snapshot. No guide → create it. No tab for this flow → add it. Tab exists → follow-up run (step 7).

Figma rules: load `figma-use` before any `use_figma` call; the snapshot writes, so also load `figma-generate-design` and pass both in `skillNames`. Switch pages at most once per call. Results are capped at 48 KB: keep reads compact.

**Other sources (no Figma).** The guide, the .md, the audit and every rule above stay the same; only measuring and the baseline change.
- **Screenshots**: read each image, mark values `~approx`, no snapshot.
- **A prototype or app built with an AI tool** (live URL, artifact, or code in a repo): open it with Playwright (or the browser tools) at 1440, 1024, 768 and 390 wide, and read real values with `getComputedStyle`: padding, gap, size, radius, font family / size / weight / line-height, colors, and the CSS custom properties (tokens) they use. Routes, links and buttons give the user flow; each state you can reach gives the states matrix. Take screenshots only to look and audit, never to publish. With the code, read tokens and components from it (CSS variables, Tailwind config, component props) and link files instead of Figma frames.
- **Baseline** for a later run: a JSON of the measured values saved next to the guide's build (or the commit hash), instead of an "Audit – before" page.
- **Changes**: the same ask-first rule, applied to the code or the AI tool's project instead of Figma; Before / after links the commit or the changed file.

## 1. Snapshot (first run of a flow)

`scripts/snapshot.js` copies the flow to **Audit – before** in its own file, so there is a before for every later change. It only adds a page and never touches the design, so it runs without asking (unless the file is off-limits); say so in one line. Every other write to Figma needs the user's go-ahead (step 6).

## 2. Measure

- `scripts/measure.js`: variables, styles, layout trees, off-token values.
- `scripts/dev-extras.js`: components with variants and props, prototype links, sample values by kind. `get_code_connect_map` on one frame: mappings → their names; none → *Proposed*.
- Containers for the diagrams: padding, gap, size and radius of every card, row, tile, bar, block, modal and shell (small targeted reads).
- **Look at each screen** with `get_screenshot` (`enableBase64Response: true`) for notes and the audit; don't save or publish the images.

List inconsistencies (same role drawn two ways, off-token values, stray fonts, text under 12px, conflicting data, two shells) and gaps in the journey (unlinked or missing destinations, missing states). They become open questions (Q1…). Don't resolve any of them by assumption.

**User flow.** From the prototype links (`dev-extras.js` navigation), screen names and buttons, map entry → steps → exits. A destination that only the design implies (a button with no link) is *Not linked*; one that nothing shows is an *Open question*.

## 3. Audit (every run)

Follow the audit instructions and checklist exactly: the user's `ux-audit` skill if installed, otherwise `references/ux-audit/`. Evidence from `scripts/audit-measure.js`; use measured numbers.

## 4. Update the guide

Follow `references/guide.md`. New guide: start from `assets/guide-template.html`. Existing guide: Artifact `read` it, keep everything, update General with anything new or shared, and add or update this flow's tab. Look once at desktop and phone width (no horizontal scroll). Then run `python3 scripts/guide2md.py <guide.html> <product>-handoff.md` and publish the guide to the **same URL** with the .md in `files` and `capabilities: {downloads: true}`; send the .md with SendUserFile.

## 5. Decisions

Open questions go in the flow's Decisions chapter (system-wide ones in General → Design system issues). **Always ask them** — don't offer, don't assume: `AskUserQuestion`, up to 4 per call, recommended option first, newest flow first, until all are answered or the user stops. Answers become D-00x cards and flip the matching values, user-flow arrows and findings to Decided; republish. If the user isn't there, publish with them as *Needs decision* and ask at the start of the next reply.

## 6. Hand off

Three lines at most: what changed in the guide, finding counts with the top issue, decisions taken.

**Changes in Figma: ask first, log after.**
1. Build the change list from approved decisions and open findings: what changes, on which frames, before → after value.
2. Ask with `AskUserQuestion` (multi-select, one option per change group, safest first). Nothing in Figma changes without a yes; a "no" or no answer leaves the design untouched.
3. Change only what was approved: original frames only (never the Audit – before copy), existing variables and styles, note library overrides. Check each change with a screenshot.
4. Right after, update the flow's **Before / after**: one card per change with the before → after values, Where | Why (finding or D-00x) | Dev impact, and Figma links to the snapshot frame and the changed frame. Move fixed findings to Fixed, flip the matching values in the guide (layout, formats, user flow), and republish to the same URL.

Save a memory note when the memory rules allow: product, guide URL, flows with their nodes and snapshot nodes.

## 7. Follow-up run (same link again)

1. `scripts/diff.js` (snapshot vs current).
2. Re-audit: previous findings Fixed / Still open / Regressed, then new issues only.
3. Update the flow's tab (before / after, notes, user flow, diagrams, values, audit) and General if shared values changed, then regenerate the .md. A change with no decision or finding gets "Why: to confirm". Republish to the same URL.
4. Reply with what changed and anything to confirm.

## Files in this skill

- `scripts/snapshot.js`, `scripts/measure.js`, `scripts/dev-extras.js`, `scripts/audit-measure.js`, `scripts/diff.js` — `use_figma` code; replace the `__PLACEHOLDERS__`
- `scripts/anatomy.py` — to-scale spacing diagrams for the Layout spacing chapters
- `scripts/userflow.py` — user flow diagrams for the User flow chapters (also stores them as JSON for the .md)
- `scripts/guide2md.py` — writes the developer .md from the guide (tables, decisions, Mermaid user flows)
- `references/guide.md` — tabs, chapters, switcher, writing rules
- `references/ux-audit/` — bundled audit instructions and checklist
- `references/ux-doc/` — before / after write-up templates
- `assets/guide-template.html` — a working one-flow guide to start from
