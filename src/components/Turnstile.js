"use client";

import { useEffect, useRef } from "react";

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

/** True when Turnstile is configured for this deployment. */
export const captchaEnabled = !!SITE_KEY;

let scriptPromise = null;
function loadScript() {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.onload = resolve;
      s.onerror = () => { scriptPromise = null; reject(new Error("Turnstile failed to load")); };
      document.head.appendChild(s);
    });
  }
  return scriptPromise;
}

/**
 * Cloudflare Turnstile widget. Renders nothing when
 * NEXT_PUBLIC_TURNSTILE_SITE_KEY is not set, so auth keeps working
 * in environments without CAPTCHA configured.
 *
 * Props:
 *  - onToken(token|null): called with a fresh token, or null when it expires.
 *  - resetSignal: bump this number to force a fresh challenge (tokens are single-use).
 */
export default function Turnstile({ onToken, resetSignal = 0 }) {
  const boxRef = useRef(null);
  const widgetIdRef = useRef(null);
  const onTokenRef = useRef(onToken);
  onTokenRef.current = onToken;

  useEffect(() => {
    if (!SITE_KEY) return undefined;
    let cancelled = false;

    loadScript().then(() => {
      if (cancelled || !boxRef.current || widgetIdRef.current !== null) return;
      widgetIdRef.current = window.turnstile.render(boxRef.current, {
        sitekey: SITE_KEY,
        theme: "dark",
        callback: (token) => onTokenRef.current?.(token),
        "expired-callback": () => onTokenRef.current?.(null),
        "error-callback": () => onTokenRef.current?.(null),
      });
    }).catch(() => {
      // Script blocked/failed: leave token null; server decides whether it's required.
    });

    return () => {
      cancelled = true;
      if (widgetIdRef.current !== null && window.turnstile) {
        try { window.turnstile.remove(widgetIdRef.current); } catch {}
        widgetIdRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (resetSignal > 0 && widgetIdRef.current !== null && window.turnstile) {
      onTokenRef.current?.(null);
      try { window.turnstile.reset(widgetIdRef.current); } catch {}
    }
  }, [resetSignal]);

  if (!SITE_KEY) return null;
  return <div ref={boxRef} className="flex justify-center" />;
}
