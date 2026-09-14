"use client";

/* The Analytics section on its own route. The rails are shared with Configure
   and Design, so leaving from here is a real navigation rather than a state
   change — the other two sections live at their own URLs. */

import { useRouter } from "next/navigation";

import { AnalyticsPanel } from "./AnalyticsPanel";

export default function AnalyticsRoute() {
  const router = useRouter();
  return (
    <div className="h-screen">
      <AnalyticsPanel
        onLeave={(s) => router.push(s === "configure" ? "/explored/configure" : "/design")}
      />
    </div>
  );
}
