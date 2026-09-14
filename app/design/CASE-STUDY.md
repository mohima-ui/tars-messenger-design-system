# TARS Messenger — designing a conversational layer for a two-sided product

**Role:** [your title] · **Timeline:** [dates] · **Team:** [engineering, product, leadership]
**Scope:** Launcher, messenger, conversation history, and the configuration surface that controls them.
**Deliverables:** State model, interaction specification, component library, and a live design tool.

---

## Overview

TARS enables businesses to deploy an AI agent on their website. The agent answers
questions, qualifies leads, and escalates to a human when required.

Two components are exposed to the end user: the **launcher**, which rests in the
corner of the customer's site, and the **messenger**, which opens from it. A third
surface — the **Design section** of the dashboard — is where the business
configures both.

This case study covers the redesign of all three, with particular focus on the
returning-visitor journey, which had no defined state model prior to this work.

---

## Context: a dual-sided product

The system serves two distinct user groups whose needs are frequently in tension.
Their jobs-to-be-done do not align.

**The business (the buyer).** Requires brand alignment, predictable placement,
and editorial control over the agent's output. It operates the dashboard, owns
the configuration, and raises the support ticket.

**The visitor (the end user).** Did not opt in. Arrived with an unrelated task,
and experiences the agent as an interruption to that task.

Each decision was therefore assessed against both. Increased configurability for
the buyer generally increases cognitive load or visual noise for the end user, and
the design work lay in identifying where that trade-off was justified.

---

## Problem definition

The existing experience covered a single happy path: a first-time visitor
arriving, opening the launcher, and starting a conversation.

Session data and the support queue told a different story. Most sessions are not
first sessions. Visitors leave and return — minutes later, the next morning, or a
week on. The agent may have responded in their absence. They may have composed a
message and abandoned it without sending.

None of these conditions had a defined state. All of them were scheduled to ship.

The problem was not visual. It was one of **state coverage**: the product had no
mental model for the condition a returning visitor is in, and no interaction rule
governing what the interface should do about it.

---

## Approach: modelling states, not screens

Rather than producing additional screens, I began by mapping the conditions in
which a visitor can encounter the launcher — the entry points to the flow.

| State | Definition | Primary user need |
| --- | --- | --- |
| **First conversation** | No prior session | Orientation |
| **Recent conversation** | Session within 24 hours | Fast re-entry |
| **Open conversation** | Older than 24 hours, unresolved | Recognition, then a route out |
| **Unread message** | Agent replied after the visitor left | Notification, then the message |
| **Unsent draft** | Message composed, never sent | Restoration of their own input |
| **Floating message** | Agent-initiated, no prior exchange | A reason to accept the interruption |

Three states describe the *recency* of a conversation. Two describe something
*pending* within any of them. The sixth describes proactive contact.

The model was then built into the design tool as a state switcher, allowing any
stakeholder to move between states and observe the same component respond. This
became the most reused artefact of the project: edge cases could be evaluated
directly rather than argued in the abstract, which materially shortened design
review.

---

## Key design decisions

### 1. A system rule for launcher behaviour

A recurring disagreement concerned the primary action: on press, should the
launcher resume the prior conversation or begin a new one? Both positions were
defensible, and the question resurfaced with every new state — a symptom of a
missing principle rather than a missing screen.

I resolved it once, at system level:

> **The launcher opens what it says.**

Where the affordance offers to continue, it continues. Where it invites a new
question, it starts fresh. Where it surfaces the agent's last message, it opens on
that message. Label and outcome are bound together.

This is consistency between system and expectation, applied to a component whose
label changes by state. It eliminated a live defect in which the launcher greeted
the visitor by name and then opened a seventeen-message thread from the previous
week — a mismatch between the affordance and the result.

In a B2B product the second function of a stated rule is governance: it continues
to resolve decisions after the designer has left the discussion.

### 2. Recognition over recall

The conventional pattern for a returning visitor is a control labelled
*"Continue your conversation."*

I prototyped it and rejected it. The label is courteous but places the retrieval
burden on the user: it asks them to reconstruct, unaided, what they were doing.

The launcher now surfaces the exchange itself — the visitor's own last message and
the opening of the response they received. This substitutes recognition for
recall, which is measurably lower effort: the visitor confirms a thread rather
than retrieving it from memory.

The same principle governs the conversation history list, where each row displays
the last message rather than a static description. The title answers *which
conversation*; the last message answers *where it reached*. Those are the two
attributes users scan for, so those are the two the row carries.

### 3. Contextual suggestions bound to conversation state

Suggestion chips in the launcher and messenger were drawn from a static list.

This is adequate for a cold start and degrades immediately afterwards: the chips
stop functioning as answers and become visual noise. In one instance a thread
ending on *"what type of business do you run?"* presented suggestions about payout
timelines — responses to a question that had not been asked, which erodes trust in
the agent's context-awareness.

