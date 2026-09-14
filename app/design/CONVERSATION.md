# The demo conversation

One script, used by every visitor state in `/design/v2`. Each state is a
different depth into it — a first conversation is the greeting alone, a recent
one is three turns in, an open one has run its course. Nothing is written twice,
so the launcher preview, the card and the thread can never disagree about what
was said.

Live in `app/design/v2/page.tsx` as `SCRIPT`. Edit it there; this file is the
readable copy.

---

**Agent**
Hi there 👋 welcome to Global Payments. Looking to learn more? I can help!
· Accept payments · Explore POS solutions · Online payments · Talk to sales

**Visitor** — I want to accept payments online

**Agent**
Absolutely. Global Payments helps businesses accept payments online with secure
checkout and flexible integration options.
To recommend the right solution, what type of business do you run?
· Retail / Ecommerce · Restaurant · Professional services · Other

**Visitor** — Ecommerce

**Agent**
Got it. Are you looking to add payments to an existing website or build a new
checkout experience?
· Existing website · Building a new site · Not sure

**Visitor** — Existing website

**Agent**
Great. Global Payments can integrate payments into your existing ecommerce
experience, so customers can pay securely without requiring you to build the
payment infrastructure from scratch.
Do you already have an online store up and running?
· Yes, it's live · Not yet

**Visitor** — Yes, it's live

**Agent**
Perfect. That means we can focus on making your existing checkout experience
work better for your customers.
What would you most like to improve about your current payment setup?
· Offer more payment options · Improve checkout · Accept international payments
· Reduce payment issues

**Visitor** — Offer more payment options

**Agent**
Absolutely. Giving customers more ways to pay can help you support different
preferences and markets.
Where are most of your customers located?
· Mostly in my country · US & Canada · Europe · Worldwide

**Visitor** — Worldwide

**Agent**
Got it. If you're selling globally, payment preferences can vary quite a bit
from one market to another.
Are you currently accepting payments from customers outside your home market?
· Yes, already · Only a few markets · Not yet · I'm not sure

**Visitor** — Only a few markets

**Agent**
That makes sense. If you're already selling internationally and planning to
expand, having a payment setup that can support different markets and customer
payment preferences can make that growth much easier.
Based on what you've shared — an existing ecommerce store, customers worldwide,
and plans to expand into more markets — Global Payments' ecommerce solutions
could be a good fit.
Would you like to see what Global Payments can offer for your business?
· Explore ecommerce solutions · See payment options · Get a quote
· Talk to a specialist

**Visitor** — Explore ecommerce solutions

**Agent**
Global Payments can help you build a payment experience that supports your
international customers, with options to accept payments across markets and give
customers more ways to pay.
Since you already have an ecommerce store, the next step would be to find the
solution that best fits your business and current setup.
What would you like to do?
· Get a quote · Talk to a specialist · See how integration works

---

## How each state uses it

| State | What it opens on |
| --- | --- |
| First conversation | the greeting alone |
| Recent conversation | the first three turns — they were here today and need little to recognise it |
| Open conversation | the whole script, ending on an unanswered question, which is what lets the card say "ended unresolved" |
| Unread message | the whole script, plus the agent following up after they left |
| Unsent draft | the whole script, with their half-typed reply back in the composer |

Every suggestion answers the question its own turn ends on. That is the rule
worth holding: a set of chips that does not follow from the message above it is
furniture.
