# ux-flow

A Claude skill that turns one Figma flow link into a developer handoff guide.

Paste a Figma flow link (or screenshots). Claude measures the screens, audits them, and adds them to **one visual guide per product**: a **General** tab with the shared design system, plus **one tab per flow**.

## What each flow gets

- **Notes**: a few lines about the flow, plus the design link
- **User flow**: a diagram of every path, with each step marked Linked, Not linked, Not designed, or Open question
- **Layout spacing**: to-scale diagrams of padding, gaps, sizes and radius
- **Build specs**: responsive rules, components and states, what each click does, data formats
- **Before / after**: every approved Figma change, with before → after values and links
- **Decisions**: what was decided and when
- **Audit**: UX issues by severity, every run

## How it behaves

- Runs the whole pipeline on every link, including the audit, without being asked.
- **Asks, doesn't assume.** Every open question is put to you before the run ends.
- **Asks before changing Figma.** It lists each change and edits only what you approve. It only edits files you allow.
- No screenshots, no per-screen descriptions, nothing to download. The output is a single shareable HTML guide.
- Applies your feedback to the skill itself, so every note sticks.

## Install

1. Download [`ux-flow.zip`](ux-flow.zip) from this repo (click it, then **Download raw file**).
2. In Claude, open your skills settings and upload `ux-flow.zip` as a custom skill.
3. Connect Figma in Claude's connectors (needed for links; screenshots work without it).
4. Paste a Figma flow link, or say `run ux-flow`.

## What's inside

```
ux-flow/
├── SKILL.md                 # the pipeline and rules
├── references/
│   ├── guide.md             # guide tabs, chapters, writing rules
│   ├── ux-audit/            # audit instructions and checklist
│   └── ux-doc/              # before / after templates
├── scripts/
│   ├── snapshot.js          # copies the flow to "Audit – before"
│   ├── measure.js           # variables, styles, layout, off-token values
│   ├── dev-extras.js        # components, prototype links, data formats
│   ├── audit-measure.js     # audit evidence
│   ├── diff.js              # before vs current on re-runs
│   ├── anatomy.py           # to-scale spacing diagrams
│   └── userflow.py          # user flow diagrams
└── assets/
    └── guide-template.html  # starting guide page
```

Made by Sally.
