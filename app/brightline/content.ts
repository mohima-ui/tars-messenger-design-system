import type { ComposerContent } from "@/components/launcher/GlassComposer";

/* Brightline's voice through the TARS composer.

   Same tenant pattern as GP ([[project-tenant-demos]]): the component is
   untouched, only accent + content change. This pack ran the composer's
   no-greeting default for a while — the ChatGPT pattern, nothing speaks
   first — and now doesn't; see the `greeting` at the foot of the file for
   why a pediatric mental-health agent is the wrong one to open on an empty
   cursor. */

/* Brightline's own CTA colour, pulled from their production stylesheet
   (--color-brightline-orange). Marigold is the next swatch over in their
   real palette — lighter and warmer, the same relationship TARS purple has
   to lavender — so it stands in for a computed tint rather than one picked
   by eye. */
export const BRIGHTLINE_ACCENT = "#FFA300";
export const BRIGHTLINE_ACCENT_LITE = "#F6AE5B";

export const BRIGHTLINE_CONTENT: ComposerContent = {
  agentName: "Brightline",
  endChatLabel: "End Chat",
  /* Name on top, role underneath — the two-line header Design's own
     preview uses ("Tars" / "Virtual Assistant"), not one combined line. */
  headerTitle: "Brightline",
  subtitle: "AI Info Agent",
  ariaPrompt: "Ask Brightline anything",
  /* Brightline's own sunburst mark, not the monogram fallback — it already
     carries its own orange, circular fill, so it sits inside the header's
     round tile as a complete icon rather than a glyph drawn on it.
     `monogram` stays set underneath as the fallback the header's own ternary
     reaches for if this path is ever cleared. */
  logomark: "/brightline/logo-mark.png",
  monogram: "b",
  /* A medical-context caveat, not the generic "AI can make mistakes" —
     this is what it means for THIS tenant's answers to be wrong: it isn't
     a diagnosis, and the actual one comes from a clinician. */
  disclaimer:
    "AI Agent replies are not medical advice. Request an appointment for a diagnosis from Brightline clinicians.",

  questions: [
    "What ages do you see?",
    "Do you take insurance?",
    "Book an appointment",
    "Is online therapy available?",
    "What does it cost?",
  ],

  starters: [
    "Insurance & pricing",
    "How do I get started?",
    "How does care work?",
  ],

  replies: {
    /* Short, then sectioned — the detail lives in the accordion this reply
       ships with (see `replyAccordions`), so the turn itself stays the two
       sentences a parent actually needs before deciding what to open. */
    "Insurance & pricing":
      "We work with many major insurance plans, and if we're not in-network for yours, self-pay is simple and predictable too — here's how both paths work.\n\nIf you'd like to know exactly what your specific plan covers, we can run a quick eligibility check — just request an appointment or call us at **(888) 255-7040**, open 8am–7pm ET Monday–Friday, and our team will walk you through it.",
    "How do I get started?":
      "Every family starts the same way: a **diagnostic evaluation** — three closely scheduled sessions where we get a full picture of your child's needs before recommending therapy, psychiatry, or testing.\n\nFrom there it's a few quick details — your name, contact info, and what's mainly going on — and our team reaches out within one business day to confirm your first session.\n\nWant to get that started now?",
    "How does care work?":
      "Every family starts with a **diagnostic evaluation** — three closely scheduled sessions where we get a full picture of your child's needs, your concerns, and what's actually going on before recommending a path forward.\n\nOnce it's done, we'll recommend one of three tracks: therapy, psychiatry, or psychological testing — sometimes more than one.",
    "What does Brightline treat?":
      "We treat the full range of what comes up for kids and teens:\n\n- Anxiety, OCD, and disruptive behaviors\n\n- ADHD and autism\n\n- Depression, low mood, and withdrawal\n\n- Trauma and stress\n\nCare starts with a diagnostic evaluation — three closely scheduled sessions — so we recommend therapy, psychiatry, or testing based on what your child actually needs, not a guess.",
    "What ages do you see?":
      "We work with kids and teens from early childhood through age 18, plus parenting support for the adults around them. Tell me your child's age and I can point you at the right starting point.",
    "Do you take my insurance?":
      "We're in-network with several major plans: **Aetna, Cigna, Blue Cross Blue Shield of Massachusetts, Anthem, UnitedHealthcare, Carelon, UMR, 1199SEIU**, and a few regional plans.\n\nOut-of-network and self-pay options are available too — I can check your specific plan if you tell me who it's with.",
    "Do you take insurance?":
      "We're in-network with several major plans: **Aetna, Cigna, Blue Cross Blue Shield of Massachusetts, Anthem, UnitedHealthcare, Carelon, UMR, 1199SEIU**, and a few regional plans.\n\nOut-of-network and self-pay options are available too — I can check your specific plan if you tell me who it's with.",
    "What does it cost?":
      "It depends on your coverage:\n\n- **In-network**: you pay your plan's normal copay or coinsurance.\n\n- **Self-pay** — therapy: $350 for the initial session, $200–$275 ongoing. Psychiatry: $225–$350 a session. Psychological testing: $2,000–$5,000 depending on scope.\n\nAll services are HSA/FSA eligible, and we provide superbills for out-of-network reimbursement. Want me to check a specific insurance plan?",
    "Is online therapy available?":
      "Yes — most of our therapy and psychiatry is available online across the states we serve, alongside in-person care at our New York clinics (Brooklyn Heights, Columbus Circle, Lake Success, White Plains, and Albany). Psychological testing is in-person only, since it requires hands-on assessment.",
    "How does the evaluation work?":
      "Every family starts with a **diagnostic evaluation** — three closely scheduled sessions where we get a full picture of your child's needs, your concerns, and what's actually going on before recommending a path forward.\n\nOnce it's done, we'll recommend one of three tracks: therapy, psychiatry, or psychological testing — sometimes more than one.",
    "What's the difference between therapy and psychiatry?":
      "**Therapy** is talk-based — a clinician works with your child (and often you) on coping skills, behavior, and the underlying cause of what's going on.\n\n**Psychiatry** is medical — a psychiatric provider evaluates whether medication could help, and manages it if so.\n\nMany families use both together. The evaluation tells us which your child needs.",
    "Do you do psychological testing?":
      "Yes — full psychological and educational testing for:\n\n- Autism\n\n- Learning differences\n\n- Giftedness and school readiness\n\n- Memory and cognitive skills\n\nTesting is in-person and includes a written report you can bring to your child's school.",
    "Where are your locations?":
      "In-person clinics are in New York: **Brooklyn Heights, Columbus Circle, Lake Success, White Plains, and Albany**. Online therapy and psychiatry are available more broadly — tell me your state and I'll confirm coverage.",
    "I want to talk to a clinician":
      "Happy to connect you with our care team directly. What's the best number or email to reach you, and is this about a current appointment or a new one?",
    "I need help now":
      "If this is a medical emergency, please call 911 or go to your nearest emergency room. For a mental health crisis, the 988 Suicide & Crisis Lifeline is available 24/7 — call or text **988**.\n\nFor everything else, our care team is reachable at **(888) 255-7040**, and I'm here too.",
    "I'm ready to schedule":
      "Great — let's get you booked in for an evaluation. A few quick details and our team will reach out to confirm your first session.",
    "Main Menu":
      "Sure — what would you like to do next?",
    "End Chat":
      "Thank you for chatting with Brightline! This conversation is now closed — you can start a new one anytime. 👋",
    "Not sure yet":
      "That's completely normal — most families start out unsure. The diagnostic evaluation is built for exactly that: three sessions to figure out what's actually going on and what will help, before anything is decided.",
    /* An open door, not another menu. Someone who pressed "Something else"
       has already declined three options; answering with four more is the
       same wall one step further in. It asks, and then gets out of the way. */
    "Something else":
      "Of course — tell me what's going on and I'll point you at the right place. Whatever it is, you can put it in your own words; I'm not looking for the right category.\n\nIf it's easier to talk to a person, our team is at **(888) 255-7040** or information@hellobrightline.com.",
  },

  followUps: {
    "Insurance & pricing": [
      "Where are your locations?",
      "How do I get started?",
      "I want to talk to a clinician",
    ],
    "How do I get started?": [
      "Insurance & pricing",
      "How does care work?",
      "I'm ready to schedule",
    ],
    "How does care work?": [
      "What's the difference between therapy and psychiatry?",
      "Do you do psychological testing?",
      "How do I get started?",
    ],
    "What does Brightline treat?": [
      "How does the evaluation work?",
      "What ages do you see?",
      "I'm ready to schedule",
    ],
    "What ages do you see?": [
      "What does Brightline treat?",
      "Is online therapy available?",
      "I'm ready to schedule",
    ],
    "Do you take my insurance?": [
      "What does it cost?",
      "Where are your locations?",
      "I'm ready to schedule",
    ],
    "Do you take insurance?": [
      "What does it cost?",
      "Where are your locations?",
      "I'm ready to schedule",
    ],
    "What does it cost?": [
      "Do you take my insurance?",
      "I'm ready to schedule",
      "I want to talk to a clinician",
    ],
    "Is online therapy available?": [
      "Where are your locations?",
      "How does the evaluation work?",
      "I'm ready to schedule",
    ],
    "How does the evaluation work?": [
      "What's the difference between therapy and psychiatry?",
      "Do you do psychological testing?",
      "I'm ready to schedule",
    ],
    "What's the difference between therapy and psychiatry?": [
      "Do you do psychological testing?",
      "Not sure yet",
      "I'm ready to schedule",
    ],
    "Do you do psychological testing?": [
      "How does the evaluation work?",
      "What does it cost?",
      "I'm ready to schedule",
    ],
    "Where are your locations?": [
      "Is online therapy available?",
      "I'm ready to schedule",
      "I want to talk to a clinician",
    ],
    "I want to talk to a clinician": [],
    "I need help now": [],
    "I'm ready to schedule": [],
    "Main Menu": [],
    "End Chat": [],
    "Not sure yet": [
      "How does the evaluation work?",
      "What does Brightline treat?",
      "I'm ready to schedule",
    ],
    /* Deliberately empty. The turn it hangs under asks the visitor to say
       what's going on in their own words, and a row of suggestions under
       that question is the menu it just stepped out of, back again. */
    "Something else": [],
  },

  /* The four things "how does paying for this work" actually means. Written
     as sections rather than folded into the reply because a parent asking
     about insurance is usually asking one of these, not all four, and a
     screen of prose makes them find their paragraph in it. */
  replyAccordions: {
    "Insurance & pricing": {
      title: "Insurance & Pricing",
      items: [
        {
          label: "With Insurance",
          body: "We're in-network with many commercial plans, including Aetna, Anthem, Cigna, Optum, Carelon, and others depending on your state. We don't accept Medicaid, Medicare, or most government-sponsored plans. Since coverage varies, the best next step is an eligibility check so we can tell you what your plan actually covers.",
        },
        {
          label: "Self-Pay",
          body: "Paying out of pocket is straightforward, and the rates don't change with your plan: $350 for an initial therapy session and $200–$275 for ongoing ones. Psychiatry runs $225–$350 a session. Psychological testing is $2,000–$5,000 depending on whether we're assessing a single concern or a fuller picture.",
        },
        {
          label: "FSA/HSA & Superbills",
          body: "Every Brightline service is FSA and HSA eligible, so you can pay with those funds directly. If we're out of network with your plan, we provide superbills — itemized receipts you submit to your insurer for out-of-network reimbursement at whatever rate your plan allows.",
        },
        {
          label: "Cancellation Policy",
          body: "Appointments can be cancelled or rescheduled up to 24 hours ahead at no charge. Inside 24 hours, or a missed session, is billed at the full session rate — clinician time is held for your child specifically, so it can't be given to another family at short notice.",
        },
      ],
    },
  },

  replyForms: {
    "I'm ready to schedule": {
      fields: [
        { key: "firstName", label: "Your first name", half: true },
        { key: "lastName", label: "Your last name", half: true },
        { key: "email", label: "Email address", type: "email" },
        { key: "phone", label: "Phone number", type: "tel" },
        { key: "childAge", label: "Child or teen's age", half: true },
        {
          key: "concern",
          label: "What's mainly going on?",
          options: ["Anxiety", "ADHD", "OCD", "Disruptive behaviors", "Not sure yet"],
        },
      ],
      submitLabel: "Request appointment",
      reply:
        "Thanks {firstName} — we'll reach out within one business day to schedule the first evaluation session for your {childAge}-year-old.",
      replyButtons: ["Main Menu", "End Chat"],
    },
  },
  replyButtons: {
    "Main Menu": [
      "What does Brightline treat?",
      "Do you take my insurance?",
      "I'm ready to schedule",
    ],
  },
  followUpFallback: ["Tell me more", "I want to talk to a clinician"],
  replyFallback:
    "Good question — let me get that checked with our care team. In the meantime, is there anything else about care, insurance, or getting started I can help with?",

  reasoningTrace: [
    "Searched Brightline's care guide",
    "Read 3 sources",
    "Checked insurance network",
  ],
  reasoningSteps: [
    "Thinking",
    "Searching the care guide",
    "Reading 3 sources",
    "Checking insurance network",
    "Writing the answer",
  ],

  sources: [
    {
      name: "Diagnostic evaluation",
      description: "How the first three sessions work and what they decide.",
      url: "brightline.com/what-we-treat/evaluation",
    },
    {
      name: "Insurance & pricing",
      description: "In-network plans, self-pay rates, and how to check coverage.",
      url: "brightline.com/pricing/insurance",
    },
    {
      name: "Locations",
      description: "In-person clinics and where online care is available.",
      url: "brightline.com/locations",
    },
    {
      name: "Therapy at Brightline",
      description: "What a therapy track looks like once the evaluation is done.",
      url: "brightline.com/what-we-offer/therapy",
    },
  ],

  conversations: [
    {
      group: "Today",
      items: [
        {
          id: "c1",
          title: "Evaluation for anxiety",
          description: "You: can we do the first session online?",
          time: "10:14 AM",
          channel: "web",
          status: "resolved",
        },
      ],
    },
    {
      group: "Yesterday",
      items: [
        {
          id: "c2",
          title: "Insurance coverage — Aetna",
          description: "Brightline: here's how your copay works for therapy visits.",
          time: "Yesterday",
          channel: "web",
          status: "resolved",
        },
      ],
    },
    {
      group: "Earlier",
      items: [
        {
          id: "c3",
          title: "Switching clinicians",
          description: "Priya: I've flagged the request with your care coordinator.",
          time: "Sep 3",
          channel: "whatsapp",
          status: "waiting",
          handedTo: "Priya",
        },
        {
          id: "c4",
          title: "First look at care options",
          description:
            "Brightline: Hi — welcome. I can help with what we treat, insurance, or booking.",
          time: "Aug 22",
          channel: "web",
          status: "closed",
        },
      ],
    },
  ],

  /* Brightline speaks first after all — the note further up about this pack
     running the composer's no-greeting default is no longer true, and this
     is why: a mental-health agent that opens with nothing but a cursor is
     asking a parent to phrase the hardest thing on their mind cold. Two
     turns, because they do two jobs — the mark and the hello, then what
     this is and who to reach if it should be a person instead. The second
     carries the prompts, so they pin at the foot under the turn that asks
     for them. */
  greeting: {
    image: "/brightline/greeting-mark.png",
    text: "Hi there!",
    then: {
      text: "I'm an AI chatbot and here to help you find your way around Brightline. Pick one below to get started, or just tell me what's on your mind. If you wish to speak to a human, please contact a Brightline clinician or our support team at information@hellobrightline.com or call (888) 255-1401 (8am–7pm ET, Mon–Fri).",
      /* The launcher's three, plus a fourth that only exists in here.

         "Something else" is the way out of a menu. The three above are the
         paths most families are on, and a parent whose reason isn't one of
         them shouldn't have to decide whether theirs counts as "how does
         care work" before they can say it. The turn already says "or just
         tell me what's on your mind" — this is that sentence as a thing you
         can press, for anyone who reads a row of options as the whole of
         what's on offer. Last on purpose: it's the fallback, not a peer of
         the three. */
      prompts: [
        "Insurance & pricing",
        "How do I get started?",
        "How does care work?",
        "Something else",
      ],
    },
  },
};