I specified the constraint as: **every suggestion set must answer the question its
own turn ends on**, and had it enforced in the implementation by deriving the set
from the agent's most recent turn rather than from a separately maintained list.
The two cannot diverge, because there is no second source.

### 4. A single conversation as the source of truth

I authored one demonstration conversation — a merchant enquiring about online
payments — and every state in the design tool renders a different depth of it. The
first-conversation state shows the greeting; recent, three turns; open, the full
exchange; unread, the full exchange plus the agent's follow-up.

No content is duplicated, so the launcher preview, the recall card, and the
transcript are structurally incapable of contradicting one another — a class of
defect that had previously reached a live demo undetected.

The secondary benefit is design-to-development parity. The tool stopped being an
illustration and became a specification: what the team reviews is what the visitor
receives.

### 5. Touch as a separate input modality

Two interactions depended on hover, which has no equivalent on touch.

**Suggestions.** Revealed on hover at desktop; revealed on scroll at mobile,
appearing as the visitor moves down the page and retracting a few seconds after
scrolling stops. This preserves the intent of the original interaction — offering
options to a reader in motion, then receding — using an input the device actually
has.

**Conversation history actions.** Rename and delete sat behind a hover-revealed
overflow menu. On mobile the row now swipes to reveal them, using the platform's
established gesture, with targets sized for a thumb rather than a cursor.

The failure mode being designed out is a discoverability gap that produces no
signal: a control that exists on one platform and silently does not on the other
is rarely reported as a bug. The function simply appears absent.

---

## Constraints and trade-offs

**Discoverability of the "New conversation" affordance.** Returning visitors
handed a long thread need a route to a fresh one. I placed the control at the top
of the thread, which is correct in reading order and wrong in the viewport: the
panel opens scrolled to the end of the conversation, so the control sat well above
the fold and was effectively undiscoverable.

Seven placements were built and compared in-tool — a full-width bar, a floating
pill, a header icon, a line above the composer, and three in-thread variants. The
selected pattern places a compact control on a divider at the foot of the thread,
coinciding with the panel's landing position. The evaluation criterion was
discoverability at zero interaction cost, not aesthetics.

**Type scale on mobile.** A request was raised to reduce all mobile type by 2px.
I recommended against it and documented why: the scale terminates at 10px, so a
uniform reduction would render metadata at 8px, below any reasonable legibility
threshold; and input text under 16px triggers viewport zoom on iOS Safari, which
breaks the layout on focus. The underlying problem was perceived density, not type
size. It was resolved by reducing padding and control heights while holding the
type scale, which recovered more space than the type change would have.

---

## Outcome

- **Six visitor states** specified, designed, and demonstrable, replacing a single
  first-visit happy path.
- **Three system rules** now govern behaviour across surfaces, reducing per-screen
  decisions and giving engineering an unambiguous specification.
- **A live design tool** used as shared reference by design, engineering, and
  leadership, with every state reachable in one interaction.
- **A proactive floating mode** prototyped for evaluation.

---

## In progress: floating messenger

A non-obtrusive mode is under exploration in which the messenger is presented
without its container: turns render directly on the customer's page above the
launcher, allowing the visitor to browse and converse concurrently.

Removing the container invalidates three affordances the panel had been providing
implicitly:

- **Contrast.** A panel guarantees a background; unbounded text does not, and the
  underlying page is outside our control. Agent turns are therefore white and
  elevated rather than tinted, as they must separate from an arbitrary website
  rather than from an adjacent bubble.
- **Boundary.** A panel's scroll region terminates at a header. A floating column
  has no such boundary, so the earliest turn dissolves beneath a gradient mask
  rather than clipping — a hard edge reads as a rendering error, and the fade
  additionally signals that content continues above.
- **Input affordance.** Every other element can be transparent; the field cannot.
  A field through which the page is visible does not read as accepting input.

For the composer launcher this adds no new element, as the field is already
present. For the button launcher there is none, so the button persists while the
agent is speaking and transitions into a field only once the visitor responds —
preserving the reduced footprint the business selected until the visitor's own
action makes a field the higher-value element.

---

## Next steps

- **Validate** the floating mode with live traffic. The rationale above is
  reasoning, not evidence.
- **Define the dismissal model** for proactive messages — per page, per session,
  or persistent. A dismiss control currently exists without a governing rule.
- **Instrument the Design section** to establish which settings are actually
  modified. If the defaults are rarely changed, the defaults are the product and
  the controls are largely reassurance — which would redirect the next phase of
  work from configurability to better defaults.

---

## Reflection

The most durable output of this project was not the component library. It was the
principles governing it.

*The launcher opens what it says. Suggestions answer the question the turn ends
on. One conversation, used everywhere.* Each of these resolved more decisions than
any individual screen, and each continues to resolve them without my involvement.
In a B2B product, which outlives every discussion held about it, that proved to be
the higher-leverage deliverable.

---

*Screens to include: the six-state switcher, the recall card, the seven
"New conversation" placements compared side by side, and the floating mode
rendered over a live site.*
