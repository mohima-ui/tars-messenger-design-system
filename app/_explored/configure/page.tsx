"use client";

import { useState } from "react";
import {
  ConfigurePanel,
  DEFAULT_SUGGESTIONS,
  type SuggestionState,
} from "@/components/configure/ConfigurePanel";

export default function ConfigureRoute() {
  const [suggestions, setSuggestions] = useState<SuggestionState>(DEFAULT_SUGGESTIONS);
  return (
    <div className="h-screen">
      <ConfigurePanel suggestions={suggestions} onSuggestions={setSuggestions} />
    </div>
  );
}
