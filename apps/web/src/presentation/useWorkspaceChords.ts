import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";

import { hasModifier, isTypingTarget } from "./keyboard";

/** How long a `g` prefix stays pending before it is discarded. */
const CHORD_TIMEOUT_MS = 1500;

const chordDestinations: Record<string, string> = {
  t: "/today",
  p: "/pipeline",
  r: "/roles"
};

/**
 * Global two-key chords: `g` then a workspace key. Navigation goes through
 * browser history, so Back returns to the previous workspace.
 */
export function useWorkspaceChords() {
  const navigate = useNavigate();

  useEffect(() => {
    let expiryTimer: ReturnType<typeof setTimeout> | null = null;
    let isPrefixPending = false;

    function discardPrefix() {
      isPrefixPending = false;
      if (expiryTimer) clearTimeout(expiryTimer);
      expiryTimer = null;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (hasModifier(event) || isTypingTarget(event.target)) {
        discardPrefix();
        return;
      }

      const key = event.key.toLowerCase();

      if (isPrefixPending) {
        discardPrefix();

        const destination = chordDestinations[key];
        if (!destination) return;

        event.preventDefault();
        void navigate({ to: destination });
        return;
      }

      if (key === "g") {
        isPrefixPending = true;
        expiryTimer = setTimeout(discardPrefix, CHORD_TIMEOUT_MS);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      discardPrefix();
    };
  }, [navigate]);
}
