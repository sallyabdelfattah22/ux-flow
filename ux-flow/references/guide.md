# Visual guide: tabs, chapters and rules

Developers search the guide ("modal padding", "timeline block", "breakpoints"), read a one-line answer, and copy a token. Build for that.

## Start and keep

- **New guide**: copy `assets/guide-template.html`; keep its machinery (search with keyboard navigation, contents with active section, copy buttons, both themes). Replace the `:root` tokens with the product's own colors and font, the brand mark and the title (`<Product> Guide`).
- **Existing guide**: Artifact `read` it, keep everything, change only General (shared values) and this flow's tab. Same URL, same title.
- No images: no screenshots, crops or image files anywhere. Link frames in Figma.
- Tokens are a CSS block with a Copy button. The only file offered is the developer .md: a link in the intro (`<product>-handoff.md`, published beside the page) plus a Save .md button that calls `claude.use("downloads")` and stays hidden when that is unavailable.

## Tabs

- Intro: eyebrow (product · number of flows · updated date), one-line lede, then the **tab switcher**: General first, then one button per flow (flow name + screen count · finding count), `role="tab"`, `aria-selected`.
- Under it, one source line per tab (`data-for="<tab>"`): Figma link, counts, owner.
- Each tab's chapters sit in `<div class="flow" data-flow="<slug>">` (`gen` for General); only the selected one is visible (`hidden` + `[hidden]{display:none!important}`).
- IDs are unique across tabs: prefix per flow (`d-layout`, `d-audit`); General uses `g-` plus the template's own IDs (`spacing-scale`, `semantic-spacing`, `type-scale`, `css-vars`) because the template script fills them.
- Script after the template's: number chapters per tab, show only the selected tab's contents entries and renumber them, open the tab named in `location.hash` (or holding the hashed ID), handle `hashchange`, and switch tabs when a search hit is in another tab (`__flowFor(el)` inside the template's `go()`).

## General tab chapters

1. **Foundations** — rules for every screen: font, base grid, minimum text, touch targets, theme, number alignment.
2. **App shell** — the standard shell drawn to scale. Note flows that deviate.
3. **Spacing** — spacing scale (bars), semantic tokens, to-scale diagrams of common containers (card, modal, input, tile).
4. **Radius** — Token | px | Use.
5. **Typography** — text-style specimen with breakpoint modes.
6. **Grid and breakpoints** — Breakpoint | Width | Cols | Gutter | Margin | Font mode | Shell, plus mini wireframes. Proposed when no frames exist.
7. **Component sizes** — Component | Size | Padding | Radius.
8. **Tokens** — CSS custom properties (colors as rendered in the default mode).
9. **Design system issues** — # | Severity | Issue | Fix, for problems that affect every flow.

## Flow tab chapters (include a chapter only if the flow has content for it)

1. **Notes** — 4–7 one-line notes (what the flow covers, key states, rules, what's out of scope) + design link. No per-screen descriptions.
2. **User flow** — one diagram per journey from `scripts/userflow.py` (`uflow(nodes, edges)`): entry pill, screens, modals, diamond checks, exits; arrows labeled with the trigger (1–2 words). Solid = prototype-linked, dashed = not linked, red dashed `?` = open question; red dashed box = step not designed. One-line answer above (path in arrows + counts of unlinked / missing), legend below. Lay the happy path on one row, branches above and below, no arrow through a box.
3. **Layout spacing** — one entry per repeated container of this flow, each a to-scale SVG from `scripts/anatomy.py` (`anat(W, H, pad, direction, gap, items, r)`), a one-line answer with the numbers above, token chips below, legend at the end. Measured values only.
4. **App shell** — only when this flow deviates from General's shell.
5. **Responsive** — rules specific to this flow (how its tables, timelines or panels behave per breakpoint).
6. **Components** — Figma | Code | Props | Uses, then the ✓ / — states matrix and screen states.
7. **Behavior** — Screen | Element | Trigger | Goes to | Prototype (Linked / Not linked / No destination).
8. **Data formats** — Data | In Figma | Format | Note.
9. **Before / after** — updated right after every approved Figma change (changes are asked for first, never made on Claude's own); one card per change: severity badge, before → after values, Where | Why | Dev impact, links to the snapshot and changed frame. First run: a baseline card.
10. **Decisions** — decided cards, then open-question cards. Every open question is asked (`AskUserQuestion`), never assumed; cards show the options and a recommendation, not an answer.
11. **Audit** — severity tiles (Critical · Major · Minor · Fixed), what passed, open findings (# | Severity | Issue | Where | Fix), Fixed table, Needs verification.

## Status pills

| Pill | Class | Meaning |
|---|---|---|
| In Figma | `st-fig` | Measured, or defined as a variable |
| Proposed | `st-pro` | Not in Figma yet |
| Needs decision | `st-dec` | Drawn two ways, off-token, or missing |
| Decided · D-00x | `st-ok` | Agreed |

## Writing rules

- Lead with the answer and its numbers; name the token next to the value.
- One line per note; no paragraph longer than two lines.
- Never round a measured value; flag it.
- Link frames in Figma instead of describing them.
- Don't assume: anything unclear is an open question, asked, and shown as Needs decision until answered.
