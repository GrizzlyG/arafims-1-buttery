"use client";

import { Provider } from "@radix-ui/react-tooltip";

export function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <Provider>{children}</Provider>;
}