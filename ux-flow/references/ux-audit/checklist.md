# UX Audit Checklist

Tags: `[screen]` checkable on a single frame · `[flow]` needs a sequence of frames · `[live]` needs a running build.

## User Experience

### User Journey `[flow]`
- All key user flows are identified and complete (no dead ends or missing steps)
- Friction points: unnecessary steps, repeated input, unclear next action
- Navigation is clear and predictable
- Experience is consistent across pages and screens

### Accessibility `[screen]`
- Text contrast is at least 4.5:1 for body text and 3:1 for large text (18px+, or 14px+ bold)
- UI components and icons have at least 3:1 contrast against their background
- Color is never the only way information is shown (status, errors, required fields)
- Body text is at least 14px on mobile and 14–16px on web; Arabic text is not smaller than its Latin equivalent
- Images and icons that carry meaning have a text label or alt text
- Keyboard focus states are visible `[live]`
- Logical keyboard and screen reader order `[live]`

## Visual Design

### Visual Consistency `[screen]` `[flow]`
- Colors, type, and spacing use design system tokens and components
- Typography uses a consistent type scale
- Color palette is used with a consistent meaning (for example, primary, danger, success)
- Icons share one style, weight, and size set
- Whitespace and layout are balanced, on a consistent spacing scale

### Visual Hierarchy `[screen]`
- The most important element or action on the screen is the most prominent
- One clear primary action per screen or section
- Information is prioritized by what the user needs first
- Elements align to a consistent grid

## Interaction & Usability

### Responsiveness `[screen]` `[live]`
- Touch targets are at least 44×44px (iOS) or 48×48dp (Android), with enough spacing between them
- Layout works at the defined breakpoints
- Works across devices and browsers `[live]`
- Loading time and perceived performance `[live]`

### Interactive Elements `[screen]`
- Buttons and links have default, hover, pressed, focus, and disabled states defined
- Form fields have clear labels (not placeholder-only), with required fields and input formats indicated
- Inline validation and feedback appear next to the field
- Actions give visible feedback (loading, success, error)
- Destructive actions ask for confirmation or offer undo
- Micro-interactions and animations have a purpose and don't block the task

### States `[screen]`
- Empty state: explains why it's empty and what to do next
- Loading state: skeleton or progress indicator
- Error state: what happened and how to recover
- Success and confirmation states
- Disabled state: makes it clear why the action is unavailable
- Edge cases: long text, long names, many items, zero items

## Content & Information Architecture

### Content Clarity `[screen]`
- Language and tone are consistent
- Text is readable and scannable (short paragraphs, clear headings)
- No jargon or internal terms the user wouldn't know
- Microcopy, button labels, and help text are specific ("Save shift", not "Submit")
- Terms are used consistently across screens `[flow]`

### Information Organization `[screen]` `[flow]`
- Menu and navigation structure is logical
- Search is available where lists are long, with filters and a no-results state
- Categories and labels are clear and distinct
- Important information is easy to find
- Users know where they are (titles, breadcrumbs, active nav state)

## Enterprise Data `[screen]`
- Data density fits the task (scannable, not cramped)
- Tables have clear headers, alignment (numbers right-aligned in LTR, left-aligned in RTL), sorting, and filtering
- Bulk actions are available where users act on many items
- Long tables and lists have pagination or virtualization
- Key values (status, dates, counts) are easy to spot
- Role-based differences are clear (what each role can see or do)

## RTL / Arabic `[screen]`
- Layout is mirrored: navigation, alignment, progress direction, back/forward
- Directional icons are flipped (arrows, chevrons, back); non-directional icons are not (checkmarks, play, logos)
- Arabic font size and line height are adjusted for legibility (usually larger line height than Latin)
- Mixed Arabic and English text, numbers, and dates display in the correct order
- Numeral style (Western 0–9 or Arabic-Indic ٠–٩) is consistent across the product
- Phone numbers, times, and IDs stay LTR inside RTL text
- No truncated or overflowing Arabic labels

## Performance & Technical `[live]`
- Page load times and server response times
- Resources are optimized (images, fonts, scripts)
- Mobile performance
- Caching

## Error Handling `[screen]` `[flow]`
- Error messages say what happened and how to fix it, in plain language
- Errors are prevented where possible (constraints, defaults, confirmation)
- Users can recover without losing their input
- Errors are logged and reported `[live]`

## User Feedback & Engagement `[flow]`
- Feedback collection points (surveys, ratings) are well placed and short
- Communication channels and support are easy to reach
- Onboarding: first-use guidance is short and skippable
- Personalization features are relevant
- Retention elements (notifications, reminders) are useful, not noisy
- Gamification or motivational design supports the task

## Compliance & Security
- Privacy policy is accessible `[screen]`
- Consent and cookie notices are clear, with a real choice `[screen]`
- Password requirements are shown before the user types `[screen]`
- Authentication flow is clear (including forgotten password and lockout) `[flow]`
- GDPR or local data protection compliance `[live]`
- SSL and secure data transmission `[live]`
