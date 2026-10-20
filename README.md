# ux-flow

A Claude skill that turns one design link into a developer handoff guide: a Figma flow, screenshots, or a prototype or app built with an AI tool.

Paste a Figma flow link, screenshots, or a link to a prototype built with an AI tool (no Figma needed). Claude measures the screens, audits them, and adds them to **one visual guide per product**: a **General** tab with the shared design system, plus **one tab per flow**. It also writes a **developer .md** with the same content as Markdown (user flows as Mermaid), ready for repos and AI coding tools.

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
- No screenshots and no per-screen descriptions. Two outputs: a shareable HTML guide and its developer .md.
- Applies your feedback to the skill itself, so every note sticks.

## Audit checklist

Every run audits the design against the same checklist: **79 checks in 15 areas**. Each finding is rated Critical, Major or Minor and comes with a fix. The same list is in [AUDIT-CHECKLIST.md](AUDIT-CHECKLIST.md).

### How findings are rated

| Severity | Meaning |
|---|---|
| **Critical** | Blocks the task, causes data loss or a wrong action, or fails accessibility for a whole group of users |
| **Major** | Causes confusion, errors or a noticeable slowdown, or breaks consistency in a way users will notice |
| **Minor** | Polish, a small inconsistency, or a low-impact improvement |

Every finding comes with the measured value, where it is in the design, and the fix. Issues that affect every flow (duplicate components, stray fonts, off-token values) go to the guide's **General** tab instead of one flow's audit.

### What each check needs

| Tag | Checked from |
|---|---|
| `[screen]` | A single screen or frame |
| `[flow]` | A sequence of screens |
| `[live]` | A running build: skipped on a Figma file or screenshots, checked on an AI-built prototype or live app |

### Areas

| Area | Checks |
|---|---|
| User Journey | 4 |
| Accessibility | 7 |
| Visual Consistency | 5 |
| Visual Hierarchy | 4 |
| Responsiveness | 4 |
| Interactive Elements | 6 |
| States | 6 |
| Content Clarity | 5 |
| Information Organization | 5 |
| Enterprise Data | 6 |
| RTL / Arabic | 7 |
| Performance & Technical | 4 |
| Error Handling | 4 |
| User Feedback & Engagement | 6 |
| Compliance & Security | 6 |
| **Total** | **79** |


### User Experience

#### User Journey `[flow]`
- All key user flows are identified and complete (no dead ends or missing steps)
- Friction points: unnecessary steps, repeated input, unclear next action
- Navigation is clear and predictable
- Experience is consistent across pages and screens

#### Accessibility `[screen]`
- Text contrast is at least 4.5:1 for body text and 3:1 for large text (18px+, or 14px+ bold)
- UI components and icons have at least 3:1 contrast against their background
- Color is never the only way information is shown (status, errors, required fields)
- Body text is at least 14px on mobile and 14–16px on web; Arabic text is not smaller than its Latin equivalent
- Images and icons that carry meaning have a text label or alt text
- Keyboard focus states are visible `[live]`
- Logical keyboard and screen reader order `[live]`

### Visual Design

#### Visual Consistency `[screen]` `[flow]`
- Colors, type, and spacing use design system tokens and components
- Typography uses a consistent type scale
- Color palette is used with a consistent meaning (for example, primary, danger, success)
- Icons share one style, weight, and size set
- Whitespace and layout are balanced, on a consistent spacing scale

#### Visual Hierarchy `[screen]`
- The most important element or action on the screen is the most prominent
- One clear primary action per screen or section
- Information is prioritized by what the user needs first
- Elements align to a consistent grid

### Interaction & Usability

#### Responsiveness `[screen]` `[live]`
- Touch targets are at least 44×44px (iOS) or 48×48dp (Android), with enough spacing between them
- Layout works at the defined breakpoints
- Works across devices and browsers `[live]`
- Loading time and perceived performance `[live]`

#### Interactive Elements `[screen]`
- Buttons and links have default, hover, pressed, focus, and disabled states defined
- Form fields have clear labels (not placeholder-only), with required fields and input formats indicated
- Inline validation and feedback appear next to the field
- Actions give visible feedback (loading, success, error)
- Destructive actions ask for confirmation or offer undo
- Micro-interactions and animations have a purpose and don't block the task

#### States `[screen]`
- Empty state: explains why it's empty and what to do next
- Loading state: skeleton or progress indicator
- Error state: what happened and how to recover
- Success and confirmation states
- Disabled state: makes it clear why the action is unavailable
- Edge cases: long text, long names, many items, zero items

### Content & Information Architecture

#### Content Clarity `[screen]`
- Language and tone are consistent
- Text is readable and scannable (short paragraphs, clear headings)
- No jargon or internal terms the user wouldn't know
- Microcopy, button labels, and help text are specific ("Save shift", not "Submit")
- Terms are used consistently across screens `[flow]`

#### Information Organization `[screen]` `[flow]`
- Menu and navigation structure is logical
- Search is available where lists are long, with filters and a no-results state
- Categories and labels are clear and distinct
- Important information is easy to find
- Users know where they are (titles, breadcrumbs, active nav state)

### Enterprise Data `[screen]`
- Data density fits the task (scannable, not cramped)
- Tables have clear headers, alignment (numbers right-aligned in LTR, left-aligned in RTL), sorting, and filtering
- Bulk actions are available where users act on many items
- Long tables and lists have pagination or virtualization
- Key values (status, dates, counts) are easy to spot
- Role-based differences are clear (what each role can see or do)

### RTL / Arabic `[screen]`
- Layout is mirrored: navigation, alignment, progress direction, back/forward
- Directional icons are flipped (arrows, chevrons, back); non-directional icons are not (checkmarks, play, logos)
- Arabic font size and line height are adjusted for legibility (usually larger line height than Latin)
- Mixed Arabic and English text, numbers, and dates display in the correct order
- Numeral style (Western 0–9 or Arabic-Indic ٠–٩) is consistent across the product
- Phone numbers, times, and IDs stay LTR inside RTL text
- No truncated or overflowing Arabic labels

### Performance & Technical `[live]`
- Page load times and server response times
- Resources are optimized (images, fonts, scripts)
- Mobile performance
- Caching

### Error Handling `[screen]` `[flow]`
- Error messages say what happened and how to fix it, in plain language
- Errors are prevented where possible (constraints, defaults, confirmation)
- Users can recover without losing their input
- Errors are logged and reported `[live]`

### User Feedback & Engagement `[flow]`
- Feedback collection points (surveys, ratings) are well placed and short
- Communication channels and support are easy to reach
- Onboarding: first-use guidance is short and skippable
- Personalization features are relevant
- Retention elements (notifications, reminders) are useful, not noisy
- Gamification or motivational design supports the task

### Compliance & Security
- Privacy policy is accessible `[screen]`
- Consent and cookie notices are clear, with a real choice `[screen]`
- Password requirements are shown before the user types `[screen]`
- Authentication flow is clear (including forgotten password and lockout) `[flow]`
- GDPR or local data protection compliance `[live]`
- SSL and secure data transmission `[live]`

## Install

1. Download [`ux-flow.zip`](ux-flow.zip) from this repo (click it, then **Download raw file**).
2. In Claude, open your skills settings and upload `ux-flow.zip` as a custom skill.
3. For Figma links, connect Figma in Claude's connectors. Screenshots and AI-built prototypes work without it.
4. Share your design (Figma link, screenshots or prototype link), or say `run ux-flow`.

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
│   ├── userflow.py          # user flow diagrams
│   └── guide2md.py          # developer .md from the guide
└── assets/
    └── guide-template.html  # starting guide page
```

Made by Sally.
