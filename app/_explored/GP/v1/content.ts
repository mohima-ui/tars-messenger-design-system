import type { ComposerContent } from "@/components/launcher/GlassComposer";

/* Global Payments' voice through the TARS composer.

   The tenant demo: same component, different words. Everything here follows
   the shapes the TARS pack established — replies keyed by the starter that
   reaches them, follow-ups written beside the reply they hang under — so a
   chain can't dangle. What's new against the default pack is `greeting`: GP's
   workflow opens on the agent's node (the gambit pattern), so the assistant
   speaks first, and the launcher gains an open-without-sending path because
   there is now something to open onto. */

/* The brand blue, and the lighter companion the ring gradients and the
   sparkle's lit edge run toward. #292EFF is deep enough that its "lighter"
   partner does the work lavender does for the TARS purple. */
export const GP_ACCENT = "#292EFF";
export const GP_ACCENT_LITE = "#6b6eff";

export const GP_CONTENT: ComposerContent = {
  agentName: "Global Payments",
  endChatLabel: "End Chat",
  headerTitle: "Global Payments Assistant",
  ariaPrompt: "Ask Global Payments anything",
  /* No asset for the demo tenant — the monogram on the brand tile matches
     the wordmark in the site's own nav. */
  logomark: "",
  monogram: "gp",

  /* Typed into the resting chip — same width budget as the default pack, so
     nothing here runs past ~27 characters. */
  questions: [
    "What are your card rates?",
    "How fast are payouts?",
    "Can I take payments online?",
    "Do you support Apple Pay?",
    "Book a demo",
  ],

  /* The override in action: the launcher advertises journeys, while the
     greeting inside routes intent (sales / support / partner). */
  starters: ["Find the payment solution", "Explore POS systems", "Book a demo"],

  replies: {
    /* The long one — the reply that proves the pane can hold structure, same
       job the "What can Tars do?" answer does in the default pack. */
    /* No ** on the lead line: a line ending in a colon is bolded up to the
       colon by the renderer's lead-in rule, and inline bold inside that span
       shows its own asterisks. */
    "What are your rates?":
      "Card processing rates depend on how you take payments:\n\n- In person: 2.29% + 10¢ per tap, dip, or swipe on our terminals and POS.\n\n- Online: 2.79% + 20¢ per transaction through checkout, invoices, or payment links.\n\n- Keyed-in: 3.29% + 20¢ when a card number is entered manually.\n\nNo monthly minimums and no setup fee on standard plans. If you process over $250k a year, interchange-plus pricing usually works out cheaper — I can walk you through it.",
    "Anything for high volume?":
      "Yes — above roughly $250k a year we quote **interchange-plus** — the card networks' wholesale cost, passed through at cost, plus a fixed markup you can see on every statement.\n\n- Typical markup: 0.30% + 8¢, negotiated on volume.\n\n- Same-day settlement and a dedicated account manager are included.\n\nShare your rough monthly volume and average ticket and I'll give you a real number.",
    "How fast are payouts?":
      "Standard payouts land the **next business day** — batches close at 10pm ET and funds arrive by morning.\n\n- Same-day payouts: available on eligible accounts for 1% per transfer, arriving within hours.\n\n- Weekends: batches close as usual and settle Monday, unless same-day is enabled.\n\nYour first payout takes 2–3 days while your account is verified.",
    "Book a demo":
      "Happy to set that up. What day works for you, and roughly how many locations or storefronts are we talking about?",
    "Can I take payments online?":
      "Yes — three ways, and they share one dashboard with your in-store sales:\n\n- Hosted checkout you can drop onto your site with a snippet.\n\n- Payment links and invoices you can send from your phone.\n\n- A full API if your team wants to build the flow themselves.",
    "What do I pay per sale?":
      "Card processing rates depend on how you take payments:\n\n- In person: 2.29% + 10¢ per tap, dip, or swipe on our terminals and POS.\n\n- Online: 2.79% + 20¢ per transaction through checkout, invoices, or payment links.\n\n- Keyed-in: 3.29% + 20¢ when a card number is entered manually.\n\nNo monthly minimums and no setup fee on standard plans. If you process over $250k a year, interchange-plus pricing usually works out cheaper — I can walk you through it.",
    "When do I get paid?":
      "Standard payouts land the **next business day** — batches close at 10pm ET and funds arrive by morning.\n\n- Same-day payouts: available on eligible accounts for 1% per transfer, arriving within hours.\n\n- Weekends: batches close as usual and settle Monday, unless same-day is enabled.\n\nYour first payout takes 2–3 days while your account is verified.",
    "Can I sell online?":
      "Yes — three ways, and they share one dashboard with your in-store sales:\n\n- Hosted checkout you can drop onto your site with a snippet.\n\n- Payment links and invoices you can send from your phone.\n\n- A full API if your team wants to build the flow themselves.",
    "I want to talk to sales":
      "Which of these options best describes how we can help?",
    "I'm an Enterprise Business":
      "Thank you for your interest! Kindly provide your contact details, and our team will connect with you as soon as possible.",
    "I'm looking for Events Payments":
      "We power payments for stadia, festivals, and events of every size:\n\n- Fast contactless terminals built for queues.\n\n- Offline mode that keeps taking payments if the network drops.\n\n- Same-day reporting across every stand and kiosk.\n\nTell me about your event and I'll point you at the right setup.",
    "I'm an Independent Business":
      "Perfect — most independent businesses are up and running in days:\n\n- Simple flat-rate pricing, no monthly minimums.\n\n- A card machine or POS that fits your counter.\n\n- Next-business-day payouts as standard.\n\nWant a quote or a quick demo?",
    "I need support":
      "I can help with most things right here. What's going on?\n\n- Payouts: a transfer that hasn't landed, or your payout schedule.\n\n- Disputes: respond to a chargeback and upload evidence.\n\n- Hardware: a terminal or POS that's misbehaving.\n\nIf it's urgent, I can hand you straight to the support team with the conversation attached.",
    "I want to become a partner":
      "Great — the partner programme has three tracks:\n\n- Referral: recommend us and earn a share of the processing revenue.\n\n- Integration: connect your software to our payments API, with co-marketing.\n\n- Agent/ISO: sell our stack under your own brand with dedicated support.\n\nTell me which sounds closest and I'll get the right team to reach out.",
    "Main Menu":
      "Sure — what would you like to do next?",
    "End Chat":
      "Thank you for chatting with Global Payments! This conversation is now closed — you can start a new one anytime. 👋",
    "Retail":
      "Retail it is — tills, inventory, and returns are exactly what our POS was built around. Our team will factor that into your setup when they reach out.",
    "Restaurant":
      "Restaurants are one of our biggest specialities — table management, kitchen tickets, and split bills all come built in. Our team will tailor the demo to that.",
    "Services":
      "Service businesses run best on payment links, invoices, and on-the-move payments — all one account. Our team will shape your setup around that.",
    "Other":
      "No problem — we work across hundreds of verticals, so our team will find the right fit when they reach out.",
    "Talk to sales":
      "Happy to connect you. To point you at the right person:\n\n- How do you mainly sell — in store, online, or both?\n\n- Roughly how many locations or storefronts?\n\nOr skip the questions and book a demo directly — I can hold a slot this week.",
    "Find the payment solution":
      "Let's find the right fit. How does your business take payments?\n\n- In person: card machines and full POS for counters, tables, and on the move.\n\n- Online: hosted checkout, payment links, and invoices.\n\n- Both: one account and one dashboard across store and site.\n\nTell me how you sell and I'll point you at the exact setup.",
    "Explore POS systems":
      "Our POS systems fit the way your business runs:\n\n- Restaurants: table management, kitchen tickets, and split bills.\n\n- Retail: inventory, barcodes, and returns at the counter.\n\n- On the move: Genius mobile pay turns a smartphone into a terminal.\n\nEvery system takes tap, dip, swipe, and wallets — with next-business-day payouts as standard.",
    "Get a quote":
      "Happy to put a real number together. Two quick things:\n\n- How do you mainly sell — in store, online, or both?\n\n- Roughly how much do you process a month?\n\nAnswer either and I'll quote you — or leave your email and our team will send a tailored quote today.",
    "Need help":
      "I can help with most things right here. What's going on?\n\n- Payouts: a transfer that hasn't landed, or your payout schedule.\n\n- Disputes: respond to a chargeback and upload evidence.\n\n- Hardware: a terminal or POS that's misbehaving.\n\nIf it's urgent, I can hand you straight to the support team with the conversation attached.",
    "Need support":
      "I can help with most things right here. What's going on?\n\n- Payouts: a transfer that hasn't landed, or your payout schedule.\n\n- Disputes: respond to a chargeback and upload evidence.\n\n- Hardware: a terminal or POS that's misbehaving.\n\nIf it's urgent, I can hand you straight to the support team with the conversation attached.",
    "Want to become a partner":
      "Great — the partner programme has three tracks:\n\n- Referral: recommend us and earn a share of the processing revenue.\n\n- Integration: connect your software to our payments API, with co-marketing.\n\n- Agent/ISO: sell our stack under your own brand with dedicated support.\n\nTell me which sounds closest and I'll get the right team to reach out.",
    "Want to become partner":
      "Great — the partner programme has three tracks:\n\n- Referral: recommend us and earn a share of the processing revenue.\n\n- Integration: connect your software to our payments API, with co-marketing.\n\n- Agent/ISO: sell our stack under your own brand with dedicated support.\n\nTell me which sounds closest and I'll get the right team to reach out.",
  },

  followUps: {
    "What are your rates?": [
      "Anything for high volume?",
      "How fast are payouts?",
      "Book a demo",
    ],
    "Anything for high volume?": [
      "Around $400k a year",
      "Book a demo",
      "Talk to a human",
    ],
    "How fast are payouts?": [
      "Enable same-day payouts",
      "What are your rates?",
      "Talk to a human",
    ],
    "Book a demo": ["Thursday works", "Just one location", "Send me some times"],
    "Can I take payments online?": [
      "Show me the checkout",
      "What are your rates?",
      "Book a demo",
    ],
    "What do I pay per sale?": [
      "Anything for high volume?",
      "When do I get paid?",
      "Book a demo",
    ],
    "When do I get paid?": [
      "Enable same-day payouts",
      "What do I pay per sale?",
      "Talk to a human",
    ],
    "Can I sell online?": [
      "Show me the checkout",
      "What are your rates?",
      "Book a demo",
    ],
    "I want to talk to sales": [],
    "I'm an Enterprise Business": [],
    "Main Menu": [],
    "End Chat": [],
    "Retail": ["Book a demo", "What are your rates?", "Talk to a human"],
    "Restaurant": ["Book a demo", "What are your rates?", "Talk to a human"],
    "Services": ["Book a demo", "What are your rates?", "Talk to a human"],
    "Other": ["Book a demo", "What are your rates?", "Talk to a human"],
    "I'm looking for Events Payments": [
      "Book a demo",
      "It's a stadium",
      "Talk to a human",
    ],
    "I'm an Independent Business": [
      "Get a quote",
      "Book a demo",
      "What are your rates?",
    ],
    "I need support": [
      "Payout hasn't arrived",
      "Dispute a chargeback",
      "Talk to a human",
    ],
    "I want to become a partner": [
      "Referral sounds right",
      "We build software",
      "Talk to a human",
    ],
    "Talk to sales": ["Book a demo", "What are your rates?", "Both, two locations"],
    "Find the payment solution": [
      "Mostly in store",
      "Mostly online",
      "Both",
    ],
    "Explore POS systems": [
      "For a restaurant",
      "For retail",
      "Book a demo",
    ],
    "Get a quote": [
      "In store mostly",
      "Online store",
      "Around $30k a month",
    ],
    "Need help": [
      "Payout hasn't arrived",
      "Dispute a chargeback",
      "Talk to a human",
    ],
    "Need support": [
      "Payout hasn't arrived",
      "Dispute a chargeback",
      "Talk to a human",
    ],
    "Want to become a partner": [
      "Referral sounds right",
      "We build software",
      "Talk to a human",
    ],
    "Want to become partner": [
      "Referral sounds right",
      "We build software",
      "Talk to a human",
    ],
  },
  replyForms: {
    "I'm an Enterprise Business": {
      fields: [
        { key: "firstName", label: "First name", half: true },
        { key: "lastName", label: "Last name", half: true },
        { key: "email", label: "Email address", type: "email" },
        { key: "phone", label: "Phone number", type: "tel" },
        {
          key: "industry",
          label: "What industry does your business belong to?",
          options: ["Retail", "Restaurant", "Services", "Other"],
        },
      ],
      submitLabel: "Submit",
      reply:
        "Thanks {firstName} for chatting with us! Our team will reach out to you shortly. Have a wonderful day!",
      replyButtons: ["Main Menu", "End Chat"],
    },
  },
  replyButtons: {
    "Main Menu": [
      "I want to talk to sales",
      "I need support",
      "I want to become a partner",
    ],
    "I want to talk to sales": [
      "I'm an Enterprise Business",
      "I'm looking for Events Payments",
      "I'm an Independent Business",
    ],
  },
  followUpFallback: ["Tell me more", "Talk to a human"],
  replyFallback:
    "Good question — let me check that with the team. In the meantime, is there anything else about rates, payouts, or getting set up I can help with?",

  reasoningTrace: [
    "Searched the pricing guide",
    "Read 3 sources",
    "Called check_rates",
  ],
  reasoningSteps: [
    "Thinking",
    "Searching the pricing guide",
    "Reading 3 sources",
    "Calling check_rates",
    "Writing the answer",
  ],

  sources: [
    {
      name: "Card processing rates",
      description:
        "Current pricing — in person, online, and keyed-in, with volume tiers.",
      url: "globalpayments.com/pricing",
    },
    {
      name: "Payout schedule",
      description:
        "When batches close, when funds land, and how same-day works.",
      url: "globalpayments.com/docs/payouts",
    },
    {
      name: "Online payments",
      description: "Hosted checkout, payment links, and the payments API.",
      url: "globalpayments.com/online",
    },
    {
      name: "Talking to a person",
      description:
        "When a conversation moves to the sales or support team, and what travels with it.",
      url: "globalpayments.com/support",
    },
  ],

  conversations: [
    {
      group: "Today",
      items: [
        {
          id: "c1",
          title: "Chargeback on order #4417",
          description:
            "You: got it — I've uploaded the delivery confirmation.",
          time: "11:02 AM",
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
          title: "Terminal vs. POS bundle",
          description:
            "Global Payments: here's how the two setups compare for a single register.",
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
          title: "Switching from our old processor",
          description: "Marcus: I've started the statement review on our side.",
          time: "Aug 12",
          channel: "whatsapp",
          status: "waiting",
          handedTo: "Marcus",
        },
        {
          id: "c4",
          title: "First look at payment options",
          description:
            "Global Payments: Hi — welcome. I can help with rates, payouts, or getting set up.",
          time: "Aug 6",
          channel: "web",
          status: "closed",
        },
      ],
    },
  ],

  /* The gambit opener. GP's workflow starts on the agent's node, so the
     assistant speaks first — seeded when the thread opens without a message,
     and above the first message when someone types before opening. The
     prompts are the starters again on purpose: the pills above the launcher
     disappear once the panel is up, and the greeting is where they land. */
  greeting: {
    text: "Hi 👋 welcome to Global Payments. Looking to learn more? I can help!",
    /* Buttons, not prompts: these are the node's own UI components, so they
       render under the message bubble rather than as quick replies pinned at
       the composer. */
    buttons: [
      "I want to talk to sales",
      "I need support",
      "I want to become a partner",
    ],
  },
};
