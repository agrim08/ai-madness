"use client";

import { useEffect } from "react";
import { useAIStore } from "@/store/ai-store";

export default function ClientInit() {
  useEffect(() => {
    useAIStore.getState().loadKeys();
  }, []);

  return null;
}
