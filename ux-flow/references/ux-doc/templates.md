# Templates

Replace everything in `<...>`. Leave `[...]` placeholders where information is missing. Remove a section only if it truly does not apply (for example, no prototype).

---

## Team doc

```markdown
# <Product> — <Flow>: Design update

**Date:** <date> · **Designer:** <name> · **Status:** <Ready for dev | In review | Shipped>
**Links:** [Final design](<figma link>) · [Prototype](<link>) · [Audit report](<file>) · [Re-audit report](<file>)

## 1. Context
- **Product & user:** <who uses this and for what>
- **Flow:** <flow covered>
- **Why we audited it:** <reason — or [add reason]>

## 2. Audit summary
**<n> issues found:** <n> critical · <n> major · <n> minor

Top issues:
1. <issue>
2. <issue>
3. <issue>

## 3. Decisions

### D1. <Short decision title>
- **Finding:** <issue> (<severity>, <finding ID>)
- **Change:** <what changed, specific>
- **Why:** <reason>

| Before | After |
|---|---|
| <image or Figma link> | <image or Figma link> |

### D2. ...

### Minor fixes
- <finding ID>: <one line>

## 4. Prototype
- **Link:** <link>
- **Covers:** <flows / scenarios>
- **What to test:** <key questions — or [add]>

## 5. Results
**<n> issues found · <n> fixed · <n> still open · <n> critical remaining**

<Test feedback, if any, with its source.>

## 6. Open items
| Finding | Severity | Reason deferred | Next step |
|---|---|---|---|
| <ID: issue> | <severity> | <reason or [add reason]> | <owner / when> |
```

---

## Portfolio case study

```markdown
# <Project title — outcome-focused, e.g. "Making shift approvals 3× clearer">

**Role:** <your role> · **Product:** <name or anonymized> · **Platform:** <web / mobile> · **Timeline:** <duration or [add]>

## The problem
<2–3 sentences: who the user is, what was hard for them, and why it mattered.>

## What I found
<1–2 sentences on the audit approach.>
**<n> issues** across <n> screens — <n> critical.

The ones that mattered most:
- <user-facing problem, not a checklist label>
- <...>

## Key decisions

### <Decision 1 — framed as what the user gains>
<1–2 sentences: the problem and what I changed.>

| Before | After |
|---|---|
| <image> | <image> |

*<Caption: the value to the user.>*

### <Decision 2>
...

## Outcome
**<n> of <n> issues resolved · <n> critical remaining**
<Test feedback or other evidence, with its source — or [add evidence]>

## What I'd do next
<1–3 lines: open items or what you'd validate next.>
```
