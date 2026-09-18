/* ── tool-call payloads ───────────────────────────────────────────────────
   Real responses, kept whole rather than trimmed to something tidy. The
   point of showing a tool call is that you can check it, and a payload
   edited down to five neat lines is not the thing anyone needs to check —
   the long content strings, the scores that don't sort the way you expect
   and the fields nobody reads are exactly what the block has to survive
   rendering.

   Held here rather than in page.tsx so the transcript stays readable. */

export type Json =
  | string
  | number
  | boolean
  | null
  | Json[]
  | { [key: string]: Json };

export const SEARCH_DOCS_INPUT: Json = {
  query: "flow control gambits types and how to use them in Tars conversation builder",
};

const DOC = "https://tars-951e24d5.mintlify.site/guides/building";

export const SEARCH_DOCS_OUTPUT: Json = {
  images: [
    {
      alt: "A Text gambit selected in the builder with its editor open on Messages and the Input Type cards",
      mediaId: "img_004bf951b12bc88d",
      score: 0.5165764,
      type: "image",
    },
    {
      alt: "A Card gambit selected in the builder with a handle per card, and its editor scrolled to the card rows and the Configuration section's Allow Multiple Selections, Allow Skip, and Allow Free Text switches",
      context:
        "A Card gambit selected in the builder with a handle per card, and its editor scrolled to the card rows and the Configuration section's Allow Multiple Selections, Allow Skip, and Allow Free Text switch",
      mediaId: "img_05b77121ae3dd82a",
      score: 0.4969309,
      type: "image",
    },
    {
      alt: "A Button gambit selected in the builder, with the editor scrolled to the Options section and the Configuration section's Allow Multiple Selections, Allow Skip, and Allow Free Text switches",
      mediaId: "img_76de93f363b9e1cc",
      score: 0.45959207,
      type: "image",
    },
    {
      alt: "A Language gambit selected in the builder, its editor listing English as Primary plus Spanish and French, each row carrying a Continue dropdown",
      mediaId: "img_dace6d196a63458e",
      score: 0.40006384,
      type: "image",
    },
    {
      alt: "A Star Rating gambit selected in the builder with its editor open on the Maximum Stars slider and the two optional scale labels",
      mediaId: "img_4aca5b209bc8e858",
      score: 0.30350634,
      type: "image",
    },
  ],
  results: [
    {
      content: `-   [Gambit mastery](${DOC}/gambits/overview)\n-   [Card gambit](${DOC}/gambits/card)\n-   [Flow control and branching](${DOC}/flow-control-and-branching)\n-   [Use variables](${DOC}/variables)\n\n[Text gambit Previous](${DOC}/gambits/text)[Card gambit Next](${DOC}/gambits/card)`,
      score: 0.64629173,
      title: "Button gambit - Tars Docs",
      url: `${DOC}/gambits/button`,
    },
    {
      content: `-   [Gambit mastery](${DOC}/gambits/overview)\n-   [Languages](${DOC}/languages)\n-   [Flow control and branching](${DOC}/flow-control-and-branching)\n\n[Redirect gambit Previous](${DOC}/gambits/redirect)[API Call gambit Next](${DOC}/gambits/api-call)`,
      score: 0.6428173,
      title: "Language gambit - Tars Docs",
      url: `${DOC}/gambits/language`,
    },
    {
      content: `-   [Gambit mastery](${DOC}/gambits/overview)\n-   [Button gambit](${DOC}/gambits/button)\n-   [Use variables](${DOC}/variables)\n-   [Flow control and branching](${DOC}/flow-control-and-branching)\n\n[AI Agent gambit Previous](${DOC}/gambits/ai-agent)[Button gambit Next](${DOC}/gambits/button)`,
      score: 0.6205901,
      title: "Text gambit - Tars Docs",
      url: `${DOC}/gambits/text`,
    },
    {
      content: `-   [Gambit mastery](${DOC}/gambits/overview)\n-   [Button gambit](${DOC}/gambits/button)\n-   [Flow control and branching](${DOC}/flow-control-and-branching)\n\n[Button gambit Previous](${DOC}/gambits/button)[Star Rating gambit Next](${DOC}/gambits/star-rating)`,
      score: 0.61328745,
      title: "Card gambit - Tars Docs",
      url: `${DOC}/gambits/card`,
    },
    {
      content: `-   [Gambit mastery](${DOC}/gambits/overview)\n-   [Flow control and branching](${DOC}/flow-control-and-branching)\n-   [Collect CSAT ratings](https://tars-951e24d5.mintlify.site/guides/live-chat/csat)\n\n[Card gambit Previous](${DOC}/gambits/card)[Date & Time gambit Next](${DOC}/gambits/date-time)`,
      score: 0.6094708,
      title: "Star Rating gambit - Tars Docs",
      url: `${DOC}/gambits/star-rating`,
    },
  ],
};
